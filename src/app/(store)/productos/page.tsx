import { Suspense } from "react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";
import { Skeleton } from "@/components/ui/skeleton";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import SearchWrapper from "./search-wrapper";

async function getProducts(searchParams: Record<string, string>) {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const sp = new URLSearchParams();
    if (searchParams.category) sp.set("category", searchParams.category);
    if (searchParams.collection) sp.set("collection", searchParams.collection);
    if (searchParams.search) sp.set("search", searchParams.search);
    sp.set("limit", "50");
    const res = await fetch(`${baseUrl}/products?${sp.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return { products: [], categories: [], collections: [] };
    const data = await res.json();
    return {
      products: data.data || data || [],
      categories: [],
      collections: [],
    };
  } catch {
    return { products: [], categories: [], collections: [] };
  }
}

async function getFilters() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const [catRes, colRes] = await Promise.all([
      fetch(`${baseUrl}/categories`, { next: { revalidate: 300 } }),
      fetch(`${baseUrl}/collections`, { next: { revalidate: 300 } }),
    ]);
    const cats = catRes.ok ? (await catRes.json()) : [];
    const cols = colRes.ok ? (await colRes.json()) : [];
    return {
      categories: Array.isArray(cats) ? cats : (cats.data || cats.value || []),
      collections: Array.isArray(cols) ? cols : (cols.data || cols.value || []),
    };
  } catch {
    return { categories: [], collections: [] };
  }
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const [{ products }, { categories, collections }] = await Promise.all([
    getProducts(params),
    getFilters(),
  ]);

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        <div className="border-b bg-white">
          <div className="mx-auto max-w-7xl px-4 py-6">
            <h1 className="text-2xl font-bold text-gray-900">
              {params.search
                ? `Resultados para "${params.search}"`
                : "Catálogo de productos"}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {products.length} producto{products.length !== 1 ? "s" : ""} encontrado{products.length !== 1 ? "s" : ""}
            </p>
            <Suspense fallback={null}>
              <SearchWrapper />
            </Suspense>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex gap-8">
            <Suspense fallback={<div className="w-56" />}>
              <ProductFilters categories={categories} collections={collections} />
            </Suspense>
            <div className="flex-1">
              {products.length > 0 ? (
                <ProductGrid products={products} />
              ) : (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <p className="text-5xl">🔍</p>
                  <h3 className="mt-4 text-lg font-semibold text-gray-900">No se encontraron productos</h3>
                  <p className="mt-2 text-gray-500">Intenta con otros filtros o términos de búsqueda</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
