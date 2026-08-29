"use client";

import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/lib/store/cart-store";
import type { ProductImage, ProductUnit } from "@/types";

/**
 * Isla de cliente del botón "Agregar al carrito".
 *
 * Se separó de `ProductCard` para que la tarjeta pueda renderizarse en el
 * servidor: la maquetación, la imagen, el precio y los enlaces no necesitan
 * JavaScript, solo lo necesita esta acción. Lo que cruza al cliente es el
 * objeto de producto ya serializado, que es lo que el store guarda tal cual.
 */

export interface AddToCartProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  unit: ProductUnit;
  stock: number;
  collection?: { name: string } | null;
  category?: { name: string } | null;
  images?: ProductImage[];
}

/** El corte de metro se vende por tramos de 10 m; el resto, por unidad. */
export function minQuantityFor(unit: ProductUnit) {
  return unit === "METRO" ? 10 : 1;
}

export function AddToCartButton({ product }: { product: AddToCartProduct }) {
  const addItem = useCartStore((s) => s.addItem);
  const minQty = minQuantityFor(product.unit);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        addItem(product, minQty);
        toast.success(`${product.name} agregado`, {
          description: `${minQty}${product.unit === "METRO" ? "m" : " unid."} · $${(
            product.basePrice * minQty
          ).toFixed(2)}`,
          duration: 2500,
        });
      }}
      aria-label={`Agregar ${product.name} al carrito`}
      className="mt-auto pt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 py-2.5 text-[13px] font-bold tracking-wide text-white hover:bg-green-800 active:scale-[0.98] transition-all duration-150 shadow-sm hover:shadow-md"
    >
      <ShoppingCart className="h-3.5 w-3.5" />
      Agregar al carrito
    </button>
  );
}
