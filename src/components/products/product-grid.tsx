"use client";

import { ProductCard } from "./product-card";

interface Product {
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

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} {...product} />
      ))}
    </div>
  );
}
