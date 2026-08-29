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

/**
 * Extra options on top of `RequestInit`.
 *
 * `skipAuthRedirect` is used by calls that probe the session (e.g. `/auth/me`
 * during hydration): a 401 there is a legitimate answer ("no hay sesión"), not
 * a reason to kick the visitor to the login screen.
 */
export interface RequestOptions extends RequestInit {
  skipAuthRedirect?: boolean;
}

/**
 * Tokens are kept in memory ONLY, and never persisted.
 *
 * The source of truth for the session is the pair of httpOnly cookies issued by
 * the API (`accessToken` / `refreshToken`), which the browser attaches on every
 * request thanks to `credentials: "include"`. The in-memory copies are just a
 * convenience for the tab that performed the login, so an `Authorization`
 * header can also be sent. Because they are in memory, they disappear on
 * reload — which is exactly why the refresh flow below must NOT depend on them.
 */
let memoryTokens: { accessToken: string | null; refreshToken: string | null } = {
  accessToken: null,
  refreshToken: null,
};

export function setMemoryTokens(accessToken: string | null, refreshToken?: string | null) {
  memoryTokens = {
    accessToken: accessToken ?? null,
    refreshToken: refreshToken ?? null,
  };
}

export function clearMemoryTokens() {
  memoryTokens = { accessToken: null, refreshToken: null };
}

/**
 * Lets the auth store know that the session is definitively gone (the refresh
 * attempt failed), so it can drop the cached user instead of keeping a UI that
 * pretends to be logged in.
 */
type SessionExpiredListener = () => void;
let sessionExpiredListener: SessionExpiredListener | null = null;

export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListener = listener;
  return () => {
    if (sessionExpiredListener === listener) sessionExpiredListener = null;
  };
}

/** Endpoints that must never trigger a refresh round-trip (avoids loops). */
const NO_REFRESH_ENDPOINTS = ["/auth/login", "/auth/register", "/auth/refresh", "/auth/logout"];

function canAttemptRefresh(endpoint: string): boolean {
  if (typeof window === "undefined") return false;
  return !NO_REFRESH_ENDPOINTS.some((path) => endpoint.startsWith(path));
}

function redirectToLogin(): void {
  if (typeof window === "undefined") return;
  if (window.location.pathname === "/login") return;
  window.location.href = "/login";
}

/** Single-flight refresh: concurrent 401s share one refresh request. */
let refreshInFlight: Promise<boolean> | null = null;

async function performRefresh(): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // The refresh token normally travels as an httpOnly cookie. We only add it
      // to the body when this very tab still holds it in memory (right after a
      // login), so the call keeps working on both transports.
      body: JSON.stringify(memoryTokens.refreshToken ? { refreshToken: memoryTokens.refreshToken } : {}),
      credentials: "include",
    });

    if (!response.ok) return false;

    const envelope = (await response
      .json()
      .catch(() => null)) as ApiEnvelope<{ accessToken?: string; refreshToken?: string }> | null;

    if (envelope?.success === false) return false;

    // The API also re-sets the httpOnly cookies here; the body tokens are optional.
    if (envelope?.data?.accessToken) {
      setMemoryTokens(envelope.data.accessToken, envelope.data.refreshToken ?? memoryTokens.refreshToken);
    }

    return true;
  } catch {
    return false;
  }
}

function refreshSession(): Promise<boolean> {
  if (!refreshInFlight) {
    refreshInFlight = performRefresh().finally(() => {
      refreshInFlight = null;
    });
  }
  return refreshInFlight;
}

function buildHeaders(options: RequestOptions): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  if (memoryTokens.accessToken) {
    headers["Authorization"] = `Bearer ${memoryTokens.accessToken}`;
  }

  return headers;
}

async function rawFetch(endpoint: string, init: RequestInit, headers: Record<string, string>): Promise<Response> {
  try {
    return await fetch(`${API_BASE}${endpoint}`, {
      ...init,
      headers,
      credentials: "include",
    });
  } catch (e) {
    if (e instanceof TypeError) {
      throw new ApiError(
        "No se pudo conectar con el servidor. Verifica tu conexión e intenta de nuevo.",
        0
      );
    }
    throw e;
  }
}

/**
 * Performs the request and, on a 401, tries to renew the session once before
 * retrying. The renewal no longer requires an in-memory refresh token: after a
 * page reload the only thing left is the httpOnly cookie, and that is enough.
 */
async function fetchWithAuth(endpoint: string, options: RequestOptions = {}): Promise<Response> {
  const { skipAuthRedirect = false, ...init } = options;

  const response = await rawFetch(endpoint, init, buildHeaders(options));

  if (response.status !== 401 || !canAttemptRefresh(endpoint)) return response;

  // Only bounce to /login when this tab believed it had a live session.
  const hadLiveSession = Boolean(memoryTokens.accessToken);

  const refreshed = await refreshSession();

  if (refreshed) {
    return rawFetch(endpoint, init, buildHeaders(options));
  }

  clearMemoryTokens();
  sessionExpiredListener?.();

  if (!skipAuthRedirect && hadLiveSession) redirectToLogin();

  throw new ApiError("Sesión expirada. Por favor inicie sesión nuevamente.", 401);
}

async function request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const response = await fetchWithAuth(endpoint, options);

  const envelope = (await response.json().catch(() => ({}))) as Partial<ApiEnvelope<T>> & { message?: string };

  if (!response.ok || envelope.success === false) {
    throw new ApiError(
      envelope.error?.message || envelope.message || "Error en la solicitud",
      response.status,
      envelope.error?.code,
      envelope.error?.errors,
    );
  }

  return envelope.data as T;
}

async function requestPaginated<T>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<{ data: T[]; pagination: ApiEnvelope<T>["pagination"] }> {
  const response = await fetchWithAuth(endpoint, options);

  const envelope = (await response.json().catch(() => ({}))) as Partial<ApiEnvelope<T[]>> & { message?: string };

  if (!response.ok || envelope.success === false) {
    throw new ApiError(
      envelope.error?.message || envelope.message || "Error en la solicitud",
      response.status,
      envelope.error?.code,
      envelope.error?.errors,
    );
  }

  return { data: (envelope.data ?? []) as T[], pagination: envelope.pagination };
}

export { request, requestPaginated, ApiError, API_BASE };
