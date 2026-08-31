import Link from "next/link"

import type { Category, Collection, Product, ProductUnit } from "@/types"

import PriceFilter from "@/app/(store)/productos/price-filter"

/* Facetas del listado — sistema «Perímetro».
 *
 * Aquí vive TODO el vocabulario de filtrado del catálogo: qué se puede filtrar,
 * con qué valores y cómo se escribe cada uno en la URL. La página no decide
 * nada de esto; sólo lo pinta.
 *
 * Qué filtra de verdad quien compra cerca por metro lineal, en su orden:
 *
 *   1. ALTURA   — es la primera pregunta y estaba en la base de datos
 *                 (`attributes.heightOptions`, los 15 modelos la traen) sin
 *                 aparecer en ningún filtro. Se filtraba por «colección» y por
 *                 texto libre, que es lo que el CMS sabía hacer, no lo que el
 *                 cliente pregunta.
 *   2. USO      — nadie busca «PVC»: busca cercar su casa, su nave o su finca.
 *                 Son las categorías reales de la API, con el mismo nombre que
 *                 usa la portada.
 *   3. PRECIO   — por metro lineal, en tramos que parten el catálogo real
 *                 (de $8.50 a $45.00) en cuatro grupos con contenido.
 *
 * Ni marca ni SKU ni valoraciones: el modelo no los tiene. Un filtro que no
 * filtra nada es peor que ningún filtro.
 *
 * Todo son enlaces `<Link>` y un formulario `method="get"`. Cero JavaScript de
 * cliente, cero hidratación, y funciona con el JS caído. Los chips además se
 * prefetch-ean al entrar en viewport, así que cambiar de faceta es instantáneo.
 */

/* ── La URL ──────────────────────────────────────────────────────────────── */

/** Parámetros que el listado reconoce. Cualquier otro se descarta al navegar. */
export const FACET_KEYS = [
  "category",
  "collection",
  "height",
  "search",
  "sort",
  "minPrice",
  "maxPrice",
  "page",
] as const

export type FacetKey = (typeof FACET_KEYS)[number]

/**
 * Opciones de `hrefWith`.
 *
 * Existen porque el precotizador filtra con este mismo vocabulario pero vive en
 * otra ruta y arrastra dos parámetros propios (`producto` y `metros`). La
 * alternativa era duplicar la función allí, y entonces habría dos sitios
 * decidiendo cómo se escribe una faceta en la URL: el día que se añada una, una
 * de las dos pantallas se quedaría sin ella y nadie se enteraría hasta que un
 * filtro dejara de conservarse al navegar. Se parametriza en vez de copiarse.
 *
 * Los valores por defecto son los del listado, así que sus veintitantas
 * llamadas de dos argumentos siguen significando exactamente lo mismo.
 */
export interface HrefOptions {
  /** Ruta destino. El listado es el caso por defecto. */
  basePath?: string
  /**
   * Claves ajenas a las facetas que deben sobrevivir al navegar. No entran en
   * `patch` a propósito: no son facetas del catálogo, son estado de la otra
   * pantalla que pasa de largo.
   */
  carry?: readonly string[]
}

/**
 * Construye la URL del listado con los parámetros actuales más un parche.
 * `null` borra la clave; poner cualquier faceta devuelve siempre a la página 1
 * —quedarse en la 3 con un filtro que sólo tiene 2 páginas da un vacío que
 * parece un error del sitio—.
 */
export function hrefWith(
  params: Record<string, string | undefined>,
  patch: Partial<Record<FacetKey, string | null>> = {},
  { basePath = "/productos", carry = [] }: HrefOptions = {},
) {
  const sp = new URLSearchParams()
  for (const key of FACET_KEYS) {
    const value = key in patch ? patch[key] : params[key]
    if (value) sp.set(key, value)
  }
  if (!("page" in patch)) sp.delete("page")
  /* Detrás de las facetas para que la parte legible de la URL —lo que se está
     filtrando— quede delante de lo que sólo es estado arrastrado. */
  for (const key of carry) {
    const value = params[key]
    if (value) sp.set(key, value)
  }
  const qs = sp.toString()
  return qs ? `${basePath}?${qs}` : basePath
}

/* ── Altura ──────────────────────────────────────────────────────────────── */

/**
 * `heightOptions` llega como `["1.5m","1.8m","2.1m"]`. Se pasa a número para
 * poder ordenar y comparar sin depender de cómo esté escrita la unidad.
 */
