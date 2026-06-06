"use client";
import React, { useState } from 'react';
import { FatigueDetector } from '@/components/session/FatigueDetector';
import { useSession } from '@/hooks/useSession';
// Assuming PomodoroTimer is available in components/session/PomodoroTimer.tsx
import { PomodoroTimer } from '@/components/session/PomodoroTimer';

export default function StudyPage() {
  const { isRunning, hasActiveSession } = useSession();
  const [showFatigueCam, setShowFatigueCam] = useState(true);

  return (
    <div className="max-w-6xl mx-auto p-6 min-h-[calc(100vh-100px)] flex flex-col">
      <header className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight">Focus Session</h1>
          <p className="text-gray-500 mt-2 text-lg">Maximize your productivity with AI-assisted focus.</p>
        </div>
        {hasActiveSession && (
          <button 
            onClick={() => setShowFatigueCam(!showFatigueCam)}
            className="px-4 py-2 bg-white border border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors shadow-sm text-sm font-medium"
          >
            {showFatigueCam ? 'Hide AI Camera' : 'Show AI Camera'}
          </button>
        )}
      </header>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className={`lg:col-span-7 transition-all duration-500 flex flex-col justify-center`}>
          <div className="bg-white rounded-3xl p-8 shadow-xl shadow-indigo-100/50 border border-indigo-50">
            <PomodoroTimer />
          </div>
        </div>

        {showFatigueCam && (
          <div className="lg:col-span-5 flex flex-col gap-6 animate-in fade-in slide-in-from-right-8 duration-500">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500 animate-pulse"></span>
                Fatigue Monitoring
              </h3>
              <FatigueDetector />
              <div className="mt-4 text-sm text-gray-500 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <p><strong>Note:</strong> Your camera feed is processed locally and never leaves your device. It is used solely to detect fatigue and suggest timely breaks.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
