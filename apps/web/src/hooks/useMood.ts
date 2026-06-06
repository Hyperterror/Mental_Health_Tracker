import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import type { MoodLogRecord, MoodPatternsResult, ApiResponse } from "@mindfulprep/shared";
import type { MoodLogCreate } from "@mindfulprep/shared";

interface MoodHistoryParams {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

interface MoodHistoryResponse {
  logs: MoodLogRecord[];
  total: number;
  page: number;
  pages: number;
}

// Basic IndexedDB utility for offline mood queue
const DB_NAME = "MindfulPrep_MoodQueue";
const STORE_NAME = "moods";

const getDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      if (!req.result.objectStoreNames.contains(STORE_NAME)) {
        req.result.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
};

const saveToOfflineQueue = async (data: MoodLogCreate) => {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).add(data);
    tx.oncomplete = () => resolve(true);
    tx.onerror = () => reject(tx.error);
  });
};

export function useMoodHistory(params: MoodHistoryParams = {}) {
  return useQuery({
    queryKey: ["mood", "history", params],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MoodHistoryResponse>>(
        "/api/v1/mood/history",
        { params }
      );
      return res.data.data!;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useMoodPatterns() {
  return useQuery({
    queryKey: ["mood", "patterns"],
    queryFn: async () => {
      const res = await apiClient.get<ApiResponse<MoodPatternsResult>>(
        "/api/v1/mood/patterns"
      );
      return res.data.data!;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useSubmitMood() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: MoodLogCreate) => {
      if (!navigator.onLine) {
        await saveToOfflineQueue(data);
        return {
          id: `offline-${Date.now()}`,
          userId: "me",
          emojiScore: data.emojiScore,
          stressLevel: data.stressLevel,
          tags: data.tags ?? [],
          journalText: data.journalText ?? null,
          createdAt: new Date().toISOString(),
        } as MoodLogRecord;
      }
      const res = await apiClient.post<ApiResponse<MoodLogRecord>>(
        "/api/v1/mood",
        data
      );
      return res.data.data!;
    },
    onMutate: async (newMood) => {
      await queryClient.cancelQueries({ queryKey: ["mood", "history"] });
      await queryClient.cancelQueries({ queryKey: ["dashboard"] });

      const snapshot = queryClient.getQueryData<MoodHistoryResponse>([
        "mood",
        "history",
        {},
      ]);

      queryClient.setQueryData<MoodHistoryResponse>(
        ["mood", "history", {}],
        (old) => {
          if (!old) return old;
          const optimistic: MoodLogRecord = {
            id: `optimistic-${Date.now()}`,
            userId: "me",
            emojiScore: newMood.emojiScore ?? 3,
            stressLevel: newMood.stressLevel ?? 5,
            tags: newMood.tags ?? [],
            journalText: newMood.journalText ?? null,
            createdAt: new Date().toISOString(),
          };
          return { ...old, logs: [optimistic, ...old.logs] };
        }
      );

      return { snapshot };
    },
    onError: (_err, _vars, context) => {
      if (context?.snapshot) {
        queryClient.setQueryData(["mood", "history", {}], context.snapshot);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["mood"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });
}
