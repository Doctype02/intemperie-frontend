"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart } from "lucide-react";
import { useState } from "react";
import { useCartStore } from "@/lib/store/cart-store";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  unit: string;
  stock: number;
  category?: { name: string };
  collection?: { name: string };
  isActive?: boolean;
}

const fenceColors: Record<string, [string, string]> = {
  Residencial: ["#dcfce7", "#86efac"],
  Industrial: ["#e5e7eb", "#9ca3af"],
  Gubernamental: ["#dbeafe", "#93c5fd"],
  Agropecuario: ["#fef3c7", "#fcd34d"],
  "Zonas Costeras": ["#cffafe", "#67e8f9"],
};

function FencePattern({ category }: { category?: string }) {
  const [c1, c2] = fenceColors[category || "Residencial"] || fenceColors["Residencial"];
  return (
    <svg viewBox="0 0 400 200" className="absolute inset-0 h-full w-full opacity-60">
      <defs>
        <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={c1} /><stop offset="100%" stopColor={c2} />
        </linearGradient>
        <pattern id="fence" x="0" y="0" width="24" height="40" patternUnits="userSpaceOnUse">
          <rect width="8" height="40" rx="2" fill="url(#g1)" opacity="0.6" />
          <rect y="6" width="24" height="4" rx="1" fill="url(#g1)" opacity="0.3" />
          <rect y="18" width="24" height="4" rx="1" fill="url(#g1)" opacity="0.3" />
          <rect y="30" width="24" height="4" rx="1" fill="url(#g1)" opacity="0.3" />
        </pattern>
        <pattern id="mesh" x="0" y="0" width="16" height="16" patternUnits="userSpaceOnUse">
          <rect width="16" height="16" fill="none" />
          <circle cx="0" cy="0" r="2.5" fill="url(#g1)" opacity="0.5" />
          <circle cx="8" cy="8" r="2.5" fill="url(#g1)" opacity="0.3" />
        </pattern>
      </defs>
      <rect width="400" height="200" fill="url(#fence)" />
      {category === "Industrial" || category === "Gubernamental" ? (
        <rect width="400" height="200" fill="url(#mesh)" />
      ) : null}
      <rect x="0" y="170" width="400" height="30" fill="url(#g1)" opacity="0.15" />
    </svg>
  );
}

export function ProductCard(product: ProductCardProps) {
  const [loaded, setLoaded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const unitLabel = product.unit === "METRO" ? "/m lineal" : product.unit === "PANEL" ? "/panel" : "/unid.";
  const catName = product.collection?.name || product.category?.name || "Intemperie";
  const areaMatch = catName.match(/(\d{3})/);

  return (
    <div className={`animate-slide-up ${loaded ? "" : "opacity-0"}`} ref={(el) => { if (el) setTimeout(() => setLoaded(true), 100); }}>
      <Card className="group relative overflow-hidden border border-gray-100 bg-white card-hover">
        <Link href={`/productos/${product.slug}`} className="block">
          {/* Image area */}
          <div className="relative h-48 md:h-52 overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
            <FencePattern category={product.category?.name} />
            {/* Collection badge */}
            <div className="absolute left-3 top-3 z-10">
              <Badge className="bg-white/90 text-gray-700 border-0 text-[10px] font-medium shadow-sm backdrop-blur">
                {catName}
              </Badge>
              {areaMatch && (
                <Badge className="ml-1.5 bg-green-600 text-white border-0 text-[10px] font-medium">
                  {areaMatch[0]}
                </Badge>
              )}
            </div>
            {/* Stock badges */}
            {product.stock > 0 && product.stock <= 3 && (
              <Badge className="absolute right-3 top-3 z-10 bg-amber-500/95 text-white border-0 text-[10px] font-bold shadow-sm backdrop-blur animate-bounce-in">
                ¡Últimas!
              </Badge>
            )}
            {product.stock === 0 && (
              <Badge className="absolute right-3 top-3 z-10 bg-red-500/95 text-white border-0 text-[10px] font-bold shadow-sm backdrop-blur">
                Agotado
              </Badge>
            )}
          </div>
        </Link>

        <CardContent className="p-4">
          <Link href={`/productos/${product.slug}`} className="block">
            <p className="mb-0.5 text-[11px] font-medium uppercase tracking-wider text-gray-400">{catName}</p>
            <h3 className="font-semibold text-gray-900 leading-snug line-clamp-2 group-hover:text-green-700 transition-colors">
              {product.name}
            </h3>
          </Link>

          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold text-gray-900 tabular-nums">
              ${Number(product.basePrice).toFixed(2)}
            </span>
            <span className="text-xs text-gray-400">{unitLabel}</span>
          </div>

          <div className="mt-3 flex items-center justify-between gap-2">
            <Badge className={`text-[10px] border-0 ${
              product.stock === 0
                ? "bg-red-50 text-red-600"
                : product.stock <= 5
                ? "bg-amber-50 text-amber-700"
                : "bg-green-50 text-green-700"
            }`}>
              {product.stock === 0 ? "Agotado" : product.stock <= 5 ? `Quedan ${product.stock}` : "Disponible"}
            </Badge>
            {product.stock > 0 && (
              <button
                onClick={(e) => { e.preventDefault(); addItem({
                  id: product.id, name: product.name, slug: product.slug,
                  basePrice: product.basePrice, unit: product.unit, stock: product.stock,
                  collection: product.collection, category: product.category,
                }, 10); }}
                className="flex items-center gap-1 rounded-lg bg-green-600 px-3 py-1.5 text-xs font-semibold text-white opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-green-700 btn-press"
              >
                <ShoppingCart className="h-3.5 w-3.5" />
                Agregar
              </button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
