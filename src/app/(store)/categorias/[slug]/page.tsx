import { Metadata } from "next";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import type { Category } from "@/types";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const res = await fetch(`${API_BASE}/categories/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data || data || null;
}

async function getProductsByCategory(slug: string) {
  const res = await fetch(`${API_BASE}/products?category=${slug}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
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
  const [category, products] = await Promise.all([
    getCategoryBySlug(slug),
    getProductsByCategory(slug),
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
