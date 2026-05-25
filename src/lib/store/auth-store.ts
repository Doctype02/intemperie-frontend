import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { setMemoryTokens, clearMemoryTokens } from "@/lib/api";
import { logout as logoutApi } from "@/lib/api/auth";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;

  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setUser: (user: User) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          setMemoryTokens(accessToken, refreshToken);
        }
        set({ user, accessToken, refreshToken, isAuthenticated: true });
      },

      setUser: (user) => set({ user }),

      logout: async () => {
        try {
          await logoutApi();
        } catch {
          // best-effort: clear cookies even if API call fails
        }
        if (typeof window !== "undefined") {
          clearMemoryTokens();
        }
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
      },
    }),
    {
      name: "intemperie-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
