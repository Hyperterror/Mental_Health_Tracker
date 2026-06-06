"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { UserProfile } from "@mindfulprep/shared";
import apiClient from "@/lib/axios";

export default function LoginPage() {
  const router = useRouter();
  const setAuth = useAuthStore((state) => state.setAuth);
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const response = await apiClient.post("/api/v1/auth/login", {
        email,
        password,
      });

      const { user, tokens } = response.data.data;
      
      setAuth(user as UserProfile, tokens);
      router.push("/dashboard");
    } catch (error: any) {
      setErrorMsg(error.response?.data?.error || "An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-surface font-body text-on-surface overflow-hidden min-h-screen relative">
      {/* Ambient Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-primary-container rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute top-1/2 -right-24 w-80 h-80 bg-outline-variant rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute -bottom-24 left-1/4 w-72 h-72 bg-primary rounded-full mix-blend-multiply filter blur-3xl opacity-10"></div>
      </div>

      {/* Main Content Shell */}
      <main className="min-h-screen flex flex-col items-center justify-center p-6 relative">
        
        {/* Header Branding */}
        <header className="mb-12 text-center animate-fade-in">
          <div className="flex items-center justify-center gap-2 mb-8">
            <span className="material-symbols-outlined text-primary text-3xl">spa</span>
            <h1 className="font-display font-black text-2xl tracking-tight text-primary">MindSprint AI</h1>
          </div>
          <div className="space-y-2">
            <h2 className="font-display font-bold text-3xl text-on-surface">Welcome back</h2>
            <p className="text-on-surface-variant font-medium">Find your center and continue your journey.</p>
          </div>
        </header>

        {/* Login Card */}
        <div className="w-full max-w-md space-y-8">
          
          {/* Hero Illustration */}
          <div className="flex justify-center mb-4">
            <div className="relative w-48 h-48 flex items-center justify-center animate-[float_8s_ease-in-out_infinite]">
              <img alt="Serenity illustration" className="w-full h-full object-contain mix-blend-multiply opacity-80 grayscale" src="https://lh3.googleusercontent.com/aida-public/AB6AXuAdzBK2AdecN-375Ro-5HUCTE_fPzBdS7yrsBUR_Pr844b9Zz8uS0rqN3O70SaXA4XPBmZmp1hzj6cCrVlOckkAwNZ2SIFO7pAdjBd-g1_V9wgIwPoyvbK9uXcj-W9Eo2SEqAALawiDk-K4Eo4xVuy-TVsznGf8mxi5-HV59t836Be_DtRDHCe1Wcwp0hgpniizc9x-Iw2ukOsg3juqvSXXz33huChOJGRuoYnyybR--QUCh6gH9eHCFJSI1Cot3bJZ3PqJIjA2SHM" />
            </div>
          </div>

          {/* Login Form Container */}
          <div className="bg-white/40 backdrop-blur-md border border-white/30 rounded-xl p-8 shadow-[0_10px_40px_-10px_rgba(200,182,166,0.2)]">
            {errorMsg && (
              <div className="mb-6 p-3 bg-red-50 border border-red-200 text-red-600 rounded-lg text-sm font-medium animate-fade-in flex items-center gap-2">
                <span className="material-symbols-outlined text-lg">error</span>
                {errorMsg}
              </div>
            )}
            <form className="space-y-6" onSubmit={handleLogin}>
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
                  <Link href="#" className="text-xs font-bold text-primary hover:underline transition-all">Forgot Password?</Link>
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
                    Authenticating...
                  </>
                ) : (
                  <>
                    Login
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Secondary Actions */}
          <div className="text-center pt-4">
            <p className="text-on-surface-variant text-sm font-medium">
              Don&apos;t have an account?{" "}
              <Link href="/register" className="text-primary font-bold hover:underline underline-offset-4 transition-all">Sign up</Link>
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
