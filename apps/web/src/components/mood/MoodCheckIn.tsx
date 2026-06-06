"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2 } from "lucide-react";
import { MOOD_TAGS } from "@mindfulprep/shared";
import { useSubmitMood } from "@/hooks/useMood";
import type { MoodLogCreate } from "@mindfulprep/shared";
import { cn } from "@/lib/utils";

const EMOJI_SCORES: { score: number; emoji: string; label: string }[] = [
  { score: 1, emoji: "😔", label: "Very low" },
  { score: 2, emoji: "😟", label: "Low" },
  { score: 3, emoji: "😐", label: "Okay" },
  { score: 4, emoji: "🙂", label: "Good" },
  { score: 5, emoji: "😊", label: "Great" },
];

interface MoodCheckInProps {
  onSuccess?: () => void;
}

export function MoodCheckIn({ onSuccess }: MoodCheckInProps) {
  const [emojiScore, setEmojiScore] = useState<number | null>(null);
  const [stressLevel, setStressLevel] = useState(5);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [journalText, setJournalText] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const { mutateAsync: submitMood, isPending } = useSubmitMood();

  const toggleTag = (tag: string) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const getStressGradient = (level: number) => {
    if (level <= 3) return "bg-green-500";
    if (level <= 6) return "bg-yellow-500";
    return "bg-red-500";
  };

  const getStressLabel = (level: number) => {
    if (level <= 2) return "Very calm";
    if (level <= 4) return "Mild";
    if (level <= 6) return "Moderate";
    if (level <= 8) return "High";
    return "Very high";
  };

  const handleSubmit = async () => {
    if (!emojiScore) return;
    try {
      const payload: MoodLogCreate = {
        emojiScore,
        stressLevel,
        tags: selectedTags,
        journalText: journalText.trim() || undefined,
      };
      await submitMood(payload);
      setSubmitted(true);
      setTimeout(() => {
        onSuccess?.();
      }, 1500);
    } catch {
      // Error handled by mutation
    }
  };

  if (submitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center gap-4 py-8"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
          className="text-6xl"
        >
          ✅
        </motion.div>
        <p className="text-white font-semibold text-lg">Mood logged!</p>
        <p className="text-mindful-slate text-sm">Keep tracking — you&apos;re doing great.</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      {/* Emoji Selection */}
      <div>
        <p className="text-sm font-medium text-mindful-text mb-3">How are you feeling?</p>
        <div className="flex items-center justify-between gap-2">
          {EMOJI_SCORES.map(({ score, emoji, label }) => (
            <motion.button
              key={score}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setEmojiScore(score)}
              aria-label={label}
              aria-pressed={emojiScore === score}
              className={cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 flex-1 min-h-[64px]",
                emojiScore === score
                  ? "bg-teal-500/20 border-2 border-teal-500/60"
                  : "bg-white/5 border-2 border-transparent hover:bg-white/10"
              )}
            >
              <span className={cn("text-2xl transition-transform", emojiScore === score && "scale-110")}>
                {emoji}
              </span>
              <span className="text-xs text-mindful-slate hidden sm:block">{label}</span>
            </motion.button>
          ))}
        </div>
      </div>

      {/* Stress Slider */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-medium text-mindful-text">Stress level</p>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "text-xs px-2 py-1 rounded-full font-medium",
                stressLevel <= 3 && "bg-green-500/20 text-green-400",
                stressLevel > 3 && stressLevel <= 6 && "bg-yellow-500/20 text-yellow-400",
                stressLevel > 6 && "bg-red-500/20 text-red-400"
              )}
            >
              {getStressLabel(stressLevel)}
            </span>
            <span className="text-white font-bold text-sm w-4">{stressLevel}</span>
          </div>
        </div>
        <div className="relative">
          <div className="absolute inset-y-0 left-0 right-0 h-1.5 my-auto rounded-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 opacity-30 pointer-events-none" />
          <input
            type="range"
            min={1}
            max={10}
            value={stressLevel}
            onChange={(e) => setStressLevel(Number(e.target.value))}
            aria-label="Stress level from 1 to 10"
            aria-valuemin={1}
            aria-valuemax={10}
            aria-valuenow={stressLevel}
            className="w-full relative z-10"
            style={{
              background: `linear-gradient(to right, ${
                stressLevel <= 3 ? "#22c55e" : stressLevel <= 6 ? "#eab308" : "#ef4444"
              } 0%, ${
                stressLevel <= 3 ? "#22c55e" : stressLevel <= 6 ? "#eab308" : "#ef4444"
              } ${((stressLevel - 1) / 9) * 100}%, rgba(255,255,255,0.1) ${((stressLevel - 1) / 9) * 100}%, rgba(255,255,255,0.1) 100%)`,
            }}
          />
        </div>
        <div className="flex justify-between text-xs text-mindful-slate mt-1">
          <span>😌 Calm</span>
          <span>😰 Very stressed</span>
        </div>
      </div>

      {/* Tags */}
      <div>
        <p className="text-sm font-medium text-mindful-text mb-3">
          What&apos;s on your mind?{" "}
          <span className="text-mindful-slate font-normal">(optional)</span>
        </p>
        <div className="flex flex-wrap gap-2">
          {MOOD_TAGS.map((tag) => (
            <motion.button
              key={tag}
              whileTap={{ scale: 0.95 }}
              onClick={() => toggleTag(tag)}
              aria-pressed={selectedTags.includes(tag)}
              className={cn(
                "chip",
                selectedTags.includes(tag) ? "chip-active" : "chip-inactive"
              )}
            >
              {tag}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Journal */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-sm font-medium text-mindful-text">
            Journal{" "}
            <span className="text-mindful-slate font-normal">(optional)</span>
          </p>
          <span
            className={cn(
              "text-xs",
              journalText.length > 250 ? "text-amber-400" : "text-mindful-slate"
            )}
          >
            {journalText.length}/280
          </span>
        </div>
        <textarea
          value={journalText}
          onChange={(e) => setJournalText(e.target.value.slice(0, 280))}
          placeholder="How is your preparation going? Any thoughts..."
          rows={3}
          className="input-field resize-none"
          aria-label="Journal entry"
        />
      </div>

      {/* Submit */}
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!emojiScore || isPending}
        className="btn-primary w-full"
      >
        {isPending ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            Logging mood...
          </>
        ) : (
          "Log Mood"
        )}
      </button>
    </motion.div>
  );
}
