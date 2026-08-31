import { Suspense } from "react"
import Link from "next/link"
import { ChevronRight } from "lucide-react"

import {
  ActiveFilters,
  ProductFiltersDrawer,
  ProductFiltersRail,
  SegmentBar,
  countActiveFacets,
  findHeightBand,
  hrefWith,
} from "@/components/products/product-filters"
import { ProductGrid } from "@/components/products/product-grid"
import { ProductGridSkeleton } from "@/components/products/product-grid-skeleton"
import type { Category, Collection } from "@/types"

import { getCategories, getCollections } from "../_data/catalog"
import { loadListing, type ListingQuery } from "./listing"
import { PaginationNav } from "./pagination-nav"
import SearchWrapper from "./search-wrapper"
import SortSelect from "./sort-select"

/* Listado del catálogo — sistema «Perímetro».
 *
 * La página no decide nada del filtrado: lee la URL, la reparte y monta las
 * piezas. Qué se puede filtrar y cómo se escribe cada faceta vive en
 * `components/products/product-filters.tsx`; cómo se carga, en `./listing.ts`.
 *
 * ARMAZÓN Y STREAMING (esto ya estaba resuelto y se conserva)
 * El armazón —cabecera, migas, buscador, facetas— sólo espera a las taxonomías,
 * cacheadas una hora y prácticamente instantáneas, y se envía de inmediato. El
 * contador y la parrilla cuelgan de sus propios `<Suspense>` y llegan en
 * streaming cuando responde `/products`. Los dos piden lo mismo a `loadListing`,
 * que está memoizado por render: una sola consulta a la API por página.
 * La `key` del boundary es la consulta, así que al cambiar de faceta se vuelve
 * a ver el esqueleto en lugar de la parrilla anterior congelada.
 *
 * LO QUE SE MONTA AHORA
 * El uso (`SegmentBar`) está siempre a la vista sobre la parrilla, en todos los
 * anchos. Altura, precio y línea van en la barra lateral en escritorio y en un
 * `<details>` en móvil, con el número de filtros puestos en el resumen para que
 * no queden escondidos. `ActiveFilters` repite lo aplicado con su «quitar» al
 * lado. Todo son enlaces y formularios `GET`: cero JavaScript de cliente en el
 * listado, y funciona con el JS caído.
 *
 * La barra lateral de antes listaba categorías Y colecciones como dos menús de
 * navegación, que era la taxonomía del CMS, no la pregunta del comprador. La
 * altura, que decide la compra y estaba en la base de datos, no aparecía por
 * ningún lado.
 */

/**
 * Next entrega `?height=a&height=b` como array. El listado entiende un solo
 * valor por faceta —dos alturas a la vez no son una franja, son un error de
 * copiar y pegar—, así que se queda con el primero en vez de pintar «a,b» por
 * toda la interfaz. Las cadenas vacías se descartan aquí para que
 * `params.search` sea `undefined` y no `""`.
 */
function firstValues(
  raw: Record<string, string | string[] | undefined>,
): Record<string, string | undefined> {
  const out: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value
    if (first) out[key] = first
  }
  return out
}

/** La `key` del boundary: al cambiar de filtro vuelve a verse el esqueleto. */
function queryKey(query: ListingQuery) {
  return JSON.stringify(query)
}

/** Título de la pantalla, en el orden en que manda cada faceta. */
function titleFor(
  params: Record<string, string | undefined>,
  categories: Category[],
  collections: Collection[],
) {
  if (params.search) return `Resultados para «${params.search}»`

  const collection = collections.find((c) => c.slug === params.collection)
  if (collection) return collection.name

  const category = categories.find((c) => c.slug === params.category)
  if (category) return `Cercado ${category.name.toLowerCase()}`

  const band = findHeightBand(params.height)
  if (band) return `Cercas de ${band.label.toLowerCase()}`

  return "Todo el catálogo"
}

/* ── Piezas que esperan a la API ─────────────────────────────────────────── */

