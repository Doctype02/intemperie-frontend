"use client";

import { useCartStore } from "@/lib/store/cart-store";

export function useCart() {
  const store = useCartStore();
  return store;
}
