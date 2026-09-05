import Link from "next/link"

import { WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

import type { SegmentSection } from "./catalog-data"
import { SectionHeader } from "./section"

/* «Comprar por uso» — sistema «Perímetro».
 *
 * Cinco fichas de tramo, como recortes de un plano: el alzado del sistema
 * (listón o cuadrícula, según lo que haya de verdad en el segmento), marcas de
 * esquina en L de lámina técnica y el precio de entrada rotulado como
 * mini-cota. Sin fotografías: la foto que la API asigna a cada categoría es la
 * de uno de los cinco productos con fotógrafo y acababa ilustrando
 * «Agropecuario» con una cerca residencial blanca.
 *
 * En móvil no hay parrilla con huérfano: cinco filas verticales de
 * alzado + nombre + precio, que se leen como un índice.
 *
 * El segmento sin modelos cargados —hoy Agropecuario— no manda a un listado
 * vacío: manda a WhatsApp, y la ficha lo dice con su borde discontinuo, el
 * icono a la vista y el verbo completo. Nadie descubre el salto de canal al
 * aterrizar en el chat.
 */
export function SegmentGrid({ segments }: { segments: SegmentSection[] }) {
  if (!segments.length) return null

  return (
    <section className="defer-paint border-b border-border bg-background">
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          eyebrow="Empiece por aquí"
          title="Comprar por uso"
          sub="Cada uso pide una altura, un calibre y un acabado distintos. Elija el suyo y el catálogo se filtra solo."
          href="/productos"
          linkLabel="Todo el catálogo"
        />

        <ul className="flex flex-col gap-2 sm:grid sm:grid-cols-3 sm:gap-3 lg:grid-cols-5">
          {segments.map((seg) => {
            const empty = seg.total === 0
            /* Malla de acero donde el segmento es de malla; listón donde es de
               cerca de PVC. Sale del propio catálogo, no de una preferencia. */
            const mesh =
              seg.products.length > 0 &&
              seg.products.filter((p) => /malla/i.test(p.name)).length * 2 >=
                seg.products.length

            const href = empty
              ? whatsappHref(
                  `Hola Intemperie, necesito cercado ${seg.name.toLowerCase()}: ${seg.who.toLowerCase()}.`,
                )
              : `/productos?category=${seg.slug}`

            return (
              <li key={seg.slug}>
                <Link
                  href={href}
                  {...(empty ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                  className={`group relative flex h-full items-center gap-3 rounded-lg border bg-surface p-3 transition-colors hover:border-brand-green sm:flex-col sm:items-stretch sm:gap-0 sm:p-0 ${
                    empty ? "border-dashed border-border-strong" : "border-border"
                  } before:pointer-events-none before:absolute before:top-1.5 before:left-1.5 before:size-3 before:border-t before:border-l before:border-border-strong after:pointer-events-none after:absolute after:right-1.5 after:bottom-1.5 after:size-3 after:border-r after:border-b after:border-border-strong`}
                >
                  {/* El alzado del tramo: miniatura en móvil, franja en tarjeta. */}
                  <span
                    className={`size-12 shrink-0 rounded-sm border border-border diagram sm:h-14 sm:w-auto sm:rounded-none sm:rounded-t-lg sm:border-0 sm:border-b sm:border-border ${
                      mesh ? "diagram-mesh" : "diagram-picket"
                    }`}
                    aria-hidden="true"
                  />

                  <span className="min-w-0 flex-1 sm:flex-none sm:p-3 sm:pb-0">
                    <span className="block text-sm leading-tight font-bold text-foreground group-hover:text-brand-green-deep">
                      {seg.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {seg.who}
                      {!empty && (
                        <span className="tabular">
                          {" "}
                          · {seg.total} {seg.total === 1 ? "modelo" : "modelos"}
                        </span>
                      )}
                    </span>
                  </span>

                  {empty ? (
                    <span className="inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold text-brand-green-deep sm:mt-auto sm:p-3 sm:pt-2">
                      <IconWhatsApp className="size-4 shrink-0" />
                      Cotizar agropecuario por WhatsApp
                    </span>
                  ) : (
                    seg.from != null && (
                      <span className="w-32 shrink-0 sm:mt-auto sm:w-auto sm:p-3 sm:pt-2">
                        <span className="cota">
                          <span className="tabular bg-surface px-1.5 text-sm font-bold text-brand-green-deep">
                            desde ${seg.from.toFixed(2)}/m
                          </span>
                        </span>
                      </span>
                    )
                  )}
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mt-3 text-xs text-muted-foreground">
          ¿No encaja en ninguno?{" "}
          <a
            href={whatsappHref(WA_MESSAGE.quote)}
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-brand-green-deep underline underline-offset-2"
          >
            Cuéntenos qué necesita cercar
          </a>{" "}
          y le decimos qué modelo aplica.
        </p>
      </div>
    </section>
  )
}
