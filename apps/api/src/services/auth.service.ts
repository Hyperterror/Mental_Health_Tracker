import argon2 from "argon2";
import { FastifyInstance } from "fastify";
import { prisma } from "../config/prisma.js";
import { RegisterInput, TokenResponse, ApiResponse } from "@mindfulprep/shared";
import jwt from "jsonwebtoken";
import { env } from "../config/env.js";

// ============================================================
// Types
// ============================================================

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // seconds
}

/**
 * Registers a new user with the specified credentials.
 * @param data - The user registration payload containing email, name, password, etc.
 * @returns An ApiResponse containing the newly created user and JWT tokens.
 */
export async function registerUser(data: any): Promise<ApiResponse<{ user: any; accessToken: string; refreshToken: string }>> { expiresIn: number; // seconds
}

export interface RefreshPayload {
  userId: string;
}

// ============================================================
// Password hashing
// ============================================================

/**
 * Hashes a plaintext password using Argon2id.
 * @param password - The raw password string to hash.
 * @returns The resulting hash string.
 */
export async function hashPassword(password: string): Promise<string> {
  try {
    return await argon2.hash(password, {
      type: argon2.argon2id,
      memoryCost: 65536, // 64 MB
      timeCost: 3,
      parallelism: 1,
    });
  } catch (err) {
    throw new Error(
      `Failed to hash password: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

export async function verifyPassword(
  hash: string,
  password: string
): Promise<boolean> {
  try {
    return await argon2.verify(hash, password);
  } catch (err) {
    // argon2.verify throws on invalid hash format
    throw new Error(
      `Failed to verify password: ${err instanceof Error ? err.message : String(err)}`
    );
  }
}

// ============================================================
// Token generation
// ============================================================

/**
 * Generates an access token (15 min) and a refresh token (7 days).
 * Access token is signed with JWT_ACCESS_SECRET.
 * Refresh token is signed with JWT_REFRESH_SECRET via a separate sign call.
 */
export function generateTokens(
  userId: string,
  email: string,
  fastify: FastifyInstance
): TokenPair {
  const ACCESS_EXPIRY_SECONDS = 15 * 60; // 15 minutes
  const REFRESH_EXPIRY_SECONDS = 7 * 24 * 60 * 60; // 7 days

  const accessToken = jwt.sign(
    { userId, email },
    env.JWT_ACCESS_SECRET,
    { expiresIn: ACCESS_EXPIRY_SECONDS }
  );

  const refreshToken = jwt.sign(
    { userId },
    env.JWT_REFRESH_SECRET,
    { expiresIn: REFRESH_EXPIRY_SECONDS }
  );

  return {
    accessToken,
    refreshToken,
    expiresIn: ACCESS_EXPIRY_SECONDS,
  };
}

// ============================================================
// Refresh token verification
// ============================================================

export function verifyRefreshToken(
  token: string,
  fastify: FastifyInstance
): RefreshPayload {
  try {
    const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshPayload;
    return { userId: decoded.userId };
  } catch (err) {
    if (err instanceof Error) {
      if (err.name === "TokenExpiredError") {
        throw Object.assign(new Error("Refresh token has expired."), {
          statusCode: 401,
        });
      }
      if (err.name === "JsonWebTokenError") {
        throw Object.assign(new Error("Invalid refresh token."), {
          statusCode: 401,
        });
      }
    }
    throw Object.assign(new Error("Refresh token verification failed."), {
      statusCode: 401,
    });
  }
}
