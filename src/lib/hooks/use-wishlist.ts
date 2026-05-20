"use client";

import { useState, useEffect } from "react";

export interface WishlistItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  unit: string;
  imageUrl?: string;
  categoryName?: string;
}

const KEY = "intemperie-wishlist";

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
  }, []);

  const toggle = (item: WishlistItem) => {
    setItems((prev) => {
      const exists = prev.some((p) => p.id === item.id);
      const next = exists ? prev.filter((p) => p.id !== item.id) : [item, ...prev];
      try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
      return next;
    });
  };

  const isWishlisted = (id: string) => items.some((p) => p.id === id);

  return { items, toggle, isWishlisted, count: items.length };
}
