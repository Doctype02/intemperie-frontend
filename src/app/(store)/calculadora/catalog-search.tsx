import Link from "next/link"
import { ChevronRight, Search } from "lucide-react"

import {
  FACET_KEYS,
  FacetChip,
  HEIGHT_BANDS,
  findHeightBand,
} from "@/components/products/product-filters"
import type { Category } from "@/types"

import { QUOTE_KEYS, quoteHref } from "./catalog-query"

/* Buscador y facetas del precotizador — sistema «Perímetro».
 *
 * Todo lo de este archivo es HTML de servidor: un `<form method="get">` y un
 * puñado de `<Link>`. Ni un byte de JavaScript de cliente, igual que el
 * buscador, el orden y el precio del listado. El motivo no es purismo: filtrar
 * en el cliente obligaría a mandarle el catálogo entero, que es exactamente el
 * problema que veníamos a resolver.
 *
 * El vocabulario —qué franjas de altura hay, cómo se llaman, cómo se escribe
 * cada faceta en la URL— sale entero de `components/products/product-filters`.
 * Aquí sólo se decide la disposición, que es distinta porque esto no es un
 * listado con barra lateral: es una tira de filtros encima del carrusel.
 *
 * Por qué un carrusel de cincuenta cercas no era la alternativa: no hay quien
 * deslice cincuenta fichas. Un buscador con dos facetas convierte «encuéntralo
 * tú» en «dime qué vas a cercar».
 */

/* ── Buscador ────────────────────────────────────────────────────────────── */

/**
 * Buscar no debe borrar lo que ya estabas mirando, así que las demás facetas
 * —y los dos parámetros propios del precotizador— viajan en campos ocultos. Con
 * `GET` hay que declararlos, y eso es una ventaja: se leen en el HTML.
 *
 * `page` no se arrastra porque aquí no hay paginación, y `search` tampoco,
 * porque es justo lo que el campo va a escribir.
 */
function QuoteSearch({ params }: { params: Record<string, string | undefined> }) {
  const carried = [...FACET_KEYS, ...QUOTE_KEYS].filter(
    (k) => k !== "search" && k !== "page" && params[k],
  )

  return (
    <form action="/calculadora" method="get" role="search" className="relative">
      {carried.map((k) => (
        <input key={k} type="hidden" name={k} value={params[k]} />
      ))}

      <label htmlFor="quote-search" className="sr-only">
        Buscar el modelo de cerca que quieres cotizar
      </label>

      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />

      {/* `text-lg` son 17 px: por debajo de 16 px Safari en iOS amplía la página
          al enfocar el campo y descoloca la maqueta entera. Es el mismo motivo
          por el que el campo de metros del paso 2 va a 17 px. */}
      <input
        id="quote-search"
        name="search"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        defaultValue={params.search ?? ""}
        placeholder="Buscar modelo: Atenea, Titan, malla…"
        className="h-12 w-full rounded-lg border border-border-strong bg-surface pr-24 pl-10 text-lg text-foreground placeholder:text-muted-foreground"
      />

      <button
        type="submit"
        className="absolute top-1.5 right-1.5 bottom-1.5 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-green-deep"
      >
        Buscar
      </button>
    </form>
  )
}

/* ── Facetas ─────────────────────────────────────────────────────────────── */

/** Uso: las categorías reales de la API, las mismas que pinta la portada. */
function UseFacet({
  params,
  categories,
}: {
  params: Record<string, string | undefined>
  categories: Category[]
}) {
  const active = params.category

  return (
    <nav aria-label="Filtrar por uso" className="-mx-gutter px-gutter">
      <ul className="scrollbar-hide flex gap-2 overflow-x-auto pb-1">
        <li className="shrink-0">
          <FacetChip
            href={quoteHref(params, { category: null })}
            active={!active}
            className="min-h-tap"
          >
            Cualquier uso
          </FacetChip>
        </li>
        {categories.map((cat) => (
          <li key={cat.slug} className="shrink-0">
            <FacetChip
              href={quoteHref(params, { category: active === cat.slug ? null : cat.slug })}
              active={active === cat.slug}
              count={cat._count?.products}
              className="min-h-tap"
            >
              {cat.name}
            </FacetChip>
          </li>
        ))}
      </ul>
    </nav>
  )
}

/**
 * Altura: las tres franjas del listado, con su decisión de comprador debajo.
 *
 * Se pintan como tarjetas y no como chips escuetos porque «1.8 – 2.1 m» no le
 * dice nada a quien nunca ha comprado cerca; «cerrar el perímetro de casa o
 * nave» sí. Esa frase es la que convierte un filtro en una guía, y era el
 * encargo: el precotizador no guiaba.
 */
