import { ExamType, SuggestionType } from "@mindfulprep/shared";

// ============================================================
// Gemini AI Prompt Templates for MindfulPrep Wellness
// Model: gemini-2.0-flash
// ============================================================

export interface WellnessPromptContext {
  studentName: string;
  examType: ExamType;
  daysToExam: number | null;
  recentMoodLogs: Array<{
    emojiScore: number;
    stressLevel: number;
    tags: string[];
    journalText?: string | null;
    createdAt: string;
  }>;
  currentSession: {
    mode: string;
    completedPomodoros: number;
    durationMinutes: number;
  } | null;
  studentGoal: string;
}

export const WELLNESS_SYSTEM_PROMPT = `You are a compassionate cognitive behavioral therapist and academic wellness expert specializing in helping Indian students navigate the extreme pressures of competitive exam preparation.

Your role is to provide personalized, empathetic, and actionable wellness interventions. You deeply understand the unique stressors of JEE, NEET, UPSC, CAT, GATE, CUET, and board exam preparation: the fear of failure, parental expectations, peer comparison, syllabus anxiety, and burnout.

STRICT OUTPUT FORMAT:
Return ONLY valid JSON matching this exact schema. No preamble, no markdown, no extra text.
{
  "suggestions": [
    {
      "type": "BREATHING" | "HYDRATION" | "STRETCH" | "TASK_SWITCH" | "REST" | "JOURNAL" | "MINDFULNESS" | "COGNITIVE_REFRAMING",
      "content": "string (max 200 chars, warm, empathetic, actionable first-person instruction)",
      "triggerContext": "string (max 100 chars, specific reason based on student data)"
    }
  ]
}

RULES:
1. Generate exactly 2 suggestions of different types
2. Content must be warm, never clinical. Address the student by name.
3. Acknowledge the exam pressure context specifically
4. For BREATHING: include exact technique (e.g., 4-7-8 or box breathing with counts)
5. For COGNITIVE_REFRAMING: challenge a specific negative thought pattern you detected
6. For JOURNAL: give a specific reflective prompt, not just "write your thoughts"
7. Never dismiss or minimize the student's stress — validate it first
8. If daysToExam < 7: prioritize REST and BREATHING, avoid TASK_SWITCH
9. If journalText contains negative self-talk: address it directly in COGNITIVE_REFRAMING`;

export function buildWellnessPrompt(ctx: WellnessPromptContext): string {
  const examInfo = ctx.daysToExam !== null
    ? `${ctx.daysToExam} days until ${ctx.examType} exam`
    : `preparing for ${ctx.examType}`;

  const moodSummary = ctx.recentMoodLogs
    .slice(0, 3)
    .map((log, i) => {
      const journalInfo = log.journalText
        ? `\n  Journal: "${log.journalText.slice(0, 150)}"`
        : "";
      return `Log ${i + 1} (${new Date(log.createdAt).toLocaleDateString("en-IN")}):
  Mood: ${log.emojiScore}/5 | Stress: ${log.stressLevel}/10 | Tags: ${log.tags.join(", ") || "none"}${journalInfo}`;
    })
    .join("\n\n");

  const sessionInfo = ctx.currentSession
    ? `Current session: ${ctx.currentSession.mode} mode, ${ctx.currentSession.completedPomodoros} Pomodoros completed, ${ctx.currentSession.durationMinutes} minutes studied`
    : "No active session";

  return `Student Profile:
- Name: ${ctx.studentName}
- Exam: ${examInfo}
- Daily goal: ${ctx.studentGoal}

Recent Mood Logs (last 3):
${moodSummary}

${sessionInfo}

Based on this data, provide exactly 2 targeted wellness interventions.`;
}

// ── Response Validator ──────────────────────────────────────

import { z } from "zod";

const GeminiWellnessSuggestionSchema = z.object({
  type: z.nativeEnum(SuggestionType),
  content: z.string().min(10).max(250),
  triggerContext: z.string().min(5).max(150),
});

export const GeminiWellnessResponseSchema = z.object({
  suggestions: z.array(GeminiWellnessSuggestionSchema).min(1).max(3),
});

export type GeminiWellnessResponse = z.infer<typeof GeminiWellnessResponseSchema>;
export type GeminiWellnessSuggestion = z.infer<typeof GeminiWellnessSuggestionSchema>;

/**
 * Parse and validate Gemini API response text
 * Returns null if parsing/validation fails (trigger fallback)
 */
