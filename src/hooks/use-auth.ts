"use client";

import { useAuthStore } from "@/lib/store/auth-store";
import { useRouter } from "next/navigation";

export function useAuth() {
  const store = useAuthStore();
  const router = useRouter();

  const requireAuth = () => {
    if (!store.isAuthenticated) {
      router.push("/login");
      return false;
    }
    return true;
  };

  return { ...store, requireAuth };
}
