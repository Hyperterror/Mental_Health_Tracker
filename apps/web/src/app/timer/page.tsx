"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PomodoroPage() {
  const router = useRouter();
  const [timeLeft, setTimeLeft] = useState(1500); // 25 minutes
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlaying && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsPlaying(false);
    }
    return () => clearInterval(interval);
  }, [isPlaying, timeLeft]);

  const togglePlay = () => setIsPlaying(!isPlaying);
  const resetTimer = () => {
    setIsPlaying(false);
    setTimeLeft(1500);
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeString = `${minutes}:${seconds.toString().padStart(2, "0")}`;

  const totalDash = 865;
  const progress = timeLeft / 1500;
  const offset = totalDash * (1 - progress);

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen flex flex-col items-center">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full bg-surface dark:bg-surface flex justify-between items-center px-6 py-4 z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontSize: "28px" }}>spa</span>
          <h1 className="font-headline font-bold text-xl text-primary tracking-tight">MindSprint AI</h1>
        </div>
        <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-primary-container">
          <img 
            alt="Student Profile Avatar" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBOTIyBZjU8bSyY3_uXE-aegQEXJB-VjvHq5nu-abrZFoKCJ6jJ76xJMro9s1k4QTJi3CiRSLxoKb42qzdcOantHn8M_j8IAH3dxJBiTdWPXokjET-My-zmxLA1RLtz6lCIRggz3B-qOZuaFAAiVRVgLfLELmuxYvdD9nCvyJH4CnZ7xO-wdxnPrzMkKOHk3NzBF55-TbQDtxr7V9sUcw1zK1kGOlaCksOtiTaMa6icXBzXLV0CqvcZmOSDTTNW5m_S_3ZTk6QcPbk"
          />
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="flex-1 w-full max-w-md flex flex-col items-center justify-center px-6 pt-24 pb-32">
        {/* Focus Score Indicator */}
        <div className="mb-8 flex flex-col items-center gap-2">
          <div className="px-4 py-1.5 rounded-full bg-primary-container text-on-primary-container text-xs font-label font-bold flex items-center gap-2 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
            Current Focus Score: 92%
          </div>
        </div>

        {/* Timer Section */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-10">
          <svg className="absolute w-full h-full" style={{ transform: "rotate(-90deg)" }}>
            <circle className="text-primary-container" cx="50%" cy="50%" fill="none" r="48%" stroke="currentColor" strokeWidth="1"></circle>
            <circle 
              className="text-primary transition-all duration-1000 linear" 
              cx="50%" cy="50%" 
              fill="none" 
              r="48%" 
              stroke="currentColor" 
              strokeDasharray={totalDash} 
              strokeDashoffset={offset} 
              strokeWidth="2"
            ></circle>
          </svg>
          <div className="flex flex-col items-center relative z-10">
            <span className="text-7xl font-headline font-light tracking-tight text-on-surface">{timeString}</span>
            <div className="mt-4 flex flex-col items-center">
              <p className="text-primary font-medium text-sm uppercase tracking-widest">Focus Phase</p>
              <p className="text-on-surface-variant text-xs opacity-70 mt-1">Study Block 1</p>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col items-center gap-8 w-full">
          <div className="flex items-center gap-10">
            <button 
              className="w-12 h-12 rounded-full border border-primary-container flex items-center justify-center text-on-surface-variant hover:bg-primary-container transition-colors active:scale-95 duration-150"
              onClick={resetTimer}
            >
              <span className="material-symbols-outlined">restart_alt</span>
            </button>
            <button 
              className="w-20 h-20 rounded-full bg-primary text-on-primary shadow-xl shadow-primary/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95 duration-200" 
              onClick={togglePlay}
            >
              <span className="material-symbols-outlined text-4xl">{isPlaying ? "pause" : "play_arrow"}</span>
            </button>
            <button className="w-12 h-12 rounded-full border border-primary-container flex items-center justify-center text-on-surface-variant hover:bg-primary-container transition-colors active:scale-95 duration-150">
              <span className="material-symbols-outlined">settings</span>
            </button>
          </div>
          <button className="text-primary font-label text-sm font-semibold hover:opacity-80 transition-colors flex items-center gap-1 group">
            Skip to Break
            <span className="material-symbols-outlined text-sm group-hover:translate-x-1 transition-transform">fast_forward</span>
          </button>
        </div>

        {/* Adaptive Recommendation Card */}
        <div className="mt-12 w-full bg-white/40 backdrop-blur-md border border-primary/20 p-5 rounded-xl flex items-start gap-4">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <span className="material-symbols-outlined">auto_awesome</span>
          </div>
          <div>
            <h4 className="text-sm font-bold text-on-surface mb-1">Adaptive Break Recommendation</h4>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              7 minutes based on your current stress level and biometric data.
            </p>
          </div>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-4 pt-2 bg-surface shadow-sm rounded-t-xl border-t border-primary-container">
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90 duration-200" onClick={() => router.push('/dashboard')}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-5 py-1 transition-all active:scale-90 duration-200" onClick={() => router.push('/mood')}>
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>self_improvement</span>
          <span className="font-label text-xs mt-1">Wellness</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90 duration-200" onClick={() => router.push('/journal')}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-xs mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
