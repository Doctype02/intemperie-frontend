import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { request, setMemoryTokens, clearMemoryTokens, onSessionExpired } from "@/lib/api";
import { logout as logoutApi } from "@/lib/api/auth";

/**
 * `unknown`         → todavía no sabemos nada (SSR / primer render)
 * `checking`        → estamos preguntándole al backend por la sesión
 * `authenticated`   → el backend confirmó la sesión
 * `unauthenticated` → no hay sesión válida
 */
export type AuthStatus = "unknown" | "checking" | "authenticated" | "unauthenticated";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  status: AuthStatus;

  setAuth: (user: User, accessToken?: string | null, refreshToken?: string | null) => void;
  setUser: (user: User) => void;
  clearSession: () => void;
  logout: () => Promise<void>;
  /** Pregunta al backend quién es el usuario actual usando la cookie httpOnly. */
  hydrate: () => Promise<void>;
}

let hydrateInFlight: Promise<void> | null = null;

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      status: "unknown",

      setAuth: (user, accessToken, refreshToken) => {
        if (typeof window !== "undefined") {
          // Sólo en memoria: la sesión real vive en las cookies httpOnly.
          setMemoryTokens(accessToken ?? null, refreshToken ?? null);
        }
        set({ user, isAuthenticated: true, status: "authenticated" });
      },

      setUser: (user) => set({ user }),

      clearSession: () => {
        if (typeof window !== "undefined") clearMemoryTokens();
        set({ user: null, isAuthenticated: false, status: "unauthenticated" });
      },

      logout: async () => {
        try {
          await logoutApi();
        } catch {
          // best-effort: limpiamos el estado local aunque la API falle
        }
        get().clearSession();
      },

      hydrate: async () => {
        if (typeof window === "undefined") return;
        if (hydrateInFlight) return hydrateInFlight;

        set({ status: "checking" });

        hydrateInFlight = (async () => {
          try {
            // `skipAuthRedirect`: un 401 aquí significa "no hay sesión",
            // no es motivo para mandar a nadie al login.
            const user = await request<User>("/auth/me", { skipAuthRedirect: true });
            set({ user, isAuthenticated: true, status: "authenticated" });
          } catch {
            clearMemoryTokens();
            set({ user: null, isAuthenticated: false, status: "unauthenticated" });
          } finally {
            hydrateInFlight = null;
          }
        })();

        return hydrateInFlight;
      },
    }),
    {
      name: "intemperie-auth",
      version: 2,
      // Sólo cacheamos el perfil para poder pintar la UI sin parpadeo.
      // `isAuthenticated` YA NO se persiste: es una afirmación de seguridad y
      // el único que puede emitirla es el backend.
      partialize: (state) => ({ user: state.user }),
      migrate: (persisted) => {
        const legacy = persisted as { user?: User | null } | null;
        return { user: legacy?.user ?? null };
      },
      onRehydrateStorage: () => (state) => {
        if (typeof window === "undefined" || !state) return;

        if (!state.user) {
          // Sin perfil cacheado no hay nada que revalidar: evitamos una
          // llamada por cada visitante anónimo.
          state.status = "unauthenticated";
          return;
        }

        // Hay un perfil cacheado: lo damos por bueno de forma optimista para no
        // expulsar de las páginas privadas a quien sí tiene cookie válida, pero
        // lo confirmamos contra el backend de inmediato. Si no hay sesión, el
        // estado se limpia solo en el siguiente tick. Las rutas protegidas
        // (/cuenta, /admin) están además cubiertas por el middleware, que lee
        // la cookie httpOnly en el servidor.
        state.isAuthenticated = true;
        state.status = "checking";
        void state.hydrate();
      },
    }
  )
);

// Si `api.ts` agota el refresh, la sesión se acabó de verdad: limpiamos el
// estado para que la interfaz deje de creerse autenticada.
if (typeof window !== "undefined") {
  onSessionExpired(() => {
    useAuthStore.getState().clearSession();
  });
}
