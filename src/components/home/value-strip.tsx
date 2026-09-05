import Link from "next/link"
import { Search } from "lucide-react"

/* El cajetín — sistema «Perímetro».
 *
 * En un plano técnico, el cajetín es la franja donde viven los datos de la
 * lámina: escala, autor, fecha. Aquí es la franja pegada al hero con el
 * buscador —que baja del hero, porque la acción del hero es ver el precio, no
 * buscar— y los tres datos comprobables de la casa.
 *
 * El dato «desde $X/m» ya NO va aquí: es el hero entero. Y el envío dice la
 * verdad simple: con pedido mínimo de 10 m todo pedido supera los $50, así que
 * el envío es gratis en todo pedido — las condiciones completas viven en
 * /envios, que es donde está la política publicada.
 *
 * El buscador conserva la semántica de siempre: `<form method="get">` contra
 * /productos. Funciona sin JavaScript.
 */
export function ValueStrip({
  modelCount,
  warrantyYears,
}: {
  modelCount: number
  warrantyYears: number | null
}) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="shell">
        <div className="grid grid-cols-2 lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr]">
          {/* Celda 1, la más ancha: el buscador. */}
          <div className="col-span-2 border-b border-hairline py-3 lg:col-span-1 lg:border-r lg:border-b-0 lg:py-4 lg:pr-6">
            <form action="/productos" method="get" role="search">
              <label htmlFor="hero-search" className="sr-only">
                Buscar modelo, material o altura
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search
                    className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <input
                    id="hero-search"
                    type="search"
                    name="search"
                    enterKeyHint="search"
                    className="h-11 w-full rounded-lg border border-border bg-surface pr-3 pl-9 text-base text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary"
                    placeholder="Buscar: malla, PVC, 2 m de alto…"
                  />
                </div>
                <button
                  type="submit"
                  className="h-11 shrink-0 rounded-lg bg-primary px-4 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
                >
                  Buscar
                </button>
              </div>
            </form>
          </div>

          {/* Celdas 2-4: los datos de la lámina, todos auditables. */}
          <Link
            href="/productos"
            className="flex flex-col justify-center gap-0.5 border-r border-hairline px-3 py-3 transition-colors hover:bg-surface-2 lg:px-5 lg:py-4"
          >
            <span className="eyebrow text-muted-foreground">Catálogo</span>
            <span className="tabular text-base font-bold text-foreground">
              {modelCount} modelos
            </span>
          </Link>

          {warrantyYears != null ? (
            <div className="flex flex-col justify-center gap-0.5 px-3 py-3 lg:border-r lg:border-hairline lg:px-5 lg:py-4">
              <span className="eyebrow text-muted-foreground">Garantía</span>
              <span className="tabular text-base font-bold text-foreground">
                Hasta {warrantyYears} años
              </span>
            </div>
          ) : null}

          <Link
            href="/envios"
            className="col-span-2 flex flex-col justify-center gap-0.5 border-t border-hairline px-3 py-3 transition-colors hover:bg-surface-2 lg:col-span-1 lg:border-t-0 lg:px-5 lg:py-4"
          >
            <span className="eyebrow text-muted-foreground">Envío gratis</span>
            <span className="text-base font-bold text-foreground">
              En todo pedido{" "}
              <span className="tabular text-xs font-medium text-muted-foreground">
                · mínimo 10 m
              </span>
            </span>
          </Link>
        </div>
      </div>
    </section>
  )
}
