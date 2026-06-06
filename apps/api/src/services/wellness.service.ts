import { SuggestionType, ExamType } from "@mindfulprep/shared";
import { prisma } from "../config/prisma.js";
import { redis, CacheKeys, CACHE_TTL } from "../config/redis.js";
import { gemini, GEMINI_MODEL } from "../config/gemini.js";

// ============================================================
// Types
// ============================================================

interface MoodLogSnapshot {
  emojiScore: number;
  stressLevel: number;
  tags: string[];
  journalText: string | null;
  createdAt: Date;
}

interface SessionSnapshot {
  mode: string;
  completedPomodoros: number;
  breaksTaken: number;
  wellnessScore: number | null;
  triggerFlags: string[];
}

interface UserSnapshot {
  id: string;
  name: string;
  examType: ExamType;
  targetExamDate: Date | null;
}

interface SuggestionResult {
  type: SuggestionType;
  content: string;
  triggerContext: string;
  isAiGenerated: boolean;
}

interface CachedSuggestion {
  type: SuggestionType;
  content: string;
  triggerContext: string;
  isAiGenerated: boolean;
}

// ============================================================
// Rule-based suggestion engine
// ============================================================

export function getRuleBasedSuggestion(
  moodScore: number,
  stressLevel: number,
  tags: string[]
): SuggestionResult {
  // Rule priority order

  if (stressLevel >= 8) {
    return {
      type: SuggestionType.BREATHING,
      content:
        "Try the 4-7-8 breathing technique to calm your nervous system:\n\n" +
        "1. Exhale completely through your mouth.\n" +
        "2. Close your mouth and inhale quietly through your nose for **4 counts**.\n" +
        "3. Hold your breath for **7 counts**.\n" +
        "4. Exhale completely through your mouth for **8 counts**.\n\n" +
        "Repeat this cycle 4 times. It activates your parasympathetic nervous system and reduces cortisol.",
      triggerContext: `Stress level ${stressLevel}/10 detected — breathing exercise recommended.`,
      isAiGenerated: false,
    };
  }

  if (tags.includes("Tired") || stressLevel >= 7) {
    return {
      type: SuggestionType.HYDRATION,
      content:
        "💧 **Hydration check!** You may be dehydrated — this causes fatigue, difficulty concentrating, and increased stress perception.\n\n" +
        "Drink 1–2 glasses of water right now. Step away from your screen for 2 minutes while you hydrate.\n\n" +
        "Aim for 8 glasses (2 litres) throughout your study day.",
      triggerContext: `Fatigue/high stress detected — hydration reminder.`,
      isAiGenerated: false,
    };
  }

  if (moodScore <= 2 && tags.includes("Overwhelmed")) {
    return {
      type: SuggestionType.COGNITIVE_REFRAMING,
      content:
        "🌱 **Cognitive Reframing Exercise**\n\n" +
        "When overwhelmed, try this 3-step thought reset:\n\n" +
        "1. **Identify the thought**: Write down exactly what's worrying you.\n" +
        "2. **Challenge it**: Ask yourself — \"Is this thought 100% true? What evidence do I have?\"\n" +
        "3. **Replace it**: Write a more balanced version. E.g., 'I can't handle this exam' → 'This topic is hard, but I've handled hard things before.'\n\n" +
        "This technique rewires how your brain processes stress over time.",
      triggerContext: `Low mood (${moodScore}/5) + Overwhelmed tag — cognitive reframing suggested.`,
      isAiGenerated: false,
    };
  }

  if (moodScore >= 4 && stressLevel >= 6) {
    return {
      type: SuggestionType.STRETCH,
      content:
        "🧘 **2-Minute Desk Stretch** — your body needs movement!\n\n" +
        "1. **Neck rolls**: Slowly roll your neck left, forward, right, back — 3 times each direction.\n" +
        "2. **Shoulder shrugs**: Lift both shoulders to your ears, hold 5 seconds, release. Repeat 5 times.\n" +
        "3. **Wrist stretch**: Extend arm, pull fingers back gently. Hold 10 seconds each hand.\n" +
        "4. **Seated spinal twist**: Sit up straight, twist to the right while holding the chair back, hold 10 seconds, repeat left.\n\n" +
        "Stretching increases blood flow and helps maintain focus energy.",
      triggerContext: `Good mood but elevated stress — physical release via stretching recommended.`,
      isAiGenerated: false,
    };
  }

  if (tags.includes("Distracted")) {
    return {
      type: SuggestionType.TASK_SWITCH,
      content:
        "🔄 **Task Switch Protocol**\n\n" +
        "When distracted, your brain needs a context reset — not more of the same subject.\n\n" +
        "Try this:\n" +
        "1. Stop what you're doing. Close current tabs/books.\n" +
        "2. Write down 3 specific things you'll do in the next Pomodoro.\n" +
        "3. Switch to a different subject or topic for the next session.\n" +
        "4. Use the Pomodoro timer — the countdown creates urgency that beats distraction.\n\n" +
        "Varied subjects also improve long-term retention through interleaving.",
      triggerContext: `Distracted tag detected — task switch technique suggested.`,
      isAiGenerated: false,
    };
  }

  // Default
  return {
    type: SuggestionType.MINDFULNESS,
    content:
      "🧘 **1-Minute Mindfulness Reset**\n\n" +
      "Take a brief mindful pause to clear mental clutter:\n\n" +
      "1. Close your eyes and take 3 slow deep breaths.\n" +
      "2. Notice 5 things you can feel physically (chair, feet on floor, hands, etc.).\n" +
      "3. Take one more breath and open your eyes.\n\n" +
      "Mindfulness micro-breaks have been shown to improve focus and reduce exam anxiety when practiced regularly.",
    triggerContext: `General wellness check-in — mindfulness suggested.`,
    isAiGenerated: false,
  };
}

