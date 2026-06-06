import { FastifyPluginAsync } from "fastify";
import { prisma } from "../config/prisma.js";
import { authenticate } from "../plugins/auth.js";
import { BADGE_METADATA, BadgeCode } from "@mindfulprep/shared";

// ============================================================
// Gamification Routes Plugin
// ============================================================

export const gamificationRoutes: FastifyPluginAsync = async (fastify) => {
  // ── GET /gamification/profile ───────────────────────────

  fastify.get(
    "/gamification/profile",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.userId;

        const record = await prisma.gamificationRecord.findUnique({
          where: { userId },
          select: {
            id: true,
            currentStreak: true,
            longestStreak: true,
            streakFreezes: true,
            calmFocusPoints: true,
            badges: true,
            lastActivity: true,
            updatedAt: true,
          },
        });

        if (!record) {
          return reply.status(404).send({
            success: false,
            error: "Gamification record not found.",
          });
        }

        // Enrich badges with metadata
        const badgesWithMeta = record.badges.map((code) => ({
          code,
          ...(BADGE_METADATA[code as BadgeCode] ?? {
            title: code,
            description: "Badge",
            emoji: "🏅",
          }),
        }));

        return reply.send({
          success: true,
          data: {
            currentStreak: record.currentStreak,
            longestStreak: record.longestStreak,
            streakFreezes: record.streakFreezes,
            calmFocusPoints: record.calmFocusPoints,
            badges: badgesWithMeta,
            lastActivity: record.lastActivity,
            updatedAt: record.updatedAt,
          },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in GET /gamification/profile");
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch gamification profile.",
        });
      }
    }
  );

  // ── POST /gamification/streak-freeze ───────────────────

  fastify.post(
    "/gamification/streak-freeze",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.userId;

        const record = await prisma.gamificationRecord.findUnique({
          where: { userId },
          select: {
            streakFreezes: true,
            currentStreak: true,
            longestStreak: true,
          },
        });

        if (!record) {
          return reply.status(404).send({
            success: false,
            error: "Gamification record not found.",
          });
        }

        if (record.streakFreezes <= 0) {
          return reply.status(400).send({
            success: false,
            error:
              "No streak freezes remaining. Earn more by completing sessions.",
          });
        }

        const newStreak = record.currentStreak + 1;
        const newLongest = Math.max(newStreak, record.longestStreak);

        const updated = await prisma.gamificationRecord.update({
          where: { userId },
          data: {
            streakFreezes: Math.max(0, record.streakFreezes - 1),
            currentStreak: newStreak,
            longestStreak: newLongest,
            lastActivity: new Date(),
          },
          select: {
            currentStreak: true,
            longestStreak: true,
            streakFreezes: true,
            calmFocusPoints: true,
            badges: true,
            lastActivity: true,
          },
        });

        return reply.send({
          success: true,
          data: {
            message: "Streak freeze applied successfully.",
            currentStreak: updated.currentStreak,
            longestStreak: updated.longestStreak,
            streakFreezesRemaining: updated.streakFreezes,
          },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in POST /gamification/streak-freeze");
        return reply.status(500).send({
          success: false,
          error: "Failed to apply streak freeze.",
        });
      }
    }
  );
};
