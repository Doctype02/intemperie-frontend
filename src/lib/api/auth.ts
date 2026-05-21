import { request } from "@/lib/api";
import type { AuthResponse, AuthTokens, User } from "@/types";

export async function login(email: string, password: string): Promise<AuthResponse> {
  const res = await request<any>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  return { user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken };
}

export async function register(data: {
  name: string;
  email: string;
  password: string;
}): Promise<AuthResponse> {
  const res = await request<any>("/auth/register", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return { user: res.user, accessToken: res.accessToken, refreshToken: res.refreshToken };
}

export async function refreshToken(token: string): Promise<AuthTokens> {
  const res = await request<any>("/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refreshToken: token }),
  });
  return { accessToken: res.accessToken, refreshToken: res.refreshToken };
}

export async function logout(): Promise<void> {
  await request("/auth/logout", { method: "POST" });
}

export async function getMe(): Promise<User> {
  const res = await request<any>("/auth/me");
  return res.user || res;
}
