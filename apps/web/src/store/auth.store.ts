// ============================================================
// MindfulPrep — Auth Store
// Stores user profile in sessionStorage and tokens in localStorage
// to be compatible with axios interceptors and page reloads.
// ============================================================

import { create } from "zustand";
import type { UserProfile, TokenResponse } from "@mindfulprep/shared";

interface AuthState {
  // User profile (non-sensitive, safe to persist via sessionStorage)
  user: UserProfile | null;
  // Access token in memory and local storage
  accessToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: UserProfile, tokens: TokenResponse) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<UserProfile>) => void;
  setAccessToken: (token: string) => void;
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,

  setAuth: (user: UserProfile, tokens: TokenResponse) => {
    // Store tokens in localStorage for axios to pick up
    if (typeof window !== "undefined") {
      localStorage.setItem("accessToken", tokens.accessToken || "");
      localStorage.setItem("refreshToken", tokens.refreshToken || "");
    }

    set({
      user,
      accessToken: tokens.accessToken,
      isAuthenticated: true,
    });

    // Persist only non-sensitive user profile to sessionStorage
    // (sessionStorage is cleared when tab closes, reducing exposure window)
    if (typeof window !== "undefined") {
      try {
        sessionStorage.setItem(
          "mindfulprep-user",
          JSON.stringify({ user, isAuthenticated: true })
        );
      } catch {
        // sessionStorage unavailable — graceful degradation
      }
    }
  },

  clearAuth: () => {
    set({
      user: null,
      accessToken: null,
      isAuthenticated: false,
    });
    if (typeof window !== "undefined") {
      try {
        sessionStorage.removeItem("mindfulprep-user");
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
      } catch {
        // ignore
      }
    }
  },

  setAccessToken: (token: string) => {
    set({ accessToken: token });
  },

  updateUser: (partial: Partial<UserProfile>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updated = { ...currentUser, ...partial };
      set({ user: updated });
      if (typeof window !== "undefined") {
        try {
          sessionStorage.setItem(
            "mindfulprep-user",
            JSON.stringify({ user: updated, isAuthenticated: true })
          );
        } catch {
          // ignore
        }
      }
    }
  },
}));

// Rehydrate user from sessionStorage on app load (non-sensitive only)
// This preserves the user's login state across page refreshes
// while access tokens are re-obtained via the silent refresh flow
export function rehydrateAuthFromSession(): void {
  if (typeof window === "undefined") return;
  try {
    const raw = sessionStorage.getItem("mindfulprep-user");
    const accessToken = localStorage.getItem("accessToken");
    
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      user: UserProfile;
      isAuthenticated: boolean;
    };
    if (parsed.user && parsed.isAuthenticated) {
      useAuthStore.setState({
        user: parsed.user,
        isAuthenticated: true,
        accessToken: accessToken,
      });
    }
  } catch {
    // Corrupted sessionStorage — clear it
    sessionStorage.removeItem("mindfulprep-user");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
}
