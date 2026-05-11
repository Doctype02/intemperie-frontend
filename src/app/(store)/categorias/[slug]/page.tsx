import { Metadata } from "next";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import type { Product, Category } from "@/types";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCategoryBySlug(slug: string): Promise<Category | null> {
  const res = await fetch(`${API_BASE}/categories/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data || null;
}

async function getProductsByCategory(slug: string): Promise<Product[]> {
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/productos">
          <ArrowLeft className="h-4 w-4 mr-1" /> Todos los productos
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{category.name}</h1>
        {category.description && (
          <p className="text-gray-600 mt-2">{category.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          {products.length} {products.length === 1 ? "producto" : "productos"} encontrados
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
