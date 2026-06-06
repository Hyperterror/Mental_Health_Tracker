"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const triggers = [
  { id: 1, label: "Exam Pressure", icon: "school" },
  { id: 2, label: "Family Expectations", icon: "family_history" },
  { id: 3, label: "Incomplete Syllabus", icon: "auto_stories", colSpan: 2 },
  { id: 4, label: "Poor Mock Scores", icon: "assignment_late" },
  { id: 5, label: "Result Anxiety", icon: "trending_down" },
  { id: 6, label: "Lack of Sleep", icon: "bedtime", colSpan: 2 },
];

export default function TriggersPage() {
  const router = useRouter();
  const [selected, setSelected] = useState<number[]>([]);

  const toggleTrigger = (id: number) => {
    setSelected(prev => 
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    );
  };

  const handleSave = () => {
    // In a real app, save to global store/backend here
    router.push("/dashboard");
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 font-body">
      {/* TopAppBar */}
      <header className="bg-surface/80 backdrop-blur-md sticky top-0 flex justify-between items-center px-4 w-full h-16 z-50">
        <button 
          onClick={() => router.back()}
          className="transition-transform duration-200 active:scale-95 text-primary p-2 hover:bg-surface-variant rounded-full"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <h1 className="font-headline text-lg text-primary font-bold">Wellness Hub</h1>
        <button 
          onClick={() => router.push('/profile')}
          className="transition-transform duration-200 active:scale-95 text-primary p-2 hover:bg-surface-variant rounded-full"
        >
          <span className="material-symbols-outlined">account_circle</span>
        </button>
      </header>

      <main className="max-w-md mx-auto px-6 pt-8">
        {/* Visual Anchor */}
        <div className="flex justify-center mb-8 animate-fade-in">
          <div className="relative w-32 h-32 rounded-full overflow-hidden bg-primary-container/30 flex items-center justify-center">
            <img alt="Mindfulness Illustration" className="w-full h-full object-cover mix-blend-multiply opacity-80 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuB2Z5bRLAQVYvlCnbILeT7DPIyHNk7qMTQV_ys-fI8oyNLi79Nrtt3Ey5SW6VOCTotgUdeaPCLEVDio9ih0lIsQqfpfILrhIlF9wHNpvJgG94ikvVkD3h-NF8zXjmzTojSotSOB7gfxH6nezia-vT9hm1d87z8v2BqeWigJa9ytj5oSkZ15utuUufWqdvrosmN1MzPFAqbBcXVWFdiVMPitlH24ZeRVdfiGsANLEhALLtl1X07FvUMBbtfpTsVCwMQxG2Jgwq4X9Y8" />
            <div className="absolute inset-0 border-4 border-surface rounded-full shadow-inner"></div>
          </div>
        </div>

        {/* Headline & Subheadline */}
        <div className="text-center mb-10">
          <h2 className="font-headline text-3xl font-extrabold text-on-surface tracking-tight mb-3">What&apos;s weighing on you?</h2>
          <p className="text-on-surface-variant font-body leading-relaxed">Identifying your stressors is the first step to managing them. Select all that apply.</p>
        </div>

        {/* Stressors Grid */}
        <div className="grid grid-cols-2 gap-4 mb-12">
          {triggers.map((trigger) => {
            const isSelected = selected.includes(trigger.id);
            return (
              <button
                key={trigger.id}
                onClick={() => toggleTrigger(trigger.id)}
                className={`group transition-all duration-300 ease-in-out border px-4 py-6 rounded-xl flex flex-col items-center gap-3 text-center ${trigger.colSpan === 2 ? 'col-span-2' : ''} ${isSelected ? 'bg-primary border-primary text-white' : 'bg-white/60 border-outline-variant hover:border-primary text-on-surface'}`}
              >
                <span 
                  className={`material-symbols-outlined transition-transform group-hover:scale-110 ${isSelected ? 'text-white' : 'text-primary'}`}
                  style={{ fontVariationSettings: isSelected ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {trigger.icon}
                </span>
                <span className={`font-label text-sm font-semibold ${isSelected ? 'text-white' : 'text-on-surface'}`}>{trigger.label}</span>
              </button>
            );
          })}
        </div>

        {/* CTA Section */}
        <div className="fixed bottom-24 left-0 right-0 px-6 max-w-md mx-auto z-40">
          <button 
            onClick={handleSave}
            className="w-full bg-primary text-white py-4 rounded-full font-headline font-bold text-lg shadow-lg hover:shadow-xl active:scale-[0.98] transition-all flex justify-center items-center gap-2"
          >
            Save and Continue
            <span className="material-symbols-outlined text-xl">arrow_forward</span>
          </button>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface shadow-lg border-t border-outline-variant rounded-t-xl">
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90" onClick={() => router.push('/dashboard')}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>psychology</span>
          <span className="font-label text-xs mt-1">Stressors</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90" onClick={() => router.push('/profile')}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-xs mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
