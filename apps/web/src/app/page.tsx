"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Brain,
  Timer,
  LineChart,
  Sparkles,
  ArrowRight,
  Shield,
  Heart,
  Zap,
} from "lucide-react";

const examTypes = ["JEE", "NEET", "UPSC", "CAT", "GATE", "CUET", "BOARDS"];

const features = [
  {
    icon: Heart,
    title: "Mood Tracking",
    description:
      "Log how you feel with emoji-based check-ins. Spot patterns in your emotional journey.",
    color: "from-pink-500 to-rose-500",
  },
  {
    icon: Timer,
    title: "Adaptive Timer",
    description:
      "AI-powered Pomodoro sessions that adapt to your stress levels — CALM, STANDARD, or RECOVERY mode.",
    color: "from-teal-500 to-cyan-500",
  },
  {
    icon: Brain,
    title: "AI Wellness Coach",
    description:
      "Personalized suggestions powered by Claude AI — breathing exercises, hydration reminders, and more.",
    color: "from-violet-500 to-purple-500",
  },
  {
    icon: LineChart,
    title: "Progress Insights",
    description:
      "Weekly mood trends, session analytics, and stress trigger analysis to help you study smarter.",
    color: "from-amber-500 to-orange-500",
  },
];

const testimonials = [
  {
    name: "Priya S.",
    exam: "JEE 2025",
    text: "MindfulPrep helped me realize I was most stressed at 10pm. Now I stop studying by 9:30 and my mock scores improved!",
    emoji: "🙂",
  },
  {
    name: "Arjun K.",
    exam: "NEET 2025",
    text: "The CALM mode timer is a game changer. I used to burn out by day 3 of intense study. Now I'm consistent.",
    emoji: "😊",
  },
  {
    name: "Meera T.",
    exam: "UPSC 2024",
    text: "Having an AI wellness coach that actually understands exam pressure is something I didn't know I needed.",
    emoji: "🙂",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
};

export default function LandingPage() {
  return (
    <div className="relative min-h-screen overflow-x-hidden">
      {/* Animated background orbs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <motion.div
          className="absolute -top-40 -left-40 w-96 h-96 rounded-full bg-teal-500/10 blur-3xl"
          animate={{ x: [0, 60, 0], y: [0, 40, 0] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute top-1/2 -right-40 w-80 h-80 rounded-full bg-indigo-500/10 blur-3xl"
          animate={{ x: [0, -50, 0], y: [0, 60, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute bottom-20 left-1/3 w-72 h-72 rounded-full bg-amber-500/5 blur-3xl"
          animate={{ x: [0, 40, 0], y: [0, -30, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      {/* Nav */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-5 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center">
            <Brain size={18} className="text-white" />
          </div>
          <span className="font-bold text-lg text-white">MindfulPrep</span>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <Link
            href="/login"
            className="px-4 py-2 text-sm text-mindful-slate hover:text-white transition-colors min-h-[44px] flex items-center"
          >
            Log in
          </Link>
          <Link href="/register" className="btn-primary text-sm px-5 py-2.5">
            Get Started
          </Link>
        </motion.div>
      </nav>

      {/* Hero */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 pt-16 pb-24 text-center">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center gap-6"
        >
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass text-sm text-teal-300 font-medium"
          >
            <Sparkles size={14} />
            <span>AI-powered student wellness platform</span>
          </motion.div>

          <motion.h1
            variants={itemVariants}
            className="text-5xl md:text-7xl font-extrabold leading-tight text-white max-w-4xl"
          >
            Your calm companion through the{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              storm
            </span>{" "}
            of competitive exams
          </motion.h1>

          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-mindful-slate max-w-2xl leading-relaxed"
          >
            MindfulPrep combines adaptive Pomodoro timers, mood tracking, and AI
            wellness coaching — built specifically for JEE, NEET, UPSC &amp; more.
          </motion.p>

          {/* Exam chips */}
          <motion.div
            variants={itemVariants}
            className="flex flex-wrap items-center justify-center gap-2"
          >
            {examTypes.map((exam) => (
              <span
                key={exam}
                className="px-3 py-1.5 rounded-full glass text-xs font-semibold text-teal-300 border border-teal-500/20"
              >
                {exam}
              </span>
            ))}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row items-center gap-4 mt-4"
          >
            <Link
              href="/register"
              className="btn-primary text-base px-8 py-4 gap-2"
            >
              Get Started Free
              <ArrowRight size={18} />
            </Link>
            <Link href="#features" className="btn-secondary text-base px-8 py-4">
              Learn More
            </Link>
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center gap-6 text-sm text-mindful-slate pt-4"
          >
            <div className="flex items-center gap-1.5">
              <Shield size={14} className="text-teal-400" />
              <span>No video stored</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={14} className="text-amber-400" />
              <span>Adaptive AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Heart size={14} className="text-pink-400" />
              <span>Built with care</span>
            </div>
          </motion.div>
        </motion.div>
      </section>

      {/* Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-teal-400 to-cyan-400 bg-clip-text text-transparent">
              stay well
            </span>
          </h2>
          <p className="text-mindful-slate max-w-xl mx-auto">
            A complete mental wellness toolkit designed around the unique pressures
            of competitive exam preparation.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              whileHover={{ scale: 1.02, y: -4 }}
              className="glass-card p-6 group cursor-default"
            >
              <div
                className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <feature.icon size={22} className="text-white" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-mindful-slate leading-relaxed text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="relative z-10 max-w-7xl mx-auto px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-14"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            From students who made it through
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-card p-6"
            >
              <p className="text-4xl mb-4">{t.emoji}</p>
              <p className="text-mindful-text text-sm leading-relaxed mb-4 italic">
                &ldquo;{t.text}&rdquo;
              </p>
              <div>
                <p className="font-semibold text-white text-sm">{t.name}</p>
                <p className="text-teal-400 text-xs">{t.exam}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 max-w-4xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="glass-card p-12"
        >
          <div className="text-5xl mb-4">🧘</div>
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to study smarter?
          </h2>
          <p className="text-mindful-slate mb-8 max-w-md mx-auto">
            Join thousands of students who balance performance with wellbeing.
          </p>
          <Link href="/register" className="btn-primary text-base px-10 py-4">
            Start for Free
            <ArrowRight size={18} />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8 text-center text-mindful-slate text-sm">
        <p>© 2025 MindfulPrep · Built with care for students everywhere</p>
      </footer>
    </div>
  );
}
