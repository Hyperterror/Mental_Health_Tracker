import { FastifyPluginAsync } from "fastify";
import { prisma } from "../config/prisma.js";
import {
  SessionStartSchema,
  SessionEndSchema,
  FatigueEventSchema,
} from "@mindfulprep/shared";
import { authenticate } from "../plugins/auth.js";
import { recommend } from "../services/pomodoro.service.js";
import { redis, CacheKeys, CACHE_TTL } from "../config/redis.js";
import {
  awardPoints,
  updateStreak,
  computeSessionPoints,
} from "../services/gamification.service.js";
import { analyzeUserPatterns } from "../jobs/pattern-detection.job.js";

// ============================================================
// Session Routes Plugin
// ============================================================

export const sessionRoutes: FastifyPluginAsync = async (fastify) => {
  // ── POST /session/start ─────────────────────────────────

  fastify.post(
    "/session/start",
    {
      preHandler: [authenticate],
      config: {
        rateLimit: {
          max: 10,
          timeWindow: "1 hour",
        },
      },
    },
    async (request, reply) => {
      try {
        const parseResult = SessionStartSchema.safeParse(request.body);
        if (!parseResult.success) {
          return reply.status(400).send({
            success: false,
            error: parseResult.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          });
        }

        const { examType, initialMoodScore, initialStressLevel, preferredMode } =
          parseResult.data;
        const userId = request.user.userId;
        const now = new Date();

        // Count completed sessions today for adaptive pomodoro
        const startOfDay = new Date(now);
        startOfDay.setHours(0, 0, 0, 0);
        const completedToday = await prisma.studySession.count({
          where: {
            userId,
            isActive: false,
            createdAt: { gte: startOfDay },
          },
        });

        const pomodoroInput = {
          moodScore: initialMoodScore ?? 3,
          stressLevel: initialStressLevel ?? 5,
          completedSessionsToday: completedToday,
          currentHour: now.getHours(),
        };

        const recommendation = recommend(pomodoroInput);

        // If user prefers a mode, use it unless safety overrides apply
        const finalMode =
          preferredMode &&
          !(
            pomodoroInput.moodScore <= 2 ||
            pomodoroInput.stressLevel >= 8 ||
            pomodoroInput.currentHour >= 22
          )
            ? preferredMode
            : recommendation.mode;

        const session = await prisma.studySession.create({
          data: {
            userId,
            examType,
            startMoodScore: initialMoodScore ?? null,
            startStressLevel: initialStressLevel ?? null,
            mode: finalMode,
            workDuration: recommendation.workDuration,
            breakDuration: recommendation.breakDuration,
            isActive: true,
            lastHeartbeat: now,
          },
          select: {
            id: true,
            userId: true,
            examType: true,
            mode: true,
            workDuration: true,
            breakDuration: true,
            completedPomodoros: true,
            breaksTaken: true,
            breakCompliance: true,
            triggerFlags: true,
            wellnessScore: true,
            isActive: true,
            lastHeartbeat: true,
            endTime: true,
            createdAt: true,
          },
        });

        // Cache active session in Redis with 1hr TTL
        await redis.set(
          CacheKeys.session(session.id),
          JSON.stringify({ sessionId: session.id, userId, startedAt: now }),
          { ex: CACHE_TTL.session }
        );

        return reply.status(201).send({
          success: true,
          data: { session, recommendation },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in POST /session/start");
        return reply.status(500).send({
          success: false,
          error: "Failed to start study session.",
        });
      }
    }
  );

  // ── POST /session/heartbeat ─────────────────────────────

  fastify.post(
    "/session/heartbeat",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const body = request.body as { sessionId?: string; focusSignal?: number };
        if (!body.sessionId) {
          return reply.status(400).send({
            success: false,
            error: "sessionId is required.",
          });
        }

        const userId = request.user.userId;
        const sessionId = body.sessionId;

        const session = await prisma.studySession.findFirst({
          where: { id: sessionId, userId, isActive: true },
          select: {
            id: true,
            lastHeartbeat: true,
            createdAt: true,
            breaksTaken: true,
            triggerFlags: true,
            workDuration: true,
          },
        });

        if (!session) {
          return reply.status(404).send({
            success: false,
            error: "Active session not found.",
          });
        }

        const now = new Date();
        const sessionDurationMinutes =
          (now.getTime() - session.createdAt.getTime()) / 60000;

        // Check: 90+ minutes without a break
        const shouldBreak =
          sessionDurationMinutes > 90 && session.breaksTaken === 0;

        const newFlags = [...session.triggerFlags];
        if (shouldBreak && !newFlags.includes("LONG_FOCUS_NO_BREAK")) {
          newFlags.push("LONG_FOCUS_NO_BREAK");
        }

        await prisma.studySession.update({
          where: { id: sessionId },
          data: {
            lastHeartbeat: now,
            triggerFlags: newFlags,
          },
        });

        // Refresh Redis TTL
        await redis.set(
          CacheKeys.session(sessionId),
          JSON.stringify({ sessionId, userId, lastHeartbeat: now }),
          { ex: CACHE_TTL.session }
        );

        return reply.send({
          success: true,
          data: { ok: true, shouldBreak },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in POST /session/heartbeat");
        return reply.status(500).send({
          success: false,
          error: "Heartbeat failed.",
        });
      }
    }
  );

  // ── POST /session/end ───────────────────────────────────

  fastify.post(
    "/session/end",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const parseResult = SessionEndSchema.safeParse(request.body);
        if (!parseResult.success) {
          return reply.status(400).send({
            success: false,
            error: parseResult.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          });
        }

        const { sessionId, endMoodScore, endStressLevel } = parseResult.data;
        const userId = request.user.userId;

        const session = await prisma.studySession.findFirst({
          where: { id: sessionId, userId, isActive: true },
          select: {
            id: true,
            startMoodScore: true,
            startStressLevel: true,
            completedPomodoros: true,
            breaksTaken: true,
            workDuration: true,
            breakDuration: true,
            createdAt: true,
            triggerFlags: true,
          },
        });

        if (!session) {
          return reply.status(404).send({
            success: false,
            error: "Active session not found.",
          });
        }

        const now = new Date();
        const sessionDurationMinutes =
          (now.getTime() - session.createdAt.getTime()) / 60000;

        // Compute wellness score (0-100)
        // Factors: break compliance + mood delta
        const expectedPomodoros = Math.max(
          1,
          Math.floor(sessionDurationMinutes / session.workDuration)
        );
        const breakCompliance = Math.min(
          1,
          session.breaksTaken / expectedPomodoros
        );

        let moodDelta = 0;
        if (
          session.startMoodScore !== null &&
          endMoodScore !== undefined
        ) {
          moodDelta = (endMoodScore - session.startMoodScore) / 4; // normalized -1 to +1
        }

        // wellness = 50% break compliance + 50% mood maintenance/improvement
        const wellnessScore = Math.min(
          100,
          Math.max(
            0,
            Math.round(
              50 * breakCompliance + 50 * Math.max(0, 0.5 + moodDelta * 0.5)
            )
          )
        );

        const updatedSession = await prisma.studySession.update({
          where: { id: sessionId },
          data: {
            isActive: false,
            endTime: now,
            breakCompliance,
            wellnessScore,
            ...(endMoodScore !== undefined
              ? { startMoodScore: session.startMoodScore }
              : {}),
          },
          select: {
            id: true,
            userId: true,
            examType: true,
            mode: true,
            workDuration: true,
            breakDuration: true,
            completedPomodoros: true,
            breaksTaken: true,
            breakCompliance: true,
            triggerFlags: true,
            wellnessScore: true,
            isActive: true,
            endTime: true,
            createdAt: true,
          },
        });

        // Award gamification points
        const points = computeSessionPoints(updatedSession);
        await awardPoints(userId, points, prisma);
        await updateStreak(userId, prisma);

        // Remove from Redis cache
        await redis.del(CacheKeys.session(sessionId));

        // Fire-and-forget pattern detection
        analyzeUserPatterns(userId).catch((err) => {
          fastify.log.warn({ err, userId }, "Pattern detection job failed");
        });

        return reply.send({
          success: true,
          data: {
            session: updatedSession,
            pointsAwarded: points,
            wellnessScore,
          },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in POST /session/end");
        return reply.status(500).send({
          success: false,
          error: "Failed to end session.",
        });
      }
    }
  );

  // ── GET /session/history ────────────────────────────────

  fastify.get(
    "/session/history",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const query = request.query as { page?: string; limit?: string };
        const page = Math.max(1, parseInt(query.page ?? "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "20", 10)));
        const skip = (page - 1) * limit;
        const userId = request.user.userId;

        const [sessions, total] = await Promise.all([
          prisma.studySession.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            select: {
              id: true,
              userId: true,
              examType: true,
              mode: true,
              workDuration: true,
              breakDuration: true,
              completedPomodoros: true,
              breaksTaken: true,
              breakCompliance: true,
              triggerFlags: true,
              wellnessScore: true,
              isActive: true,
              endTime: true,
              createdAt: true,
            },
          }),
          prisma.studySession.count({ where: { userId } }),
        ]);

        return reply.send({
          success: true,
          data: { sessions, total, page, limit },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in GET /session/history");
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch session history.",
        });
      }
    }
  );

  // ── POST /session/:sessionId/fatigue-event ──────────────

  fastify.post(
    "/session/:sessionId/fatigue-event",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const { sessionId } = request.params as { sessionId: string };
        const userId = request.user.userId;

        // Check camera consent
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { cameraOptIn: true },
        });

        if (!user) {
          return reply.status(404).send({
            success: false,
            error: "User not found.",
          });
        }

        if (!user.cameraOptIn) {
          return reply.status(403).send({
            success: false,
            error:
              "Camera-based fatigue detection is disabled. Enable it in your profile settings.",
          });
        }

        const parseResult = FatigueEventSchema.safeParse(request.body);
        if (!parseResult.success) {
          return reply.status(400).send({
            success: false,
            error: parseResult.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          });
        }

        const { confidenceScore, signalType } = parseResult.data;

        // Verify session belongs to user
        const session = await prisma.studySession.findFirst({
          where: { id: sessionId, userId, isActive: true },
          select: { id: true, triggerFlags: true },
        });

        if (!session) {
          return reply.status(404).send({
            success: false,
            error: "Active session not found.",
          });
        }

        // Create fatigue event
        const fatigueEvent = await prisma.fatigueEvent.create({
          data: {
            userId,
            sessionId,
            confidenceScore,
            signalType,
            breakTriggered: confidenceScore > 0.75,
          },
          select: {
            id: true,
            confidenceScore: true,
            signalType: true,
            breakTriggered: true,
            createdAt: true,
          },
        });

        // If high confidence, add flag to session
        if (confidenceScore > 0.75) {
          const newFlags = [...session.triggerFlags];
          if (!newFlags.includes("FATIGUE_DETECTED")) {
            newFlags.push("FATIGUE_DETECTED");
          }
          await prisma.studySession.update({
            where: { id: sessionId },
            data: { triggerFlags: newFlags },
          });
        }

        const breakSuggestion =
          confidenceScore > 0.75
            ? {
                shouldBreak: true,
                message:
                  "High fatigue detected. Please take a 5-minute break — close your eyes or stretch.",
              }
            : { shouldBreak: false, message: null };

        return reply.status(201).send({
          success: true,
          data: { fatigueEvent, breakSuggestion },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in POST /session/:sessionId/fatigue-event");
        return reply.status(500).send({
          success: false,
          error: "Failed to record fatigue event.",
        });
      }
    }
  );
};
