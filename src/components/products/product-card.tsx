import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/productos/${product.slug}`}>
      <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow border-gray-200">
        <div className="aspect-[4/3] bg-gray-100 relative overflow-hidden">
          {product.images.length > 0 ? (
            <img
              src={product.images[0].url}
              alt={product.images[0].alt || product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-green-100 to-green-200">
              <div className="text-green-700 text-center p-4">
                <div className="w-12 h-12 mx-auto mb-2 rounded-full bg-green-200 flex items-center justify-center">
                  <span className="text-xl font-bold">{product.name.charAt(0)}</span>
                </div>
                <span className="text-sm font-medium">{product.name}</span>
              </div>
            </div>
          )}
          {product.collection && (
            <Badge className="absolute top-2 left-2 bg-white/90 text-gray-800 border-0">
              {product.collection.name}
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="text-lg font-bold text-green-700">
              {formatCurrency(product.pricePerMeter)}
            </span>
            <span className="text-xs text-gray-400">/metro lineal</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
