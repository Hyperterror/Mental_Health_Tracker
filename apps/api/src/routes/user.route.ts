import { FastifyPluginAsync } from "fastify";
import { prisma } from "../config/prisma.js";
import { redis, CacheKeys } from "../config/redis.js";
import { authenticate } from "../plugins/auth.js";
import { UserProfileUpdateSchema } from "@mindfulprep/shared";

// ============================================================
// User Routes Plugin
// ============================================================

export const userRoutes: FastifyPluginAsync = async (fastify) => {
  // ── GET /user/profile ───────────────────────────────────

  fastify.get(
    "/user/profile",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.userId;

        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: {
            id: true,
            email: true,
            name: true,
            examType: true,
            targetExamDate: true,
            dailyGoalMinutes: true,
            stressCheckInTime: true,
            cameraOptIn: true,
            isMinor: true,
            parentEmail: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
            // Explicitly exclude passwordHash and refreshTokenHash
          },
        });

        if (!user) {
          return reply.status(404).send({
            success: false,
            error: "User not found.",
          });
        }

        return reply.send({
          success: true,
          data: user,
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in GET /user/profile");
        return reply.status(500).send({
          success: false,
          error: "Failed to fetch user profile.",
        });
      }
    }
  );

  // ── PATCH /user/profile ─────────────────────────────────

  fastify.patch(
    "/user/profile",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const parseResult = UserProfileUpdateSchema.safeParse(request.body);
        if (!parseResult.success) {
          return reply.status(400).send({
            success: false,
            error: parseResult.error.issues
              .map((i) => `${i.path.join(".")}: ${i.message}`)
              .join("; "),
          });
        }

        const userId = request.user.userId;
        const updates = parseResult.data;

        // Build update data — only include fields that are present
        const updateData: Record<string, unknown> = {};
        if (updates.name !== undefined) updateData.name = updates.name;
        if (updates.examType !== undefined) updateData.examType = updates.examType;
        if (updates.targetExamDate !== undefined) {
          updateData.targetExamDate = new Date(updates.targetExamDate);
        }
        if (updates.dailyGoalMinutes !== undefined) {
          updateData.dailyGoalMinutes = updates.dailyGoalMinutes;
        }
        if (updates.stressCheckInTime !== undefined) {
          updateData.stressCheckInTime = updates.stressCheckInTime;
        }
        if (updates.cameraOptIn !== undefined) {
          updateData.cameraOptIn = updates.cameraOptIn;
        }

        if (Object.keys(updateData).length === 0) {
          return reply.status(400).send({
            success: false,
            error: "No valid fields provided for update.",
          });
        }

        const updatedUser = await prisma.user.update({
          where: { id: userId },
          data: updateData,
          select: {
            id: true,
            email: true,
            name: true,
            examType: true,
            targetExamDate: true,
            dailyGoalMinutes: true,
            stressCheckInTime: true,
            cameraOptIn: true,
            isMinor: true,
            parentEmail: true,
            createdAt: true,
            updatedAt: true,
            lastLoginAt: true,
          },
        });

        // Invalidate Redis profile cache
        await redis.del(CacheKeys.userProfile(userId));

        return reply.send({
          success: true,
          data: updatedUser,
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in PATCH /user/profile");
        return reply.status(500).send({
          success: false,
          error: "Failed to update user profile.",
        });
      }
    }
  );

  // ── DELETE /user ────────────────────────────────────────

  fastify.delete(
    "/user",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        const userId = request.user.userId;

        // Cascading delete — Prisma schema has onDelete: Cascade on all relations
        await prisma.user.delete({
          where: { id: userId },
        });

        // Clean up Redis keys
        await redis.del(CacheKeys.userProfile(userId));
        await redis.del(CacheKeys.wellness(userId));

        return reply.send({
          success: true,
          data: {
            message:
              "Account and all associated data deleted successfully.",
          },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in DELETE /user");
        return reply.status(500).send({
          success: false,
          error: "Failed to delete user account.",
        });
      }
    }
  );
};
