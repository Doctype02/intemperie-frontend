"use client";

import { ProductCard } from "./product-card";
import type { ProductUnit, ProductImage } from "@/types";

interface Product {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice?: number;
  unit: ProductUnit;
  stock: number;
  isNew?: boolean;
  reviewCount?: number;
  rating?: number;
  category?: { name: string };
  collection?: { name: string };
  images?: ProductImage[];
  isActive?: boolean;
}

export function ProductGridClient({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
