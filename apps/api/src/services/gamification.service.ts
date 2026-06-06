import { PrismaClient } from "@prisma/client";
import { BadgeCode } from "@mindfulprep/shared";

// ============================================================
// Types
// ============================================================

interface SessionForPoints {
  completedPomodoros: number;
  breaksTaken: number;
}

// ============================================================
// Award points
// ============================================================

export async function awardPoints(
  userId: string,
  points: number,
  prisma: PrismaClient
): Promise<void> {
  if (points <= 0) return;

  const updated = await prisma.gamificationRecord.update({
    where: { userId },
    data: {
      calmFocusPoints: { increment: points },
    },
    select: { calmFocusPoints: true, badges: true },
  });

  // Check FOCUS_100 badge
  if (
    updated.calmFocusPoints >= 100 &&
    !updated.badges.includes(BadgeCode.FOCUS_100)
  ) {
    await checkAndAwardBadge(userId, BadgeCode.FOCUS_100, prisma);
  }
}

// ============================================================
// Update daily streak
// ============================================================

export async function updateStreak(
  userId: string,
  prisma: PrismaClient
): Promise<void> {
  const record = await prisma.gamificationRecord.findUnique({
    where: { userId },
    select: {
      currentStreak: true,
      longestStreak: true,
      lastActivity: true,
      badges: true,
    },
  });

  if (!record) return;

  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastActivity = new Date(record.lastActivity);
  const lastActivityDay = new Date(
    lastActivity.getFullYear(),
    lastActivity.getMonth(),
    lastActivity.getDate()
  );

  const daysDiff = Math.round(
    (today.getTime() - lastActivityDay.getTime()) / (1000 * 60 * 60 * 24)
  );

  let newStreak = record.currentStreak;

  if (daysDiff === 0) {
    // Already updated today — no change needed
    return;
  } else if (daysDiff === 1) {
    // Consecutive day — increment
    newStreak = record.currentStreak + 1;
  } else {
    // Gap of more than 1 day — reset
    newStreak = 1;
  }

  const newLongest = Math.max(newStreak, record.longestStreak);

  await prisma.gamificationRecord.update({
    where: { userId },
    data: {
      currentStreak: newStreak,
      longestStreak: newLongest,
      lastActivity: now,
    },
  });

  // Badge checks
  if (newStreak >= 5 && !record.badges.includes(BadgeCode.FIVE_DAY_STREAK)) {
    await checkAndAwardBadge(userId, BadgeCode.FIVE_DAY_STREAK, prisma);
  }
  if (newStreak >= 10 && !record.badges.includes(BadgeCode.TEN_DAY_STREAK)) {
    await checkAndAwardBadge(userId, BadgeCode.TEN_DAY_STREAK, prisma);
  }
}

// ============================================================
// Award a badge (idempotent)
// ============================================================

export async function checkAndAwardBadge(
  userId: string,
  badge: BadgeCode,
  prisma: PrismaClient
): Promise<void> {
  const record = await prisma.gamificationRecord.findUnique({
    where: { userId },
    select: { badges: true },
  });

  if (!record) return;

  if (!record.badges.includes(badge)) {
    await prisma.gamificationRecord.update({
      where: { userId },
      data: {
        badges: { push: badge },
      },
    });
  }
}

// ============================================================
// Compute session points
// ============================================================

export function computeSessionPoints(session: SessionForPoints): number {
  const pomodoroPoints = session.completedPomodoros * 10;
  const breakPoints = session.breaksTaken * 5;
  return pomodoroPoints + breakPoints;
}
