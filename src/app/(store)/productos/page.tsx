import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Grid3X3 } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { ProductGrid } from "@/components/products/product-grid";
import SearchWrapper from "./search-wrapper";

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.value || data.data || []);
  } catch { return []; }
}

async function getCollections() {
  try {
    const res = await fetch(`${API_BASE}/collections`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : (data.value || data.data || []);
  } catch { return []; }
}

async function getProducts(searchParams: Record<string, string>) {
  try {
    const sp = new URLSearchParams();
    if (searchParams.category) sp.set("category", searchParams.category);
    if (searchParams.collection) sp.set("collection", searchParams.collection);
    if (searchParams.search) sp.set("search", searchParams.search);
    sp.set("limit", "50");
    const res = await fetch(`${API_BASE}/products?${sp.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

export default async function ProductosPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const [categories, collections, products] = await Promise.all([
    getCategories(), getCollections(), getProducts(params),
  ]);

  const activeCategory = params.category;
  const activeCollection = params.collection;

  return (
    <div className="flex-1 bg-white">
      {/* Breadcrumb */}
      <div className="border-b bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-2.5">
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <Link href="/" className="hover:text-green-600">Inicio</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-gray-700 font-medium">
              {params.search ? `Buscar: "${params.search}"` : "Catálogo de productos"}
            </span>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
          {/* Sidebar */}
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-[77px]">
              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Categorías</h3>
              <ul className="space-y-0.5 mb-6">
                <li>
                  <Link
                    href="/productos"
                    className={`block rounded-md px-3 py-2 text-sm transition-colors ${!activeCategory && !activeCollection ? "bg-green-50 text-green-700 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}
                  >
                    <Grid3X3 className="mr-2 inline h-3.5 w-3.5" />
                    Todas las categorías
                  </Link>
                </li>
                {categories.map((cat: any) => (
                  <li key={cat.id || cat.slug}>
                    <Link
                      href={`/productos?category=${cat.slug}`}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors ${activeCategory === cat.slug ? "bg-green-50 text-green-700 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>

              <h3 className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">Colecciones</h3>
              <ul className="space-y-0.5">
                {collections.map((col: any) => (
                  <li key={col.id || col.slug}>
                    <Link
                      href={`/productos?collection=${col.slug}`}
                      className={`block rounded-md px-3 py-2 text-sm transition-colors ${activeCollection === col.slug ? "bg-green-50 text-green-700 font-semibold" : "text-gray-600 hover:bg-gray-100"}`}
                    >
                      {col.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Main */}
          <div className="flex-1">
            <div className="mb-6">
              <div className="flex items-center justify-between">
                <h1 className="text-xl font-extrabold text-gray-900">
                  {params.search
                    ? `Resultados para "${params.search}"`
                    : activeCollection
                    ? collections.find((c: any) => c.slug === activeCollection)?.name || "Colección"
                    : activeCategory
                    ? categories.find((c: any) => c.slug === activeCategory)?.name || "Categoría"
                    : "Todos los productos"}
                </h1>
                <p className="text-sm text-gray-500">{products.length} producto{products.length !== 1 ? "s" : ""}</p>
              </div>

              {/* Mobile filter buttons */}
              <div className="mt-3 flex flex-wrap gap-2 lg:hidden">
                <Link href="/productos" className={`rounded-full px-3 py-1 text-xs font-medium ${!activeCategory && !activeCollection ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                  Todos
                </Link>
                {categories.slice(0, 4).map((cat: any) => (
                  <Link key={cat.slug} href={`/productos?category=${cat.slug}`} className={`rounded-full px-3 py-1 text-xs font-medium ${activeCategory === cat.slug ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"}`}>
                    {cat.name}
                  </Link>
                ))}
                {categories.length > 4 && (
                  <Link href="/productos" className="rounded-full px-3 py-1 text-xs font-medium bg-gray-100 text-gray-500 hover:bg-gray-200">
                    Más
                  </Link>
                )}
              </div>

              <Suspense fallback={null}>
                <div className="mt-4">
                  <SearchWrapper />
                </div>
              </Suspense>
            </div>

            {products.length > 0 ? (
              <ProductGrid products={products} />
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <p className="text-4xl mb-3">📦</p>
                <h3 className="text-lg font-semibold text-gray-900">No se encontraron productos</h3>
                <p className="mt-1 text-sm text-gray-500">Intenta con otros filtros</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
