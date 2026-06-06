import { SessionMode } from "@mindfulprep/shared";

// ============================================================
// Types
// ============================================================

export interface PomodoroInput {
  moodScore: number; // 1-5
  stressLevel: number; // 1-10
  completedSessionsToday: number;
  currentHour: number; // 0-23
}

export interface PomodoroRecommendation {
  mode: SessionMode;
  workDuration: number; // minutes
  breakDuration: number; // minutes
  label: string;
  reasoning: string;
}

// ============================================================
// Adaptive Pomodoro Rule Engine
// ============================================================

export function recommend(input: PomodoroInput): PomodoroRecommendation {
  const { moodScore, stressLevel, completedSessionsToday, currentHour } = input;

  let mode: SessionMode;
  let workDuration: number;
  let breakDuration: number;
  let label: string;
  let reasoning: string;

  // Rule 1: Late night → always CALM regardless of other signals
  if (currentHour >= 22) {
    mode = SessionMode.CALM;
    workDuration = 15;
    breakDuration = 5;
    label = "Late Night Calm";
    reasoning =
      "It's late at night. Your brain needs rest. A short session is best before sleep.";
  }
  // Rule 2: High stress or very low mood → CALM
  else if (moodScore <= 2 || stressLevel >= 8) {
    mode = SessionMode.CALM;
    workDuration = 15;
    breakDuration = 5;
    label = "Calm Focus";
    reasoning =
      moodScore <= 2
        ? "Your mood is very low right now. A gentle 15-minute session helps maintain momentum without overwhelming you."
        : "Your stress level is high. A short focused burst with frequent breaks will help you stay effective without burning out.";
  }
  // Rule 3: Good mood, low stress, few sessions done → RECOVERY (extended)
  else if (
    moodScore >= 4 &&
    stressLevel <= 4 &&
    completedSessionsToday < 3
  ) {
    mode = SessionMode.RECOVERY;
    workDuration = 35;
    breakDuration = 10;
    label = "Deep Focus";
    reasoning =
      "You're in a great mental state with low stress. This extended session will help you make significant progress.";
  }
  // Default → STANDARD Pomodoro
  else {
    mode = SessionMode.STANDARD;
    workDuration = 25;
    breakDuration = 5;
    label = "Standard Pomodoro";
    reasoning =
      "Classic 25/5 Pomodoro timing suits your current energy and stress level well.";
  }

  // Append long-day note if many sessions completed
  if (completedSessionsToday >= 4) {
    reasoning +=
      " You have had a long day. Consider wrapping up.";
  }

  return { mode, workDuration, breakDuration, label, reasoning };
}
