"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCartStore } from "@/lib/store/cart-store";

interface ProductCardProps {
  id: string; name: string; slug: string;
  basePrice: number; unit: string; stock: number;
  category?: { name: string }; collection?: { name: string };
  isActive?: boolean;
}

const placeholderImages: Record<string, string> = {
  "cerca-pvc-oceanides-101": "2563EB/FFFFFF?text=Oceanides+101",
  "cerca-pvc-super-oceanides-103": "16A34A/FFFFFF?text=Super+Oceanides",
  "cerca-pvc-atlas": "475569/FFFFFF?text=Atlas",
  "cerca-pvc-pandora-201": "7C3AED/FFFFFF?text=Pandora+201",
  "cerca-pvc-pandora-204": "9333EA/FFFFFF?text=Pandora+204",
  "cerca-pvc-afrodita-401": "DB2777/FFFFFF?text=Afrodita+401",
  "cerca-pvc-atenea-305": "EA580C/FFFFFF?text=Atenea+305",
  "cerca-pvc-poseidon-502": "0891B2/FFFFFF?text=Poseidon+502",
  "cerca-pvc-atenea-303": "059669/FFFFFF?text=Atenea+303",
  "cerca-pvc-vesta-601": "4B5563/FFFFFF?text=Vesta+601",
  "cerca-pvc-selene-701": "0E7490/FFFFFF?text=Selene+701",
  "malla-electrosoldada-mini-titan": "6B7280/FFFFFF?text=Mini+Titan",
  "malla-electrosoldada-titan": "374151/FFFFFF?text=Titan",
  "malla-electrosoldada-super-titan": "1F2937/FFFFFF?text=Super+Titan",
  "malla-electrosoldada-maximus": "111827/FFFFFF?text=Maximus",
};

export function ProductCard(p: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const catName = p.collection?.name || p.category?.name || "Intemperie";
  const imgUrl = placeholderImages[p.slug];
  const unitLabel = p.unit === "METRO" ? "/m" : p.unit === "PANEL" ? "/panel" : "";

  return (
    <div className="group bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-xl transition-all duration-300">
      <Link href={`/productos/${p.slug}`} className="block">
        <div className="relative h-48 md:h-52 rounded-t-xl overflow-hidden bg-gray-100">
          {imgUrl ? (
            <img
              src={`https://placehold.co/600x400/${imgUrl}`}
              alt={p.name}
              className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full bg-gradient-to-br from-green-100 to-emerald-200 flex items-center justify-center">
              <span className="text-4xl font-black text-green-300">{catName.charAt(0)}</span>
            </div>
          )}
          {p.stock > 0 && p.stock <= 3 && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">¡Últimas!</span>
          )}
          {p.stock === 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-md">Agotado</span>
          )}
        </div>
      </Link>

      <div className="p-3 md:p-4">
        <Link href={`/productos/${p.slug}`}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider font-medium mb-0.5">{catName}</p>
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">{p.name}</h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-extrabold text-gray-900">${Number(p.basePrice).toFixed(2)}</span>
          <span className="text-xs text-gray-400">{unitLabel}</span>
        </div>

        <div className="mt-2 flex items-center gap-2">
          <span className={`text-[11px] font-semibold ${p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-green-600"}`}>
            {p.stock === 0 ? "Agotado" : p.stock <= 5 ? `Solo ${p.stock}` : "Disponible"}
          </span>
        </div>

        {p.stock > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({ id: p.id, name: p.name, slug: p.slug, basePrice: p.basePrice, unit: p.unit, stock: p.stock, collection: p.collection, category: p.category }, 10);
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white hover:bg-green-700 transition-all active:scale-95"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
}
