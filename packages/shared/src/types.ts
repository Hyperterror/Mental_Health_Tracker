// ============================================================
// MindfulPrep — Shared TypeScript Interfaces
// ============================================================

import { ExamType, SuggestionType, SessionMode, PatternType, BadgeCode } from "./enums.js";

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  examType: ExamType;
  targetExamDate: string | null;
  dailyGoalMinutes: number;
  stressCheckInTime: string;
  cameraOptIn: boolean;
  createdAt: string;
}

export interface MoodLogRecord {
  id: string;
  userId: string;
  emojiScore: number;
  stressLevel: number;
  tags: string[];
  journalText: string | null;
  createdAt: string;
}

export interface MoodPatternsResult {
  peakStressHour: number;
  averageMoodScore: number;
  averageStressLevel: number;
  topTriggerTags: Array<{ tag: string; count: number }>;
  moodTrend: "improving" | "declining" | "stable";
  weeklyData: Array<{ date: string; avgMood: number; avgStress: number }>;
}

export interface StudySessionRecord {
  id: string;
  userId: string;
  examType: ExamType;
  mode: SessionMode;
  workDuration: number;
  breakDuration: number;
  completedPomodoros: number;
  breaksTaken: number;
  breakCompliance: number;
  triggerFlags: string[];
  wellnessScore: number | null;
  isActive: boolean;
  endTime: string | null;
  createdAt: string;
}

export interface WellnessSuggestionRecord {
  id: string;
  userId: string;
  type: SuggestionType;
  content: string;
  triggerContext: string;
  isAiGenerated: boolean;
  dismissed: boolean;
  acted: boolean;
  createdAt: string;
}

export interface GamificationState {
  currentStreak: number;
  longestStreak: number;
  streakFreezes: number;
  calmFocusPoints: number;
  badges: BadgeCode[];
  lastActivity: string;
}

export interface StressTriggerPatternRecord {
  id: string;
  userId: string;
  patternType: PatternType;
  frequency: number;
  severity: number;
  details: Record<string, unknown>;
  detectedAt: string;
  lastSeenAt: string;
  isActive: boolean;
}


export interface PomodoroInput {
  moodScore: number;
  stressLevel: number;
  completedSessionsToday: number;
  currentHour: number;
}

export interface ClaudeWellnessResponse {
  suggestions: Array<{
    type: SuggestionType;
    content: string;
    triggerContext: string;
  }>;
}

export interface DashboardMetrics {
  todayMood: {
    averageScore: number;
    trend: "improving" | "declining" | "stable";
    logsCount: number;
  };
  activeSession: StudySessionRecord | null;
  weeklyMoodData: Array<{ date: string; avgMood: number; avgStress: number }>;
  latestSuggestion: WellnessSuggestionRecord | null;
  gamification: GamificationState;
  daysToExam: number | null;
}

// Mood tag constants
export const MOOD_TAGS = [
  "Fear of results",
  "Syllabus pressure",
  "Family pressure",
  "Peer comparison",
  "Tired",
  "Distracted",
  "Motivated",
  "MockTest",
  "Backlog",
  "NoSleep",
  "Procrastinating",
  "Overwhelmed",
] as const;

export type MoodTag = (typeof MOOD_TAGS)[number];

// Badge metadata for UI display
export const BADGE_METADATA: Record<BadgeCode, { title: string; description: string; emoji: string }> = {
  [BadgeCode.FIRST_CALM_SESSION]: {
    title: "First Calm Session",
    description: "Completed your first session in CALM mode",
    emoji: "🌿",
  },
  [BadgeCode.FIVE_DAY_STREAK]: {
    title: "5-Day Streak",
    description: "Studied consistently for 5 days",
    emoji: "🔥",
  },
  [BadgeCode.TEN_DAY_STREAK]: {
    title: "10-Day Streak",
    description: "Studied consistently for 10 days",
    emoji: "⚡",
  },
  [BadgeCode.HYDRATION_HERO]: {
    title: "Hydration Hero",
    description: "Acted on a hydration suggestion",
    emoji: "💧",
  },
  [BadgeCode.RECOVERY_MODE_MASTER]: {
    title: "Recovery Mode Master",
    description: "Chose Recovery mode when stressed",
    emoji: "🌙",
  },
  [BadgeCode.JOURNAL_KEEPER]: {
    title: "Journal Keeper",
    description: "Added journal text in 3 mood logs",
    emoji: "📓",
  },
  [BadgeCode.EARLY_BIRD]: {
    title: "Early Bird",
    description: "Completed a session before 7am",
    emoji: "🌅",
  },
  [BadgeCode.NIGHT_OWL_DETECTED]: {
    title: "Night Owl",
    description: "Studied after midnight — consider rest!",
    emoji: "🦉",
  },
  [BadgeCode.MINDFUL_BREATHER]: {
    title: "Mindful Breather",
    description: "Completed a breathing exercise",
    emoji: "🧘",
  },
  [BadgeCode.FOCUS_100]: {
    title: "Focus 100",
    description: "Earned 100 Calm Focus Points",
    emoji: "💯",
  },
  [BadgeCode.MOOD_LOGGER_7]: {
    title: "Mood Tracker",
    description: "Logged mood for 7 consecutive days",
    emoji: "📊",
  },
};
