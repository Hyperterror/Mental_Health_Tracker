import { FastifyPluginAsync } from "fastify";
import { prisma } from "../config/prisma.js";
import {
  MoodLogCreateSchema,
  MoodHistoryQuerySchema,
} from "@mindfulprep/shared";
import { authenticate } from "../plugins/auth.js";
import { analyzeUserPatterns } from "../jobs/pattern-detection.job.js";

// ============================================================
// Mood Routes Plugin
// ============================================================

export const moodRoutes: FastifyPluginAsync = async (fastify) => {
  // ── POST /mood ──────────────────────────────────────────

  fastify.post(
    "/mood",
    {
      preHandler: [authenticate],
      config: {
        rateLimit: {
          max: 30,
          timeWindow: "1 hour",
        },
      },
    },
    async (request, reply) => {
      try {
        const parseResult = MoodLogCreateSchema.safeParse(request.body);
        if (!parseResult.success) {
          return reply.status(400).send({
            success: false,
            error: parseResult.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          });
        }

        const { emojiScore, stressLevel, tags, journalText } =
          parseResult.data;
        const userId = request.user.userId;

        const moodLog = await prisma.moodLog.create({
          data: {
            userId,
            emojiScore,
            stressLevel,
            tags,
            journalText: journalText ?? null,
          },
          select: {
            id: true,
            userId: true,
            emojiScore: true,
            stressLevel: true,
            tags: true,
            journalText: true,
            createdAt: true,
          },
        });

        // Fire-and-forget pattern detection (do not await)
        analyzeUserPatterns(userId).catch((err) => {
          fastify.log.warn({ err, userId }, "Pattern detection job failed");
        });

        return reply.status(201).send({
          success: true,
          data: moodLog,
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in POST /mood");
        return reply.status(500).send({
          success: false,
          error: "Failed to create mood log.",
        });
      }
    }
  );

  // ── GET /mood/history ───────────────────────────────────

  fastify.get(
    "/mood/history",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const parseResult = MoodHistoryQuerySchema.safeParse(request.query);
        if (!parseResult.success) {
          return reply.status(400).send({
            success: false,
            error: parseResult.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          });
        }

        const { page, limit, from, to } = parseResult.data;
        const userId = request.user.userId;
        const skip = (page - 1) * limit;

        const where = {
          userId,
          ...(from || to
            ? {
                createdAt: {
                  ...(from ? { gte: new Date(from) } : {}),
                  ...(to ? { lte: new Date(to) } : {}),
                },
              }
            : {}),
        };

        const [logs, total] = await Promise.all([
          prisma.moodLog.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip,
            take: limit,
            select: {
              id: true,
              userId: true,
              emojiScore: true,
              stressLevel: true,
              tags: true,
              journalText: true,
              createdAt: true,
            },
          }),
          prisma.moodLog.count({ where }),
        ]);

        return reply.send({
          success: true,
          data: { logs, total, page, limit },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in GET /mood/history");
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch mood history.",
        });
      }
    }
  );

  // ── GET /mood/patterns ──────────────────────────────────

  fastify.get(
    "/mood/patterns",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.userId;
        const now = new Date();
        const thirtyDaysAgo = new Date(
          now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        const sevenDaysAgo = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        );
        const fourteenDaysAgo = new Date(
          now.getTime() - 14 * 24 * 60 * 60 * 1000
        );

        const logs = await prisma.moodLog.findMany({
          where: { userId, createdAt: { gte: thirtyDaysAgo } },
          orderBy: { createdAt: "asc" },
          select: {
            emojiScore: true,
            stressLevel: true,
            tags: true,
            createdAt: true,
          },
        });

        if (logs.length === 0) {
          return reply.send({
            success: true,
            data: {
              averageMoodScore: 0,
              averageStressLevel: 0,
              topTriggerTags: [],
              peakStressHour: 0,
              moodTrend: "stable" as const,
              weeklyData: [],
            },
          });
        }

        // Average mood and stress
        const averageMoodScore =
          logs.reduce((sum, l) => sum + l.emojiScore, 0) / logs.length;
        const averageStressLevel =
          logs.reduce((sum, l) => sum + l.stressLevel, 0) / logs.length;

        // Top trigger tags (count frequency)
        const tagCounts = new Map<string, number>();
        for (const log of logs) {
          for (const tag of log.tags) {
            tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
          }
        }
        const topTriggerTags = Array.from(tagCounts.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([tag, count]) => ({ tag, count }));

        // Peak stress hour (hour of day with highest avg stress)
        const hourStressMap = new Map<number, { sum: number; count: number }>();
        for (const log of logs) {
          const hour = new Date(log.createdAt).getHours();
          const existing = hourStressMap.get(hour) ?? { sum: 0, count: 0 };
          hourStressMap.set(hour, {
            sum: existing.sum + log.stressLevel,
            count: existing.count + 1,
          });
        }
        let peakStressHour = 0;
        let maxAvgStress = -1;
        for (const [hour, { sum, count }] of hourStressMap) {
          const avg = sum / count;
          if (avg > maxAvgStress) {
            maxAvgStress = avg;
            peakStressHour = hour;
          }
        }

        // Mood trend: last 7 days vs previous 7 days
        const last7 = logs.filter((l) => new Date(l.createdAt) >= sevenDaysAgo);
        const prev7 = logs.filter(
          (l) =>
            new Date(l.createdAt) >= fourteenDaysAgo &&
            new Date(l.createdAt) < sevenDaysAgo
        );

        let moodTrend: "improving" | "declining" | "stable" = "stable";
        if (last7.length > 0 && prev7.length > 0) {
          const avgLast7 =
            last7.reduce((s, l) => s + l.emojiScore, 0) / last7.length;
          const avgPrev7 =
            prev7.reduce((s, l) => s + l.emojiScore, 0) / prev7.length;
          const diff = avgLast7 - avgPrev7;
          if (diff > 0.3) moodTrend = "improving";
          else if (diff < -0.3) moodTrend = "declining";
        }

        // Weekly data: last 7 days, grouped by date
        const weeklyMap = new Map<
          string,
          { moodSum: number; stressSum: number; count: number }
        >();
        for (const log of last7) {
          const date = new Date(log.createdAt).toISOString().split("T")[0];
          const existing = weeklyMap.get(date) ?? {
            moodSum: 0,
            stressSum: 0,
            count: 0,
          };
          weeklyMap.set(date, {
            moodSum: existing.moodSum + log.emojiScore,
            stressSum: existing.stressSum + log.stressLevel,
            count: existing.count + 1,
          });
        }
        const weeklyData = Array.from(weeklyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, { moodSum, stressSum, count }]) => ({
            date,
            avgMood: Math.round((moodSum / count) * 100) / 100,
            avgStress: Math.round((stressSum / count) * 100) / 100,
          }));

        return reply.send({
          success: true,
          data: {
            averageMoodScore: Math.round(averageMoodScore * 100) / 100,
            averageStressLevel: Math.round(averageStressLevel * 100) / 100,
            topTriggerTags,
            peakStressHour,
            moodTrend,
            weeklyData,
          },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in GET /mood/patterns");
        return reply.status(500).send({
          success: false,
          error: "Failed to analyze mood patterns.",
        });
      }
    }
  );
};
