import { request } from "@/lib/api";

interface AdminStats {
  totalOrders: number;
  confirmedOrders: number;
  totalRevenue: number;
  productsCount: number;
  usersCount: number;
  recentOrders: Array<{
    id: string;
    total: string;
    status: string;
    createdAt: string;
  }>;
}

export async function getAdminStats(): Promise<AdminStats> {
  return request<AdminStats>("/admin/stats");
}

export async function getAdminOrders(params?: {
  page?: number;
  limit?: number;
  status?: string;
}) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  if (params?.status) sp.set("status", params.status);
  const q = sp.toString();
  return request(`/admin/orders${q ? `?${q}` : ""}`);
}

export async function updateOrderStatus(id: string, status: string) {
  return request(`/admin/orders/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export async function getAdminUsers(params?: { page?: number; limit?: number }) {
  const sp = new URLSearchParams();
  if (params?.page) sp.set("page", String(params.page));
  if (params?.limit) sp.set("limit", String(params.limit));
  const q = sp.toString();
  return request(`/admin/users${q ? `?${q}` : ""}`);
}

export async function updateUserRole(id: string, role: string) {
  return request(`/admin/users/${id}`, {
    method: "PATCH",
    body: JSON.stringify({ role }),
  });
}

export async function createProduct(data: Record<string, unknown>) {
  return request("/products", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateProduct(id: string, data: Record<string, unknown>) {
  return request(`/products/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteProduct(id: string) {
  return request(`/products/${id}`, { method: "DELETE" });
}

export async function createCategory(data: { name: string; slug: string; description?: string }) {
  return request("/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(id: string, data: Record<string, unknown>) {
  return request(`/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string) {
  return request(`/categories/${id}`, { method: "DELETE" });
}

export async function createCollection(data: { name: string; slug: string; description?: string }) {
  return request("/collections", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCollection(id: string, data: Record<string, unknown>) {
  return request(`/collections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCollection(id: string) {
  return request(`/collections/${id}`, { method: "DELETE" });
}

export async function getContentBlocks() {
  return request("/admin/content-blocks");
}

export async function updateContentBlock(id: string, data: Record<string, unknown>) {
  return request(`/admin/content-blocks/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
