"use client";

import { Heart } from "lucide-react";
import { toast } from "sonner";
import { useWishlist, type WishlistItem } from "@/lib/hooks/use-wishlist";

/**
 * Isla de cliente del corazón de favoritos.
 *
 * La lista vive en `localStorage`, así que el estado marcado/no marcado solo
 * se conoce tras hidratar. Se renderiza siempre sin marcar y se corrige en el
 * cliente: es lo que ya hacía `ProductCard`, pero ahora el coste se limita a
 * este botón en lugar de arrastrar la tarjeta entera al bundle.
 */
export function WishlistButton({ item }: { item: WishlistItem }) {
  const { toggle, isWishlisted } = useWishlist();
  const wishlisted = isWishlisted(item.id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        toggle(item);
        toast(wishlisted ? "Eliminado de favoritos" : "Guardado en favoritos", {
          icon: wishlisted ? "🗑️" : "❤️",
          duration: 1800,
        });
      }}
      aria-label={wishlisted ? "Quitar de favoritos" : "Guardar en favoritos"}
      aria-pressed={wishlisted}
      className="absolute top-2.5 right-2.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/95 backdrop-blur-sm shadow-sm hover:scale-110 transition-all duration-200"
    >
      <Heart
        className={`h-4 w-4 transition-all duration-200 ${
          wishlisted
            ? "fill-red-500 text-red-500"
            : "text-gray-300 hover:text-red-400"
        }`}
      />
    </button>
  );
}
