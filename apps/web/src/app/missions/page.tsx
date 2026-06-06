"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const INITIAL_MISSIONS = [
  { id: 1, title: "Drink Water", xp: 10, icon: "water_drop", completed: true },
  { id: 2, title: "Stretch", xp: 15, icon: "self_care", completed: true },
  { id: 3, title: "Sleep Before Midnight", xp: 25, icon: "bedtime", completed: false },
  { id: 4, title: "Journal Entry", xp: 20, icon: "edit_note", completed: false },
  { id: 5, title: "Complete Breaks", xp: 15, icon: "pause_circle", completed: false }
];

export default function MissionsPage() {
  const router = useRouter();
  const [missions, setMissions] = useState(INITIAL_MISSIONS);

  const toggleMission = (id: number) => {
    setMissions(missions.map(m => m.id === id ? { ...m, completed: !m.completed } : m));
  };

  const completedCount = missions.filter(m => m.completed).length;

  return (
    <div className="bg-surface text-on-primary-container font-body antialiased min-h-screen pb-24">
      {/* Top App Bar */}
      <header className="flex justify-between items-center px-6 py-4 w-full bg-surface shadow-sm sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary text-2xl">spa</span>
          <span className="text-xl font-display font-black text-primary tracking-tight">MindSprint AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-surface-variant transition-colors active:scale-95">
            <span className="material-symbols-outlined text-on-surface-variant">notifications</span>
          </button>
          <div className="w-10 h-10 rounded-full bg-primary-container overflow-hidden ring-2 ring-outline-variant">
            <img 
              alt="User Profile" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuB7SjRivZm9CHxL2wSiPAi8JQDTguDbOXYfTIyTbds00JJq6QuTT6JDb3D8G2kHkj5MlR-ioidVFH1jPLE7VHxEPLgPf4QuuCuWcHHSr_L52ibnrDH0QyH_QdyKIhb4ix5FCcRwI2OwaKrwI8V1Px-kSyPwIx6_MmjDiINxKNoz59iOpJrDaYo4ooR5hoLs_lG6WNy3DRj1JDcKXt2Nb05PkluNVZoacc_JdeauG7Tp7RfABwppE13X1Gckc9PnIJLTNz12IW9GVHo"
            />
          </div>
        </div>
      </header>

      <main className="max-w-xl mx-auto px-6 py-8">
        {/* User Status Section */}
        <section className="mb-10 animate-fade-in">
          <div className="flex justify-between items-end mb-4">
            <div>
              <h1 className="font-headline text-2xl font-bold text-on-primary-container leading-tight">Wellness Missions</h1>
              <p className="text-on-surface-variant font-medium mt-1">Level: <span className="text-primary font-bold">Scholar</span></p>
            </div>
            <div className="text-right">
              <span className="text-sm font-label font-bold text-on-surface-variant uppercase tracking-wider">Total XP</span>
              <p className="text-3xl font-display font-black text-primary">1,250</p>
            </div>
          </div>
          <div className="bg-white/60 p-6 rounded-xl shadow-sm border border-outline-variant">
            <div className="flex justify-between text-xs font-bold font-label mb-2 text-on-surface-variant uppercase tracking-widest">
              <span>Current Level</span>
              <span>1,500 XP to next level</span>
            </div>
            <div className="h-3 w-full bg-outline-variant rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" style={{ width: "83.3%" }}></div>
            </div>
            <p className="mt-3 text-sm text-on-surface-variant italic">&quot;You&apos;re doing great, Alex. Consistency is your superpower.&quot;</p>
          </div>
        </section>

        {/* Daily Challenges Section */}
        <section className="mb-10">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-lg font-bold">Daily Challenges</h2>
            <span className="text-xs font-label bg-primary-container text-on-primary-container px-3 py-1 rounded-full font-bold">{completedCount}/{missions.length} Done</span>
          </div>
          <div className="space-y-4">
            {missions.map(mission => (
              <div 
                key={mission.id}
                className={`flex items-center justify-between p-4 border rounded-xl group cursor-pointer transition-transform hover:scale-[1.01] active:scale-95 ${mission.completed ? "bg-white border-outline-variant" : "bg-white/50 border-outline-variant hover:border-outline transition-colors"}`}
                onClick={() => toggleMission(mission.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 flex items-center justify-center rounded-lg ${mission.completed ? "bg-primary-container" : "bg-surface-variant"}`}>
                    <span className={`material-symbols-outlined ${mission.completed ? "text-primary" : "text-on-surface-variant"}`}>{mission.icon}</span>
                  </div>
                  <div>
                    <h3 className="font-bold text-on-primary-container">{mission.title}</h3>
                    <span className={`text-xs font-bold ${mission.completed ? "text-primary" : "text-on-surface-variant"}`}>+{mission.xp} XP</span>
                  </div>
                </div>
                {mission.completed ? (
                  <div className="w-7 h-7 rounded-full border-2 border-primary bg-primary flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-lg font-bold">check</span>
                  </div>
                ) : (
                  <div className="w-7 h-7 rounded-full border-2 border-outline-variant bg-transparent group-hover:border-outline transition-colors"></div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Recent Badges Earned Section */}
        <section>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline text-lg font-bold">Recent Badges</h2>
            <button className="text-xs font-label font-bold text-primary uppercase tracking-widest hover:opacity-80 transition-opacity">View All</button>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {/* Badge 1 */}
            <div className="flex-shrink-0 w-32 flex flex-col items-center p-4 bg-white rounded-xl border border-outline-variant shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>local_fire_department</span>
              </div>
              <span className="text-[11px] font-black font-label text-on-primary-container text-center leading-tight">7-Day Streak</span>
            </div>
            {/* Badge 2 */}
            <div className="flex-shrink-0 w-32 flex flex-col items-center p-4 bg-white rounded-xl border border-outline-variant shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>filter_vintage</span>
              </div>
              <span className="text-[11px] font-black font-label text-on-primary-container text-center leading-tight">Mindful Master</span>
            </div>
            {/* Badge 3 */}
            <div className="flex-shrink-0 w-32 flex flex-col items-center p-4 bg-white rounded-xl border border-outline-variant shadow-sm">
              <div className="w-16 h-16 rounded-full bg-primary-container flex items-center justify-center mb-3">
                <span className="material-symbols-outlined text-primary text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>water_full</span>
              </div>
              <span className="text-[11px] font-black font-label text-on-primary-container text-center leading-tight">Hydration Hero</span>
            </div>
            {/* Badge 4 */}
            <div className="flex-shrink-0 w-32 flex flex-col items-center p-4 bg-white/50 rounded-xl border border-outline-variant opacity-60">
              <div className="w-16 h-16 rounded-full bg-surface-variant flex items-center justify-center mb-3 grayscale">
                <span className="material-symbols-outlined text-on-surface-variant text-3xl">stars</span>
              </div>
              <span className="text-[11px] font-black font-label text-on-surface-variant text-center leading-tight">Elite Mentor</span>
            </div>
          </div>
        </section>
      </main>

      {/* Navigation Shell */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface shadow-lg border-t border-outline-variant rounded-t-xl">
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90" onClick={() => router.push('/dashboard')}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>self_care</span>
          <span className="font-label text-xs mt-1">Wellness</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90" onClick={() => router.push('/journal')}>
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-xs mt-1">Profile</span>
        </button>
      </nav>
    </div>
  );
}
