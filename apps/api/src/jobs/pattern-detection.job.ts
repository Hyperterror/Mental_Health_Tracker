import { prisma } from "../config/prisma.js";
import { PatternType, SuggestionType } from "@mindfulprep/shared";

// ============================================================
// Background Pattern Detection Job
// ============================================================

/**
 * Analyzes a user's recent activity to detect stress/behavior patterns.
 * Runs as a fire-and-forget background task — should not throw to callers.
 */
export async function analyzeUserPatterns(userId: string): Promise<void> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => reject(new Error("TIMEOUT")), 5000);
  });

  const runLogic = async () => {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

    // Fetch last 7 days of mood logs and sessions in parallel
    const [moodLogs, sessions, user] = await Promise.all([
      prisma.moodLog.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "asc" },
        select: {
          emojiScore: true,
          stressLevel: true,
          tags: true,
          createdAt: true,
        },
      }),
      prisma.studySession.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: "asc" },
        select: {
          id: true,
          startMoodScore: true,
          breaksTaken: true,
          triggerFlags: true,
          createdAt: true,
          isActive: true,
        },
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { targetExamDate: true },
      }),
    ]);

    const detectedPatterns: Array<{
      patternType: PatternType;
      severity: number;
      details: Record<string, unknown>;
      isCritical: boolean;
    }> = [];

    // ── DETECT: LATE_NIGHT_STUDY ─────────────────────────
    const lateNightSessions = sessions.filter(
      (s) => new Date(s.createdAt).getHours() >= 23
    );
    if (lateNightSessions.length > 0) {
      detectedPatterns.push({
        patternType: PatternType.LATE_NIGHT_STUDY,
        severity: Math.min(1, lateNightSessions.length / 3),
        details: {
          count: lateNightSessions.length,
          sessionIds: lateNightSessions.map((s) => s.id),
          firstOccurrence: lateNightSessions[0].createdAt,
        },
        isCritical: false,
      });
    }

    // ── DETECT: NO_BREAK_STREAK (3+ consecutive sessions without breaks) ──
    let consecutiveNoBreak = 0;
    let maxConsecutiveNoBreak = 0;
    for (const session of sessions) {
      if (session.breaksTaken === 0 && !session.isActive) {
        consecutiveNoBreak++;
        maxConsecutiveNoBreak = Math.max(
          maxConsecutiveNoBreak,
          consecutiveNoBreak
        );
      } else {
        consecutiveNoBreak = 0;
      }
    }
    if (maxConsecutiveNoBreak >= 3) {
      detectedPatterns.push({
        patternType: PatternType.NO_BREAK_STREAK,
        severity: Math.min(1, maxConsecutiveNoBreak / 5),
        details: {
          maxConsecutiveNoBreak,
          totalSessions: sessions.length,
        },
        isCritical: false,
      });
    }

    // ── DETECT: RECURRING_TRIGGER (any tag 3+ times in 7 days) ──────
    const tagCounts = new Map<string, number>();
    for (const log of moodLogs) {
      for (const tag of log.tags) {
        tagCounts.set(tag, (tagCounts.get(tag) ?? 0) + 1);
      }
    }
    const recurringTags = Array.from(tagCounts.entries()).filter(
      ([, count]) => count >= 3
    );
    for (const [tag, count] of recurringTags) {
      detectedPatterns.push({
        patternType: PatternType.RECURRING_TRIGGER,
        severity: Math.min(1, count / 7),
        details: { tag, count, period: "7_days" },
        isCritical: false,
      });
    }

    // ── DETECT: PRE_EXAM_ANXIETY_SPIKE (< 14 days to exam + avg stress > 7) ──
    let daysToExam: number | null = null;
    if (user?.targetExamDate) {
      const msLeft = user.targetExamDate.getTime() - now.getTime();
      daysToExam = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    }

    if (moodLogs.length > 0) {
      const avgStress =
        moodLogs.reduce((s, l) => s + l.stressLevel, 0) / moodLogs.length;

      if (daysToExam !== null && daysToExam < 14 && avgStress > 7) {
        detectedPatterns.push({
          patternType: PatternType.PRE_EXAM_ANXIETY_SPIKE,
          severity: Math.min(1, (avgStress - 7) / 3),
          details: {
            avgStress: Math.round(avgStress * 100) / 100,
            daysToExam,
          },
          isCritical: true,
        });
      }

      // ── DETECT: MOOD_DECLINE_TREND (avg mood last 3 days < prev 4 days by > 1) ──
      const last3 = moodLogs.filter(
        (l) => new Date(l.createdAt) >= threeDaysAgo
      );
      const prev4 = moodLogs.filter(
        (l) => new Date(l.createdAt) < threeDaysAgo
      );

      if (last3.length > 0 && prev4.length > 0) {
        const avgLast3 =
          last3.reduce((s, l) => s + l.emojiScore, 0) / last3.length;
        const avgPrev4 =
          prev4.reduce((s, l) => s + l.emojiScore, 0) / prev4.length;

        if (avgPrev4 - avgLast3 > 1) {
          detectedPatterns.push({
            patternType: PatternType.MOOD_DECLINE_TREND,
            severity: Math.min(1, (avgPrev4 - avgLast3) / 4),
            details: {
              avgLast3Days: Math.round(avgLast3 * 100) / 100,
              avgPrev4Days: Math.round(avgPrev4 * 100) / 100,
              drop: Math.round((avgPrev4 - avgLast3) * 100) / 100,
            },
            isCritical: true,
          });
        }
      }
    }

    // ── Upsert detected patterns ──────────────────────────
    for (const pattern of detectedPatterns) {
      const existing = await prisma.stressTriggerPattern.findFirst({
        where: {
          userId,
          patternType: pattern.patternType,
          isActive: true,
          // For recurring trigger, also match on the tag detail
          ...(pattern.patternType === PatternType.RECURRING_TRIGGER
            ? {} // handled per-tag below
            : {}),
        },
        select: { id: true, frequency: true },
      });

      if (existing) {
        await prisma.stressTriggerPattern.update({
          where: { id: existing.id },
          data: {
            frequency: existing.frequency + 1,
            severity: pattern.severity,
            details: pattern.details,
            lastSeenAt: now,
          },
        });
      } else {
        await prisma.stressTriggerPattern.create({
          data: {
            userId,
            patternType: pattern.patternType,
            frequency: 1,
            severity: pattern.severity,
            details: pattern.details,
            detectedAt: now,
            lastSeenAt: now,
            isActive: true,
          },
        });
      }

      // Create proactive wellness suggestion for critical patterns
      if (pattern.isCritical) {
        let suggestionType: SuggestionType;
        let content: string;
        let triggerContext: string;

        if (pattern.patternType === PatternType.PRE_EXAM_ANXIETY_SPIKE) {
          suggestionType = SuggestionType.BREATHING;
          content =
            "🚨 **Pre-Exam Anxiety Alert**\n\n" +
            `With ${daysToExam} days to your exam, your stress levels are consistently high (avg ${(pattern.details.avgStress as number).toFixed(1)}/10).\n\n` +
            "Try this right now:\n" +
            "1. **Box breathing** — inhale 4s, hold 4s, exhale 4s, hold 4s. Repeat 5 times.\n" +
            "2. **Prioritize sleep** — studying while severely sleep-deprived retains 40% less.\n" +
            "3. **Focus on review**, not new topics — consolidate what you know.\n\n" +
            "Your preparation matters. Your wellbeing matters more.";
          triggerContext = `Pre-exam anxiety spike detected: ${daysToExam} days to exam, avg stress ${(pattern.details.avgStress as number).toFixed(1)}/10.`;
        } else {
          // MOOD_DECLINE_TREND
          suggestionType = SuggestionType.COGNITIVE_REFRAMING;
          content =
            "📉 **Mood Decline Detected**\n\n" +
            `Your mood has dropped by ${(pattern.details.drop as number).toFixed(1)} points over the past 3 days.\n\n` +
            "This is a pattern worth addressing:\n" +
            "1. **Name what's hard**: Write down the specific thing weighing on you.\n" +
            "2. **Talk to someone**: A friend, family member, or counsellor.\n" +
            "3. **Take a lighter study day**: One lighter day now prevents a full burnout later.\n\n" +
            "Recovery is productive. Rest is not a setback — it's strategy.";
          triggerContext = `Mood decline trend: ${(pattern.details.drop as number).toFixed(1)} point drop over last 3 days.`;
        }

        // Only create if no recent suggestion of this type exists
        const recentSuggestion = await prisma.wellnessSuggestion.findFirst({
          where: {
            userId,
            type: suggestionType,
            createdAt: { gte: sevenDaysAgo },
          },
          select: { id: true },
        });

        if (!recentSuggestion) {
          await prisma.wellnessSuggestion.create({
            data: {
              userId,
              type: suggestionType,
              content,
              triggerContext,
              isAiGenerated: false,
            },
          });
        }
      }
    }
  };

  try {
    await Promise.race([runLogic(), timeoutPromise]);
  } catch (err: any) {
    if (err.message === "TIMEOUT") {
      console.warn(`[pattern-detection] Timeout for user ${userId}`);
    } else {
      console.error(`[pattern-detection] Error for user ${userId}:`, err);
    }
  } finally {
    clearTimeout(timeoutId!);
  }
}
