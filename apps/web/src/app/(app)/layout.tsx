"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  BookOpen,
  TrendingUp,
  User,
} from "lucide-react";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/study", label: "Study", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: TrendingUp },
  { href: "/profile", label: "Profile", icon: User },
];

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-64 h-screen sticky top-0 border-r border-white/5 bg-mindful-card/50 backdrop-blur-xl">
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-6 border-b border-white/5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center shadow-lg">
            <LayoutDashboard size={16} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">MindfulPrep</span>
        </div>

        {/* Nav links */}
        <nav className="flex-1 px-4 py-6 space-y-1" aria-label="Main navigation">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} aria-current={isActive ? "page" : undefined}>
                <motion.div
                  whileHover={{ x: 4 }}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 min-h-[44px]",
                    isActive
                      ? "bg-teal-500/15 text-teal-300 border border-teal-500/20"
                      : "text-mindful-slate hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon size={20} />
                  <span className="font-medium text-sm">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="ml-auto w-1.5 h-1.5 rounded-full bg-teal-400"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className="px-4 py-4 border-t border-white/5">
          <Link href="/profile">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors min-h-[44px]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                <UserInitial />
              </div>
              <div className="min-w-0">
                <UserName />
              </div>
            </div>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 min-h-screen pb-20 md:pb-0 overflow-x-hidden">
        {children}
      </main>

      {/* Bottom tab bar — mobile */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-mindful-card/80 backdrop-blur-xl border-t border-white/10"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-around px-2 py-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(`${href}/`);
            return (
              <Link key={href} href={href} aria-current={isActive ? "page" : undefined}>
                <motion.div
                  whileTap={{ scale: 0.9 }}
                  className={cn(
                    "flex flex-col items-center gap-1 px-4 py-2 rounded-xl min-h-[44px] min-w-[44px] transition-colors",
                    isActive ? "text-teal-400" : "text-mindful-slate"
                  )}
                >
                  <Icon size={22} />
                  <span className="text-xs font-medium">{label}</span>
                  {isActive && (
                    <motion.div
                      layoutId="mobileActiveIndicator"
                      className="absolute bottom-1 w-1 h-1 rounded-full bg-teal-400"
                    />
                  )}
                </motion.div>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

function UserInitial() {
  const { user } = useAuthStore();
  return <>{user?.name?.[0]?.toUpperCase() ?? "U"}</>;
}

function UserName() {
  const { user } = useAuthStore();
  return (
    <>
      <p className="text-sm font-medium text-white truncate">{user?.name ?? "User"}</p>
      <p className="text-xs text-mindful-slate truncate">{user?.examType ?? ""}</p>
    </>
  );
}
