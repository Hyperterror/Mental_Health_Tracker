import { useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import apiClient from "@/lib/axios";
import { useSessionStore } from "@/store/session.store";
import type {
  SessionMode,
  StudySessionRecord,
  ApiResponse,
} from "@mindfulprep/shared";
import type { FatigueEvent, SessionEnd } from "@mindfulprep/shared";

interface StartSessionPayload {
  examType: string;
  initialMoodScore?: number;
  initialStressLevel?: number;
  preferredMode?: SessionMode;
}

export function useSession() {
  const queryClient = useQueryClient();
  const store = useSessionStore();
  const heartbeatRef = useRef<NodeJS.Timeout | null>(null);

  // Tick interval
  useEffect(() => {
    if (!store.isRunning || store.isBreak) return;

    const interval = setInterval(() => {
      store.tick();
    }, 1000);

    return () => clearInterval(interval);
  }, [store.isRunning, store.isBreak, store]);

  // Heartbeat every 60 seconds
  useEffect(() => {
    if (!store.sessionId || !store.isRunning) {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
      return;
    }

    heartbeatRef.current = setInterval(() => {
      void apiClient
        .post("/api/v1/session/heartbeat", {
          sessionId: store.sessionId,
          focusSignal: 0.8,
        })
        .catch(() => {
          // Silently ignore heartbeat failures
        });
    }, 60_000);

    return () => {
      if (heartbeatRef.current) clearInterval(heartbeatRef.current);
    };
  }, [store.sessionId, store.isRunning]);

  const startSessionMutation = useMutation({
    mutationFn: async (payload: StartSessionPayload) => {
      const res = await apiClient.post<
        ApiResponse<{ session: StudySessionRecord; recommendation: { workDuration: number; breakDuration: number; mode: SessionMode } }>
      >("/api/v1/session/start", payload);
      return res.data.data!;
    },
    onSuccess: (data) => {
      const { session, recommendation } = data;
      store.startSession(
        session.id,
        session.mode,
        recommendation.workDuration,
        recommendation.breakDuration
      );
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async (payload: SessionEnd) => {
      const res = await apiClient.post<ApiResponse<StudySessionRecord>>(
        "/api/v1/session/end",
        payload
      );
      return res.data.data!;
    },
    onSuccess: () => {
      store.endSession();
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["session", "history"] });
    },
  });

  const fatigueEventMutation = useMutation({
    mutationFn: async (payload: FatigueEvent) => {
      await apiClient.post("/api/v1/session/fatigue-event", payload);
    },
  });

  const startSession = useCallback(
    (payload: StartSessionPayload) => startSessionMutation.mutateAsync(payload),
    [startSessionMutation]
  );

  const endSession = useCallback(
    (payload: SessionEnd) => endSessionMutation.mutateAsync(payload),
    [endSessionMutation]
  );

  const handleFatigueEvent = useCallback(
    (data: FatigueEvent) => fatigueEventMutation.mutate(data),
    [fatigueEventMutation]
  );

  return {
    // State
    sessionId: store.sessionId,
    mode: store.mode,
    workDuration: store.workDuration,
    breakDuration: store.breakDuration,
    elapsed: store.elapsed,
    isRunning: store.isRunning,
    isBreak: store.isBreak,
    completedPomodoros: store.completedPomodoros,
    hasActiveSession: !!store.sessionId,

    // Actions
    startSession,
    endSession,
    handleFatigueEvent,
    pauseSession: store.pauseSession,
    resumeSession: store.resumeSession,
    startBreak: store.startBreak,
    endBreak: store.endBreak,

    // Mutation states
    isStarting: startSessionMutation.isPending,
    isEnding: endSessionMutation.isPending,
    startError: startSessionMutation.error,
  };
}
