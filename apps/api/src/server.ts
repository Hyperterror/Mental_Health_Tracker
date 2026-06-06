import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import jwt from "@fastify/jwt";
import rateLimit from "@fastify/rate-limit";
import websocket from "@fastify/websocket";

import { env } from "./config/env.js";
import { prisma } from "./config/prisma.js";
import { authRoutes } from "./routes/auth.route.js";
import { moodRoutes } from "./routes/mood.route.js";
import { sessionRoutes } from "./routes/session.route.js";
import { wellnessRoutes } from "./routes/wellness.route.js";
import { gamificationRoutes } from "./routes/gamification.route.js";
import { dashboardRoutes } from "./routes/dashboard.route.js";
import { userRoutes } from "./routes/user.route.js";

// ============================================================
// Build the Fastify app (exported for testing)
// ============================================================

export async function buildApp() {
  const app = Fastify({
    logger: {
      level: env.NODE_ENV === "production" ? "info" : "debug",
      transport:
        env.NODE_ENV !== "production"
          ? { target: "pino-pretty", options: { colorize: true } }
          : undefined,
    },
  });

  // ── Plugins ──────────────────────────────────────────────

  await app.register(helmet, {
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:"],
        connectSrc: ["'self'", env.FRONTEND_URL],
        frameSrc: ["'none'"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
    crossOriginEmbedderPolicy: false, // Required for face-api.js SharedArrayBuffer
    referrerPolicy: { policy: "no-referrer" },
    xFrameOptions: { action: "deny" },
    xContentTypeOptions: true,
    hsts: {
      maxAge: 31536000,
      includeSubDomains: true,
      preload: true,
    },
  });

  await app.register(cors, {
    origin: [env.FRONTEND_URL],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
  });

  await app.register(rateLimit, {
    max: env.RATE_LIMIT_MAX,
    timeWindow: env.RATE_LIMIT_WINDOW_MS,
    errorResponseBuilder: (_req, context) => ({
      success: false,
      error: `Rate limit exceeded. Try again in ${Math.ceil(context.ttl / 1000)} seconds.`,
    }),
  });

  await app.register(jwt, {
    secret: {
      private: env.JWT_ACCESS_SECRET,
      public: env.JWT_ACCESS_SECRET,
    },
    sign: { expiresIn: "15m" },
  });

  await app.register(websocket);

  // ── Global error handler ──────────────────────────────────

  app.setErrorHandler((error, _request, reply) => {
    app.log.error({ err: error }, "Unhandled error");

    const statusCode = error.statusCode ?? 500;
    const message =
      env.NODE_ENV === "production" && statusCode === 500
        ? "Internal server error"
        : error.message;

    reply.status(statusCode).send({
      success: false,
      error: message,
    });
  });

  // ── Health endpoint ───────────────────────────────────────

  app.get("/health", async (_request, reply) => {
    await reply.send({
      success: true,
      data: {
        status: "ok",
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
      },
    });
  });

  // ── Routes ───────────────────────────────────────────────

  await app.register(authRoutes, { prefix: "/api/v1" });
  await app.register(moodRoutes, { prefix: "/api/v1" });
  await app.register(sessionRoutes, { prefix: "/api/v1" });
  await app.register(wellnessRoutes, { prefix: "/api/v1" });
  await app.register(gamificationRoutes, { prefix: "/api/v1" });
  await app.register(dashboardRoutes, { prefix: "/api/v1" });
  await app.register(userRoutes, { prefix: "/api/v1" });

  return app;
}

// ── Main entry point ──────────────────────────────────────────

async function main() {
  let app: Awaited<ReturnType<typeof buildApp>> | undefined;

  try {
    app = await buildApp();
    await app.listen({ port: env.PORT, host: env.HOST });
    app.log.info(`🚀 MindfulPrep API listening on ${env.HOST}:${env.PORT}`);
  } catch (err) {
    console.error("Fatal startup error:", err);
    process.exit(1);
  }

  // ── Graceful shutdown ───────────────────────────────────

  const shutdown = async (signal: string) => {
    app?.log.info(`Received ${signal}. Graceful shutdown initiated.`);
    try {
      await app?.close();
      await prisma.$disconnect();
      app?.log.info("Connections closed. Goodbye.");
      process.exit(0);
    } catch (err) {
      app?.log.error({ err }, "Error during shutdown");
      process.exit(1);
    }
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));
}

main();