// ============================================================
// Gemini AI suggestion
// ============================================================

export async function getGeminiSuggestion(
  userId: string,
  recentMoodLogs: MoodLogSnapshot[],
  sessionData: SessionSnapshot | null,
  examType: ExamType,
  daysToExam: number | null
): Promise<SuggestionResult> {
  // Check Redis cache first
  const cacheKey = CacheKeys.wellness(userId);
  try {
    const cached = await redis.get<CachedSuggestion>(cacheKey);
    if (cached) {
      return {
        type: cached.type,
        content: cached.content,
        triggerContext: cached.triggerContext,
        isAiGenerated: true,
      };
    }
  } catch (_cacheErr) {
    // Cache miss — proceed to Gemini
  }

  const latestMood = recentMoodLogs[recentMoodLogs.length - 1];
  const avgMood =
    recentMoodLogs.length > 0
      ? recentMoodLogs.reduce((s, l) => s + l.emojiScore, 0) /
        recentMoodLogs.length
      : 3;
  const avgStress =
    recentMoodLogs.length > 0
      ? recentMoodLogs.reduce((s, l) => s + l.stressLevel, 0) /
        recentMoodLogs.length
      : 5;

  const allTags = recentMoodLogs.flatMap((l) => l.tags);
  const tagFrequency = allTags.reduce<Record<string, number>>((acc, tag) => {
    acc[tag] = (acc[tag] ?? 0) + 1;
    return acc;
  }, {});

  const prompt = `You are MindfulPrep's wellness AI assistant for Indian competitive exam students.

Student context:
- Exam preparing for: ${examType}
- Days until exam: ${daysToExam !== null ? daysToExam : "unknown"}
- Average mood (last 7 days): ${avgMood.toFixed(1)}/5
- Average stress (last 7 days): ${avgStress.toFixed(1)}/10
- Current mood: ${latestMood?.emojiScore ?? "unknown"}/5
- Current stress: ${latestMood?.stressLevel ?? "unknown"}/10
- Recurring tags: ${Object.entries(tagFrequency).map(([t, c]) => `${t}(×${c})`).join(", ") || "none"}
${latestMood?.journalText ? `- Journal entry: "${latestMood.journalText}"` : ""}
${
  sessionData
    ? `- Last session: ${sessionData.completedPomodoros} pomodoros completed, ${sessionData.breaksTaken} breaks taken, flags: ${sessionData.triggerFlags.join(", ") || "none"}`
    : ""
}

Generate ONE personalized mental wellness suggestion. Respond ONLY with valid JSON:
{
  "type": "<one of: BREATHING|HYDRATION|STRETCH|TASK_SWITCH|REST|JOURNAL|MINDFULNESS|COGNITIVE_REFRAMING>",
  "content": "<2-4 sentence personalized suggestion with concrete steps, reference their specific exam context>",
  "triggerContext": "<one sentence explaining why this suggestion was chosen>"
}`;

  try {
    const model = gemini.getGenerativeModel({ model: GEMINI_MODEL });
    const result = await model.generateContent(prompt);
    const text = result.response.text();

    // Extract JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Gemini response");
    }

    const parsed = JSON.parse(jsonMatch[0]) as {
      type: string;
      content: string;
      triggerContext: string;
    };

    // Validate type
    const validTypes = Object.values(SuggestionType) as string[];
    if (!validTypes.includes(parsed.type)) {
      throw new Error(`Invalid suggestion type from Gemini: ${parsed.type}`);
    }

    const suggestionResult: SuggestionResult = {
      type: parsed.type as SuggestionType,
      content: parsed.content,
      triggerContext: parsed.triggerContext,
      isAiGenerated: true,
    };

    // Cache for 10 minutes
    await redis.set(cacheKey, JSON.stringify(suggestionResult), {
      ex: CACHE_TTL.wellness,
    });

    return suggestionResult;
  } catch (_err) {
    // Fall back to rule-based on any Gemini error
    return getRuleBasedSuggestion(
      latestMood?.emojiScore ?? 3,
      latestMood?.stressLevel ?? 5,
      latestMood?.tags ?? []
    );
  }
}

