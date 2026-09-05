import type { CSSProperties } from "react"
import Link from "next/link"

import {
  heightRange,
  isMesh,
  unitSuffix,
  type HeightBand,
} from "./catalog-data"
import { SectionHeader } from "./section"

/* «Comprar por altura», dibujada — sistema «Perímetro».
 *
 * La altura es la primera decisión de quien cerca un terreno, y una decisión
 * de medida se explica MIDIENDO: cada franja se dibuja a escala como el alzado
 * de un plano —misma gramática de gradientes que `.diagram-picket`, sin una
 * sola imagen— con su cota vertical al lado rotulando el rango real de
 * `heightOptions`. Una línea de referencia a 1.70 m —la altura de una
 * persona— cruza las tres columnas: se ve de un vistazo que la primera franja
 * queda por debajo de los ojos, la segunda los tapa y la tercera disuade.
 *
 * Los tres alzados comparten escala (~59 px por metro): 1.5 m → h-24,
 * 2.1 m → h-32, 3.0 m → h-44, persona → 100 px. El dibujo va PRIMERO en cada
 * tarjeta para que las tres zonas de dibujo queden a la misma altura y la
 * línea de referencia conecte de tarjeta a tarjeta.
 *
 * Las listas de modelos se conservan bajo cada alzado, con el precio en
 * text-sm: un dato decisivo no se escribe a 11 px.
 */

const INK = "color-mix(in oklab, var(--on-dark) 34%, transparent)"
const POST = "color-mix(in oklab, var(--on-dark) 62%, transparent)"

/* Alzado de cerca de listones: dos rieles y los listones verticales. */
const picketStyle: CSSProperties = {
  backgroundImage: `linear-gradient(${POST} 0 0), linear-gradient(${POST} 0 0), repeating-linear-gradient(90deg, ${INK} 0 7px, transparent 7px 17px)`,
  backgroundSize: "100% 4px, 100% 4px, 100% 100%",
  backgroundPosition: "0 24%, 0 68%, 0 0",
  backgroundRepeat: "no-repeat",
}

/* Alzado de malla electrosoldada: cuadrícula entre dos postes. */
const meshStyle: CSSProperties = {
  backgroundImage: `linear-gradient(${POST} 0 0), linear-gradient(${POST} 0 0), repeating-linear-gradient(90deg, ${INK} 0 2px, transparent 2px 14px), repeating-linear-gradient(0deg, ${INK} 0 2px, transparent 2px 14px)`,
  backgroundSize: "4px 100%, 4px 100%, 100% 100%, 100% 100%",
  backgroundPosition: "0 0, 100% 0, 0 0, 0 0",
  backgroundRepeat: "no-repeat",
}

/* Tope de la franja («1.8 – 2.1 m» → 2.1) a su altura de dibujo en escala. */
function columnHeight(range: string): string {
  const top = parseFloat(range.split("–").pop() ?? "")
  if (!Number.isFinite(top) || top > 2.1) return "h-44"
  return top <= 1.5 ? "h-24" : "h-32"
}

/* Cota vertical, con las mismas piezas que la horizontal: línea de 1px de
   alto completo, tics horizontales de 9×2 en los extremos y la cifra central
   rompiendo la línea. */
function VerticalCota({ range }: { range: string }) {
  return (
    <div
      className="flex h-full flex-col items-center text-(--cota-ink)"
      aria-hidden="true"
    >
      <span className="h-[2px] w-[9px] bg-(--cota-ink)" />
      <span className="w-px flex-1 bg-(--cota-ink)" />
      <span className="tabular py-1 text-2xs font-bold whitespace-nowrap">
        {range}
      </span>
      <span className="w-px flex-1 bg-(--cota-ink)" />
      <span className="h-[2px] w-[9px] bg-(--cota-ink)" />
    </div>
  )
}

export function HeightGuide({ bands }: { bands: HeightBand[] }) {
  if (!bands.length) return null

  return (
    <section
      id="por-altura"
      className="defer-paint sheet-grid border-b border-border bg-brand-navy-deep"
    >
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          tone="dark"
          eyebrow="La primera decisión"
          title="Comprar por altura"
          sub="Qué se quiere conseguir con la cerca decide la medida, y la medida decide el modelo y el precio. Dibujado a escala."
          href="/productos"
          linkLabel="Todo el catálogo"
        />

        <div className="grid gap-3 lg:grid-cols-3">
          {bands.map((band, i) => {
            const h = columnHeight(band.range)
            const mesh =
              band.products.length > 0 &&
              band.products.filter(isMesh).length * 2 >= band.products.length

            return (
              <div
                key={band.label}
                className="flex flex-col rounded-lg border border-on-dark/15 bg-on-dark/5 p-4"
              >
                {/* Zona de dibujo: va primero y mide lo mismo en las tres
                    tarjetas para que la línea de 1.70 m conecte entre ellas. */}
                <div className="relative flex h-44 items-end gap-4">
                  {/* 1.70 m · la persona de referencia, a escala. */}
                  <div
                    className="absolute -inset-x-4 bottom-25 border-t border-dashed border-hairline"
                    aria-hidden="true"
                  >
                    {i === 0 && (
                      <span className="absolute right-2 -top-5 text-2xs text-on-dark-soft tabular-nums">
                        1.70 m · altura de una persona
                      </span>
                    )}
                  </div>

                  <div
                    className={`${h} w-24 shrink-0 sm:w-28`}
                    style={mesh ? meshStyle : picketStyle}
                    aria-hidden="true"
                  />
                  <div className={h}>
                    <VerticalCota range={band.range} />
                  </div>
                </div>

                <div className="mt-4 flex items-baseline justify-between gap-3">
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
                        <span className="shrink-0 text-xs text-on-dark-soft tabular-nums">
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
            )
          })}
        </div>

        <p className="mt-4 text-xs text-on-dark-soft">
          Un mismo modelo puede aparecer en dos franjas: se fabrica en varias
          alturas y sirve para las dos decisiones.
        </p>
      </div>
    </section>
  )
}
