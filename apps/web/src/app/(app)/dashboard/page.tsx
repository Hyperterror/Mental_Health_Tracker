"use client";
import React from 'react';
import dynamic from 'next/dynamic';
import { GamificationWidget } from '@/components/dashboard/GamificationWidget';
import { WellnessSuggestionCard } from '@/components/wellness/WellnessSuggestionCard';

// Dynamically load Recharts
const LineChart = dynamic(() => import('recharts').then(mod => mod.LineChart), { ssr: false });
const Line = dynamic(() => import('recharts').then(mod => mod.Line), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const mockData = [
  { day: 'Mon', focus: 60 },
  { day: 'Tue', focus: 85 },
  { day: 'Wed', focus: 45 },
  { day: 'Thu', focus: 90 },
  { day: 'Fri', focus: 75 },
];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-8 p-6">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Dashboard</h1>
        <p className="text-gray-500 mt-2 text-lg">Welcome back! Here's an overview of your mental wellness and study progress.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-semibold mb-6 text-gray-800">Weekly Focus Trends</h2>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mockData}>
                  <XAxis dataKey="day" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="focus" 
                    stroke="#6366f1" 
                    strokeWidth={4}
                    dot={{ fill: '#6366f1', strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, fill: '#4f46e5' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
          <WellnessSuggestionCard />
        </div>
        <div className="space-y-8">
          <GamificationWidget />
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Quick Actions</h3>
            <div className="flex flex-col gap-3">
              <button className="px-4 py-3 bg-indigo-50 text-indigo-600 rounded-xl font-medium hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2">
                <span>📝</span> Log Mood
              </button>
              <button className="px-4 py-3 bg-emerald-50 text-emerald-600 rounded-xl font-medium hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                <span>⏱️</span> Start Session
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
