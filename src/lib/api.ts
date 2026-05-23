const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

class ApiError extends Error {
  status: number;
  code?: string;
  errors?: { field: string; message: string }[];

  constructor(message: string, status: number, code?: string, errors?: { field: string; message: string }[]) {
    super(message);
    this.status = status;
    this.code = code;
    this.errors = errors;
    this.name = "ApiError";
  }
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: {
    message: string;
    code?: string;
    errors?: { field: string; message: string }[];
  };
}

let memoryTokens: { accessToken: string | null; refreshToken: string | null } = {
  accessToken: null,
  refreshToken: null,
};

export function setMemoryTokens(accessToken: string, refreshToken: string) {
  memoryTokens = { accessToken, refreshToken };
}

export function clearMemoryTokens() {
  memoryTokens = { accessToken: null, refreshToken: null };
}

async function getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
  if (typeof window === "undefined") return { accessToken: null, refreshToken: null };
  return memoryTokens;
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
          const envelope = await refreshResponse.json() as ApiEnvelope<{ accessToken: string; refreshToken: string }>;
          const tokens = envelope.data;

          setMemoryTokens(tokens.accessToken, tokens.refreshToken);

          (headers as Record<string, string>)["Authorization"] = `Bearer ${tokens.accessToken}`;
          const retryResponse = await fetch(`${API_BASE}${endpoint}`, {
            ...options,
            headers,
          });

          if (!retryResponse.ok) {
            const errorEnvelope = await retryResponse.json().catch(() => ({}));
            throw new ApiError(
              errorEnvelope.error?.message || "Error en la solicitud",
              retryResponse.status,
              errorEnvelope.error?.code,
              errorEnvelope.error?.errors,
            );
          }

          const retryEnvelope = await retryResponse.json() as ApiEnvelope<T>;
          return retryEnvelope.data;
        }
      } catch {
        // refresh failed, clear and redirect
      }
    }

    clearMemoryTokens();
    redirectToLogin();
    throw new ApiError("Sesión expirada. Por favor inicie sesión nuevamente.", 401);
  }

  const envelope = await response.json().catch(() => ({}));

  if (!response.ok || envelope.success === false) {
    throw new ApiError(
      envelope.error?.message || "Error en la solicitud",
      response.status,
      envelope.error?.code,
      envelope.error?.errors,
    );
  }

  return envelope.data as T;
}

async function requestPaginated<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T[]; pagination: ApiEnvelope<T>["pagination"] }> {
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
    clearMemoryTokens();
    redirectToLogin();
    throw new ApiError("Sesión expirada", 401);
  }

  const envelope = await response.json() as ApiEnvelope<T[]>;

  if (!response.ok || envelope.success === false) {
    throw new ApiError(
      envelope.error?.message || "Error en la solicitud",
      response.status,
      envelope.error?.code,
      envelope.error?.errors,
    );
  }

  return { data: envelope.data, pagination: envelope.pagination };
}

export { request, requestPaginated, ApiError, API_BASE };
