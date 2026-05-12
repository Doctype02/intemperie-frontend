import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CartProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  unit: string;
  stock: number;
  collection?: { name: string };
  category?: { name: string };
}

interface CartItem {
  id: string;
  productId: string;
  product: CartProduct;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  addItem: (product: CartProduct, quantity: number) => void;
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

      addItem: (product, quantity) => {
        set((state) => {
          const existing = state.items.find((item) => item.productId === product.id && item.product);
          if (existing) {
            return {
              items: state.items.map((item) =>
                item.productId === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
            };
          }
          return {
            items: [...state.items, {
              id: Math.random().toString(36).slice(2),
              productId: product.id,
              product,
              quantity,
            }],
          };
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
        try {
          return get().items.filter(i => i && i.product).reduce((sum, item) => sum + item.quantity, 0);
        } catch { return 0; }
      },

      subtotal: () => {
        try {
          return get().items.filter(i => i && i.product && i.product.basePrice).reduce((sum, item) => sum + item.product.basePrice * item.quantity, 0);
        } catch { return 0; }
      },
    }),
    {
      name: "intemperie-cart",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.items = (state.items || []).filter((item: any) => item && item.product && item.productId);
        }
      },
    }
  )
);
