"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Square, Coffee, X } from "lucide-react";
import { useSession } from "@/hooks/useSession";
import { formatSeconds } from "@/lib/utils";
import { cn } from "@/lib/utils";
import type { SessionMode } from "@mindfulprep/shared";

const MODE_CONFIG: Record<
  SessionMode,
  { color: string; bg: string; label: string; ringColor: string }
> = {
  CALM: {
    color: "text-blue-400",
    bg: "bg-blue-500/20 border-blue-500/30",
    label: "Calm",
    ringColor: "#3b82f6",
  },
  STANDARD: {
    color: "text-teal-400",
    bg: "bg-teal-500/20 border-teal-500/30",
    label: "Standard",
    ringColor: "#0d9488",
  },
  RECOVERY: {
    color: "text-violet-400",
    bg: "bg-violet-500/20 border-violet-500/30",
    label: "Recovery",
    ringColor: "#8b5cf6",
  },
  FLOW: {
    color: "text-amber-400",
    bg: "bg-amber-500/20 border-amber-500/30",
    label: "Flow",
    ringColor: "#f59e0b",
  },
};

interface PomodoroTimerProps {
  onEnd?: (payload: { sessionId: string; endMoodScore?: number; endStressLevel?: number }) => void;
}

const RING_SIZE = 220;
const STROKE_WIDTH = 8;
const RADIUS = (RING_SIZE - STROKE_WIDTH * 2) / 2;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function PomodoroTimer({ onEnd }: PomodoroTimerProps) {
  const {
    sessionId,
    mode,
    workDuration,
    breakDuration,
    elapsed,
    isRunning,
    isBreak,
    completedPomodoros,
    pauseSession,
    resumeSession,
    endSession,
    endBreak,
  } = useSession();

  const [showBreakModal, setShowBreakModal] = useState(false);
  const [breakLockSeconds, setBreakLockSeconds] = useState(30);
  const [showEndConfirm, setShowEndConfirm] = useState(false);

  const phaseDuration = isBreak ? breakDuration * 60 : workDuration * 60;
  const progress = Math.min(elapsed / phaseDuration, 1);
  const strokeDashoffset = CIRCUMFERENCE * (1 - progress);
  const timeLeft = Math.max(phaseDuration - elapsed, 0);

  const modeConfig = mode ? MODE_CONFIG[mode] : MODE_CONFIG.STANDARD;

  // Show break modal when isBreak becomes true
  useEffect(() => {
    if (isBreak) {
      setShowBreakModal(true);
      setBreakLockSeconds(30);
    } else {
      setShowBreakModal(false);
    }
  }, [isBreak]);

  // Break lock countdown
  useEffect(() => {
    if (!showBreakModal || breakLockSeconds <= 0) return;
    const t = setTimeout(() => setBreakLockSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [showBreakModal, breakLockSeconds]);

  const handleEndSession = async () => {
    if (!sessionId) return;
    await endSession({ sessionId });
    onEnd?.({ sessionId });
    setShowEndConfirm(false);
  };

  if (!sessionId || !mode) return null;

  const totalFocusMinutes = completedPomodoros * workDuration;

  return (
    <>
      <div className="flex flex-col items-center gap-6">
        {/* Mode badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "px-4 py-1.5 rounded-full border text-sm font-semibold",
            modeConfig.bg,
            modeConfig.color
          )}
        >
          {modeConfig.label} Mode
        </motion.div>

        {/* SVG Ring */}
        <div className="relative" style={{ width: RING_SIZE, height: RING_SIZE }}>
          <svg
            width={RING_SIZE}
            height={RING_SIZE}
            className="-rotate-90"
            aria-hidden="true"
          >
            {/* Track */}
            <circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke="rgba(255,255,255,0.08)"
              strokeWidth={STROKE_WIDTH}
            />
            {/* Progress */}
            <motion.circle
              cx={RING_SIZE / 2}
              cy={RING_SIZE / 2}
              r={RADIUS}
              fill="none"
              stroke={modeConfig.ringColor}
              strokeWidth={STROKE_WIDTH}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              animate={{ strokeDashoffset }}
              transition={{ duration: 0.5, ease: "linear" }}
              style={{ filter: `drop-shadow(0 0 8px ${modeConfig.ringColor}60)` }}
            />
          </svg>

          {/* Center content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
            <motion.p
              key={timeLeft}
              className="text-4xl font-bold text-white tabular-nums"
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 0.3 }}
            >
              {formatSeconds(timeLeft)}
            </motion.p>
            <p className="text-mindful-slate text-xs font-medium">
              {isBreak ? "Break time" : "Focus time"}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={isRunning ? pauseSession : resumeSession}
            aria-label={isRunning ? "Pause session" : "Resume session"}
            className="flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-br from-teal-500 to-cyan-500 text-white shadow-lg shadow-teal-500/30"
          >
            {isRunning ? <Pause size={22} /> : <Play size={22} />}
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowEndConfirm(true)}
            aria-label="End session"
            className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10 border border-white/20 text-mindful-slate hover:text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Square size={18} />
          </motion.button>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-6 px-6 py-3 rounded-2xl bg-white/5 border border-white/10">
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{completedPomodoros}</p>
            <p className="text-xs text-mindful-slate">Pomodoros</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className="text-2xl font-bold text-white">{totalFocusMinutes}m</p>
            <p className="text-xs text-mindful-slate">Focus time</p>
          </div>
          <div className="w-px h-10 bg-white/10" />
          <div className="text-center">
            <p className={cn("text-2xl font-bold", modeConfig.color)}>{mode}</p>
            <p className="text-xs text-mindful-slate">Mode</p>
          </div>
        </div>
      </div>

      {/* Break Modal */}
      <AnimatePresence>
        {showBreakModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label="Break time"
          >
            <motion.div
              initial={{ scale: 0.85, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.85, y: 30 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="glass-card p-8 max-w-sm w-full text-center"
            >
              <motion.div
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ duration: 1, repeat: Infinity, repeatDelay: 2 }}
                className="text-6xl mb-4"
              >
                ☕
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Break time!</h2>
              <p className="text-mindful-slate mb-1">
                Great work! Take a {breakDuration}-minute break.
              </p>
              <p className="text-teal-400 text-sm mb-6">
                Stand up, stretch, hydrate 💧
              </p>

              <div className="text-3xl font-bold text-white mb-6 tabular-nums">
                {formatSeconds(Math.max(breakDuration * 60 - elapsed, 0))}
              </div>

              <button
                type="button"
                onClick={endBreak}
                disabled={breakLockSeconds > 0}
                className={cn(
                  "btn-primary w-full",
                  breakLockSeconds > 0 && "opacity-60 cursor-not-allowed"
                )}
              >
                {breakLockSeconds > 0 ? (
                  <>
                    <Coffee size={16} />
                    Skip in {breakLockSeconds}s
                  </>
                ) : (
                  <>
                    <Play size={16} />
                    Back to Focus
                  </>
                )}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* End Confirm Modal */}
      <AnimatePresence>
        {showEndConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="glass-card p-6 max-w-sm w-full"
            >
              <div className="flex items-start justify-between mb-4">
                <h2 className="text-lg font-bold text-white">End session?</h2>
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="p-2 text-mindful-slate hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label="Cancel"
                >
                  <X size={18} />
                </button>
              </div>
              <p className="text-mindful-slate text-sm mb-6">
                You&apos;ve completed {completedPomodoros} pomodoro{completedPomodoros !== 1 ? "s" : ""} ({totalFocusMinutes}m of focus). Are you sure you want to end?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowEndConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Continue
                </button>
                <button onClick={handleEndSession} className="btn-danger flex-1">
                  <Square size={16} />
                  End Session
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
