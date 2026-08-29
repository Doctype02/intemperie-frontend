"use client";

import { useEffect } from "react";
import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  const { status, hydrate } = store;

  // Si todavía no sabemos nada de la sesión, se la pedimos al backend
  // (la cookie httpOnly viaja sola).
  useEffect(() => {
    if (status === "unknown") void hydrate();
  }, [status, hydrate]);

  /** `true` mientras no tengamos una respuesta del backend sobre la sesión. */
  const isLoading = status === "unknown" || status === "checking";

  const requireAuth = () => {
    // No expulsamos a nadie mientras la sesión se está verificando:
    // hacerlo echaría del sitio a usuarios que sí están autenticados.
    if (isLoading) return false;

    if (!store.isAuthenticated) {
      router.push("/login");
      return false;
    }
    return true;
  };

  return { ...store, isLoading, requireAuth };
}