async function ResultCount({ query }: { query: ListingQuery }) {
  const { pagination, truncated } = await loadListing(query)
  const { total } = pagination

  /* Con la carga ancha recortada, `total` es un suelo, no un total. Se dice
     «al menos» en vez de dar por bueno un número que sabemos incompleto. */
  return (
    <span className="tabular">
      {truncated ? "Al menos " : ""}
      {total} {total === 1 ? "modelo" : "modelos"}
    </span>
  )
}

/**
 * El filtro de altura se resuelve en memoria sobre una carga ancha (ver
 * `listing.ts`). Si el catálogo crece por encima de ese techo, el conteo se
 * queda corto y puede faltar algún modelo: se dice aquí, encima de la parrilla,
 * en lugar de servir una lista incompleta con cara de completa.
 */
function TruncationNotice() {
  return (
    <p className="mb-4 rounded-md border border-brand-amber bg-brand-amber-soft px-3 py-2 text-xs text-accent-foreground">
      El catálogo ya no cabe entero en una sola consulta, así que este filtro de
      altura se ha resuelto sobre los primeros modelos. Puede faltar alguno:
      afina también por uso o por precio.
    </p>
  )
}

async function ProductResults({
  query,
  params,
  categories,
  collections,
}: {
  query: ListingQuery
  params: Record<string, string | undefined>
  categories: Category[]
  collections: Collection[]
}) {
  const { products, pagination, truncated } = await loadListing(query)

  if (products.length === 0) {
    return <EmptyState params={params} categories={categories} collections={collections} />
  }

  return (
    <>
      {truncated && <TruncationNotice />}
      <ProductGrid products={products} />
      <PaginationNav params={params} pagination={pagination} />
    </>
  )
}

/* ── Sin resultados ──────────────────────────────────────────────────────── */

/**
 * Una pantalla vacía con un solo botón de «ver todo el catálogo» tira por la
 * borda los cuatro filtros que el visitante acaba de poner para castigarle por
 * el quinto. Aquí se ofrece quitar cada filtro por separado, empezando por el
 * más probable culpable: el texto libre falla por una tilde o un modelo que se
 * llama de otra forma; el precio, por un tope de presupuesto; la altura ya sólo
 * la piden tres franjas anchas. «Ver todo» se queda al final, como lo que es:
 * la última salida.
 */
