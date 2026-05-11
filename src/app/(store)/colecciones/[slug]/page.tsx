import { Metadata } from "next";
import Link from "next/link";
import { API_BASE } from "@/lib/api";
import type { Collection } from "@/types";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface Props {
  params: Promise<{ slug: string }>;
}

async function getCollectionBySlug(slug: string): Promise<Collection | null> {
  const res = await fetch(`${API_BASE}/collections/${slug}`, { cache: "no-store" });
  if (!res.ok) return null;
  const data = await res.json();
  return data.data || null;
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
    <div className="max-w-7xl mx-auto px-4 py-8">
      <Button asChild variant="ghost" size="sm" className="mb-6">
        <Link href="/productos">
          <ArrowLeft className="h-4 w-4 mr-1" /> Todos los productos
        </Link>
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">{collection.name}</h1>
        {collection.description && (
          <p className="text-gray-600 mt-2">{collection.description}</p>
        )}
        <p className="text-sm text-gray-400 mt-1">
          {products.length} {products.length === 1 ? "producto" : "productos"} encontrados
        </p>
      </div>

      <ProductGrid products={products} />
    </div>
  );
}
