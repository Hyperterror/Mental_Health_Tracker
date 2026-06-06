import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { QueryProvider } from "@/providers/query-provider";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: {
    default: "MindfulPrep — Calm Through Competitive Exams",
    template: "%s | MindfulPrep",
  },
  description:
    "Your calm companion through the storm of competitive exams. Track your mood, manage study sessions, and stay mentally well.",
  keywords: [
    "JEE",
    "NEET",
    "mental health",
    "study timer",
    "pomodoro",
    "student wellness",
    "exam prep",
  ],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "MindfulPrep",
  },
  openGraph: {
    title: "MindfulPrep",
    description: "Your calm companion through the storm of competitive exams",
    type: "website",
  },
};

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`dark ${inter.variable}`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body
        className={`${inter.className} bg-mindful-dark text-mindful-text antialiased min-h-screen`}
      >
        <QueryProvider>{children}</QueryProvider>
      </body>
    </html>
  );
}
