"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function JournalPage() {
  const router = useRouter();
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [wellToday, setWellToday] = useState("");
  const [challengedToday, setChallengedToday] = useState("");
  const [improveTomorrow, setImproveTomorrow] = useState("");

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setIsSaved(true);
      setTimeout(() => {
        setIsSaved(false);
        router.push("/dashboard");
      }, 1500);
    }, 1200);
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full bg-surface/80 backdrop-blur-md z-50 flex items-center justify-between px-6 py-4 shadow-sm border-b border-outline/20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-primary text-2xl" data-icon="spa">spa</span>
          <h1 className="font-display text-headline-sm tracking-tight text-xl font-headline font-black text-primary">MindSprint AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-variant p-2 rounded-full transition-colors">notifications</button>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Header Section */}
        <header className="mb-8 animate-fade-in">
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-on-surface-variant" style={{ fontVariationSettings: "'FILL' 1" }}>bedtime</span>
            <span className="text-on-surface-variant font-label text-sm uppercase tracking-widest font-bold">Daily Mindset</span>
          </div>
          <h2 className="text-4xl font-headline font-bold text-on-primary-container leading-tight">Evening Reflection</h2>
          <p className="text-on-surface-variant mt-2 font-body">Take a moment to breathe and process your day. Your thoughts are safe here.</p>
        </header>

        {/* Reflection Inputs */}
        <div className="space-y-6">
          <div className="bg-white/60 backdrop-blur-sm border border-surface-variant rounded-xl p-6 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md focus-within:-translate-y-0.5 focus-within:shadow-md duration-200">
            <label className="block text-primary font-headline font-bold mb-3" htmlFor="well-today">What went well today?</label>
            <textarea 
              className="w-full bg-transparent border-none p-0 text-on-surface font-body placeholder:text-on-surface-variant/40 focus:ring-0 resize-none" 
              id="well-today" 
              placeholder="Focus on the small wins..." 
              rows={3}
              value={wellToday}
              onChange={(e) => setWellToday(e.target.value)}
            ></textarea>
            <div className="mt-4 flex justify-end">
              <span className="material-symbols-outlined text-surface-variant text-lg">sentiment_satisfied</span>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-surface-variant rounded-xl p-6 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md focus-within:-translate-y-0.5 focus-within:shadow-md duration-200">
            <label className="block text-primary font-headline font-bold mb-3" htmlFor="challenged-today">What challenged you today?</label>
            <textarea 
              className="w-full bg-transparent border-none p-0 text-on-surface font-body placeholder:text-on-surface-variant/40 focus:ring-0 resize-none" 
              id="challenged-today" 
              placeholder="Acknowledging obstacles is the first step to growth..." 
              rows={3}
              value={challengedToday}
              onChange={(e) => setChallengedToday(e.target.value)}
            ></textarea>
            <div className="mt-4 flex justify-end">
              <span className="material-symbols-outlined text-surface-variant text-lg">psychology</span>
            </div>
          </div>

          <div className="bg-white/60 backdrop-blur-sm border border-surface-variant rounded-xl p-6 shadow-sm transition-transform hover:-translate-y-0.5 hover:shadow-md focus-within:-translate-y-0.5 focus-within:shadow-md duration-200">
            <label className="block text-primary font-headline font-bold mb-3" htmlFor="improve-tomorrow">What is one thing you&apos;ll improve tomorrow?</label>
            <textarea 
              className="w-full bg-transparent border-none p-0 text-on-surface font-body placeholder:text-on-surface-variant/40 focus:ring-0 resize-none" 
              id="improve-tomorrow" 
              placeholder="A small commitment for a better tomorrow..." 
              rows={3}
              value={improveTomorrow}
              onChange={(e) => setImproveTomorrow(e.target.value)}
            ></textarea>
            <div className="mt-4 flex justify-end">
              <span className="material-symbols-outlined text-surface-variant text-lg">auto_awesome</span>
            </div>
          </div>
        </div>

        {/* Atmospheric Visual */}
        <div className="mt-12 relative h-48 rounded-xl overflow-hidden shadow-inner group">
          <div className="absolute inset-0 bg-primary/5 mix-blend-overlay z-10"></div>
          <img 
            alt="Tranquil aesthetic scene" 
            className="w-full h-full object-cover grayscale opacity-40 group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-1000 ease-in-out" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuChyae0wLD5qh6vI26po-i23njMMtzAIlCpF93Dh9RQdbfpEz_nqCj-Z5NJ7M8zdWRaeYBsYp9ljwnalIIXNx5R_z62udi9FyQxovMX7COWuN8ipGLO9lBdclQ39YEZkujss5Gxz56OCJnPoNx_1_HWacBGwaaKyftoiB2qOfskGi568lR7x4wbkaVE9g1nWnjxX2pwO_VjQPQLZDpNkx8Nl7P05ZZj5DNYTPw2f1ELwryDtsoPC5_NVhs7Z0u66ddq6SuU_XhhY3c"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-primary font-headline italic text-sm text-center px-10">&quot;Reflection is the lamp of the heart.&quot;</p>
          </div>
        </div>

        {/* Save Button CTA */}
        <div className="mt-12 mb-20 flex justify-center">
          <button 
            className={`px-10 py-4 rounded-full font-headline font-bold shadow-lg transition-all duration-150 flex items-center gap-2 ${isSaved ? "bg-green-800 text-white" : "bg-primary text-on-primary hover:shadow-xl hover:scale-[1.02] active:scale-95"}`}
            onClick={handleSave}
            disabled={isSaving || isSaved}
          >
            {isSaving ? (
              <>
                <span className="material-symbols-outlined animate-spin">progress_activity</span>
                Saving...
              </>
            ) : isSaved ? (
              <>
                <span className="material-symbols-outlined">done_all</span>
                Saved
              </>
            ) : (
              <>
                <span className="material-symbols-outlined">check_circle</span>
                Save Reflection
              </>
            )}
          </button>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pt-3 pb-6 bg-surface dark:bg-surface-container shadow-[0_-4px_12px_rgba(0,0,0,0.05)] rounded-t-xl">
        <button className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:bg-surface-variant/20 transition-colors px-5 py-1" onClick={() => router.push('/dashboard')}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-xs font-medium mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant opacity-70 hover:bg-surface-variant/20 transition-colors px-5 py-1" onClick={() => router.push('/mood')}>
          <span className="material-symbols-outlined">self_improvement</span>
          <span className="font-label text-xs font-medium mt-1">Wellness</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-5 py-1 transition-transform active:scale-90">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-label text-xs font-medium mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
