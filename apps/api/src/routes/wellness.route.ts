import { FastifyPluginAsync } from "fastify";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../plugins/auth.js";
import { getSuggestion } from "../services/wellness.service.js";
import { awardPoints, checkAndAwardBadge } from "../services/gamification.service.js";
import { BadgeCode } from "@mindfulprep/shared";

// ============================================================
// Wellness Routes Plugin
// ============================================================

export const wellnessRoutes: FastifyPluginAsync = async (fastify) => {
  // ── GET /wellness/suggest ───────────────────────────────

  fastify.get(
    "/wellness/suggest",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.userId;

        // Fetch user context
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            name: true,
            examType: true,
            targetExamDate: true,
          },
        });

        if (!user) {
          return reply.status(404).send({
            success: false,
            error: "User not found.",
          });
        }

        // Fetch last 7 days of mood logs
        const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const recentMoodLogs = await prisma.moodLog.findMany({
          where: { userId, createdAt: { gte: sevenDaysAgo } },
          orderBy: { createdAt: "asc" },
          select: {
            emojiScore: true,
            stressLevel: true,
            tags: true,
            journalText: true,
            createdAt: true,
          },
        });

        // Fetch active session if any
        const activeSession = await prisma.studySession.findFirst({
          where: { userId, isActive: true },
          select: {
            mode: true,
            completedPomodoros: true,
            breaksTaken: true,
            wellnessScore: true,
            triggerFlags: true,
          },
        });

        const suggestion = await getSuggestion(
          userId,
          recentMoodLogs,
          activeSession,
          user
        );

        return reply.send({
          success: true,
          data: suggestion,
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in GET /wellness/suggest");
        return reply.status(500).send({
          success: false,
          error: "Failed to generate wellness suggestion.",
        });
      }
    }
  );

  // ── POST /wellness/:id/act ──────────────────────────────

  fastify.post(
    "/wellness/:id/act",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = request.user.userId;

        const suggestion = await prisma.wellnessSuggestion.findFirst({
          where: { id, userId },
          select: { id: true, type: true, acted: true },
        });

        if (!suggestion) {
          return reply.status(404).send({
            success: false,
            error: "Suggestion not found.",
          });
        }

        if (suggestion.acted) {
          return reply.status(409).send({
            success: false,
            error: "Suggestion already marked as acted.",
          });
        }

        await prisma.wellnessSuggestion.update({
          where: { id },
          data: { acted: true },
        });

        // Award 10 calm focus points
        await awardPoints(userId, 10, prisma);

        // Check HYDRATION_HERO badge
        if (suggestion.type === "HYDRATION") {
          await checkAndAwardBadge(userId, BadgeCode.HYDRATION_HERO, prisma);
        }

        return reply.send({
          success: true,
          data: { acted: true, pointsAwarded: 10 },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in POST /wellness/:id/act");
        return reply.status(500).send({
          success: false,
          error: "Failed to mark suggestion as acted.",
        });
      }
    }
  );

  // ── POST /wellness/:id/dismiss ──────────────────────────

  fastify.post(
    "/wellness/:id/dismiss",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const { id } = request.params as { id: string };
        const userId = request.user.userId;

        const suggestion = await prisma.wellnessSuggestion.findFirst({
          where: { id, userId },
          select: { id: true, dismissed: true },
        });

        if (!suggestion) {
          return reply.status(404).send({
            success: false,
            error: "Suggestion not found.",
          });
        }

        if (suggestion.dismissed) {
          return reply.status(409).send({
            success: false,
            error: "Suggestion already dismissed.",
          });
        }

        await prisma.wellnessSuggestion.update({
          where: { id },
          data: { dismissed: true },
        });

        return reply.send({
          success: true,
          data: { dismissed: true },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in POST /wellness/:id/dismiss");
        return reply.status(500).send({
          success: false,
          error: "Failed to dismiss suggestion.",
        });
      }
    }
  );
};
