"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Brain, Loader2, ChevronDown } from "lucide-react";
import { ExamType } from "@mindfulprep/shared";
import apiClient from "@/lib/axios";
import { cn } from "@/lib/utils";

const RegisterFormSchema = z
  .object({
    name: z.string().min(2, "Name must be at least 2 characters").max(100),
    email: z.string().email("Please enter a valid email"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain an uppercase letter")
      .regex(/[0-9]/, "Must contain a number"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
    examType: z.nativeEnum(ExamType, {
      errorMap: () => ({ message: "Please select your exam" }),
    }),
    targetExamDate: z.string().optional(),
    isMinor: z.boolean().default(false),
    parentEmail: z.string().email("Please enter a valid parent email").optional().or(z.literal("")),
  })
  .refine((d) => d.password === d.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((d) => !d.isMinor || (d.parentEmail && d.parentEmail.length > 0), {
    message: "Parent email required for users under 18",
    path: ["parentEmail"],
  });

type RegisterForm = z.infer<typeof RegisterFormSchema>;

const examOptions = Object.values(ExamType);

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterForm>({
    resolver: zodResolver(RegisterFormSchema),
    defaultValues: { isMinor: false },
  });

  const isMinor = watch("isMinor");

  const onSubmit = async (data: RegisterForm) => {
    setApiError(null);
    try {
      await apiClient.post("/api/v1/auth/register", {
        name: data.name,
        email: data.email,
        password: data.password,
        examType: data.examType,
        targetExamDate: data.targetExamDate || undefined,
        isMinor: data.isMinor,
        parentEmail: data.isMinor ? data.parentEmail : undefined,
        dailyGoalMinutes: 150,
      });
      router.push("/onboarding");
    } catch (err: unknown) {
      if (
        err &&
        typeof err === "object" &&
        "response" in err &&
        err.response &&
        typeof err.response === "object" &&
        "data" in err.response
      ) {
        const errData = err.response.data as { error?: string };
        setApiError(errData.error ?? "Registration failed. Please try again.");
      } else {
        setApiError("Unable to connect. Please check your internet connection.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-80 h-80 rounded-full bg-teal-500/8 blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-80 h-80 rounded-full bg-violet-500/8 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-lg"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-teal-400 to-cyan-500 flex items-center justify-center mb-4 shadow-lg shadow-teal-500/25">
            <Brain size={24} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-mindful-slate text-sm mt-1">
            Start your mental wellness journey
          </p>
        </div>

        <div className="glass-card p-8">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-mindful-text mb-2">
                Full name
              </label>
              <input
                id="name"
                type="text"
                autoComplete="name"
                placeholder="Your name"
                className={cn("input-field", errors.name && "border-red-500/50")}
                {...register("name")}
              />
              {errors.name && (
                <p className="mt-1.5 text-xs text-red-400">{errors.name.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-mindful-text mb-2">
                Email address
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                className={cn("input-field", errors.email && "border-red-500/50")}
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-400">{errors.email.message}</p>
              )}
            </div>

            {/* Password row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-mindful-text mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn("input-field pr-12", errors.password && "border-red-500/50")}
                    {...register("password")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-mindful-slate hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showPassword ? "Hide" : "Show"}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.password.message}</p>
                )}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-mindful-text mb-2">
                  Confirm
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    type={showConfirm ? "text" : "password"}
                    placeholder="••••••••"
                    className={cn("input-field pr-12", errors.confirmPassword && "border-red-500/50")}
                    {...register("confirmPassword")}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm((p) => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-mindful-slate hover:text-white transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
                    aria-label={showConfirm ? "Hide" : "Show"}
                  >
                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Exam type */}
            <div>
              <label htmlFor="examType" className="block text-sm font-medium text-mindful-text mb-2">
                Exam you&apos;re preparing for
              </label>
              <div className="relative">
                <select
                  id="examType"
                  className={cn(
                    "input-field appearance-none pr-10 cursor-pointer",
                    errors.examType && "border-red-500/50"
                  )}
                  {...register("examType")}
                >
                  <option value="" className="bg-mindful-card text-mindful-slate">
                    Select exam type
                  </option>
                  {examOptions.map((exam) => (
                    <option key={exam} value={exam} className="bg-mindful-card text-white">
                      {exam}
                    </option>
                  ))}
                </select>
                <ChevronDown
                  size={16}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-mindful-slate pointer-events-none"
                />
              </div>
              {errors.examType && (
                <p className="mt-1.5 text-xs text-red-400">{errors.examType.message}</p>
              )}
            </div>

            {/* Target date */}
            <div>
              <label htmlFor="targetExamDate" className="block text-sm font-medium text-mindful-text mb-2">
                Target exam date{" "}
                <span className="text-mindful-slate font-normal">(optional)</span>
              </label>
              <input
                id="targetExamDate"
                type="date"
                className="input-field"
                min={new Date().toISOString().split("T")[0]}
                {...register("targetExamDate")}
              />
            </div>

            {/* Minor toggle */}
            <div className="flex items-center gap-3 py-2">
              <label className="relative flex items-center cursor-pointer min-h-[44px]">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  {...register("isMinor")}
                />
                <div className="w-11 h-6 bg-white/10 rounded-full peer-checked:bg-teal-500 transition-colors" />
                <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full peer-checked:translate-x-5 transition-transform" />
              </label>
              <span className="text-sm text-mindful-text">I am under 18 years old</span>
            </div>

            {/* Parent email */}
            {isMinor && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
              >
                <label htmlFor="parentEmail" className="block text-sm font-medium text-mindful-text mb-2">
                  Parent / guardian email
                </label>
                <input
                  id="parentEmail"
                  type="email"
                  placeholder="parent@example.com"
                  className={cn("input-field", errors.parentEmail && "border-red-500/50")}
                  {...register("parentEmail")}
                />
                {errors.parentEmail && (
                  <p className="mt-1.5 text-xs text-red-400">{errors.parentEmail.message}</p>
                )}
              </motion.div>
            )}

            {/* API Error */}
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                role="alert"
              >
                {apiError}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full text-base py-3.5 mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-mindful-slate">
            Already have an account?{" "}
            <Link
              href="/login"
              className="text-teal-400 hover:text-teal-300 font-medium transition-colors"
            >
              Sign in
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