export function parseGeminiWellnessResponse(rawText: string): GeminiWellnessResponse | null {
  try {
    // Strip markdown code fences if Gemini wraps JSON in ```json ... ```
    const stripped = rawText.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/i, "").trim();
    const jsonMatch = stripped.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;

    const parsed: unknown = JSON.parse(jsonMatch[0]);
    const result = GeminiWellnessResponseSchema.safeParse(parsed);

    if (!result.success) {
      console.error("Gemini response validation failed:", result.error.flatten());
      return null;
    }

    return result.data;
  } catch {
    return null;
  }
}

// Legacy aliases for backwards compatibility
export const ClaudeWellnessResponseSchema = GeminiWellnessResponseSchema;
export type ClaudeWellnessResponse = GeminiWellnessResponse;
export const parseClaudeWellnessResponse = parseGeminiWellnessResponse;

// ── Fallback Rule Engine ────────────────────────────────────

interface FallbackInput {
  moodScore: number;
  stressLevel: number;
  tags: string[];
  daysToExam: number | null;
}

interface FallbackSuggestion {
  type: SuggestionType;
  content: string;
  triggerContext: string;
}

export function getRuleBasedFallback(input: FallbackInput): FallbackSuggestion {
  const { moodScore, stressLevel, tags, daysToExam } = input;

  // Critical pre-exam stress
  if (daysToExam !== null && daysToExam <= 3 && stressLevel >= 7) {
    return {
      type: SuggestionType.BREATHING,
      content:
        "Exam is very close — your preparation got you here. Try 4-7-8 breathing: inhale 4s, hold 7s, exhale 8s. Repeat 3 times to calm your nervous system.",
      triggerContext: `${daysToExam} days to exam + high stress (${stressLevel}/10)`,
    };
  }

  // Sleep deprived / very tired
  if (tags.includes("Tired") || tags.includes("NoSleep")) {
    return {
      type: SuggestionType.REST,
      content:
        "Your brain consolidates learning during sleep. Even a 20-minute power nap now will improve recall by 40%. It's not laziness — it's smart studying.",
      triggerContext: "Fatigue/sleep deprivation tags detected",
    };
  }

  // Overwhelmed and low mood
  if (moodScore <= 2 && (tags.includes("Overwhelmed") || tags.includes("Syllabus pressure"))) {
    return {
      type: SuggestionType.COGNITIVE_REFRAMING,
      content:
        "The syllabus feels like a mountain today. Pick just ONE topic for the next 25 minutes — not the whole syllabus. Progress compounds. One brick at a time.",
      triggerContext: `Low mood (${moodScore}/5) + overwhelm detected`,
    };
  }

  // Post mock test crash
  if (tags.includes("MockTest")) {
    return {
      type: SuggestionType.JOURNAL,
      content:
        "Mock tests reveal gaps, not your worth. Write down: (1) One thing you did well, (2) One specific weak area to address, (3) One action step for tomorrow.",
      triggerContext: "MockTest tag + performance processing needed",
    };
  }

  // High stress but ok mood — physical release
  if (stressLevel >= 7 && moodScore >= 3) {
    return {
      type: SuggestionType.STRETCH,
      content:
        "Stand up, roll your shoulders back 5 times, reach for the ceiling for 10 seconds, then take 3 slow deep breaths. This resets your cortisol response.",
      triggerContext: `High stress (${stressLevel}/10) with stable mood`,
    };
  }

  // Distracted
  if (tags.includes("Distracted")) {
    return {
      type: SuggestionType.TASK_SWITCH,
      content:
        "Distraction often signals your brain needs a change. Switch to a different subject for the next 25 minutes — sometimes novelty is the cure for a wandering mind.",
      triggerContext: "Distraction pattern detected",
    };
  }

  // Family/peer pressure
  if (tags.includes("Family pressure") || tags.includes("Peer comparison")) {
    return {
      type: SuggestionType.MINDFULNESS,
      content:
        "Your journey is your own. Close your eyes for 60 seconds. Breathe naturally. Remind yourself: 'I am doing my best today, and my best is enough right now.'",
      triggerContext: "External pressure stressors detected",
    };
  }

  // Hydration default
  if (stressLevel >= 5) {
    return {
      type: SuggestionType.HYDRATION,
      content:
        "Mild dehydration reduces cognitive performance by up to 20%. Drink a full glass of water right now. Your brain will thank you in the next study block.",
      triggerContext: `Moderate stress (${stressLevel}/10) — hydration reset`,
    };
  }

  // Generic mindfulness
  return {
    type: SuggestionType.BREATHING,
    content:
      "Take a quick box breathing break: inhale 4s → hold 4s → exhale 4s → hold 4s. Do this 3 times. It takes 48 seconds and will sharpen your focus.",
    triggerContext: "Routine wellness check",
  };
}
