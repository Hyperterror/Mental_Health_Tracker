// ============================================================
// MindfulPrep — Secure Auth Store
// SECURITY FIX: Tokens stored in memory only (not localStorage)
// Rationale: localStorage is XSS-accessible. Access tokens are
// kept in memory; refresh tokens are sent via httpOnly cookie
// set by the server. This prevents token theft via XSS.
// ============================================================

import { create } from "zustand";
import type { UserProfile, TokenResponse } from "@mindfulprep/shared";

interface AuthState {
  // User profile (non-sensitive, safe to persist via sessionStorage)
  user: UserProfile | null;
  // Access token in memory ONLY — cleared on page refresh (intentional)
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
    // Access token is stored in memory only — never persisted to storage
    // Refresh token is handled via httpOnly cookie set by server
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
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      user: UserProfile;
      isAuthenticated: boolean;
    };
    if (parsed.user && parsed.isAuthenticated) {
      useAuthStore.setState({
        user: parsed.user,
        isAuthenticated: true,
        // accessToken remains null — will be populated by silent refresh
        accessToken: null,
      });
    }
  } catch {
    // Corrupted sessionStorage — clear it
    sessionStorage.removeItem("mindfulprep-user");
  }
}
