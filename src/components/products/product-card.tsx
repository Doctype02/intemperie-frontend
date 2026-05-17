"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";
import { useImageOnLoad } from "@/lib/image-load-context";
import type { ProductImage } from "@/types";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice?: number;
  unit: string;
  stock: number;
  isNew?: boolean;
  reviewCount?: number;
  rating?: number;
  sku?: string;
  category?: { name: string };
  collection?: { name: string };
  images?: ProductImage[];
}

const catColors: Record<string, string> = {
  Residencial: "#dcfce7",
  Industrial: "#f1f5f9",
  Gubernamental: "#dbeafe",
  Agropecuario: "#fef3c7",
  "Zonas Costeras": "#cffafe",
};

function Stars({ rating = 5, count = 0 }: { rating?: number; count?: number }) {
  return (
    <div className="flex items-center gap-1">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((i) => (
          <Star
            key={i}
            className={`h-2.5 w-2.5 ${
              i <= Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-gray-200 text-gray-200"
            }`}
          />
        ))}
      </div>
      <span className="text-[10px] text-gray-400">
        {count > 0 ? `(${count})` : "Sin reseñas"}
      </span>
    </div>
  );
}

export function ProductCard(p: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const onLoad = useImageOnLoad();

  const collectionName = p.collection?.name || p.category?.name || "Intemperie";
  const catBg = catColors[p.category?.name || ""] || "#f0fdf4";
  const unitLabel = p.unit === "METRO" ? "/m lineal" : p.unit === "PANEL" ? "/panel" : "";
  const primaryImage = p.images?.[0]?.url || null;
  const discount =
    p.comparePrice && p.comparePrice > p.basePrice
      ? Math.round(((p.comparePrice - p.basePrice) / p.comparePrice) * 100)
      : 0;

  const stockBadge =
    p.stock === 0
      ? { label: "Agotado", color: "text-red-600 bg-red-50" }
      : p.stock <= 3
      ? { label: `Solo quedan ${p.stock} unidades`, color: "text-amber-700 bg-amber-50" }
      : { label: "En inventario, listo para despachar", color: "text-green-700 bg-green-50" };

  return (
    <div className="group relative flex flex-col bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-gray-300 hover:shadow-lg transition-all duration-200">
      {/* Image */}
      <Link href={`/productos/${p.slug}`} className="block relative overflow-hidden bg-gray-50">
        <div className="relative h-44 sm:h-48" style={{ backgroundColor: catBg }}>
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              placeholder="blur"
              blurDataURL={BLUR_PLACEHOLDER}
              onLoad={onLoad}
            />
          ) : (
            <div className="flex h-full items-center justify-center">
              <span className="text-3xl font-black text-gray-300">
                {collectionName.charAt(0)}
              </span>
            </div>
          )}

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {p.isNew && (
              <span className="rounded-sm bg-green-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
                Nuevo
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-sm bg-red-600 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {p.stock === 0 && (
            <div className="absolute inset-0 flex items-center justify-center bg-white/60 backdrop-blur-[1px]">
              <span className="rounded-full bg-gray-900/80 px-3 py-1 text-xs font-bold text-white">
                Agotado
              </span>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3">
        {/* Vendor / collection */}
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5 truncate">
          {collectionName}
        </p>

        {/* Name */}
        <Link href={`/productos/${p.slug}`} className="flex-1">
          <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 hover:text-green-700 transition-colors">
            {p.name}
          </h3>
        </Link>

        {/* SKU */}
        {p.sku && (
          <p className="mt-0.5 text-[10px] text-gray-400">SKU: {p.sku}</p>
        )}

        {/* Price */}
        <div className="mt-2 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-base font-extrabold text-gray-900">
            ${Number(p.basePrice).toFixed(2)}
          </span>
          <span className="text-[10px] text-gray-400">{unitLabel}</span>
          {p.comparePrice && p.comparePrice > p.basePrice && (
            <span className="text-xs text-gray-400 line-through">
              ${Number(p.comparePrice).toFixed(2)}
            </span>
          )}
        </div>

        {/* Stars */}
        <div className="mt-1.5">
          <Stars rating={p.rating} count={p.reviewCount} />
        </div>

        {/* Stock status */}
        <p className={`mt-1.5 text-[10px] font-semibold rounded px-1.5 py-0.5 w-fit ${stockBadge.color}`}>
          {stockBadge.label}
        </p>

        {/* Add to cart */}
        {p.stock > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem(
                {
                  id: p.id,
                  name: p.name,
                  slug: p.slug,
                  basePrice: p.basePrice,
                  unit: p.unit,
                  stock: p.stock,
                  collection: p.collection,
                  category: p.category,
                  images: p.images,
                },
                10
              );
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg border border-green-600 py-2 text-xs font-bold text-green-700 hover:bg-green-600 hover:text-white transition-all duration-150 active:scale-95"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
}
