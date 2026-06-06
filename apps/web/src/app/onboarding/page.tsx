"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { Brain, ChevronRight, ChevronLeft, Check, Loader2, Camera } from "lucide-react";
import apiClient from "@/lib/axios";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Exam Details", step: 1 },
  { label: "Study Goal", step: 2 },
  { label: "Check-in Time", step: 3 },
  { label: "Camera Consent", step: 4 },
];

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: { x: 0, opacity: 1 },
  exit: (dir: number) => ({
    x: dir > 0 ? -80 : 80,
    opacity: 0,
  }),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, updateUser } = useAuthStore();
  const [step, setStep] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [dailyGoal, setDailyGoal] = useState(150);
  const [checkInTime, setCheckInTime] = useState("20:00");
  const [cameraOptIn, setCameraOptIn] = useState(false);

  const goNext = () => {
    setDirection(1);
    setStep((s) => Math.min(s + 1, 4));
  };

  const goPrev = () => {
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 1));
  };

  const handleComplete = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await apiClient.patch("/api/v1/user/profile", {
        dailyGoalMinutes: dailyGoal,
        stressCheckInTime: checkInTime,
        cameraOptIn,
      });
      updateUser({ dailyGoalMinutes: dailyGoal, stressCheckInTime: checkInTime, cameraOptIn });
      router.push("/dashboard");
    } catch {
      setError("Failed to save preferences. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatGoal = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ""}` : `${m}m`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-1/3 -left-20 w-72 h-72 rounded-full bg-teal-500/8 blur-3xl" />
        <div className="absolute bottom-1/3 -right-20 w-72 h-72 rounded-full bg-violet-500/8 blur-3xl" />
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/25">
            <Brain size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Let&apos;s set you up</h1>
          <p className="text-mindful-slate text-sm mt-1">Step {step} of 4</p>
        </div>

        {/* Progress bar */}
        <div className="flex gap-2 mb-8">
          {STEPS.map((s) => (
            <div key={s.step} className="flex-1 h-1.5 rounded-full overflow-hidden bg-white/10">
              <motion.div
                className="h-full bg-gradient-to-r from-teal-500 to-cyan-500 rounded-full"
                initial={false}
                animate={{ width: step >= s.step ? "100%" : "0%" }}
                transition={{ duration: 0.4, ease: "easeOut" }}
              />
            </div>
          ))}
        </div>

        {/* Step labels */}
        <div className="flex gap-2 mb-6">
          {STEPS.map((s) => (
            <p
              key={s.step}
              className={cn(
                "flex-1 text-center text-xs font-medium transition-colors",
                step === s.step ? "text-teal-400" : "text-mindful-slate"
              )}
            >
              {s.label}
            </p>
          ))}
        </div>

        {/* Step content */}
        <div className="glass-card p-8 overflow-hidden">
          <AnimatePresence mode="wait" custom={direction}>
            {step === 1 && (
              <motion.div
                key="step1"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <h2 className="text-xl font-bold text-white mb-2">Your exam details</h2>
                <p className="text-mindful-slate text-sm mb-6">
                  Here&apos;s what you&apos;ve shared with us.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-mindful-slate text-sm">Name</span>
                    <span className="text-white font-medium">{user?.name ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-mindful-slate text-sm">Exam</span>
                    <span className="px-3 py-1 rounded-full bg-teal-500/20 text-teal-300 text-sm font-semibold">
                      {user?.examType ?? "—"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                    <span className="text-mindful-slate text-sm">Target date</span>
                    <span className="text-white font-medium">
                      {user?.targetExamDate
                        ? new Date(user.targetExamDate).toLocaleDateString("en-IN", {
                            day: "numeric", month: "short", year: "numeric",
                          })
                        : "Not set"}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="step2"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <h2 className="text-xl font-bold text-white mb-2">Daily study goal</h2>
                <p className="text-mindful-slate text-sm mb-8">
                  How many hours do you aim to study per day?
                </p>
                <div className="text-center mb-8">
                  <span className="text-5xl font-bold bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
                    {formatGoal(dailyGoal)}
                  </span>
                  <p className="text-mindful-slate text-sm mt-1">per day</p>
                </div>
                <input
                  type="range"
                  min={30}
                  max={480}
                  step={15}
                  value={dailyGoal}
                  onChange={(e) => setDailyGoal(Number(e.target.value))}
                  className="w-full accent-teal-500"
                  style={{
                    background: `linear-gradient(to right, #0d9488 0%, #0d9488 ${((dailyGoal - 30) / 450) * 100}%, rgba(255,255,255,0.1) ${((dailyGoal - 30) / 450) * 100}%, rgba(255,255,255,0.1) 100%)`,
                  }}
                  aria-label="Daily study goal in minutes"
                />
                <div className="flex justify-between text-xs text-mindful-slate mt-2">
                  <span>30m</span>
                  <span>8h</span>
                </div>
                <p className="text-center text-xs text-mindful-slate mt-4">
                  We recommend starting with 2-3 hours and building up gradually.
                </p>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="step3"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <h2 className="text-xl font-bold text-white mb-2">Daily check-in time</h2>
                <p className="text-mindful-slate text-sm mb-8">
                  When should we remind you to log your mood?
                </p>
                <div className="flex justify-center mb-6">
                  <input
                    type="time"
                    value={checkInTime}
                    onChange={(e) => setCheckInTime(e.target.value)}
                    className="input-field w-48 text-center text-2xl font-bold text-white"
                    aria-label="Daily check-in time"
                  />
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {["07:00", "12:00", "18:00", "20:00", "22:00"].map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => setCheckInTime(t)}
                      className={cn(
                        "chip",
                        checkInTime === t ? "chip-active" : "chip-inactive"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            {step === 4 && (
              <motion.div
                key="step4"
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: "easeInOut" }}
              >
                <h2 className="text-xl font-bold text-white mb-2">Eye fatigue detection</h2>
                <p className="text-mindful-slate text-sm mb-6">
                  Optional: MindfulPrep can detect eye fatigue to suggest breaks at the right time.
                </p>
                <div className="p-4 rounded-xl bg-teal-500/10 border border-teal-500/20 mb-6">
                  <div className="flex items-start gap-3">
                    <Camera size={20} className="text-teal-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm font-semibold text-teal-300 mb-1">
                        Privacy-first design
                      </p>
                      <p className="text-xs text-mindful-slate leading-relaxed">
                        We detect eye fatigue <strong className="text-teal-300">locally on your device</strong>.
                        No video leaves your browser — ever. All inference runs in your browser using on-device ML.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/10">
                  <div>
                    <p className="text-white font-medium text-sm">Enable camera detection</p>
                    <p className="text-mindful-slate text-xs mt-0.5">
                      {cameraOptIn ? "Camera will activate during study sessions" : "You can enable this later in settings"}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={cameraOptIn}
                    onClick={() => setCameraOptIn((v) => !v)}
                    className="relative flex items-center min-h-[44px] min-w-[44px]"
                  >
                    <div
                      className={cn(
                        "w-12 h-6 rounded-full transition-colors duration-200",
                        cameraOptIn ? "bg-teal-500" : "bg-white/10"
                      )}
                    />
                    <motion.div
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow"
                      animate={{ x: cameraOptIn ? 24 : 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    />
                  </button>
                </div>

                {error && (
                  <p className="mt-4 text-sm text-red-400 text-center">{error}</p>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-white/10">
            <button
              type="button"
              onClick={goPrev}
              disabled={step === 1}
              className={cn(
                "btn-secondary px-5 py-2.5 text-sm",
                step === 1 && "opacity-0 pointer-events-none"
              )}
            >
              <ChevronLeft size={16} />
              Back
            </button>

            {step < 4 ? (
              <button type="button" onClick={goNext} className="btn-primary px-6 py-2.5 text-sm">
                Continue
                <ChevronRight size={16} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleComplete}
                disabled={isSubmitting}
                className="btn-primary px-6 py-2.5 text-sm"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    Let&apos;s go!
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
