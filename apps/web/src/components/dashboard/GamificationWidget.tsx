"use client";
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';

export function GamificationWidget() {
  const { data, isLoading } = useQuery({
    queryKey: ['gamification'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/gamification/status');
      return res.data.data;
    },
    staleTime: 1 * 60 * 1000, // 1 minute
  });

  if (isLoading) return <div className="p-4 rounded-xl bg-gray-100 animate-pulse h-32"></div>;
  if (!data) return null;

  return (
    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden group hover:shadow-indigo-500/25 transition-all duration-300">
      <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 rounded-full bg-white opacity-10 blur-2xl group-hover:opacity-20 transition-opacity"></div>
      <h3 className="text-xl font-bold mb-4 flex items-center gap-2">
        <span>🏆</span> Your Progress
      </h3>
      <div className="flex justify-between items-center">
        <div className="text-center">
          <p className="text-3xl font-black">{data.level || 1}</p>
          <p className="text-sm opacity-80 uppercase tracking-wider mt-1">Level</p>
        </div>
        <div className="flex-1 px-6">
          <div className="h-3 w-full bg-black/20 rounded-full overflow-hidden backdrop-blur-sm">
            <div 
              className="h-full bg-white rounded-full shadow-[0_0_10px_rgba(255,255,255,0.8)] relative" 
              style={{ width: `${Math.min(100, (data.xp / (data.level * 1000)) * 100)}%` }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-white opacity-50 animate-[shimmer_2s_infinite]"></div>
            </div>
          </div>
          <p className="text-xs mt-2 text-center opacity-80">{data.xp} / {data.level * 1000} XP</p>
        </div>
        <div className="text-center">
          <p className="text-3xl font-black">{data.streak || 0}</p>
          <p className="text-sm opacity-80 uppercase tracking-wider mt-1">Day Streak</p>
        </div>
      </div>
    </div>
  );
}
