import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { SessionMode } from "@mindfulprep/shared";

interface SessionState {
  sessionId: string | null;
  mode: SessionMode | null;
  workDuration: number; // minutes
  breakDuration: number; // minutes
  elapsed: number; // seconds elapsed in current phase
  isRunning: boolean;
  isBreak: boolean;
  completedPomodoros: number;
  startedAt: number | null; // epoch ms, for cold-start resume
  startSession: (
    sessionId: string,
    mode: SessionMode,
    workDuration: number,
    breakDuration: number
  ) => void;
  tick: () => void;
  pauseSession: () => void;
  resumeSession: () => void;
  startBreak: () => void;
  endBreak: () => void;
  endSession: () => void;
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      sessionId: null,
      mode: null,
      workDuration: 25, // minutes
      breakDuration: 5, // minutes
      elapsed: 0,
      isRunning: false,
      isBreak: false,
      completedPomodoros: 0,
      startedAt: null,

      startSession: (
        sessionId: string,
        mode: SessionMode,
        workDuration: number,
        breakDuration: number
      ) => {
        set({
          sessionId,
          mode,
          workDuration,
          breakDuration,
          elapsed: 0,
          isRunning: true,
          isBreak: false,
          completedPomodoros: 0,
          startedAt: Date.now(),
        });
      },

      tick: () => {
        const state = get();
        if (!state.isRunning) return;

        const newElapsed = state.elapsed + 1;
        const phaseDurationSeconds = state.isBreak
          ? state.breakDuration * 60
          : state.workDuration * 60;

        if (newElapsed >= phaseDurationSeconds) {
          if (!state.isBreak) {
            // Work phase complete → trigger break
            set({
              elapsed: 0,
              isBreak: true,
              isRunning: false,
              completedPomodoros: state.completedPomodoros + 1,
            });
          } else {
            // Break complete → back to work
            set({
              elapsed: 0,
              isBreak: false,
              isRunning: true,
            });
          }
        } else {
          set({ elapsed: newElapsed });
        }
      },

      pauseSession: () => set({ isRunning: false }),

      resumeSession: () => set({ isRunning: true }),

      startBreak: () =>
        set({
          isBreak: true,
          elapsed: 0,
          isRunning: false,
          completedPomodoros: get().completedPomodoros + 1,
        }),

      endBreak: () =>
        set({
          isBreak: false,
          elapsed: 0,
          isRunning: true,
        }),

      endSession: () =>
        set({
          sessionId: null,
          mode: null,
          workDuration: 25,
          breakDuration: 5,
          elapsed: 0,
          isRunning: false,
          isBreak: false,
          completedPomodoros: 0,
          startedAt: null,
        }),
    }),
    {
      name: "mindfulprep-session",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
