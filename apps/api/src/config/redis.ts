import { Redis } from "@upstash/redis";
import { env } from "./env.js";

export const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

// Cache key helpers
export const CacheKeys = {
  wellness: (userId: string) => `wellness:suggest:${userId}`,
  session: (sessionId: string) => `session:active:${sessionId}`,
  rateLimit: (ip: string) => `rate:${ip}`,
  userProfile: (userId: string) => `user:profile:${userId}`,
} as const;

export const CACHE_TTL = {
  wellness: 600, // 10 minutes for Claude suggestions
  session: 3600, // 1 hour for active session state
  userProfile: 300, // 5 minutes for profile
} as const;
