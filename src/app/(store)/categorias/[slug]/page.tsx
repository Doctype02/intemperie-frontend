import { Metadata } from "next";
import Link from "next/link";
import {
  getAllCategorySlugs,
  getCategoryBySlug,
  listProducts,
} from "../../_data/catalog";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Categoría: estática con revalidación. Antes cada visita disparaba dos `fetch`
 * con `cache: "no-store"` contra la API, que comparte 2 vCPU con Postgres.
 */
// Debe ser un literal: Next analiza la config de segmento estáticamente.
// Mantener sincronizado con CATALOG_TTL de _data/catalog.ts.
export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category?.name || "Categoría",
    description: category?.description || `Productos en la categoría ${slug}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, { products }] = await Promise.all([
    getCategoryBySlug(slug),
    listProducts({ category: slug }, 100),
  ]);

  if (!category) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Categoría no encontrada</h2>
        <p className="text-gray-600 mb-6">La categoría que buscas no existe.</p>
        <Button asChild variant="outline">
          <Link href="/productos">Ver todos los productos</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex-1">
      <div className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-400">
            <Link href="/" className="hover:text-green-600">Inicio</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/productos" className="hover:text-green-600">Productos</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 font-medium">{category.name}</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          {products.length} {products.length === 1 ? "producto" : "productos"} encontrados
        </p>
      </div>

        <ProductGrid products={products} />
      </div>
    </div>
  );
}
