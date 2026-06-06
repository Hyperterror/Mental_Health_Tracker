import { FastifyPluginAsync } from "fastify";
import { prisma } from "../config/prisma.js";
import {
  RegisterSchema,
  LoginSchema,
  RefreshTokenSchema,
} from "@mindfulprep/shared";
import {
  hashPassword,
  verifyPassword,
  generateTokens,
  verifyRefreshToken,
} from "../services/auth.service.js";
import { authenticate } from "../plugins/auth.js";

// ============================================================
// Auth Routes Plugin
// ============================================================

export const authRoutes: FastifyPluginAsync = async (fastify) => {
  // ── POST /auth/register ─────────────────────────────────
  // Rate limit: 3 registrations per hour per IP (prevents account farming)
  fastify.post(
    "/auth/register",
    {
      config: {
        rateLimit: {
          max: 3,
          timeWindow: "1 hour",
          errorResponseBuilder: () => ({
            success: false,
            error: "Too many registration attempts. Please try again in 1 hour.",
          }),
        },
      },
    },
    async (request, reply) => {
    try {
      const parseResult = RegisterSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: parseResult.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        });
      }

      const {
        name,
        email,
        password,
        examType,
        targetExamDate: targetExamDate || undefined,
        dailyGoalMinutes,
        isMinor,
        parentEmail: parentEmail || undefined,
      } = parseResult.data;

      // Check if email already taken
      const existing = await prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existing) {
        return reply.status(409).send({
          success: false,
          error: "An account with this email already exists.",
        });
      }

      // Validate minor consent
      if (isMinor && !parentEmail) {
        return reply.status(400).send({
          success: false,
          error: "Parent email is required for minor accounts.",
        });
      }

      const passwordHash = await hashPassword(password);

      // Create user + gamification in a transaction
      const user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name,
            email,
            passwordHash,
            examType,
            targetExamDate: targetExamDate
              ? targetExamDate ? new Date(targetExamDate as string) : undefined
              : undefined,
            dailyGoalMinutes,
            isMinor,
            parentEmail: isMinor ? parentEmail : undefined,
          },
          select: { id: true, email: true, name: true },
        });

        await tx.gamificationRecord.create({
          data: {
            userId: newUser.id,
            currentStreak: 0,
            longestStreak: 0,
            streakFreezes: 1,
            calmFocusPoints: 0,
            badges: [],
          },
        });

        return newUser;
      });

      const tokens = generateTokens(user.id, user.email, fastify);

      // Store hashed refresh token
      const refreshHash = await hashPassword(tokens.refreshToken);
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: refreshHash },
      });

      return reply.status(201).send({
        success: true,
        data: tokens,
      });
    } catch (err) {
      fastify.log.error({ err }, "Error in POST /auth/register");
      return reply.status(500).send({
        success: false,
        error: "Registration failed. Please try again.",
      });
    }
  });

  // ── POST /auth/login ────────────────────────────────────
  // Rate limit: 5 attempts per 15 minutes per IP (brute-force protection)
  fastify.post(
    "/auth/login",
    {
      config: {
        rateLimit: {
          max: 5,
          timeWindow: "15 minutes",
          errorResponseBuilder: () => ({
            success: false,
            error: "Too many login attempts. Please try again in 15 minutes.",
          }),
        },
      },
    },
    async (request, reply) => {
    try {
      const parseResult = LoginSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: parseResult.error.issues
            .map((i) => `${i.path.join(".")}: ${i.message}`)
            .join("; "),
        });
      }

      const { email, password } = parseResult.data;

      const user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          name: true,
          passwordHash: true,
        },
      });

      if (!user) {
        return reply.status(401).send({
          success: false,
          error: "Invalid email or password.",
        });
      }

      const valid = await verifyPassword(user.passwordHash, password);
      if (!valid) {
        return reply.status(401).send({
          success: false,
          error: "Invalid email or password.",
        });
      }

      const tokens = generateTokens(user.id, user.email, fastify);
      const refreshHash = await hashPassword(tokens.refreshToken);

      await prisma.user.update({
        where: { id: user.id },
        data: {
          lastLoginAt: new Date(),
          refreshTokenHash: refreshHash,
        },
      });

      return reply.send({
        success: true,
        data: tokens,
      });
    } catch (err) {
      fastify.log.error({ err }, "Error in POST /auth/login");
      return reply.status(500).send({
        success: false,
        error: "Login failed. Please try again.",
      });
    }
  });

  // ── POST /auth/refresh ──────────────────────────────────

  fastify.post("/auth/refresh", async (request, reply) => {
    try {
      const parseResult = RefreshTokenSchema.safeParse(request.body);
      if (!parseResult.success) {
        return reply.status(400).send({
          success: false,
          error: "refreshToken is required.",
        });
      }

      const { refreshToken } = parseResult.data;

      let payload: { userId: string };
      try {
        payload = verifyRefreshToken(refreshToken, fastify);
      } catch (err) {
        const statusCode =
          err instanceof Error && "statusCode" in err
            ? (err as NodeJS.ErrnoException & { statusCode: number })
                .statusCode
            : 401;
        return reply.status(statusCode).send({
          success: false,
          error:
            err instanceof Error ? err.message : "Invalid refresh token.",
        });
      }

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, email: true, refreshTokenHash: true },
      });

      if (!user || !user.refreshTokenHash) {
        return reply.status(401).send({
          success: false,
          error: "Session not found. Please log in again.",
        });
      }

      // Verify the stored refresh token hash matches
      const hashMatch = await verifyPassword(
        user.refreshTokenHash,
        refreshToken
      );
      if (!hashMatch) {
        return reply.status(401).send({
          success: false,
          error: "Refresh token mismatch. Please log in again.",
        });
      }

      const tokens = generateTokens(user.id, user.email, fastify);
      const newRefreshHash = await hashPassword(tokens.refreshToken);

      await prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: newRefreshHash },
      });

      return reply.send({
        success: true,
        data: tokens,
      });
    } catch (err) {
      fastify.log.error({ err }, "Error in POST /auth/refresh");
      return reply.status(500).send({
        success: false,
        error: "Token refresh failed.",
      });
    }
  });

  // ── POST /auth/logout ───────────────────────────────────

  fastify.post(
    "/auth/logout",
    { preHandler: [authenticate] },
    async (request, reply) => {
      try {
        await prisma.user.update({
          where: { id: request.user.userId },
          data: { refreshTokenHash: null },
        });

        return reply.send({
          success: true,
          data: { message: "Logged out successfully." },
        });
      } catch (err) {
        fastify.log.error({ err }, "Error in POST /auth/logout");
        return reply.status(500).send({
          success: false,
          error: "Logout failed.",
        });
      }
    }
  );
};
