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

const gradients: Record<string, string> = {
  Residencial: "from-green-100 to-emerald-200",
  Industrial: "from-gray-100 to-gray-200",
  Gubernamental: "from-blue-100 to-indigo-200",
  Agropecuario: "from-amber-100 to-yellow-200",
  "Zonas Costeras": "from-cyan-100 to-sky-200",
};

export function ProductCard(p: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem);
  const catName = p.collection?.name || p.category?.name || "Intemperie";
  const catType = p.category?.name || "Residencial";
  const gradient = gradients[catType] || "from-green-100 to-emerald-200";
  const unitLabel = p.unit === "METRO" ? "/m" : p.unit === "PANEL" ? "/panel" : "";

  return (
    <div className="group flex flex-col bg-white rounded-xl border border-gray-100 hover:border-green-200 hover:shadow-lg transition-all duration-300 overflow-hidden">
      <Link href={`/productos/${p.slug}`} className="block">
        <div className={`relative h-44 md:h-48 bg-gradient-to-br ${gradient} flex items-center justify-center`}>
          <div className="text-center">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-white/70 flex items-center justify-center shadow-sm">
              <span className="text-xl font-extrabold text-green-700">{catName.charAt(0)}</span>
            </div>
            <p className="mt-2 text-[10px] font-bold text-green-800/60 uppercase tracking-widest">{catName}</p>
          </div>
          {p.stock > 0 && p.stock <= 3 && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Quedan {p.stock}</span>
          )}
          {p.stock === 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">Agotado</span>
          )}
        </div>
      </Link>

      <div className="flex flex-col flex-1 p-3 md:p-4">
        <Link href={`/productos/${p.slug}`} className="flex-1">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">{catName}</p>
          <h3 className="text-sm font-bold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">{p.name}</h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-lg font-extrabold text-gray-900">${Number(p.basePrice).toFixed(2)}</span>
          <span className="text-[11px] text-gray-400">{unitLabel}</span>
        </div>

        <span className={`mt-1 text-[10px] font-semibold ${p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-green-600"}`}>
          {p.stock === 0 ? "Agotado" : p.stock <= 5 ? `Solo ${p.stock} unid.` : "Disponible"}
        </span>

        {p.stock > 0 && (
          <button
            onClick={(e) => {
              e.preventDefault();
              addItem({ id: p.id, name: p.name, slug: p.slug, basePrice: p.basePrice, unit: p.unit, stock: p.stock, collection: p.collection, category: p.category }, 10);
            }}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-green-600 py-2.5 text-xs font-bold text-white hover:bg-green-700 transition-colors active:scale-[0.98]"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Agregar al carrito
          </button>
        )}
      </div>
    </div>
  );
}
