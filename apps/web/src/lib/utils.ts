import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/** Merge Tailwind classes safely with clsx */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/** Format a date string or Date object into a human-readable string */
export function formatDate(date: string | Date): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

/** Format minutes into '2h 30m' style */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0m";
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

/** Format seconds into 'MM:SS' display */
export function formatSeconds(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

/** Get number of days from today to exam date, or null if no date */
export function getDaysToExam(examDate: string | null): number | null {
  if (!examDate) return null;
  const exam = new Date(examDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  exam.setHours(0, 0, 0, 0);
  const diffMs = exam.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
  return diffDays;
}

/** Map mood score (1-5) to emoji */
export function getMoodEmoji(score: number): string {
  const map: Record<number, string> = {
    1: "😔",
    2: "😟",
    3: "😐",
    4: "🙂",
    5: "😊",
  };
  return map[Math.round(score)] ?? "😐";
}

/** Map stress level (1-10) to Tailwind text color */
export function getStressColor(level: number): string {
  if (level <= 3) return "text-green-400";
  if (level <= 6) return "text-yellow-400";
  return "text-red-400";
}

/** Map stress level (1-10) to Tailwind background color */
export function getStressBgColor(level: number): string {
  if (level <= 3) return "bg-green-500/20 text-green-400 border-green-500/30";
  if (level <= 6)
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  return "bg-red-500/20 text-red-400 border-red-500/30";
}

/** Get a greeting based on the current hour */
export function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** Truncate text with ellipsis */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
