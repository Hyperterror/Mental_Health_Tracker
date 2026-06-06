import { z } from "zod";
import { ExamType, SuggestionType, SessionMode } from "./enums.js";

// ─────────────────────────── API Response ───────────────────────────

export const ApiResponseSchema = <T extends z.ZodTypeAny>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema.optional(),
    error: z.string().optional(),
    message: z.string().optional(),
  });

// ─────────────────────────── Auth ───────────────────────────

export const RegisterSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  password: z
    .string()
    .min(8)
    .regex(/[A-Z]/, "Must contain uppercase")
    .regex(/[0-9]/, "Must contain number"),
  examType: z.nativeEnum(ExamType),
  targetExamDate: z.string().datetime().optional(),
  dailyGoalMinutes: z.number().int().min(30).max(720).default(150),
  isMinor: z.boolean().default(false),
  parentEmail: z.string().email().optional(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const RefreshTokenSchema = z.object({
  refreshToken: z.string().min(1),
});

export const TokenResponseSchema = z.object({
  accessToken: z.string(),
  refreshToken: z.string(),
  expiresIn: z.number(),
});

// ─────────────────────────── Mood ───────────────────────────

export const MoodLogCreateSchema = z.object({
  emojiScore: z.number().int().min(1).max(5),
  stressLevel: z.number().int().min(1).max(10),
  tags: z.array(z.string().max(50)).max(10).default([]),
  journalText: z.string().max(500).optional(),
});

export const MoodHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  from: z.string().datetime().optional(),
  to: z.string().datetime().optional(),
});

// ─────────────────────────── Study Session ───────────────────────────

export const SessionStartSchema = z.object({
  examType: z.nativeEnum(ExamType),
  initialMoodScore: z.number().int().min(1).max(5).optional(),
  initialStressLevel: z.number().int().min(1).max(10).optional(),
  preferredMode: z.nativeEnum(SessionMode).optional(),
});

export const SessionHeartbeatSchema = z.object({
  sessionId: z.string().cuid(),
  focusSignal: z.number().min(0).max(1), // 0 = distracted, 1 = focused
});

export const SessionEndSchema = z.object({
  sessionId: z.string().cuid(),
  endMoodScore: z.number().int().min(1).max(5).optional(),
  endStressLevel: z.number().int().min(1).max(10).optional(),
});

// ─────────────────────────── Fatigue Event ───────────────────────────

export const FatigueEventSchema = z.object({
  sessionId: z.string().cuid(),
  confidenceScore: z.number().min(0).max(1),
  signalType: z.enum(["eyes_closed", "head_slump", "blink_deviation", "squinting"]),
});

// ─────────────────────────── Wellness ───────────────────────────

export const WellnessSuggestionSchema = z.object({
  id: z.string(),
  type: z.nativeEnum(SuggestionType),
  content: z.string(),
  triggerContext: z.string(),
  isAiGenerated: z.boolean(),
  dismissed: z.boolean(),
  acted: z.boolean(),
  createdAt: z.string(),
});

export const SuggestionActionSchema = z.object({
  id: z.string().cuid(),
});

// ─────────────────────────── Gamification ───────────────────────────

export const GamificationProfileSchema = z.object({
  currentStreak: z.number().int(),
  longestStreak: z.number().int(),
  streakFreezes: z.number().int(),
  calmFocusPoints: z.number().int(),
  badges: z.array(z.string()),
  lastActivity: z.string(),
});

// ─────────────────────────── Pomodoro ───────────────────────────

export const PomodoroRecommendationSchema = z.object({
  mode: z.nativeEnum(SessionMode),
  workDuration: z.number().int(),
  breakDuration: z.number().int(),
  label: z.string(),
  reasoning: z.string(),
});

// ─────────────────────────── User Profile ───────────────────────────

export const UserProfileUpdateSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  examType: z.nativeEnum(ExamType).optional(),
  targetExamDate: z.string().datetime().optional(),
  dailyGoalMinutes: z.number().int().min(30).max(720).optional(),
  stressCheckInTime: z
    .string()
    .regex(/^([01]\d|2[0-3]):([0-5]\d)$/)
    .optional(),
  cameraOptIn: z.boolean().optional(),
});

// Type exports
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type LoginInput = z.infer<typeof LoginSchema>;
export type TokenResponse = z.infer<typeof TokenResponseSchema>;
export type MoodLogCreate = z.infer<typeof MoodLogCreateSchema>;
export type MoodHistoryQuery = z.infer<typeof MoodHistoryQuerySchema>;
export type SessionStart = z.infer<typeof SessionStartSchema>;
export type SessionHeartbeat = z.infer<typeof SessionHeartbeatSchema>;
export type SessionEnd = z.infer<typeof SessionEndSchema>;
export type FatigueEvent = z.infer<typeof FatigueEventSchema>;
export type WellnessSuggestion = z.infer<typeof WellnessSuggestionSchema>;
export type GamificationProfile = z.infer<typeof GamificationProfileSchema>;
export type PomodoroRecommendation = z.infer<typeof PomodoroRecommendationSchema>;
export type UserProfileUpdate = z.infer<typeof UserProfileUpdateSchema>;