export function heightsOf(p: Pick<Product, "attributes">): number[] {
  const raw = (p.attributes as { heightOptions?: unknown } | null)?.heightOptions
  if (!Array.isArray(raw)) return []
  return raw
    .map((h) => parseFloat(String(h).replace(",", ".")))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)
}

/** Rango listo para pintar: «1.5 – 2.1 m». `null` si el modelo no lo declara. */
export function heightRange(p: Pick<Product, "attributes">): string | null {
  const h = heightsOf(p)
  if (!h.length) return null
  return h.length === 1
    ? `${h[0].toFixed(1)} m`
    : `${h[0].toFixed(1)} – ${h[h.length - 1].toFixed(1)} m`
}

export interface HeightBand {
  value: string
  label: string
  use: string
  min: number
  max: number
}

/**
 * Tres franjas, tres decisiones distintas de comprador. Son las mismas que usa
 * la portada: si el sitio llama «delimitar» a una altura en la home, el listado
 * no puede llamarla otra cosa.
 *
 * Un modelo entra en la franja si ALGUNA de sus alturas cae dentro, no si su
 * rango completo cabe. La Atlas se fabrica de 1.2 a 2.1 m y sirve para las
 * tres: aparecer en las tres es decir la verdad, y es justo lo que pregunta
 * quien filtra («¿cuáles puedo pedir a 1.5 m?»).
 */
export const HEIGHT_BANDS: HeightBand[] = [
  { value: "0-1.5", label: "Hasta 1.5 m", use: "Delimitar jardín, piscina o frente", min: 0, max: 1.5 },
  { value: "1.6-2.1", label: "1.8 – 2.1 m", use: "Cerrar el perímetro de casa o nave", min: 1.6, max: 2.1 },
  { value: "2.2-9", label: "2.4 m o más", use: "Disuadir: obra, planta y espacio público", min: 2.2, max: 9 },
]

export function findHeightBand(value: string | undefined): HeightBand | undefined {
  return value ? HEIGHT_BANDS.find((b) => b.value === value) : undefined
}

/** ¿Este modelo se fabrica en alguna altura de la franja pedida? */
export function matchesHeight(p: Pick<Product, "attributes">, band: HeightBand) {
  return heightsOf(p).some((h) => h >= band.min && h <= band.max)
}

/* ── Precio por metro ────────────────────────────────────────────────────── */

export interface PriceBand {
  label: string
  min?: string
  max?: string
}

/**
 * Cuatro tramos elegidos sobre el catálogo real ($8.50 – $45.00/m): cada uno
 * tiene modelos dentro. Un tramo vacío es una promesa incumplida en la cara del
 * cliente, así que la lista se recorta a lo que existe.
 */
export const PRICE_BANDS: PriceBand[] = [
  { label: "Hasta $20", max: "20" },
  { label: "$20 – $30", min: "20", max: "30" },
  { label: "$30 – $40", min: "30", max: "40" },
  { label: "Más de $40", min: "40" },
]

/* ── Unidad de venta ─────────────────────────────────────────────────────── */

/** `unit` es un enum de Prisma. Un solo sitio decide cómo se escribe. */
export const unitSuffix = (unit: ProductUnit) =>
  unit === "METRO" ? "/m" : unit === "PANEL" ? "/panel" : "c/u"

/* ── Piezas de interfaz ──────────────────────────────────────────────────── */

const chip =
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-semibold transition-colors"
const chipOff =
  "border-border bg-surface text-muted-foreground hover:border-brand-green hover:text-brand-green-deep"
const chipOn = "border-brand-green-deep bg-brand-green-deep text-on-dark"

/**
 * Chip de faceta. Pulsar el chip activo lo apaga: es su propio «quitar».
 *
 * Exportado porque el precotizador filtra por las mismas facetas y un chip de
 * «uso» no puede verse de dos maneras según la pantalla en la que se toque.
 */
export function FacetChip({
  href,
  active,
  children,
  count,
  className = "",
}: {
  href: string
  active: boolean
  children: React.ReactNode
  count?: number
  /**
   * Añadidos del sitio que lo usa. El precotizador sube el chip a 44 px de
   * alto: allí es el único control de faceta a mano en móvil, no hay barra
   * lateral donde reintentar, y se toca con el pulgar mientras se mira una
   * cerca. Va como parche y no como cambio del chip base para no mover el
   * listado, donde el chip lleva su tamaño desde el rediseño.
   */
  className?: string
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "true" : undefined}
      className={`${chip} ${active ? chipOn : chipOff} ${className}`}
    >
      {children}
      {count != null && (
        <span
          className={`tabular text-2xs font-bold ${active ? "text-on-dark/70" : "text-muted-foreground"}`}
        >
          {count}
        </span>
      )}
    </Link>
  )
}

