import { request } from "@/lib/api";
import type { Cart } from "@/types";

export async function getCart(): Promise<Cart> {
  return request<Cart>("/cart");
}

export async function addToCart(data: {
  productId: string;
  quantity: number;
}): Promise<Cart> {
  return request<Cart>("/cart/items", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCartItem(
  itemId: string,
  data: { quantity: number }
): Promise<Cart> {
  return request<Cart>(`/cart/items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function removeCartItem(itemId: string): Promise<void> {
  return request<void>(`/cart/items/${itemId}`, {
    method: "DELETE",
  });
}

export async function clearCart(): Promise<void> {
  return request<void>("/cart", {
    method: "DELETE",
  });
}
