import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { CartItem, Product } from "@/types";

interface CartState {
  items: CartItem[];
  addItem: (product: Product, quantity: number, unit: "meters" | "panels") => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: () => number;
  subtotal: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (product, quantity, unit) => {
        set((state) => {
          const existing = state.items.find(
            (item) => item.productId === product.id && item.unit === unit
          );
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id && item.unit === unit
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          const newItem: CartItem = {
            id: crypto.randomUUID(),
            productId: product.id,
            product,
            quantity,
            unit,
          };
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (productId) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },

      updateQuantity: (productId, quantity) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }
        set((state) => ({
          items: state.items.map((item) =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        }));
      },

      clearCart: () => set({ items: [] }),

      itemCount: () => {
        return get().items.reduce((sum, item) => sum + item.quantity, 0);
      },

      subtotal: () => {
        return get().items.reduce((sum, item) => {
          const { product, quantity, unit } = item;
          if (unit === "meters") {
            return sum + quantity * product.pricePerMeter;
          }
          const panelPrice =
            product.pricePerPanel ??
            product.pricePerMeter * (product.panelWidth ?? 2.5);
          return sum + quantity * panelPrice;
        }, 0);
      },
    }),
    {
      name: "intemperie-cart",
    }
  )
);
