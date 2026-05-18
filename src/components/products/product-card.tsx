"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Star, ArrowRight } from "lucide-react";
import { toast } from "sonner";
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
  Residencial:    "#dcfce7",
  Industrial:     "#f1f5f9",
  Gubernamental:  "#dbeafe",
  Agropecuario:   "#fef3c7",
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
      <span className="text-[10px] text-gray-400">({count})</span>
    </div>
  );
}

export function ProductCard(p: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const onLoad  = useImageOnLoad();

  const collectionName = p.collection?.name || p.category?.name || "Intemperie";
  const catBg          = catColors[p.category?.name || ""] || "#f0fdf4";
  const unitLabel      = p.unit === "METRO" ? "/m" : p.unit === "PANEL" ? "/panel" : "";
  const primaryImage   = p.images?.[0]?.url || null;
  const discount       =
    p.comparePrice && p.comparePrice > p.basePrice
      ? Math.round(((p.comparePrice - p.basePrice) / p.comparePrice) * 100)
      : 0;

  const stockDot =
    p.stock === 0
      ? { dot: "bg-red-400",   text: "text-red-600",   label: "Agotado" }
      : p.stock <= 5
      ? { dot: "bg-amber-400", text: "text-amber-700", label: `¡Solo ${p.stock} disponibles!` }
      : { dot: "bg-green-500", text: "text-green-700", label: "En stock" };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(
      {
        id: p.id, name: p.name, slug: p.slug,
        basePrice: p.basePrice, unit: p.unit, stock: p.stock,
        collection: p.collection, category: p.category, images: p.images,
      },
      1,
    );
    toast.success(`${p.name} agregado`, { duration: 2500 });
  };

  return (
    <div className="group relative flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden hover:border-green-400 hover:shadow-xl hover:shadow-green-900/10 transition-all duration-200">

      {/* Image */}
      <Link href={`/productos/${p.slug}`} className="block relative overflow-hidden" style={{ backgroundColor: catBg }}>
        <div className="relative aspect-[4/3]">
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

          {/* Top badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1">
            {p.isNew && (
              <span className="rounded-sm bg-green-600 px-1.5 py-0.5 text-[10px] font-black uppercase tracking-wide text-white shadow-sm">
                Nuevo
              </span>
            )}
            {discount > 0 && (
              <span className="rounded-sm bg-red-500 px-1.5 py-0.5 text-[10px] font-black text-white shadow-sm">
                -{discount}%
              </span>
            )}
          </div>

          {/* Quick-view icon — appears on hover, links to PDP */}
          <Link
            href={`/productos/${p.slug}`}
            aria-label={`Ver ${p.name}`}
            className="absolute bottom-2.5 right-2.5 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-200 bg-white/90 hover:bg-white text-gray-900 rounded-full h-8 w-8 flex items-center justify-center shadow-lg backdrop-blur-sm"
          >
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>

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
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        {/* Collection label */}
        <p className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400 mb-0.5 truncate">
          {collectionName}
        </p>

        {/* Name */}
        <Link href={`/productos/${p.slug}`} className="flex-1">
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 hover:text-green-700 transition-colors">
            {p.name}
          </h3>
        </Link>

        {/* Stars — only if there are actual reviews */}
        {p.reviewCount && p.reviewCount > 0 && (
          <div className="mt-1.5">
            <Stars rating={p.rating} count={p.reviewCount} />
          </div>
        )}

        {/* Price */}
        <div className="mt-2.5 flex items-baseline gap-1.5 flex-wrap">
          <span className="text-[22px] font-black text-gray-900 leading-none">
            ${Number(p.basePrice).toFixed(2)}
          </span>
          <span className="text-[11px] text-gray-400">{unitLabel}</span>
          {p.comparePrice && p.comparePrice > p.basePrice && (
            <span className="text-xs text-gray-400 line-through">
              ${Number(p.comparePrice).toFixed(2)}
            </span>
          )}
        </div>
        {p.unit === "METRO" && (
          <p className="text-[10px] text-gray-400 mt-0.5">Mínimo 10m · envío incluido desde $50</p>
        )}

        {/* Stock indicator */}
        <div className="mt-2 flex items-center gap-1.5">
          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${stockDot.dot}`} />
          <span className={`text-[11px] font-semibold ${stockDot.text}`}>
            {stockDot.label}
          </span>
        </div>

        {/* Add to cart button */}
        {p.stock > 0 && (
          <button
            onClick={handleAddToCart}
            className="mt-auto pt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-green-700 py-2.5 text-[13px] font-bold tracking-wide text-white hover:bg-green-800 active:scale-[0.98] transition-all duration-150 shadow-sm hover:shadow-md"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
}
