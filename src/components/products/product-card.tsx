"use client";

import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface ProductCardProps {
  id: string; name: string; slug: string;
  basePrice: number; unit: string; stock: number;
  category?: { name: string }; collection?: { name: string };
  isActive?: boolean;
}

const gradients: Record<string, string> = {
  Residencial: "from-green-100 to-emerald-100",
  Industrial: "from-gray-100 to-gray-200",
  Gubernamental: "from-blue-100 to-indigo-100",
  Agropecuario: "from-amber-50 to-yellow-100",
  "Zonas Costeras": "from-cyan-100 to-sky-100",
};

export function ProductCard(p: ProductCardProps) {
  const catName = p.collection?.name || p.category?.name || "Intemperie";
  const grad = gradients[p.category?.name || "Residencial"] || "from-green-100 to-emerald-100";
  const unitLabel = p.unit === "METRO" ? "/m" : p.unit === "PANEL" ? "/panel" : "";

  return (
    <div className="group bg-white rounded-lg border border-gray-200 hover:border-green-300 hover:shadow-sm transition-all duration-200">
      <Link href={`/productos/${p.slug}`} className="block">
        <div className={`relative h-48 md:h-52 bg-gradient-to-br ${grad} flex items-center justify-center rounded-t-lg overflow-hidden`}>
          <div className="text-center p-4">
            <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-white/60 flex items-center justify-center">
              <span className="text-2xl font-bold text-green-700">
                {p.stock === 0 ? "✕" : "⊞"}
              </span>
            </div>
            <p className="text-xs font-semibold text-green-800/70 uppercase tracking-wider">{catName}</p>
          </div>
          {p.stock > 0 && p.stock <= 3 && (
            <span className="absolute top-2 right-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">¡Quedan {p.stock}!</span>
          )}
          {p.stock === 0 && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">Agotado</span>
          )}
        </div>
      </Link>

      <div className="p-3 md:p-4">
        <Link href={`/productos/${p.slug}`}>
          <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">{catName}</p>
          <h3 className="text-sm font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700">{p.name}</h3>
        </Link>

        <div className="mt-2 flex items-baseline gap-1">
          <span className="text-xl font-extrabold text-gray-900">${Number(p.basePrice).toFixed(2)}</span>
          <span className="text-xs text-gray-500">{unitLabel}</span>
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className={`text-[10px] font-medium ${p.stock === 0 ? "text-red-600" : p.stock <= 5 ? "text-amber-600" : "text-green-600"}`}>
            {p.stock === 0 ? "Agotado" : p.stock <= 5 ? `Solo ${p.stock}` : "Disponible"}
          </span>
        </div>

        {p.stock > 0 && (
          <Link
            href={`/productos/${p.slug}`}
            className="mt-3 flex w-full items-center justify-center gap-1.5 rounded bg-green-700 py-2 text-xs font-semibold text-white hover:bg-green-800 transition-colors"
          >
            <ShoppingCart className="h-3.5 w-3.5" />
            Ver producto
          </Link>
        )}
      </div>
    </div>
  );
}
