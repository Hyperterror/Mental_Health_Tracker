"use client";

import { useRouter } from "next/navigation";

export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="bg-surface pb-32 min-h-screen">
      {/* TopAppBar */}
      <header className="flex justify-between items-center px-6 py-4 w-full bg-surface dark:bg-surface fixed top-0 left-0 z-50">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary">spa</span>
          <h1 className="text-xl font-headline font-black text-primary dark:text-primary">MindSprint AI</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="material-symbols-outlined text-on-surface-variant hover:bg-surface-variant/50 transition-colors p-2 rounded-full">search</button>
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline">
            <img 
              alt="User Portrait" 
              className="w-full h-full object-cover" 
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBil2Fuod7g61JZkQaa_reslnZFn1R63WF1avIHj0pcEhkOTSBSH4oo-jeQA0oi1oo4OQXUuGnYqdCvMLoLfh4QKaQYVmlGcbr8AvQBO6NYrKgF3wS62rbQJLw66JKgxybFz6QwsKbp3Wx0_dnodFFfwY8_xQQu5yUgb6yrLlaSVivdDsISZK-S4hcLnFQb5mFzOnVW5UIeUBU2PrgvIKA8skorzb2cV5tLT0oOGX76ZLvCY8wjQodCAd0YxPeXss7S-ySYNK0NKCU"
            />
          </div>
        </div>
      </header>

      <main className="pt-24 px-6 max-w-5xl mx-auto">
        {/* Welcome Section */}
        <section className="mb-10 animate-fade-in">
          <h2 className="font-headline font-extrabold text-4xl text-on-surface tracking-tight mb-2">Hi Sarah,</h2>
          <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">You&apos;re doing great today. Take a deep breath.</p>
        </section>

        {/* Daily Wellness Recommendation (Hero Bento) */}
        <section className="mb-8">
          <div className="relative overflow-hidden rounded-xl bg-primary-container p-8 flex flex-col md:flex-row items-center justify-between gap-6 transition-transform hover:scale-[1.01] duration-300">
            <div className="z-10 text-center md:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/50 text-xs font-bold text-primary mb-4">
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>sparkles</span>
                FOR YOU
              </div>
              <h3 className="font-headline text-2xl font-bold text-on-primary-container mb-2">Take a 10-minute stretch break</h3>
              <p className="text-on-primary-container/80 max-w-sm mb-6">Recent sessions show slight muscle fatigue. Relax your shoulders and spine for better focus.</p>
              <button 
                className="px-6 py-2.5 bg-primary text-white rounded-full font-bold text-sm shadow-md hover:shadow-lg transition-all active:scale-95"
                onClick={() => router.push('/missions')}
              >
                Start Guided Stretch
              </button>
            </div>
            <div className="relative w-48 h-48 md:w-64 md:h-64 flex items-center justify-center">
              <span className="material-symbols-outlined text-[120px] text-primary/20 absolute">self_improvement</span>
              <img 
                alt="Stretch Recommendation" 
                className="w-full h-full object-cover rounded-full border-4 border-white/40 shadow-xl relative z-10" 
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCfswpuXlKbDeqzsrsK8nv3t-tuHxnWTmQB70GupRFYvWF8ljoqOi0S5G-lmEW8C2uqbLO9ovB8LggZVNNrPnD5hcEzAlBze6r2lVuxl9DqESgSUPIFtZHRXS0MgQyUljLl8KRV2kyzJBzUUqcAGjyCz-0YrjLKC8slCEdGArYbgcu7s8CiHHsBAKvNPjfqiUJKzg5MRcnKuzoXHBEiYSW2xH0A0WMoeOY8kbteXY6xBIDFUODGdXjje75xtBdeB99bCic2QDv3Rs8"
              />
            </div>
          </div>
        </section>

        {/* Analytics & Wellness Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Study Analytics */}
          <div className="md:col-span-2 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-headline font-bold text-lg text-on-surface">Study Analytics</h3>
              <button className="text-primary text-sm font-semibold hover:underline">View Details</button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="bg-white p-5 rounded-xl border border-outline shadow-sm hover:shadow-md transition-shadow group">
                <span className="material-symbols-outlined text-primary mb-3 block">schedule</span>
                <div className="text-on-surface-variant text-xs font-label uppercase tracking-wider mb-1">Hours Studied</div>
                <div className="text-2xl font-black text-on-surface group-hover:text-primary transition-colors">4.5h</div>
                <div className="mt-2 text-[10px] text-wellness-text font-bold">+12% from yesterday</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-outline shadow-sm hover:shadow-md transition-shadow group">
                <span className="material-symbols-outlined text-primary mb-3 block">task_alt</span>
                <div className="text-on-surface-variant text-xs font-label uppercase tracking-wider mb-1">Sessions</div>
                <div className="text-2xl font-black text-on-surface group-hover:text-primary transition-colors">6</div>
                <div className="mt-2 text-[10px] text-on-surface-variant font-medium">Daily Goal: 8</div>
              </div>
              <div className="bg-white p-5 rounded-xl border border-outline shadow-sm hover:shadow-md transition-shadow group">
                <span className="material-symbols-outlined text-primary mb-3 block">query_stats</span>
                <div className="text-on-surface-variant text-xs font-label uppercase tracking-wider mb-1">Consistency</div>
                <div className="text-2xl font-black text-on-surface group-hover:text-primary transition-colors">85%</div>
                <div className="mt-2 flex gap-1 items-end">
                  <div className="w-2 h-4 bg-primary rounded-full"></div>
                  <div className="w-2 h-6 bg-primary rounded-full"></div>
                  <div className="w-2 h-3 bg-primary/30 rounded-full"></div>
                  <div className="w-2 h-5 bg-primary rounded-full"></div>
                </div>
              </div>
            </div>
          </div>

          {/* Wellness Section */}
          <div className="bg-surface-variant/50 p-6 rounded-xl border border-outline/50">
            <h3 className="font-headline font-bold text-lg text-on-surface mb-4">Wellness</h3>
            <div className="space-y-6">
              <div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-on-surface-variant">Mood Trends</span>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">more_horiz</span>
                </div>
                <div className="flex items-end justify-between h-16 gap-1">
                  <div className="flex-1 bg-primary/20 h-2/3 rounded-t-sm" title="Mon"></div>
                  <div className="flex-1 bg-primary/40 h-3/4 rounded-t-sm" title="Tue"></div>
                  <div className="flex-1 bg-primary/30 h-1/2 rounded-t-sm" title="Wed"></div>
                  <div className="flex-1 bg-primary/60 h-4/5 rounded-t-sm" title="Thu"></div>
                  <div className="flex-1 bg-primary h-full rounded-t-sm" title="Fri"></div>
                  <div className="flex-1 bg-primary/50 h-2/3 rounded-t-sm" title="Sat"></div>
                  <div className="flex-1 bg-primary/20 h-1/3 rounded-t-sm" title="Sun"></div>
                </div>
                <div className="flex justify-between text-[10px] text-on-surface-variant mt-1 px-0.5">
                  <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                </div>
              </div>
              <div className="pt-4 border-t border-outline/30">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-on-surface-variant">Burnout Risk</span>
                  <span className="px-3 py-1 bg-wellness-low text-wellness-text text-xs font-bold rounded-full">Low Risk</span>
                </div>
                <p className="text-[11px] text-on-surface-variant mt-2">Your pacing is sustainable. Keep it up!</p>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Action Canvas */}
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-full max-w-xs px-6 z-[60]">
          <button 
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl flex items-center justify-center gap-3 active:scale-95 transition-all duration-150 group"
            onClick={() => router.push('/timer')}
          >
            <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>play_circle</span>
            <span className="font-headline tracking-wide uppercase text-sm">Start Study Session</span>
          </button>
        </div>
      </main>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface dark:bg-surface shadow-[0_-2px_10px_rgba(0,0,0,0.05)] rounded-t-xl">
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-xl px-4 py-1 active:scale-90 transition-all duration-150">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
          <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">Home</span>
        </button>
        <button 
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-variant/30 active:scale-90 transition-all duration-150"
          onClick={() => router.push('/mood')}
        >
          <span className="material-symbols-outlined">self_improvement</span>
          <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">Wellness</span>
        </button>
        <button 
          className="flex flex-col items-center justify-center text-on-surface-variant px-4 py-1 hover:bg-surface-variant/30 active:scale-90 transition-all duration-150"
          onClick={() => router.push('/journal')}
        >
          <span className="material-symbols-outlined">person</span>
          <span className="font-label text-[10px] uppercase tracking-wider mt-0.5">Profile</span>
        </button>
      </nav>
    </div>
  );
}
