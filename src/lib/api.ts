import type { ApiResponse } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
    this.name = "ApiError";
  }
}

async function getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return {
    accessToken: localStorage.getItem("accessToken"),
    refreshToken: localStorage.getItem("refreshToken"),
  };
}

function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  window.location.href = "/login";
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const { accessToken } = await getTokens();

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  if (accessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    const { refreshToken } = await getTokens();
    if (refreshToken && !endpoint.includes("/auth/refresh")) {
      try {
        const refreshResponse = await fetch(`${API_BASE}/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });

        if (refreshResponse.ok) {
          const data = await refreshResponse.json();
          localStorage.setItem("accessToken", data.data.accessToken);
          localStorage.setItem("refreshToken", data.data.refreshToken);

          (headers as Record<string, string>)["Authorization"] = `Bearer ${data.data.accessToken}`;
          const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            const error = await retryResponse.json().catch(() => ({}));
            throw new ApiError(error.message || "Error en la solicitud", retryResponse.status);
          }
          return retryResponse.json();
        }
      } catch {
        // refresh failed, clear and redirect
      }
    }

    clearTokens();
    redirectToLogin();
    throw new ApiError("Sesión expirada. Por favor inicie sesión nuevamente.", 401);
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(error.message || "Error en la solicitud", response.status);
  }

  return response.json();
}

export { request, ApiError, API_BASE, getTokens, clearTokens };
export type { ApiResponse };
