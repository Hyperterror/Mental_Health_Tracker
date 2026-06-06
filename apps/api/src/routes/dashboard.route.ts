import { FastifyPluginAsync } from "fastify";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../plugins/auth.js";

// ============================================================
// Dashboard Routes Plugin
// ============================================================

export const dashboardRoutes: FastifyPluginAsync = async (fastify) => {
  // ── GET /dashboard/metrics ──────────────────────────────

  fastify.get(
    "/dashboard/metrics",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.userId;
        const now = new Date();

        // Today boundaries
        const startOfToday = new Date(now);
        startOfToday.setHours(0, 0, 0, 0);
        const endOfToday = new Date(now);
        endOfToday.setHours(23, 59, 59, 999);

        // 7 days ago
        const sevenDaysAgo = new Date(
          now.getTime() - 7 * 24 * 60 * 60 * 1000
        );

        // Fetch all data in parallel
        const [
          user,
          todayLogs,
          activeSession,
          weeklyLogs,
          latestSuggestion,
          gamification,
        ] = await Promise.all([
          prisma.user.findUnique({
            where: { id: userId },
            select: {
              targetExamDate: true,
            },
          }),
          prisma.moodLog.findMany({
            where: {
              userId,
              createdAt: { gte: startOfToday, lte: endOfToday },
            },
            select: { emojiScore: true, stressLevel: true, createdAt: true },
          }),
          prisma.studySession.findFirst({
            where: { userId, isActive: true },
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
          prisma.moodLog.findMany({
            where: {
              userId,
              createdAt: { gte: sevenDaysAgo },
            },
            select: {
              emojiScore: true,
              stressLevel: true,
              createdAt: true,
            },
            orderBy: { createdAt: "asc" },
          }),
          prisma.wellnessSuggestion.findFirst({
            where: { userId, dismissed: false },
            orderBy: { createdAt: "desc" },
            select: {
              id: true,
              userId: true,
              type: true,
              content: true,
              triggerContext: true,
              isAiGenerated: true,
              dismissed: true,
              acted: true,
              createdAt: true,
            },
          }),
          prisma.gamificationRecord.findUnique({
            where: { userId },
            select: {
              currentStreak: true,
              longestStreak: true,
              streakFreezes: true,
              calmFocusPoints: true,
              badges: true,
              lastActivity: true,
            },
          }),
        ]);

        // Today mood metrics
        const logsCount = todayLogs.length;
        const averageScore =
          logsCount > 0
            ? todayLogs.reduce((s, l) => s + l.emojiScore, 0) / logsCount
            : 0;
        const averageStressLevel =
          logsCount > 0
            ? todayLogs.reduce((s, l) => s + l.stressLevel, 0) / logsCount
            : 0;

        // Trend: compare today's mood to yesterday's
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfYesterday.getDate() - 1);
        const endOfYesterday = new Date(startOfToday);
        endOfYesterday.setMilliseconds(-1);

        const yesterdayLogs = await prisma.moodLog.findMany({
          where: {
            userId,
            createdAt: { gte: startOfYesterday, lte: endOfYesterday },
          },
          select: { emojiScore: true },
        });

        let trend: "improving" | "declining" | "stable" = "stable";
        if (logsCount > 0 && yesterdayLogs.length > 0) {
          const yesterdayAvg =
            yesterdayLogs.reduce((s, l) => s + l.emojiScore, 0) /
            yesterdayLogs.length;
          const diff = averageScore - yesterdayAvg;
          if (diff > 0.3) trend = "improving";
          else if (diff < -0.3) trend = "declining";
        }

        // Weekly mood data grouped by date
        const weeklyMap = new Map<
          string,
          { moodSum: number; stressSum: number; count: number }
        >();
        for (const log of weeklyLogs) {
          const fromDate = query.from ? new Date(query.from as string) : undefined;
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
        const weeklyMoodData = Array.from(weeklyMap.entries())
          .sort(([a], [b]) => a.localeCompare(b))
          .map(([date, { moodSum, stressSum, count }]) => ({
            date,
            avgMood: Math.round((moodSum / count) * 100) / 100,
            avgStress: Math.round((stressSum / count) * 100) / 100,
          }));

        // Days to exam
        let daysToExam: number | null = null;
        if (user?.targetExamDate) {
          const msLeft = user.targetExamDate.getTime() - now.getTime();
          daysToExam = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
        }

        return reply.send({
          success: true,
          data: {
            todayMood: {
              averageScore: Math.round(averageScore * 100) / 100,
              averageStressLevel: Math.round(averageStressLevel * 100) / 100,
              trend,
              logsCount,
            },
            activeSession: activeSession ?? null,
            weeklyMoodData,
            latestSuggestion: latestSuggestion ?? null,
            gamification: gamification ?? null,
            daysToExam,
          },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in GET /dashboard/metrics");
        return reply.status(500).send({
          success: false,
          error: "Failed to compile dashboard metrics.",
        });
      }
    }
  );
};
