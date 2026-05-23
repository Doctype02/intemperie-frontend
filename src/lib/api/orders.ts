import { request } from "@/lib/api";
import type { Order, Address, CreateOrderPayload } from "@/types";

export async function getOrders(): Promise<Order[]> {
  return request<Order[]>("/orders");
}

export async function getOrderById(id: string): Promise<Order> {
  return request<Order>(`/orders/${id}`);
}

export async function createOrder(payload: CreateOrderPayload): Promise<Order> {
  return request<Order>("/orders", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getAddresses(): Promise<Address[]> {
  return request<Address[]>("/addresses");
}

export async function createAddress(
  data: Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">
): Promise<Address> {
  return request<Address>("/addresses", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateAddress(
  id: string,
  data: Partial<Omit<Address, "id" | "userId" | "createdAt" | "updatedAt">>
): Promise<Address> {
  return request<Address>(`/addresses/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteAddress(id: string): Promise<void> {
  return request<void>(`/addresses/${id}`, { method: "DELETE" });
}

export async function setDefaultAddress(id: string): Promise<Address> {
  return request<Address>(`/addresses/${id}/default`, {
    method: "PATCH",
  });
}

export async function getOrderPaymentStatus(orderId: string): Promise<{ orderStatus: string; paymentStatus: string | null }> {
  return request(`/payments/order-status/${orderId}`);
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