function FacetGroup({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="border-t border-border px-4 py-4 first:border-t-0">
      <h3 className="eyebrow text-muted-foreground">{title}</h3>
      {hint && <p className="mt-1 text-2xs text-muted-foreground">{hint}</p>}
      <div className="mt-2.5">{children}</div>
    </div>
  )
}

/* ── Barra de segmentos (siempre visible) ────────────────────────────────── */

/**
 * El uso es la faceta cabecera: se queda fuera del desplegable y encima de la
 * parrilla en todos los anchos. En móvil rueda en horizontal —cinco usos no
 * caben en 390 px y apilarlos empujaría la primera ficha fuera de pantalla—.
 */
export function SegmentBar({
  params,
  categories,
}: {
  params: Record<string, string | undefined>
  categories: Category[]
}) {
  const active = params.category
  const anyFacet = Boolean(active || params.collection)

  return (
    <nav aria-label="Filtrar por uso" className="-mx-gutter px-gutter">
      <ul className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        <li className="shrink-0">
          <FacetChip href={hrefWith(params, { category: null, collection: null })} active={!anyFacet}>
            Todo el catálogo
          </FacetChip>
        </li>
        {categories.map((cat) => (
          <li key={cat.slug} className="shrink-0">
            <FacetChip
              href={hrefWith(params, {
                category: active === cat.slug ? null : cat.slug,
                collection: null,
              })}
              active={active === cat.slug}
              count={cat._count?.products}
            >
              {cat.name}
            </FacetChip>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/* ── Filtros activos ─────────────────────────────────────────────────────── */

/** Lo que está filtrando ahora mismo, con su «quitar» al lado. */
export function ActiveFilters({
  params,
  categories,
  collections,
}: {
  params: Record<string, string | undefined>
  categories: Category[]
  collections: Collection[]
}) {
  const band = findHeightBand(params.height)
  const active: { key: FacetKey; label: string; patch: Partial<Record<FacetKey, null>> }[] = []

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category)
    active.push({ key: "category", label: `Uso: ${cat?.name ?? params.category}`, patch: { category: null } })
  }
  if (params.collection) {
    const col = collections.find((c) => c.slug === params.collection)
    active.push({ key: "collection", label: `Línea: ${col?.name ?? params.collection}`, patch: { collection: null } })
  }
  if (band) active.push({ key: "height", label: `Altura: ${band.label}`, patch: { height: null } })
  if (params.search) active.push({ key: "search", label: `«${params.search}»`, patch: { search: null } })
  if (params.minPrice || params.maxPrice) {
    const min = params.minPrice ? `$${params.minPrice}` : "$0"
    const max = params.maxPrice ? `$${params.maxPrice}` : "sin tope"
    active.push({
      key: "minPrice",
      label: `Precio: ${min} – ${max}/m`,
      patch: { minPrice: null, maxPrice: null },
    })
  }

  if (!active.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-2xs font-bold text-muted-foreground uppercase">Filtrando por</span>
      {active.map((f) => (
        <Link
          key={f.key}
          href={hrefWith(params, f.patch)}
          className="inline-flex items-center gap-1.5 rounded-full border border-brand-green bg-brand-green-soft px-2.5 py-1 text-2xs font-semibold text-brand-green-deep transition-colors hover:bg-surface"
        >
          {f.label}
          <span aria-hidden="true" className="text-sm leading-none">
            ×
          </span>
          <span className="sr-only">— quitar este filtro</span>
        </Link>
      ))}
      <Link
        href="/productos"
        className="text-2xs font-bold text-muted-foreground underline underline-offset-2 hover:text-brand-green-deep"
      >
        Limpiar todo
      </Link>
    </div>
  )
}

/* ── Panel de facetas ────────────────────────────────────────────────────── */

function FacetPanel({
  params,
  collections,
}: {
  params: Record<string, string | undefined>
  collections: Collection[]
}) {
  const height = params.height
  const minPrice = params.minPrice
  const maxPrice = params.maxPrice

  return (
    <>
      <FacetGroup title="Altura" hint="Un modelo se fabrica en varias; aparece en cada franja que alcanza.">
        <ul className="space-y-1.5">
          {HEIGHT_BANDS.map((band) => {
            const on = height === band.value
            return (
              <li key={band.value}>
                <Link
                  href={hrefWith(params, { height: on ? null : band.value })}
                  aria-current={on ? "true" : undefined}
                  className={`block rounded-md border px-3 py-2 transition-colors ${
                    on
                      ? "border-brand-green bg-brand-green-soft"
                      : "border-border bg-surface hover:border-brand-green"
                  }`}
                >
                  <span
                    className={`tabular block text-sm font-bold ${
                      on ? "text-brand-green-deep" : "text-foreground"
                    }`}
                  >
                    {band.label}
                  </span>
                  <span className="mt-0.5 block text-2xs leading-snug text-muted-foreground">
                    {band.use}
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>
      </FacetGroup>

      <FacetGroup title="Precio por metro" hint="Precio de material, en dólares. La instalación se cotiza aparte.">
        <ul className="flex flex-wrap gap-2">
          {PRICE_BANDS.map((b) => {
            const on = (b.min ?? "") === (minPrice ?? "") && (b.max ?? "") === (maxPrice ?? "")
            return (
              <li key={b.label}>
                <FacetChip
                  href={hrefWith(params, {
                    minPrice: on ? null : (b.min ?? null),
                    maxPrice: on ? null : (b.max ?? null),
                  })}
                  active={on}
                >
                  <span className="tabular">{b.label}</span>
                </FacetChip>
              </li>
            )
          })}
        </ul>
        <PriceFilter params={params} />
      </FacetGroup>

      {collections.length > 0 && (
        <FacetGroup title="Línea de producto">
          <ul className="flex flex-wrap gap-2">
            {collections.map((col) => {
              const on = params.collection === col.slug
              return (
                <li key={col.slug}>
                  <FacetChip
                    href={hrefWith(params, { collection: on ? null : col.slug, category: null })}
                    active={on}
                    count={col._count?.products}
                  >
                    {col.name}
                  </FacetChip>
                </li>
              )
            })}
          </ul>
        </FacetGroup>
      )}
    </>
  )
}

/**
 * Barra lateral de escritorio. `sticky` para que las facetas sigan a la vista
 * mientras se recorre la parrilla.
 */
export function ProductFiltersRail({
  params,
  collections,
}: {
  params: Record<string, string | undefined>
  collections: Collection[]
}) {
  return (
    <aside
      aria-label="Filtros del catálogo"
      className="hidden w-64 shrink-0 lg:block"
    >
      <div className="sticky top-20 overflow-hidden rounded-lg border border-border bg-surface">
        <FacetPanel params={params} collections={collections} />
      </div>
    </aside>
  )
}

/**
 * Móvil: el mismo panel dentro de un `<details>`.
 *
 * Un cajón de filtros suele costar un componente de cliente con estado, foco
 * atrapado y bloqueo de scroll. `<details>`/`<summary>` lo hace el navegador:
 * accesible por teclado, anunciado como botón expandible por el lector de
 * pantalla y con cero kilobytes de JavaScript. Además abre por defecto cuando
 * ya hay un filtro puesto, para que se vea qué está aplicado.
 */
export function ProductFiltersDrawer({
  params,
  collections,
  activeCount,
}: {
  params: Record<string, string | undefined>
  collections: Collection[]
  activeCount: number
}) {
  return (
    <details
      open={activeCount > 0}
      className="group overflow-hidden rounded-lg border border-border bg-surface lg:hidden"
    >
      <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 text-sm font-bold text-foreground marker:content-none">
        <span className="flex items-center gap-2">
          Altura, precio y línea
          {activeCount > 0 && (
            <span className="tabular rounded-full bg-brand-green-deep px-1.5 py-0.5 text-2xs font-bold text-on-dark">
              {activeCount}
            </span>
          )}
        </span>
        <span
          aria-hidden="true"
          className="text-brand-green-deep transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>
      <div className="border-t border-border">
        <FacetPanel params={params} collections={collections} />
      </div>
    </details>
  )
}

/** Cuántas facetas hay puestas. Alimenta el contador del cajón móvil. */
export function countActiveFacets(params: Record<string, string | undefined>) {
  let n = 0
  if (params.category) n++
  if (params.collection) n++
  if (params.height) n++
  if (params.search) n++
  if (params.minPrice || params.maxPrice) n++
  return n
}
