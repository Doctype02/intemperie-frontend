import { request } from "@/lib/api";
import type { ApiResponse, Order, PaginatedResponse, Address } from "@/types";

export async function getOrders(params?: {
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Order>> {
  const searchParams = new URLSearchParams();
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  const query = searchParams.toString();
  return request<PaginatedResponse<Order>>(
    `/orders${query ? `?${query}` : ""}`
  );
}

export async function getOrderById(id: string): Promise<Order> {
  const res = await request<ApiResponse<Order>>(`/orders/${id}`);
  return res.data;
}

export async function createOrder(data: {
  addressId: string;
  items: { productId: string; quantity: number; unit: "meters" | "panels" }[];
}): Promise<Order> {
  const res = await request<ApiResponse<Order>>("/orders", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function getAddresses(): Promise<Address[]> {
  const res = await request<ApiResponse<Address[]>>("/addresses");
  return res.data;
}

export async function createAddress(
  data: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<Address> {
  const res = await request<ApiResponse<Address>>("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<Address> {
  const res = await request<ApiResponse<Address>>(`/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function deleteAddress(id: string): Promise<void> {
  await request(`/addresses/${id}`, { method: "DELETE" });
}
