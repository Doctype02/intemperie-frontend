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
  category?: { name: string } | null;
  collection?: { name: string } | null;
  images?: ProductImage[];
  isActive?: boolean;
}

interface ProductGridProps {
  products: Product[];
}

/**
 * `priority` solo en la primera tarjeta.
 *
 * `priority` implica `<link rel="preload" fetchpriority="high">`: la imagen se
 * pide antes que el CSS y el JS, y sin `lazy`. Marcando dos por parrilla se
 * emitian dos preloads que competian entre si y con los recursos que bloquean
 * el render; el candidato a LCP es uno solo, la primera tarjeta. El resto usa
 * el lazy-loading nativo de `next/image` y baja cuando entra en viewport.
 */
export function ProductGrid({ products }: ProductGridProps) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 md:gap-6 items-stretch">
      {products.map((product, i) => (
        <ProductCard key={product.id} {...product} priority={i === 0} />
      ))}
    </div>
  );
}
