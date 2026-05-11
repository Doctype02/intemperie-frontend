import { request } from "@/lib/api";
import type { ApiResponse, Cart } from "@/types";

export async function getCart(): Promise<Cart> {
  const res = await request<ApiResponse<Cart>>("/cart");
  return res.data;
}

export async function addToCart(data: {
  productId: string;
  quantity: number;
  unit: "meters" | "panels";
}): Promise<Cart> {
  const res = await request<ApiResponse<Cart>>("/cart/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function updateCartItem(
  itemId: string,
  data: { quantity: number }
): Promise<Cart> {
  const res = await request<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
  return res.data;
}

export async function removeCartItem(itemId: string): Promise<Cart> {
  const res = await request<ApiResponse<Cart>>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
  return res.data;
}

export async function clearCart(): Promise<Cart> {
  const res = await request<ApiResponse<Cart>>("/cart", {
    method: "DELETE",
  });
  return res.data;
}
