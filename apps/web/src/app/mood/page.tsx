"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const MOODS = [
  { label: "Happy", icon: "😊" },
  { label: "Calm", icon: "😌" },
  { label: "Neutral", icon: "😐" },
  { label: "Anxious", icon: "😰" },
  { label: "Overwhelmed", icon: "😫" }
];

export default function MoodCheckInPage() {
  const router = useRouter();
  const [selectedMood, setSelectedMood] = useState("Happy");
  const [stress, setStress] = useState(5);
  const [energy, setEnergy] = useState(5);

  const handleSave = () => {
    // In a real app, save to backend here
    router.push("/mood/triggers");
  };

  return (
    <div className="bg-surface text-on-surface font-body min-h-screen pb-24">
      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full bg-surface z-50 flex items-center justify-center h-16 px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" data-icon="spa">spa</span>
          <h1 className="text-xl font-headline font-black text-primary">MindSprint AI</h1>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto space-y-10">
        {/* Welcome Title */}
        <section className="text-center space-y-2">
          <h2 className="font-display font-medium text-on-surface-variant text-3xl tracking-tight">How are you feeling today?</h2>
          <p className="text-on-surface-variant/70 text-sm">Take a moment to check in with yourself.</p>
        </section>

        {/* Aesthetic Imagery */}
        <section className="w-full h-48 rounded-xl overflow-hidden relative">
          <img 
            alt="Calm aesthetic background" 
            className="w-full h-full object-cover" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBbJsf1fZhvgNFn02_Nrq11vOo0Q5Hvpd5Bzb_ZTMBpVfINHQdOQQZwtY58p8cptqnpcDsdm8v2nxwB6WJOyY70PKNGaIy--tu8gA7MgIpcxlIuitaOfkbK5Xll0YrlZx5jwXe8k9sXqLn8v0Bu8IIiZhcVX2pqKPe9crpCh24jDkuTkrmERdk3yNCQi1Z0pAxmB8xJsjUfBkO-a7bNnSR-e7hdt9Nla7nr9xH6gtgdTTPBwLHe0Cr_VobzqfNdH-qmsucO1a5zdBI"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-surface/80 to-transparent"></div>
        </section>

        {/* Mood Selector */}
        <section className="space-y-4">
          <h3 className="font-headline font-bold text-on-surface-variant px-1 uppercase tracking-widest text-xs">Select Mood</h3>
          <div className="grid grid-cols-5 gap-3">
            {MOODS.map((mood) => {
              const isActive = selectedMood === mood.label;
              return (
                <button 
                  key={mood.label}
                  className={`flex flex-col items-center justify-center p-4 rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 bg-white/40 backdrop-blur-md border ${isActive ? "bg-primary-container border-2 border-primary" : "border-primary/10"}`}
                  onClick={() => setSelectedMood(mood.label)}
                >
                  <span className="text-3xl mb-2">{mood.icon}</span>
                  <span className="text-[10px] font-bold text-on-surface-variant uppercase">{mood.label}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Sliders */}
        <section className="space-y-8 py-4">
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="font-headline font-bold text-on-surface-variant text-sm tracking-wide">STRESS LEVEL</label>
              <span className="font-display font-bold text-primary">{stress}</span>
            </div>
            <input 
              className="w-full accent-primary" 
              max="10" 
              min="0" 
              type="range" 
              value={stress}
              onChange={(e) => setStress(Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant/50 font-bold px-1">
              <span>LOW</span>
              <span>MODERATE</span>
              <span>HIGH</span>
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex justify-between items-center px-1">
              <label className="font-headline font-bold text-on-surface-variant text-sm tracking-wide">ENERGY LEVEL</label>
              <span className="font-display font-bold text-primary">{energy}</span>
            </div>
            <input 
              className="w-full accent-primary" 
              max="10" 
              min="0" 
              type="range" 
              value={energy}
              onChange={(e) => setEnergy(Number(e.target.value))}
            />
            <div className="flex justify-between text-[10px] text-on-surface-variant/50 font-bold px-1">
              <span>DRAINED</span>
              <span>STEADY</span>
              <span>POWERFUL</span>
            </div>
          </div>
        </section>

        {/* Action Button */}
        <section className="pt-4">
          <button 
            className="w-full py-5 bg-primary text-on-primary rounded-xl font-headline font-bold text-lg shadow-lg shadow-primary/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-3"
            onClick={handleSave}
          >
            <span className="material-symbols-outlined" data-icon="task_alt">task_alt</span>
            Save Check-In
          </button>
        </section>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center py-3 px-6 bg-surface border-t border-outline-variant shadow-md rounded-t-xl">
        <div className="flex flex-col items-center justify-center text-on-surface-variant p-3 hover:bg-surface-variant transition-colors active:scale-95 duration-100 cursor-pointer rounded-full" onClick={() => router.push('/dashboard')}>
          <span className="material-symbols-outlined" data-icon="home">home</span>
        </div>
        <div className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full p-3 hover:bg-surface-variant transition-colors active:scale-95 duration-100 cursor-pointer">
          <span className="material-symbols-outlined" data-icon="self_improvement">self_improvement</span>
        </div>
        <div className="flex flex-col items-center justify-center text-on-surface-variant p-3 hover:bg-surface-variant transition-colors active:scale-95 duration-100 cursor-pointer rounded-full" onClick={() => router.push('/profile')}>
          <span className="material-symbols-outlined" data-icon="person">person</span>
        </div>
      </nav>
    </div>
  );
}
