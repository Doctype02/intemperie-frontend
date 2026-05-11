"use client";

import Link from "next/link";
import { Trash2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCartStore } from "@/lib/store/cart-store";
import { formatCurrency, calculateItemTotal } from "@/lib/utils";

interface CartItemProps {
  item: {
    id: string;
    productId: string;
    product: {
      name: string;
      slug: string;
      pricePerMeter: number;
      pricePerPanel: number | null;
      panelWidth: number | null;
      images: { url: string; alt: string | null }[];
    };
    quantity: number;
    unit: "meters" | "panels";
  };
}

export function CartItem({ item }: CartItemProps) {
  const { removeItem, updateQuantity } = useCartStore();
  const { product, quantity, unit } = item;

  const total = calculateItemTotal(
    quantity,
    unit,
    product.pricePerMeter,
    product.pricePerPanel,
    product.panelWidth
  );

  return (
    <div className="flex gap-4 py-4">
      <Link
        href={`/productos/${product.slug}`}
        className="w-20 h-20 rounded-md bg-gray-100 overflow-hidden shrink-0"
      >
        {product.images.length > 0 ? (
          <img
            src={product.images[0].url}
            alt={product.images[0].alt || product.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-green-100 text-green-700 font-bold">
            {product.name.charAt(0)}
          </div>
        )}
      </Link>

      <div className="flex-1 min-w-0">
        <Link
          href={`/productos/${product.slug}`}
          className="font-medium text-sm hover:text-green-700 transition-colors line-clamp-1"
        >
          {product.name}
        </Link>
        <p className="text-xs text-gray-500 mt-0.5">
          {unit === "meters" ? "Metros lineales" : "Paneles"}
        </p>

        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border rounded-md">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(item.productId, quantity - 1)}
            >
              <Minus className="h-3 w-3" />
            </Button>
            <span className="w-8 text-center text-sm">{quantity}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-none"
              onClick={() => updateQuantity(item.productId, quantity + 1)}
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-sm">{formatCurrency(total)}</span>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
              onClick={() => removeItem(item.productId)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
