import { Suspense } from "react";
import Link from "next/link";
import { ChevronRight, Grid3X3, SlidersHorizontal } from "lucide-react";
import {
  getCategories,
  getCollections,
  loadProductPage,
  type ProductQuery,
} from "../_data/catalog";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductGridSkeleton } from "@/components/products/product-grid-skeleton";
import { PaginationNav } from "./pagination-nav";
import SearchWrapper from "./search-wrapper";
import SortSelect from "./sort-select";
import PriceFilter from "./price-filter";

/**
 * Listado de productos.
 *
 * Antes: un solo `Promise.all` con categorías, colecciones y *cincuenta*
 * productos; el HTML no salía hasta que respondía la más lenta de las tres, y
 * el filtro de precio y la ordenación se hacían en memoria sobre esos 50 (por
 * lo que el conteo y el "orden" mentían en cuanto había más catálogo).
 *
 * Ahora la página se parte en dos tiempos:
 *
 *  - El armazón (cabecera, migas, barra lateral, buscador) solo espera a las
 *    taxonomías, cacheadas 1 h y prácticamente instantáneas. Se envía de
 *    inmediato.
 *  - La parrilla y el contador cuelgan de sus propios `<Suspense>` y llegan en
 *    streaming cuando responde `/products`. Ambos piden la misma página a
 *    `loadProductPage`, que está memoizada por render: una sola consulta.
 *
 * Filtro, orden y paginación los resuelve la API (12 por página), así que ya no
 * se descargan 50 productos para pintar 12.
 */

/** La `key` del boundary: al cambiar de filtro vuelve a verse el esqueleto. */
function queryKey(query: ProductQuery) {
  return JSON.stringify(query);
}

async function ResultCount({ query }: { query: ProductQuery }) {
  const { pagination } = await loadProductPage(query);
  const { total } = pagination;
  return (
    <>
      {total} producto{total !== 1 ? "s" : ""}
    </>
  );
}

async function ProductResults({
  query,
  params,
}: {
  query: ProductQuery;
  params: Record<string, string>;
}) {
  const { products, pagination } = await loadProductPage(query);

  if (products.length === 0) return <EmptyState search={query.search} />;

  return (
    <>
      <ProductGrid products={products} />
      <PaginationNav params={params} pagination={pagination} />
    </>
  );
}