function HeightFacet({ params }: { params: Record<string, string | undefined> }) {
  const active = params.height

  return (
    <nav aria-label="Filtrar por altura" className="-mx-gutter px-gutter">
      <p className="text-2xs text-muted-foreground">
        Un modelo se fabrica en varias alturas; aparece en cada franja que alcanza.
      </p>
      <ul className="scrollbar-hide mt-2 flex gap-2 overflow-x-auto pb-1 sm:flex-wrap sm:overflow-visible">
        <li className="w-40 shrink-0 sm:w-auto">
          <Link
            href={quoteHref(params, { height: null })}
            aria-current={!active ? "true" : undefined}
            className={`flex min-h-tap flex-col justify-center rounded-md border px-3 py-2 transition-colors ${
              !active
                ? "border-brand-green-deep bg-secondary"
                : "border-border bg-surface hover:border-brand-green"
            }`}
          >
            <span
              className={`text-sm font-bold ${
                !active ? "text-secondary-foreground" : "text-foreground"
              }`}
            >
              Cualquier altura
            </span>
            <span className="mt-0.5 text-2xs leading-snug text-muted-foreground">
              Ver todas las franjas
            </span>
          </Link>
        </li>

        {HEIGHT_BANDS.map((band) => {
          const on = active === band.value
          return (
            <li key={band.value} className="w-52 shrink-0 sm:w-auto">
              <Link
                href={quoteHref(params, { height: on ? null : band.value })}
                aria-current={on ? "true" : undefined}
                className={`flex min-h-tap flex-col justify-center rounded-md border px-3 py-2 transition-colors ${
                  on
                    ? "border-brand-green-deep bg-secondary"
                    : "border-border bg-surface hover:border-brand-green"
                }`}
              >
                {/* `bg-secondary` + `text-secondary-foreground` y no
                    `bg-brand-green-soft` + `text-brand-green-deep`: en modo
                    oscuro el par de primitivas se cruza —el verde suave baja y
                    el profundo también— y el texto se cae del AA. El par de
                    roles se invierte solo. */}
                <span
                  className={`tabular text-sm font-bold ${
                    on ? "text-secondary-foreground" : "text-foreground"
                  }`}
                >
                  {band.label}
                </span>
                <span className="mt-0.5 text-2xs leading-snug text-muted-foreground">
                  {band.use}
                </span>
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/** Lo que está filtrando ahora mismo, con su «quitar» al lado. */
function QuoteActiveFilters({
  params,
  categories,
}: {
  params: Record<string, string | undefined>
  categories: Category[]
}) {
  const band = findHeightBand(params.height)
  const active: { key: string; label: string; href: string }[] = []

  if (params.category) {
    const cat = categories.find((c) => c.slug === params.category)
    active.push({
      key: "category",
      label: `Uso: ${cat?.name ?? params.category}`,
      href: quoteHref(params, { category: null }),
    })
  }
  if (band) {
    active.push({
      key: "height",
      label: `Altura: ${band.label}`,
      href: quoteHref(params, { height: null }),
    })
  }
  if (params.search) {
    active.push({
      key: "search",
      label: `«${params.search}»`,
      href: quoteHref(params, { search: null }),
    })
  }

  if (!active.length) return null

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-2xs font-bold text-muted-foreground uppercase">Filtrando por</span>
      {active.map((f) => (
        <Link
          key={f.key}
          href={f.href}
          className="inline-flex min-h-tap items-center gap-1.5 rounded-full border border-brand-green bg-secondary px-3 text-2xs font-semibold text-secondary-foreground transition-colors hover:bg-surface"
        >
          {f.label}
          <span aria-hidden="true" className="text-sm leading-none">
            ×
          </span>
          <span className="sr-only">— quitar este filtro</span>
        </Link>
      ))}
      <Link
        href={quoteHref({ ...params, category: undefined, height: undefined, search: undefined })}
        className="text-2xs font-bold text-muted-foreground underline underline-offset-2 hover:text-foreground"
      >
        Limpiar todo
      </Link>
    </div>
  )
}

/* ── Sin resultados ──────────────────────────────────────────────────────── */

/**
 * Un vacío con un solo botón de «ver todo» tira por la borda los filtros que el
 * visitante acaba de poner para castigarle por el último. Aquí se ofrece quitar
 * cada uno por separado, empezando por el probable culpable: el texto libre
 * falla por una tilde o porque el modelo se llama de otra forma; la altura ya
 * sólo la piden tres franjas anchas; el uso es el filtro más ancho de los tres.
 */
function NoMatches({
  params,
  categories,
}: {
  params: Record<string, string | undefined>
  categories: Category[]
}) {
  const band = findHeightBand(params.height)
  const outs: { key: string; label: string; href: string }[] = []

  if (params.search) {
    outs.push({
      key: "search",
      label: `Buscar «${params.search}» en todo el catálogo`,
      href: quoteHref(params, { search: null }),
    })
  }
  if (band) {
    outs.push({
      key: "height",
      label: `Ver cualquier altura, no sólo ${band.label.toLowerCase()}`,
      href: quoteHref(params, { height: null }),
    })
  }
  if (params.category) {
    const name = categories.find((c) => c.slug === params.category)?.name ?? params.category
    outs.push({
      key: "category",
      label: `Ver todos los usos, no sólo ${name}`,
      href: quoteHref(params, { category: null }),
    })
  }

  return (
    <div className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-8 text-center sm:px-8 sm:py-10">
      {/* La misma cerca dibujada que rellena las fichas sin foto: marca de agua
          del catálogo, y no cuesta ni una petición de red. */}
      <div aria-hidden="true" className="diagram diagram-mesh mx-auto h-16 w-28 rounded-md" />

      <h3 className="mt-4 text-lg font-bold text-foreground">
        {params.search
          ? `Ningún modelo se llama «${params.search}»`
          : "Ningún modelo con estos filtros"}
      </h3>

      <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
        {outs.length > 0
          ? "No hay ningún modelo que cumpla todo lo que has pedido a la vez. Suelta el filtro que más aprieta y sigue cotizando:"
          : "Todavía no hay modelos publicados en el catálogo. Escríbenos y te decimos qué podemos fabricar."}
      </p>

      {outs.length > 0 && (
        <ul className="mx-auto mt-5 flex max-w-sm flex-col gap-2 text-left">
          {outs.map((out) => (
            <li key={out.key}>
              <Link
                href={out.href}
                className="flex min-h-tap items-center justify-between gap-3 rounded-md border border-border bg-surface-2 px-3.5 py-2.5 text-sm font-semibold text-foreground transition-colors hover:border-brand-green hover:text-secondary-foreground"
              >
                {out.label}
                <ChevronRight className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ── Recuento honesto ────────────────────────────────────────────────────── */

/**
 * Cuántos modelos coinciden y cuántos se están pintando.
 *
 * Cuando no caben todos se DICE, en vez de recortar en silencio. Un recorte
 * callado se lee como «esto es todo lo que hay», que es justo lo que contaba el
 * `listProducts({}, 100)` de antes: el modelo 101 no existía y nadie podía
 * enterarse.
 */
function MatchCount({
  shown,
  total,
  truncated,
}: {
  shown: number
  total: number
  truncated: boolean
}) {
  const hidden = total > shown

  return (
    <div className="space-y-2">
      <p className="text-sm text-muted-foreground">
        {/* `role="status"` no: esto se repinta con una navegación de servidor,
            no con un cambio en vivo, y el lector de pantalla ya anuncia la
            página nueva. */}
        <span className="tabular font-semibold text-foreground">{truncated ? "Al menos " : ""}
          {total}
        </span>{" "}
        {total === 1 ? "modelo coincide" : "modelos coinciden"}
        {hidden ? (
          <>
            {" · se muestran los "}
            <span className="tabular font-semibold text-foreground">{shown}</span> primeros. Afina
            la búsqueda o el uso para ver el resto.
          </>
        ) : (
          " · elige uno y escribe tus metros"
        )}
      </p>

      {truncated && (
        <p className="rounded-md border border-brand-amber bg-accent px-3 py-2 text-xs text-accent-foreground">
          El catálogo ya no cabe entero en una sola consulta, así que este filtro de altura se ha
          resuelto sobre los primeros modelos. Puede faltar alguno: afina también por uso o por
          nombre.
        </p>
      )}
    </div>
  )
}

/* ── Composición ─────────────────────────────────────────────────────────── */

/**
 * Todo el bloque de búsqueda, listo para colgarlo del paso 1.
 *
 * Se entrega a la isla de cliente como `ReactNode` ya pintado en el servidor:
 * así queda dentro del paso 1, donde tiene sentido leerlo, sin que una sola
 * línea de esta lógica acabe en el paquete del navegador.
 */
export function CatalogPicker({
  params,
  categories,
  shown,
  total,
  truncated,
}: {
  params: Record<string, string | undefined>
  categories: Category[]
  shown: number
  total: number
  truncated: boolean
}) {
  return (
    <div className="mt-4 space-y-4">
      <QuoteSearch params={params} />
      <UseFacet params={params} categories={categories} />
      <HeightFacet params={params} />
      <QuoteActiveFilters params={params} categories={categories} />

      {shown > 0 ? (
        <MatchCount shown={shown} total={total} truncated={truncated} />
      ) : (
        <NoMatches params={params} categories={categories} />
      )}
    </div>
  )
}
