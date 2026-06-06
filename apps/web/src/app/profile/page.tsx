"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import apiClient from "@/lib/axios";

export default function ProfilePage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    try {
      await apiClient.post("/api/v1/auth/logout");
    } catch (e) {
      // Proceed with local logout even if server request fails
    } finally {
      clearAuth();
      router.push("/login");
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-32 font-body">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full bg-surface/80 backdrop-blur-md flex justify-between items-center px-6 py-4 z-50">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
            <img alt="User profile" className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAwjd0GpRDLhHxg-20vLXDj6jH26Yqxk_c57fi-X8suHQpwekRHQlOn6aDgu8AtlDL1sGrAsrkHOKwpysgt3fSgG7vGIg1bFIBUEXUT-zRd4H7wawePiGv6_XfW2telCvjTIVivnvdfZM9b_kFpf196xxZqrx5U3SdSJEhrer6PpOA4clffTShS8XU5vyMJwmygmm0s8La29w7c5u9aS_2D3ZMG5lORifNTLDnH6w3B7HTjQ-Sff664bnUFHP6_qa8ULha134IRcVA" />
          </div>
          <h1 className="text-xl font-black text-primary tracking-tight font-headline">MindSprint AI</h1>
        </div>
        <button className="hover:opacity-80 transition-opacity active:scale-95">
          <span className="material-symbols-outlined text-primary">settings</span>
        </button>
      </header>

      <main className="pt-24 px-6 max-w-2xl mx-auto">
        {/* Hero Profile Section */}
        <section className="flex flex-col items-center text-center mb-10 animate-fade-in">
          <div className="relative mb-6">
            <div className="w-32 h-32 rounded-full border-4 border-primary-container p-1 bg-surface shadow-sm">
              <img alt="User avatar" className="w-full h-full rounded-full object-cover bg-primary-container" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj15_jweID3HidkDcdfT8vc2v8QE3ds66WCqF-gduyfeXZfd3eihJblCrGdx5Ym-gw_94YplAM2N79e0u8EARHieTSnWC_pqSA5THRUDdVh5xG-JY6uL7wyb35dw6blOLN4vyWmrPOIVCHK21uT0Y1hXh1T-CEHMUh0lJmSuqSEAbr10calQHQBVzs-aI0L3l2Re7tfDl6pOaG5oQMVIHD2V-shpzhIboErVys-v95aQuWbJ6ovTKQ_nqz08kwxQ6PnZn838OHxOw" />
            </div>
            <div className="absolute bottom-1 right-1 bg-primary text-white p-1.5 rounded-full shadow-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>edit</span>
            </div>
          </div>
          <h2 className="text-3xl font-bold font-headline text-on-surface">{user?.name || "Sarah"}</h2>
          <div className="mt-2 inline-flex items-center px-4 py-1 rounded-full bg-primary-container text-on-primary-container font-label text-sm font-semibold">
            Target Exam: NEET
          </div>
        </section>

        {/* Study Preferences Card */}
        <section className="mb-6">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-outline/20 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>tune</span>
              <h3 className="font-headline font-bold text-lg">Study Preferences</h3>
            </div>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-on-surface">Daily Study Goal</span>
                  <span className="text-xs text-on-surface-variant">Recommended for high performance</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-outline/30">
                  <span className="font-bold text-primary">6 hours</span>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">expand_more</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-on-surface">Stress Check-in Reminder</span>
                  <span className="text-xs text-on-surface-variant">Mindfulness nudges</span>
                </div>
                <div className="flex items-center gap-2 bg-white px-4 py-2 rounded-lg border border-outline/30">
                  <span className="font-bold text-primary">8:00 PM</span>
                  <span className="material-symbols-outlined text-sm text-on-surface-variant">schedule</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Account Settings Card */}
        <section className="mb-8">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-outline/20 shadow-sm transition-transform hover:-translate-y-0.5 duration-200">
            <div className="flex items-center gap-2 mb-6">
              <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>manage_accounts</span>
              <h3 className="font-headline font-bold text-lg">Account</h3>
            </div>
            <div className="space-y-1">
              <button className="w-full flex items-center justify-between py-3 hover:bg-white/50 rounded-lg px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">mail</span>
                  <span className="text-sm font-medium">Email Settings</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </button>
              <button className="w-full flex items-center justify-between py-3 hover:bg-white/50 rounded-lg px-2 transition-colors">
                <div className="flex items-center gap-3">
                  <span className="material-symbols-outlined text-on-surface-variant">lock</span>
                  <span className="text-sm font-medium">Privacy</span>
                </div>
                <span className="material-symbols-outlined text-on-surface-variant">chevron_right</span>
              </button>
            </div>
          </div>
        </section>

        {/* Logout Button */}
        <section className="mb-12">
          <button 
            onClick={handleLogout}
            className="w-full py-4 bg-primary-container text-primary font-bold rounded-xl hover:opacity-80 active:scale-[0.98] transition-all flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined">logout</span>
            Logout
          </button>
          <p className="text-center text-xs text-on-surface-variant mt-6">MindSprint AI Version 2.4.0 (NEET Edition)</p>
        </section>
      </main>

      {/* Illustrative Background Element */}
      <div className="fixed top-0 left-0 w-full h-full -z-10 pointer-events-none opacity-30">
        <div className="absolute top-[10%] left-[-10%] w-[300px] h-[300px] bg-primary-container rounded-full blur-[80px]"></div>
        <div className="absolute bottom-[20%] right-[-10%] w-[250px] h-[250px] bg-outline rounded-full blur-[100px]"></div>
      </div>

      {/* BottomNavBar */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 py-3 pb-safe bg-surface shadow-lg border-t border-outline-variant rounded-t-xl">
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90" onClick={() => router.push('/dashboard')}>
          <span className="material-symbols-outlined">home</span>
          <span className="font-label text-xs mt-1">Home</span>
        </button>
        <button className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary transition-all active:scale-90" onClick={() => router.push('/mood')}>
          <span className="material-symbols-outlined">self_care</span>
          <span className="font-label text-xs mt-1">Wellness</span>
        </button>
        <button className="flex flex-col items-center justify-center bg-primary-container text-on-primary-container rounded-full px-4 py-1 active:scale-90 transition-transform">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>person</span>
          <span className="font-label text-xs mt-1 font-bold">Profile</span>
        </button>
      </nav>
    </div>
  );
}
