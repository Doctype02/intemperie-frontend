"use client";

import Link from "next/link";
import Image from "next/image";
import { ShoppingCart, Check } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";
import type { ProductImage } from "@/types";

interface ProductCardProps {
  id: string; name: string; slug: string;
  basePrice: number; unit: string; stock: number;
  category?: { name: string }; collection?: { name: string };
  images?: ProductImage[];
}

const categoryColors: Record<string, { bg: string; accent: string }> = {
  Residencial: { bg: "#dcfce7", accent: "#16a34a" },
  Industrial: { bg: "#f1f5f9", accent: "#475569" },
  Gubernamental: { bg: "#dbeafe", accent: "#2563eb" },
  Agropecuario: { bg: "#fef3c7", accent: "#d97706" },
  "Zonas Costeras": { bg: "#cffafe", accent: "#0891b2" },
};

export function ProductCard(p: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const catName = p.collection?.name || p.category?.name || "Intemperie";
  const catType = p.category?.name || "Residencial";
  const colors = categoryColors[catType] || categoryColors["Residencial"];
  const unitLabel = p.unit === "METRO" ? "/m lineal" : p.unit === "PANEL" ? "/panel" : "";
  const match = catName.match(/(\d{3})/);
  const primaryImage = p.images?.[0]?.url || null;

  return (
    <div className="group flex flex-col rounded-2xl bg-white border border-gray-100 hover:border-gray-200 hover:shadow-xl transition-all duration-300 overflow-hidden">
      <Link href={`/productos/${p.slug}`} className="block relative">
        <div className="relative h-48 md:h-52 bg-gray-100 overflow-hidden">
          {primaryImage ? (
            <Image
              src={primaryImage}
              alt={p.name}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center" style={{ backgroundColor: colors.bg }}>
              <div className="text-center p-4">
                <div className="mx-auto w-16 h-16 rounded-2xl flex items-center justify-center shadow-sm"
                  style={{ backgroundColor: `${colors.accent}18` }}>
                  <span className="text-2xl font-black" style={{ color: colors.accent }}>
                    {catName.charAt(0)}
                  </span>
                </div>
                <p className="mt-2 text-[10px] font-bold uppercase tracking-widest"
                  style={{ color: `${colors.accent}99` }}>
                  {catName}
                </p>
              </div>
            </div>
          )}
          {p.stock > 0 && p.stock <= 3 && (
            <span className="absolute top-2.5 right-2.5 bg-amber-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
              {p.stock} unid.
            </span>
          )}
          {p.stock === 0 && (
            <span className="absolute top-2.5 right-2.5 bg-red-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-md">
              Agotado
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-3.5 md:p-4">
        <Link href={`/productos/${p.slug}`} className="flex-1">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-1">{catName}</p>
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
            {p.name}
          </h3>
        </Link>

        <div className="mt-2.5 flex items-baseline gap-1">
          <span className="text-xl font-black text-gray-900">${Number(p.basePrice).toFixed(2)}</span>
          <span className="text-[11px] text-gray-400 font-medium">{unitLabel}</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          {p.stock > 0 ? (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-green-600">
              <Check className="h-3 w-3" /> Disponible
            </span>
          ) : (
            <span className="text-[10px] font-semibold text-red-600">Agotado</span>
          )}
        </div>

        {p.stock > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({ id: p.id, name: p.name, slug: p.slug, basePrice: p.basePrice, unit: p.unit, stock: p.stock, collection: p.collection, category: p.category }, 10);
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-xl bg-green-600 py-2.5 text-xs font-extrabold text-white hover:bg-green-700 transition-all active:scale-[0.97] shadow-sm shadow-green-200"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
}
