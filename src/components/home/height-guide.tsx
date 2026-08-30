import Link from "next/link"

import {
  heightRange,
  unitSuffix,
  type HeightBand,
} from "./catalog-data"
import { SectionHeader } from "./section"

/* «Comprar por altura» — sistema «Perímetro».
 *
 * La altura es la primera decisión real de quien cerca un terreno y está en
 * los quince productos del catálogo (`attributes.heightOptions`), pero no
 * había forma de navegar por ella: ni en la cabecera, ni en la portada, ni en
 * el listado —que filtra por categoría, precio y texto, no por medida—.
 *
 * Por eso esta sección no enlaza a un filtro que no existe: enlaza a cada
 * modelo. Cada franja es una lista de fichas con su rango y su precio por
 * metro. Un enlace por modelo es más útil que un filtro inventado, y de paso
 * es la sección más densa de la portada sin una sola fotografía —que es justo
 * lo que necesita un catálogo donde diez de quince no tienen foto—.
 *
 * Un modelo aparece en más de una franja si su rango la cruza. No es un
 * error de agrupación: la Atlas se vende de 1.2 a 2.1 m y sirve para las tres
 * decisiones. Duplicarla es decir la verdad; asignarla a una sola sería
 * esconder inventario.
 */
export function HeightGuide({ bands }: { bands: HeightBand[] }) {
  if (!bands.length) return null

  return (
    <section id="por-altura" className="border-b border-border bg-brand-navy-deep">
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          tone="dark"
          eyebrow="La primera decisión"
          title="Comprar por altura"
          sub="Qué se quiere conseguir con la cerca decide la medida, y la medida decide el modelo y el precio."
          href="/productos"
          linkLabel="Todo el catálogo"
        />

        <div className="grid gap-3 lg:grid-cols-3">
          {bands.map((band) => (
            <div
              key={band.label}
              className="flex flex-col rounded-lg border border-on-dark/15 bg-on-dark/5 p-4"
            >
              <div className="flex items-baseline justify-between gap-3">
                <h3 className="text-lg font-bold text-on-dark tabular-nums">
                  {band.label}
                </h3>
                <span className="text-2xs font-bold text-brand-green tabular-nums">
                  {band.products.length}{" "}
                  {band.products.length === 1 ? "modelo" : "modelos"}
                </span>
              </div>

              <p className="mt-1 text-sm text-on-dark-soft">{band.use}</p>

              <ul className="mt-3 divide-y divide-on-dark/10 border-t border-on-dark/10">
                {band.products.slice(0, 5).map((p) => (
                  <li key={p.id}>
                    <Link
                      href={`/productos/${p.slug}`}
                      className="flex items-baseline justify-between gap-3 py-2 transition-colors hover:text-brand-green"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm font-medium text-on-dark">
                        {p.name}
                      </span>
                      <span className="shrink-0 text-2xs text-on-dark-soft tabular-nums">
                        {heightRange(p)}
                      </span>
                      <span className="w-16 shrink-0 text-right text-sm font-bold text-on-dark tabular-nums">
                        ${p.basePrice.toFixed(2)}
                        <span className="font-medium text-on-dark-soft">
                          {unitSuffix(p.unit)}
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>

              {band.products.length > 5 && (
                <p className="mt-3 text-2xs text-on-dark-soft">
                  Y {band.products.length - 5} modelos más en esta franja.
                </p>
              )}
            </div>
          ))}
        </div>

        <p className="mt-4 text-xs text-on-dark-soft">
          Un mismo modelo puede aparecer en dos franjas: se fabrica en varias
          alturas y sirve para las dos decisiones.
        </p>
      </div>
    </section>
  )
}
