import { ProductCard } from "@/components/products/product-card";
import type { Product } from "@/types";

interface ProductGridProps {
  products: Product[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-500 text-lg">No se encontraron productos.</p>
        <p className="text-gray-400 text-sm mt-1">Intenta ajustar los filtros o la búsqueda.</p>
      </div>
    );
  }

  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
