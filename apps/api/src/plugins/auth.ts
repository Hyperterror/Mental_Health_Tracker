import {
  FastifyRequest,
  FastifyReply,
  FastifyInstance,
  FastifyPluginAsync,
} from "fastify";
import fp from "fastify-plugin";

// ============================================================
// Extend FastifyRequest to carry decoded user
// ============================================================

import "@fastify/jwt";

declare module "@fastify/jwt" {
  interface FastifyJWT {
    payload: { userId: string; email: string };
    user: {
      userId: string;
      email: string;
    };
  }
}

// ============================================================
// authenticate hook — verify Bearer JWT and attach user
// ============================================================

export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return reply.status(401).send({
        success: false,
        error: "Authorization header missing or malformed.",
      });
    }

    const token = authHeader.slice(7);

    let decoded: { userId: string; email: string };

    try {
      decoded = request.server.jwt.verify<{ userId: string; email: string }>(
        token
      );
    } catch (jwtErr) {
      if (jwtErr instanceof Error) {
        if (jwtErr.name === "TokenExpiredError") {
          return reply.status(401).send({
            success: false,
            error: "Access token has expired. Please refresh your session.",
          });
        }
        if (
          jwtErr.name === "JsonWebTokenError" ||
          jwtErr.name === "NotBeforeError"
        ) {
          return reply.status(401).send({
            success: false,
            error: "Invalid access token.",
          });
        }
      }
      return reply.status(401).send({
        success: false,
        error: "Authentication failed.",
      });
    }

    request.user = {
      userId: decoded.userId,
      email: decoded.email,
    };
  } catch (err) {
    request.server.log.error({ err }, "Unexpected error in authenticate hook");
    return reply.status(500).send({
      success: false,
      error: "Internal authentication error.",
    });
  }
}

// ============================================================
// Auth plugin — exported for registration (no-op decorator)
// ============================================================

const authPlugin: FastifyPluginAsync = async (_fastify: FastifyInstance) => {
  // The authenticate function is exported directly and used per-route.
  // No global preHandler is registered here to keep auth opt-in.
};

export default fp(authPlugin, {
  name: "auth-plugin",
  fastify: "5.x",
});
