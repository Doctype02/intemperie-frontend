import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Grid3X3, SlidersHorizontal } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { ProductGrid } from "@/components/products/product-grid";
import SearchWrapper from "./search-wrapper";
import SortSelect from "./sort-select";
import PriceFilter from "./price-filter";

async function getCategories() {
  try {
    const res = await fetch(`${API_BASE}/categories`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch { return []; }
}

async function getCollections() {
  try {
    const res = await fetch(`${API_BASE}/collections`, { next: { revalidate: 300 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || [];
  } catch { return []; }
}

async function getProducts(searchParams: Record<string, string>) {
  try {
    const sp = new URLSearchParams();
    if (searchParams.category)   sp.set("category",   searchParams.category);
    if (searchParams.collection) sp.set("collection", searchParams.collection);
    if (searchParams.search)     sp.set("search",     searchParams.search);
    sp.set("limit", "50");
    const res = await fetch(`${API_BASE}/products?${sp.toString()}`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function filterByPrice(products: any[], minPrice?: string, maxPrice?: string) {
  if (!minPrice && !maxPrice) return products;
  const min = minPrice ? parseFloat(minPrice) : 0;
  const max = maxPrice ? parseFloat(maxPrice) : Infinity;
  return products.filter((p) => {
    const price = Number(p.pricePerMeter ?? p.basePrice ?? 0);
    return price >= min && price <= max;
  });
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortProducts(products: any[], sort: string) {
  const copy = [...products];
  switch (sort) {
    case "price_asc":  return copy.sort((a, b) => (a.pricePerMeter ?? a.basePrice ?? 0) - (b.pricePerMeter ?? b.basePrice ?? 0));
    case "price_desc": return copy.sort((a, b) => (b.pricePerMeter ?? b.basePrice ?? 0) - (a.pricePerMeter ?? a.basePrice ?? 0));
    case "name_asc":   return copy.sort((a, b) => (a.name ?? "").localeCompare(b.name ?? ""));
    case "newest":     return copy.sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());
    default:           return copy;
  }
}

export default async function ProductosPage({ searchParams }: { searchParams: Promise<Record<string, string>> }) {
  const params = await searchParams;
  const [categories, collections, rawProducts] = await Promise.all([
    getCategories(), getCollections(), getProducts(params),
  ]);

  const filtered  = filterByPrice(rawProducts, params.minPrice, params.maxPrice);
  const products  = sortProducts(filtered, params.sort ?? "");
  const activeCategory   = params.category;
  const activeCollection = params.collection;

  const pageTitle = params.search
    ? `Resultados para "${params.search}"`
    : activeCollection
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? collections.find((c: any) => c.slug === activeCollection)?.name || "Colección"
    : activeCategory
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ? categories.find((c: any) => c.slug === activeCategory)?.name || "Categoría"
    : "Todos los productos";

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">

      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-green-600 transition-colors">Inicio</Link>
            <ChevronRight className="h-3 w-3" />
            {activeCategory && (
              <>
                <Link href="/productos" className="hover:text-green-600 transition-colors">Productos</Link>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            <span className="text-gray-600 font-medium truncate">{pageTitle}</span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {pageTitle}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {products.length} producto{products.length !== 1 ? "s" : ""}
              </p>
            </div>

            {/* Sort — desktop */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 font-medium">Ordenar:</span>
              <Suspense fallback={<div className="h-9 w-44 rounded-lg bg-gray-100 animate-pulse" />}>
                <SortSelect />
              </Suspense>
            </div>
          </div>

          {/* Mobile filter chips */}
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            <Link href="/productos" className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${!activeCategory && !activeCollection ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
              Todos
            </Link>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            {categories.map((cat: any) => (
              <Link key={cat.slug} href={`/productos?category=${cat.slug}`} className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${activeCategory === cat.slug ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                {cat.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">

          {/* Sidebar */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-[77px] bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-4 py-3.5 border-b border-gray-100 bg-gray-50">
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Categorías</h3>
              </div>
              <ul className="py-1.5">
                <li>
                  <Link
                    href="/productos"
                    className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors border-l-2 ${!activeCategory && !activeCollection ? "bg-green-50 text-green-800 font-bold border-green-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"}`}
                  >
                    <Grid3X3 className="h-3.5 w-3.5 shrink-0 opacity-60" />
                    Todos los productos
                  </Link>
                </li>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                {categories.map((cat: any) => (
                  <li key={cat.id || cat.slug}>
                    <Link
                      href={`/productos?category=${cat.slug}`}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors border-l-2 ${activeCategory === cat.slug ? "bg-green-50 text-green-800 font-bold border-green-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"}`}
                    >
                      <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${activeCategory === cat.slug ? "bg-green-500" : "bg-gray-300"}`} />
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {collections.length > 0 && (
                <>
                  <div className="px-4 py-3 border-t border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Colecciones</h3>
                  </div>
                  <ul className="py-1.5">
                    {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                    {collections.map((col: any) => (
                      <li key={col.id || col.slug}>
                        <Link
                          href={`/productos?collection=${col.slug}`}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors border-l-2 ${activeCollection === col.slug ? "bg-green-50 text-green-800 font-bold border-green-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"}`}
                        >
                          <span className={`h-1.5 w-1.5 rounded-full shrink-0 ${activeCollection === col.slug ? "bg-green-500" : "bg-gray-300"}`} />
                          {col.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {/* Price filter */}
              <Suspense fallback={<div className="px-4 py-3 border-t border-gray-100"><div className="h-20 rounded-lg bg-gray-50 animate-pulse" /></div>}>
                <PriceFilter />
              </Suspense>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <Suspense fallback={<div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse" />}>
              <SearchWrapper />
            </Suspense>

            {/* Mobile sort */}
            <div className="mt-3 flex items-center justify-end gap-2 sm:hidden">
              <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Ordenar:</span>
              <Suspense fallback={<div className="h-9 w-36 rounded-lg bg-gray-100 animate-pulse" />}>
                <SortSelect />
              </Suspense>
            </div>

            <div className="mt-4 sm:mt-5">
              {products.length > 0 ? (
                <ProductGrid products={products} />
              ) : (
                <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-gray-200">
                  <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                    <Grid3X3 className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900">
                    {params.search
                      ? `Sin resultados para "${params.search}"`
                      : "No hay productos en esta categoría aún"}
                  </h3>
                  <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
                    {params.search
                      ? "Prueba otro término o explora el catálogo completo"
                      : "Estamos ampliando nuestro catálogo constantemente"}
                  </p>
                  <Link
                    href="/productos"
                    className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-700 px-6 py-3 text-sm font-bold text-white hover:bg-green-800 transition-colors"
                  >
                    Ver todos los productos
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
