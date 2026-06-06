"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/store/auth.store";

export default function LandingPage() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (user) {
      router.push("/dashboard");
    }
  }, [user, router]);

  if (user) {
    return null; // Avoid flashing content while redirecting
  }

  return (
    <div className="font-body selection:bg-primary-container bg-surface text-on-surface min-h-screen">
      {/* TopAppBar */}
      <header className="w-full top-0 sticky z-50 bg-surface/80 backdrop-blur-md">
        <div className="flex justify-between items-center w-full px-6 py-4 max-w-7xl mx-auto">
          <div className="flex items-center gap-2 cursor-pointer active:opacity-70 transition-opacity">
            <span className="material-symbols-outlined text-primary text-2xl">spa</span>
            <span className="text-xl font-black text-primary tracking-tight font-headline">MindSprint AI</span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="font-body text-sm font-medium text-primary hover:text-primary transition-colors duration-200 cursor-pointer">
              Log in
            </Link>
            <Link href="/register" className="bg-primary text-white px-5 py-2 rounded-full font-medium text-sm hover:opacity-90 transition-all shadow-sm">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative px-6 pt-12 pb-20 overflow-hidden">
          <div className="max-w-4xl mx-auto text-center relative z-10 animate-fade-in">
            <div className="mb-8 flex justify-center">
              <div className="relative w-full max-w-[320px] aspect-square rounded-xl overflow-hidden shadow-[0_10px_40px_-15px_rgba(200,182,166,0.3)]">
                <img alt="MindSprint AI Illustration" className="w-full h-full object-cover grayscale mix-blend-multiply opacity-90" src="https://lh3.googleusercontent.com/aida/AP1WRLu1ZyBMrcrL37ZVr4_EQnk1U3XQWHOIgdJMx96c98pg452xoa2H6xwCJ-JmQ8a0rmo1kfSnJd4_-NuLceZjy9Mcy5tMPtOBI3egO8HTDwpegVkgaltZNNMmGmXscTzu7SbEXZBKTn8BjKuER5RBxkHF94j_YEHJGEf33p_BB3EBVC4AmHAdKhjrF_5rWCVKyfj2nD9Ct9pHC1Xsp9psmHGF2ceU4iwQLmj469MIWWN7FnknNVVG7V2-tA" />
              </div>
            </div>
            <h1 className="text-4xl font-black text-on-surface font-headline tracking-tight mb-4 leading-tight">
              Study Smarter.<br/>Stay Stronger.
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md mx-auto mb-10">
              Balance your academic goals with mental well-being using AI-powered tools designed for focus.
            </p>
            <div className="flex flex-col gap-3 max-w-xs mx-auto">
              <Link href="/register" className="bg-primary text-white py-4 px-8 rounded-full text-lg font-bold shadow-lg hover:shadow-xl transition-all active:scale-95 block w-full">
                Get Started for Free
              </Link>
              <p className="text-xs text-on-surface-variant/70 font-label">No credit card required.</p>
            </div>
          </div>
          {/* Atmospheric Organic Background Shapes */}
          <div className="absolute top-1/2 -left-20 w-64 h-64 bg-primary-container/30 rounded-[60%_40%_70%_30%/40%_50%_60%_40%] blur-3xl"></div>
          <div className="absolute bottom-10 -right-20 w-80 h-80 bg-outline-variant/40 rounded-[60%_40%_70%_30%/40%_50%_60%_40%] blur-3xl"></div>
        </section>

        {/* Features Section */}
        <section className="px-6 py-16 bg-white/50 border-y border-outline-variant/50">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Feature 1 */}
              <div className="bg-white/60 p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center text-center group hover:bg-primary-container/20 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">timer</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">Adaptive Pomodoro Timer</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Smart study blocks that adjust to your focus levels, ensuring you never burn out while hitting your peak productivity.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="bg-white/60 p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center text-center group hover:bg-primary-container/20 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">mood</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">Mood Tracking</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Simple, one-tap check-ins to monitor your stress and improve your mental state through personalized reflections.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="bg-white/60 p-8 rounded-xl border border-outline-variant shadow-sm flex flex-col items-center text-center group hover:bg-primary-container/20 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary-container flex items-center justify-center text-primary mb-6 group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-3xl">rocket_launch</span>
                </div>
                <h3 className="text-xl font-bold font-headline mb-3 text-on-surface">Wellness Missions</h3>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  Gamified daily challenges that keep you healthy, consistent, and reward your commitment to mental hygiene.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Bottom CTA Access */}
        <section className="px-6 py-20 bg-surface">
          <div className="max-w-md mx-auto text-center">
            <div className="w-12 h-1 bg-outline-variant mx-auto mb-10 rounded-full"></div>
            <h2 className="text-2xl font-bold font-headline mb-8 text-on-surface">Ready to start your sprint?</h2>
            <div className="flex flex-col gap-4">
              <Link href="/register" className="bg-primary text-white w-full py-5 rounded-xl text-lg font-bold shadow-md active:scale-95 transition-all block">
                Sign up
              </Link>
              <Link href="/login" className="bg-primary-container text-primary w-full py-5 rounded-xl text-lg font-bold hover:bg-outline-variant transition-all active:scale-95 block">
                Log in
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 px-6 bg-surface border-t border-outline-variant/30">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 max-w-7xl mx-auto">
          <div className="flex flex-col items-center md:items-start gap-2">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-primary text-xl">spa</span>
              <span className="font-headline text-lg font-bold text-primary">MindSprint AI</span>
            </div>
            <p className="font-label text-xs text-on-surface-variant">© 2026 MindSprint AI. Focus on what matters.</p>
          </div>
          <nav className="flex flex-wrap justify-center gap-6">
            <Link href="#" className="font-label text-xs text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-all duration-300">Privacy Policy</Link>
            <Link href="#" className="font-label text-xs text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-all duration-300">Terms of Service</Link>
            <Link href="#" className="font-label text-xs text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-all duration-300">Support</Link>
            <Link href="#" className="font-label text-xs text-on-surface-variant hover:text-primary underline decoration-2 underline-offset-4 transition-all duration-300">Contact</Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
