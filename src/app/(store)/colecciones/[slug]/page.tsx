import { Metadata } from "next";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import type { Collection } from "@/types";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const res = await fetch(`${API_BASE}/collections/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data || null;
}

async function getProductsByCollection(slug: string) {
  const res = await fetch(`${API_BASE}/products?collection=${slug}`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  return {
    title: collection?.name || "Colección",
    description: collection?.description || `Colección de productos: ${slug}`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const [collection, products] = await Promise.all([
    getCollectionBySlug(slug),
    getProductsByCollection(slug),
  ]);

  if (!collection) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Colección no encontrada</h2>
        <p className="text-gray-600 mb-6">La colección que buscas no existe.</p>
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
            <span className="text-gray-700 font-medium">{collection.name}</span>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-xl md:text-3xl font-bold text-gray-900">{collection.name}</h1>
        {collection.description && (
          <p className="text-gray-600 mt-2">{collection.description}</p>
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
