import { create } from "zustand";
import apiClient from "@/lib/axios";

interface MoodDraft {
  emojiScore: number;
  stressLevel: number;
  tags: string[];
  journalText?: string;
}

interface MoodState {
  draft: MoodDraft;
  setDraft: (partial: Partial<MoodDraft>) => void;
  submitMoodLog: () => Promise<void>;
  clearDraft: () => void;
}

const initialDraft: MoodDraft = {
  emojiScore: 5,
  stressLevel: 5,
  tags: [],
};

export const useMoodStore = create<MoodState>((set, get) => ({
  draft: initialDraft,
  
  setDraft: (partial) => {
    set((state) => ({ draft: { ...state.draft, ...partial } }));
  },

  clearDraft: () => {
    set({ draft: initialDraft });
  },

  submitMoodLog: async () => {
    const { draft, clearDraft } = get();
    await apiClient.post("/api/v1/mood", draft);
    clearDraft();
  },
}));
