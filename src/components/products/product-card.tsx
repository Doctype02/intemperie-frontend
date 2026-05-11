"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

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

const stockBadge = (stock: number) => {
  if (stock === 0) return { text: "Agotado", cls: "bg-red-100 text-red-700 border-0" };
  if (stock <= 5) return { text: `Solo ${stock} unid.`, cls: "bg-orange-100 text-orange-700 border-0" };
  return { text: "En inventario", cls: "bg-green-100 text-green-700 border-0" };
};

export function ProductCard(product: ProductCardProps) {
  const stock = stockBadge(product.stock);
  const collectionName = product.collection?.name || product.category?.name || "Intemperie";
  const unitLabel = product.unit === "METRO" ? "/m" : product.unit === "PANEL" ? "/panel" : "/unid.";

  return (
    <Link href={`/productos/${product.slug}`} className="group">
      <Card className="h-full overflow-hidden border-gray-200 transition-all hover:border-green-300 hover:shadow-lg">
        <div className="relative h-40 md:h-52 bg-gradient-to-br from-green-50 to-green-100 flex items-center justify-center">
          <div className="text-center select-none">
            <span className="text-5xl opacity-20">🏗️</span>
            <p className="mt-2 text-xs font-medium text-green-700">{collectionName}</p>
          </div>
          {product.stock > 0 && product.stock <= 5 && (
            <Badge className="absolute left-3 top-3 bg-orange-500 border-0 text-white text-xs">
              ¡Quedan pocos!
            </Badge>
          )}
          {product.stock === 0 && (
            <Badge className="absolute left-3 top-3 bg-red-500 border-0 text-white text-xs">
              Agotado
            </Badge>
          )}
        </div>
        <CardContent className="p-3 md:p-4">
          <p className="mb-0.5 text-[10px] md:text-xs text-gray-400">{collectionName}</p>
          <h3 className="font-semibold text-sm md:text-base text-gray-900 group-hover:text-green-700 transition-colors line-clamp-2 leading-snug">
            {product.name}
          </h3>
          <div className="mt-2 md:mt-3 flex items-baseline gap-1">
            <span className="text-xl md:text-2xl font-bold text-gray-900">
              ${Number(product.basePrice).toFixed(2)}
            </span>
            <span className="text-xs md:text-sm text-gray-500">{unitLabel}</span>
          </div>
          <div className="mt-2 md:mt-3">
            <Badge className={`text-[10px] md:text-xs ${stock.cls}`}>
              {stock.text}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
