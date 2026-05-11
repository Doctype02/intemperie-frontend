import { request } from "@/lib/api";
import type { AuthResponse, AuthTokens, ApiResponse, User } from "@/types";

export async function login(
  email: string,
  password: string
): Promise<AuthResponse> {
  const res = await request<ApiResponse<AuthResponse>>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return res.data;
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await request<ApiResponse<AuthResponse>>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function refreshToken(
  refreshToken: string
): Promise<AuthTokens> {
  const res = await request<ApiResponse<AuthTokens>>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken }),
  });
  return res.data;
}

export async function logout(): Promise<void> {
  await request("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<User> {
  const res = await request<ApiResponse<User>>("/auth/me");
  return res.data;
}