function EmptyState({ search }: { search?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center bg-white rounded-xl border border-gray-200">
      <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <Grid3X3 className="h-8 w-8 text-gray-300" />
      </div>
      <h3 className="text-lg font-bold text-gray-900">
        {search
          ? `Sin resultados para "${search}"`
          : "No hay productos en esta categoría aún"}
      </h3>
      <p className="mt-1.5 text-sm text-gray-500 max-w-xs">
        {search
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
  );
}

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;

  // La normalización (lista blanca de `sort`, precios numéricos, página >= 1)
  // vive en el módulo de datos; aquí solo se recogen los valores de la URL.
  const query: ProductQuery = {
    category: params.category,
    collection: params.collection,
    search: params.search,
    sort: params.sort,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    page: params.page,
  };

  const [categories, collections] = await Promise.all([
    getCategories(),
    getCollections(),
  ]);

  const activeCategory = params.category;
  const activeCollection = params.collection;

  const pageTitle = params.search
    ? `Resultados para "${params.search}"`
    : activeCollection
      ? collections.find((c) => c.slug === activeCollection)?.name ||
        "Colección"
      : activeCategory
        ? categories.find((c) => c.slug === activeCategory)?.name || "Categoría"
        : "Todos los productos";

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-white border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-4 sm:py-5">
          {/* Breadcrumb */}
          <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-3">
            <Link href="/" className="hover:text-green-600 transition-colors">
              Inicio
            </Link>
            <ChevronRight className="h-3 w-3" />
            {(activeCategory || activeCollection) && (
              <>
                <Link
                  href="/productos"
                  className="hover:text-green-600 transition-colors"
                >
                  Productos
                </Link>
                <ChevronRight className="h-3 w-3" />
              </>
            )}
            <span className="text-gray-600 font-medium truncate">
              {pageTitle}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">
                {pageTitle}
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                <Suspense
                  fallback={
                    <span className="inline-block h-4 w-24 align-middle rounded bg-gray-100 animate-pulse" />
                  }
                >
                  <ResultCount query={query} />
                </Suspense>
              </p>
            </div>

            {/* Sort — desktop */}
            <div className="hidden sm:flex items-center gap-2 shrink-0">
              <SlidersHorizontal className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 font-medium">
                Ordenar:
              </span>
              <Suspense
                fallback={
                  <div className="h-9 w-44 rounded-lg bg-gray-100 animate-pulse" />
                }
              >
                <SortSelect />
              </Suspense>
            </div>
          </div>

          {/* Mobile filter chips */}
          <div className="mt-3 flex flex-wrap gap-2 sm:hidden">
            <Link
              href="/productos"
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${!activeCategory && !activeCollection ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
            >
              Todos
            </Link>
            {categories.map((cat) => (
              <Link
                key={cat.slug}
                href={`/productos?category=${cat.slug}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${activeCategory === cat.slug ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {cat.name}
              </Link>
            ))}
            {collections.map((col) => (
              <Link
                key={col.slug}
                href={`/productos?collection=${col.slug}`}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${activeCollection === col.slug ? "bg-green-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}
              >
                {col.name}
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
                <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
                  Categorías
                </h3>
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
                {categories.map((cat) => (
                  <li key={cat.id || cat.slug}>
                    <Link
                      href={`/productos?category=${cat.slug}`}
                      className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors border-l-2 ${activeCategory === cat.slug ? "bg-green-50 text-green-800 font-bold border-green-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"}`}
                    >
                      <span
                        className={`h-1.5 w-1.5 rounded-full shrink-0 ${activeCategory === cat.slug ? "bg-green-500" : "bg-gray-300"}`}
                      />
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>

              {collections.length > 0 && (
                <>
                  <div className="px-4 py-3 border-t border-b border-gray-100 bg-gray-50">
                    <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">
                      Colecciones
                    </h3>
                  </div>
                  <ul className="py-1.5">
                    {collections.map((col) => (
                      <li key={col.id || col.slug}>
                        <Link
                          href={`/productos?collection=${col.slug}`}
                          className={`flex items-center gap-2.5 px-4 py-2.5 text-sm transition-colors border-l-2 ${activeCollection === col.slug ? "bg-green-50 text-green-800 font-bold border-green-500" : "text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-transparent"}`}
                        >
                          <span
                            className={`h-1.5 w-1.5 rounded-full shrink-0 ${activeCollection === col.slug ? "bg-green-500" : "bg-gray-300"}`}
                          />
                          {col.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </>
              )}
              {/* Price filter */}
              <Suspense
                fallback={
                  <div className="px-4 py-3 border-t border-gray-100">
                    <div className="h-20 rounded-lg bg-gray-50 animate-pulse" />
                  </div>
                }
              >
                <PriceFilter />
              </Suspense>
            </div>
          </aside>

          {/* Main content */}
          <div className="flex-1 min-w-0">
            {/* Search bar */}
            <Suspense
              fallback={
                <div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse" />
              }
            >
              <SearchWrapper />
            </Suspense>

            {/* Mobile sort */}
            <div className="mt-3 flex items-center justify-end gap-2 sm:hidden">
              <SlidersHorizontal className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs text-gray-500">Ordenar:</span>
              <Suspense
                fallback={
                  <div className="h-9 w-36 rounded-lg bg-gray-100 animate-pulse" />
                }
              >
                <SortSelect />
              </Suspense>
            </div>

            <div className="mt-4 sm:mt-5">
              <Suspense
                key={queryKey(query)}
                fallback={<ProductGridSkeleton />}
              >
                <ProductResults query={query} params={params} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
