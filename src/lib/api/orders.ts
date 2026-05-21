import { request } from "@/lib/api";
import type { ApiResponse, Order, Address, CreateOrderPayload } from "@/types";

export async function getOrders(): Promise<Order[]> {
  const res = await request<ApiResponse<Order[]>>("/orders");
  return res.data;
}

export async function getOrderById(id: string): Promise<Order> {
  const res = await request<ApiResponse<Order>>(`/orders/${id}`);
  return res.data;
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  const res = await request<ApiResponse<Order>>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
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

export async function setDefaultAddress(id: string): Promise<Address> {
  const res = await request<ApiResponse<Address>>(`/addresses/${id}/default`, {
    method: "PATCH",
  });
  return res.data;
}

export async function chargeTilopay(
  orderId: string,
  card: { cardNumber: string; expMonth: string; expYear: string; cvv: string },
): Promise<{ success: boolean; transactionRef?: string }> {
  return request("/payments/tilopay/charge", {
    method: "POST",
    body: JSON.stringify({ orderId, ...card }),
  });
}

export async function initiateTilopay(orderId: string): Promise<{ url: string }> {
  return request<{ url: string }>("/payments/tilopay/initiate", {
    method: "POST",
    body: JSON.stringify({ orderId }),
  });
}

export async function confirmTilopay(
  orderId: string,
  tpt: string
): Promise<{ success: boolean; alreadyConfirmed: boolean }> {
  return request("/payments/tilopay/confirm", {
    method: "POST",
    body: JSON.stringify({ orderId, tpt }),
  });
}
