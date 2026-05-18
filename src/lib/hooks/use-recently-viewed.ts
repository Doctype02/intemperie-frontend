"use client";

import { useState, useEffect } from "react";

export interface RecentlyViewedProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  unit: string;
  imageUrl?: string;
}

const STORAGE_KEY = "intemperie-recently-viewed";
const MAX_ITEMS = 6;

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentlyViewedProduct[]>([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) setItems(JSON.parse(stored));
    } catch {}
  }, []);

  const addItem = (product: RecentlyViewedProduct) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id);
      const next = [product, ...filtered].slice(0, MAX_ITEMS);
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  return { items, addItem };
}
