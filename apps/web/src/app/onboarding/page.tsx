"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingPage() {
  const router = useRouter();
  const [goal, setGoal] = useState(6);
  const [examDate, setExamDate] = useState("");
  const [targetExam, setTargetExam] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const d = new Date();
    d.setMonth(d.getMonth() + 3);
    setExamDate(d.toISOString().split("T")[0]);
  }, []);

  const handleContinue = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      router.push("/dashboard");
    }, 1000);
  };

  return (
    <div className="font-body text-on-surface selection:bg-primary/30 min-h-screen bg-surface">
      {/* TopAppBar Section */}
      <header className="fixed top-0 left-0 w-full bg-surface dark:bg-surface flex items-center justify-center h-16 px-4 z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>spa</span>
          <h1 className="text-xl font-headline font-black text-primary dark:text-primary tracking-tight">MindSprint AI</h1>
        </div>
      </header>

      <main className="pt-16 pb-24 min-h-screen flex flex-col max-w-lg mx-auto px-6">
        {/* Hero Section */}
        <section className="mt-8 mb-10 text-center">
          <div className="relative w-full aspect-square max-w-[320px] mx-auto overflow-hidden rounded-xl shadow-sm bg-surface-variant">
            <img 
              alt="MindSprint AI Onboarding Illustration" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAlMOGgog6SW7FyxaHYGrWSRbCkKXjSvyz2Yel9vPv-84ssD1WUwhvLwhhui2zym4DXhQx_SiOc8kW4vKKOMEECpOXvOSM67k5psdc3_WN92kQ30MTZ0BVtNamXJUp6XJ282eT5kVDdDwiPqEMKg6sAsoyG3tVO3Zng9StZgXH3TM3ZwPw2r2mxr6CcStYojdQC3kv8FS_q9HSSPoxWHJ2_FWCZK9qTxDWRzoh_Gy9fZDx5-q_XdxdwZCMt7lEz45OSuV5SCigtgLk"
            />
          </div>
        </section>

        {/* Welcome Header */}
        <section className="mb-10 text-center">
          <h2 className="font-headline text-3xl font-extrabold text-on-surface mb-2 tracking-tight">Welcome to MindSprint AI</h2>
          <p className="text-on-surface-variant text-lg">Let&apos;s personalize your wellness journey.</p>
        </section>

        {/* Form Section */}
        <section className="space-y-8 flex-grow">
          {/* Target Exam Dropdown */}
          <div className="space-y-2">
            <label className="block font-label text-sm font-semibold text-on-primary-container ml-1" htmlFor="target-exam">Target Exam</label>
            <div className="relative">
              <select 
                className="w-full h-14 pl-4 pr-10 bg-primary-container border-none rounded-xl text-on-primary-container focus:ring-2 focus:ring-primary appearance-none transition-all" 
                id="target-exam"
                value={targetExam}
                onChange={(e) => setTargetExam(e.target.value)}
              >
                <option disabled value="">Select your exam</option>
                <option value="NEET">NEET</option>
                <option value="JEE">JEE</option>
                <option value="CUET">CUET</option>
                <option value="UPSC">UPSC</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-on-surface-variant">
                <span className="material-symbols-outlined">expand_more</span>
              </div>
            </div>
          </div>

          {/* Daily Study Goal Slider */}
          <div className="space-y-4">
            <div className="flex justify-between items-center ml-1">
              <label className="font-label text-sm font-semibold text-on-primary-container">Daily Study Goal</label>
              <span className="text-primary font-bold text-lg" id="goal-value">{goal} {goal === 1 ? "hour" : "hours"}</span>
            </div>
            <div className="px-2">
              <input 
                className="w-full h-2 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                id="goal-slider" 
                max="16" 
                min="1" 
                type="range" 
                value={goal}
                onChange={(e) => setGoal(Number(e.target.value))}
              />
            </div>
            <div className="flex justify-between text-[10px] text-on-surface-variant px-1 font-medium">
              <span>1 HR</span>
              <span>16 HRS</span>
            </div>
          </div>

          {/* Exam Date Picker */}
          <div className="space-y-2">
            <label className="block font-label text-sm font-semibold text-on-primary-container ml-1" htmlFor="exam-date">Exam Date</label>
            <div className="relative">
              <input 
                className="w-full h-14 px-4 bg-primary-container border-none rounded-xl text-on-primary-container focus:ring-2 focus:ring-primary transition-all" 
                id="exam-date" 
                type="date"
                value={examDate}
                onChange={(e) => setExamDate(e.target.value)}
              />
            </div>
          </div>
        </section>

        {/* Footer / Action Section */}
        <div className="fixed bottom-0 left-0 w-full p-6 bg-gradient-to-t from-surface via-surface to-transparent md:static md:bg-transparent md:p-0 md:mt-12">
          <button 
            className="w-full max-w-lg mx-auto h-16 bg-primary text-on-primary font-headline font-bold text-lg rounded-full shadow-lg hover:opacity-90 active:scale-95 transition-all flex items-center justify-center gap-2 group" 
            onClick={handleContinue}
            disabled={isSubmitting || targetExam === ""}
          >
            {isSubmitting ? (
              <span className="material-symbols-outlined animate-spin">progress_activity</span>
            ) : (
              <>
                Continue
                <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
              </>
            )}
          </button>
        </div>
      </main>
    </div>
  );
}
