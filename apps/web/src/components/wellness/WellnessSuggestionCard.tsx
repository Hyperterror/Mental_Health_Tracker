"use client";
import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/axios';
import DOMPurify from 'dompurify';
import { marked } from 'marked';
import { useMemo } from 'react';

export function WellnessSuggestionCard() {
  const { data, isLoading } = useQuery({
    queryKey: ['wellness-suggestion'],
    queryFn: async () => {
      const res = await apiClient.get('/api/v1/wellness/suggestion');
      return res.data.data; // Expected { markdown: string }
    },
    staleTime: 30 * 1000, // 30 seconds
  });

  const sanitizedHtml = useMemo(() => {
    if (!data?.markdown) return '';
    try {
      const rawHtml = marked.parse(data.markdown) as string;
      return DOMPurify.sanitize(rawHtml);
    } catch (e) {
      console.error('Error parsing markdown', e);
      return 'Failed to parse suggestions.';
    }
  }, [data?.markdown]);

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col gap-3">
        <div className="h-6 bg-gray-100 rounded w-1/3 animate-pulse"></div>
        <div className="h-4 bg-gray-50 rounded w-full animate-pulse mt-2"></div>
        <div className="h-4 bg-gray-50 rounded w-5/6 animate-pulse"></div>
        <div className="h-4 bg-gray-50 rounded w-4/6 animate-pulse"></div>
      </div>
    );
  }

  if (!data?.markdown) return null;

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-emerald-100 hover:shadow-md transition-shadow relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400 group-hover:bg-emerald-500 transition-colors"></div>
      <h3 className="text-xl font-semibold mb-4 text-gray-800 flex items-center gap-2">
        <span className="text-emerald-500">🌿</span> AI Wellness Insight
      </h3>
      <div 
        className="prose prose-sm prose-emerald max-w-none text-gray-600"
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    </div>
  );
}