// ============================================================
// Orchestrator
// ============================================================

export async function getSuggestion(
  userId: string,
  recentMoodLogs: MoodLogSnapshot[],
  sessionData: SessionSnapshot | null,
  user: UserSnapshot
): Promise<{
  id: string;
  type: SuggestionType;
  content: string;
  triggerContext: string;
  isAiGenerated: boolean;
  dismissed: boolean;
  acted: boolean;
  createdAt: Date;
}> {
  const latestMood = recentMoodLogs[recentMoodLogs.length - 1];

  const hasJournalText = !!latestMood?.journalText;
  const highStress = (latestMood?.stressLevel ?? 0) > 7;
  const useAI = hasJournalText || highStress;

  let daysToExam: number | null = null;
  if (user.targetExamDate) {
    const msLeft = user.targetExamDate.getTime() - Date.now();
    daysToExam = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
  }

  let suggestion: SuggestionResult;

  let isCriticalStress = (latestMood?.stressLevel ?? 0) === 10;
  if (!isCriticalStress && recentMoodLogs.length >= 5) {
    const last5 = recentMoodLogs.slice(-5);
    if (last5.every((l) => l.stressLevel === 10)) {
      isCriticalStress = true;
    }
  }

  if (isCriticalStress) {
    suggestion = {
      type: SuggestionType.REST,
      content:
        "🚨 **Reach Out for Support**\n\nWe noticed you're experiencing extremely high stress. Please know you don't have to handle this alone. Reach out to a professional who can help:\n\n📞 **iCall Helpline**: 9152987821\n📞 **Vandrevala Foundation**: 9999 666 555\n\nPlease take a break and talk to someone.",
      triggerContext:
        "Critical stress level detected (10/10). Helpline intervention triggered.",
      isAiGenerated: false,
    };
  } else if (useAI) {
    suggestion = await getGeminiSuggestion(
      userId,
      recentMoodLogs,
      sessionData,
      user.examType,
      daysToExam
    );
  } else {
    suggestion = getRuleBasedSuggestion(
      latestMood?.emojiScore ?? 3,
      latestMood?.stressLevel ?? 5,
      latestMood?.tags ?? []
    );
  }

  // Save suggestion to DB
  const saved = await prisma.wellnessSuggestion.create({
    data: {
      userId,
      type: suggestion.type,
      content: suggestion.content,
      triggerContext: suggestion.triggerContext,
      isAiGenerated: suggestion.isAiGenerated,
    },
    select: {
      id: true,
      type: true,
      content: true,
      triggerContext: true,
      isAiGenerated: true,
      dismissed: true,
      acted: true,
      createdAt: true,
    },
  });

  return saved as any;
}