function EmptyState({
  params,
  categories,
  collections,
}: {
  params: Record<string, string | undefined>
  categories: Category[]
  collections: Collection[]
}) {
  const band = findHeightBand(params.height)
  const outs: { key: string; label: string; href: string }[] = []

  if (params.search) {
    outs.push({
      key: "search",
      label: `Buscar «${params.search}» en todo el catálogo`,
      href: hrefWith(params, { search: null }),
    })
  }
  if (params.minPrice || params.maxPrice) {
    outs.push({
      key: "price",
      label: "Ver cualquier precio por metro",
      href: hrefWith(params, { minPrice: null, maxPrice: null }),
    })
  }
  if (band) {
    outs.push({
      key: "height",
      label: `Ver cualquier altura, no sólo ${band.label.toLowerCase()}`,
      href: hrefWith(params, { height: null }),
    })
  }
  if (params.collection) {
    const name = collections.find((c) => c.slug === params.collection)?.name ?? params.collection
    outs.push({
      key: "collection",
      label: `Ver todas las líneas, no sólo ${name}`,
      href: hrefWith(params, { collection: null }),
    })
  }
  if (params.category) {
    const name = categories.find((c) => c.slug === params.category)?.name ?? params.category
    outs.push({
      key: "category",
      label: `Ver todos los usos, no sólo ${name}`,
      href: hrefWith(params, { category: null }),
    })
  }

  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-8 text-center sm:px-8 sm:py-12">
      {/* La misma cerca dibujada que rellena las fichas sin foto: aquí sirve de
          marca de agua del catálogo, y no cuesta ni una petición de red. */}
      <div aria-hidden="true" className="diagram diagram-mesh mx-auto h-16 w-28 rounded-md" />

      <h2 className="mt-4 text-lg font-bold text-foreground">
        {params.search ? `Sin resultados para «${params.search}»` : "Ningún modelo con estos filtros"}
      </h2>

      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        {outs.length > 0
          ? "No hay ningún modelo que cumpla todo lo que has pedido a la vez. Suelta el filtro que más aprieta:"
          : "Todavía no hay modelos publicados en el catálogo. Escríbenos y te decimos qué podemos fabricar."}
      </p>

      {outs.length > 0 && (
        <ul className="mx-auto mt-5 flex max-w-sm flex-col gap-2 text-left">
          {outs.map((out) => (
            <li key={out.key}>
              <Link
                href={out.href}
                className="flex min-h-tap items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-green hover:text-brand-green-deep"
              >
                {out.label}
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}

      <Link
        href="/productos"
        className="mt-5 inline-flex min-h-tap items-center rounded-lg bg-primary px-5 text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-green-deep"
      >
        Ver todo el catálogo
      </Link>
    </div>
  )
}

/* ── Página ──────────────────────────────────────────────────────────────── */

export default async function ProductosPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = firstValues(await searchParams)

  /* La normalización dura (lista blanca de `sort`, precios numéricos, página
     >= 1) vive en el módulo de datos; aquí sólo se recogen los valores. */
  const query: ListingQuery = {
    category: params.category,
    collection: params.collection,
    height: params.height,
    search: params.search,
    sort: params.sort,
    minPrice: params.minPrice,
    maxPrice: params.maxPrice,
    page: params.page,
  }

  const [categories, collections] = await Promise.all([getCategories(), getCollections()])

  const title = titleFor(params, categories, collections)
  const activeCount = countActiveFacets(params)
  const taxonomy =
    collections.find((c) => c.slug === params.collection) ??
    categories.find((c) => c.slug === params.category)

  return (
    <div className="pb-section-sm">
      <div className="border-b border-border bg-surface">
        <div className="shell py-5 sm:py-6">
          <nav aria-label="Ruta" className="mb-3">
            <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="transition-colors hover:text-brand-green-deep">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3" />
              </li>
              {activeCount > 0 ? (
                <>
                  <li>
                    <Link href="/productos" className="transition-colors hover:text-brand-green-deep">
                      Catálogo
                    </Link>
                  </li>
                  <li aria-hidden="true">
                    <ChevronRight className="size-3" />
                  </li>
                  <li className="truncate font-semibold text-foreground" aria-current="page">
                    {title}
                  </li>
                </>
              ) : (
                <li className="font-semibold text-foreground" aria-current="page">
                  Catálogo
                </li>
              )}
            </ol>
          </nav>

          <p className="eyebrow text-muted-foreground">Cercas por metro lineal</p>
          <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>

          <p className="mt-1 text-sm text-muted-foreground">
            <Suspense
              fallback={
                <span
                  aria-hidden="true"
                  className="inline-block h-4 w-20 animate-pulse rounded-sm bg-muted align-middle"
                />
              }
            >
              <ResultCount query={query} />
            </Suspense>
            {" · precio de material por metro; la instalación se cotiza aparte"}
          </p>

          {taxonomy?.description && (
            <p className="mt-2 max-w-prose text-sm text-muted-foreground">{taxonomy.description}</p>
          )}

          <div className="mt-4 max-w-xl">
            <SearchWrapper params={params} />
          </div>
        </div>
      </div>

      <div className="shell pt-5 sm:pt-6">
        {/* El uso, fuera de todo desplegable y encima de la parrilla: es la
            faceta que más se toca y la que ordena el catálogo en la cabeza del
            comprador. Va a ancho completo para que ruede de borde a borde en
            móvil sin meterse debajo de la barra lateral. */}
        <SegmentBar params={params} categories={categories} />

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:gap-8">
          <ProductFiltersRail params={params} collections={collections} />

          <div className="min-w-0 flex-1">
            <ProductFiltersDrawer
              params={params}
              collections={collections}
              activeCount={activeCount}
            />

            <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <ActiveFilters params={params} categories={categories} collections={collections} />
              <div className="min-w-0 sm:ml-auto">
                <SortSelect params={params} />
              </div>
            </div>

            <div className="mt-4 sm:mt-5">
              <Suspense key={queryKey(query)} fallback={<ProductGridSkeleton />}>
                <ProductResults
                  query={query}
                  params={params}
                  categories={categories}
                  collections={collections}
                />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
