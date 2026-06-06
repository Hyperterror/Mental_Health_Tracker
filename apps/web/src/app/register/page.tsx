"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { UserProfile } from "@mindfulprep/shared";

export default function RegisterPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Simulate registration
    setTimeout(() => {
      const mockUser = {
        id: "user-123",
        email: email || "student@example.com",
        name: name || "Sarah",
      } as unknown as UserProfile;
      
      setAuth(mockUser, { accessToken: "mock-token", refreshToken: "mock-refresh" });
      setIsLoading(false);
      router.push("/onboarding");
    }, 1500);
  };

  return (
    <div className="bg-surface font-body text-on-surface overflow-hidden min-h-screen relative">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 -left-24 w-80 h-80 bg-outline-variant rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-24 right-1/4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Main Content Shell */}
      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        
        {/* Header Branding */}
        <header className="mb-8 text-center animate-fade-in mt-4">
          <div className="flex items-center justify-center gap-2 mb-6">
            <span className="material-symbols-outlined text-primary text-3xl">spa</span>
            <h1 className="font-display font-black text-2xl tracking-tight text-primary">MindSprint AI</h1>
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-3xl text-on-surface">Join us today</h2>
            <p className="text-on-surface-variant font-medium">Start your balanced study journey.</p>
          </div>
        </header>

        {/* Register Card */}
        <div className="w-full max-w-md space-y-8">
          
          {/* Register Form Container */}
          <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-xl p-8 shadow-[0_10px_40px_-10px_rgba(200,182,166,0.2)]">
            <form className="space-y-6" onSubmit={handleRegister}>
              {/* Name Input */}
              <div className="space-y-2">
                <label className="block font-label text-sm font-bold text-on-surface-variant px-1" htmlFor="name">Full Name</label>
                <div className="relative group">
                  <input 
                    className="w-full px-5 py-4 bg-white/60 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface placeholder:text-outline" 
                    id="name" 
                    placeholder="Sarah Doe" 
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="block font-label text-sm font-bold text-on-surface-variant px-1" htmlFor="email">Email Address</label>
                <div className="relative group">
                  <input 
                    className="w-full px-5 py-4 bg-white/60 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface placeholder:text-outline" 
                    id="email" 
                    placeholder="name@example.com" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              {/* Password Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center px-1">
                  <label className="font-label text-sm font-bold text-on-surface-variant" htmlFor="password">Password</label>
                </div>
                <div className="relative group">
                  <input 
                    className="w-full px-5 py-4 bg-white/60 border border-outline-variant rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-all outline-none text-on-surface placeholder:text-outline" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button className="absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary transition-colors" type="button">
                    <span className="material-symbols-outlined text-lg">visibility</span>
                  </button>
                </div>
              </div>
              
              {/* Action Button */}
              <button 
                type="submit"
                disabled={isLoading}
                className="w-full py-4 bg-primary text-white font-headline font-bold rounded-lg shadow-md active:scale-[0.98] transition-all hover:bg-opacity-90 flex items-center justify-center gap-2 group"
              >
                {isLoading ? (
                  <>
                    <span className="material-symbols-outlined animate-spin">sync</span>
                    Creating Account...
                  </>
                ) : (
                  <>
                    Create Account
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Secondary Actions */}
          <div className="text-center pt-4">
            <p className="text-on-surface-variant text-sm font-medium">
              Already have an account?{" "}
              <Link href="/login" className="text-primary font-bold hover:underline underline-offset-4 transition-all">Log in</Link>
            </p>
          </div>
        </div>

        {/* Atmospheric Footer Info */}
        <footer className="mt-auto pt-12 pb-4 text-center">
          <p className="text-[10px] uppercase tracking-widest text-outline font-bold">Secure • Private • AI-Enhanced</p>
        </footer>
      </main>
    </div>
  );
}
