"use client";
import React from 'react';
import dynamic from 'next/dynamic';

const BarChart = dynamic(() => import('recharts').then(mod => mod.BarChart), { ssr: false });
const Bar = dynamic(() => import('recharts').then(mod => mod.Bar), { ssr: false });
const XAxis = dynamic(() => import('recharts').then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import('recharts').then(mod => mod.YAxis), { ssr: false });
const Tooltip = dynamic(() => import('recharts').then(mod => mod.Tooltip), { ssr: false });
const ResponsiveContainer = dynamic(() => import('recharts').then(mod => mod.ResponsiveContainer), { ssr: false });

const mockProgress = [
  { subject: 'Math', hours: 12 },
  { subject: 'Physics', hours: 8 },
  { subject: 'History', hours: 5 },
  { subject: 'Biology', hours: 9 },
];

export default function ProgressPage() {
  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <header className="mb-8">
        <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Your Progress</h1>
        <p className="text-gray-500 mt-2 text-lg">Detailed statistics of your learning journey.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform duration-300">
          <span className="text-4xl mb-2">🔥</span>
          <h4 className="text-gray-500 font-medium mb-1">Current Streak</h4>
          <p className="text-3xl font-black text-gray-800">12 Days</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform duration-300">
          <span className="text-4xl mb-2">📚</span>
          <h4 className="text-gray-500 font-medium mb-1">Total Hours</h4>
          <p className="text-3xl font-black text-gray-800">34 Hrs</p>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:-translate-y-1 transition-transform duration-300">
          <span className="text-4xl mb-2">🎯</span>
          <h4 className="text-gray-500 font-medium mb-1">Sessions Completed</h4>
          <p className="text-3xl font-black text-gray-800">48</p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold mb-8 text-gray-800">Study Time by Subject</h2>
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockProgress} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
              <XAxis dataKey="subject" stroke="#9ca3af" fontSize={13} tickLine={false} axisLine={false} />
              <YAxis stroke="#9ca3af" fontSize={13} tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: '#f3f4f6' }}
                contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Bar dataKey="hours" fill="#10b981" radius={[8, 8, 0, 0]} barSize={40} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
