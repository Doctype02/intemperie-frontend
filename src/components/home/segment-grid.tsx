import Link from "next/link"

import { WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

import type { SegmentSection } from "./catalog-data"
import { SectionHeader } from "./section"

/* «Comprar por uso» como fila de píldoras — dirección B (mercado).
 *
 * La parrilla de tarjetas se cambia por píldoras al estilo de las categorías
 * de un marketplace: círculo con el alzado del sistema, nombre y —debajo, en
 * verde— el recuento y el precio de entrada reales. En móvil la fila se
 * desplaza en horizontal (scrollbar oculta, patrón de tienda); en escritorio
 * envuelve.
 *
 * Dentro del círculo va el mismo alzado CSS de siempre (.diagram-picket /
 * .diagram-mesh): cuadrícula donde el segmento vende malla, listón donde vende
 * cerca de PVC. Sale del propio catálogo, no de una preferencia, y sigue sin
 * costar una petición de red. Los textos who/promise no se repiten aquí:
 * viven en las secciones por segmento, más abajo.
 *
 * El segmento sin modelos cargados —hoy Agropecuario— no manda a un listado
 * vacío: borde discontinuo, icono de WhatsApp y el chat con el contexto ya
 * redactado, que es donde ese pedido se atiende de verdad.
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

        <ul className="scrollbar-hide -mx-(--gutter) flex gap-3 overflow-x-auto px-(--gutter) lg:mx-0 lg:flex-wrap lg:overflow-visible lg:px-0">
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
              <li key={seg.slug} className="shrink-0">
                <Link
                  href={href}
                  {...(empty
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className={`group flex min-h-tap items-center gap-3 rounded-full border bg-surface py-2 pr-5 pl-2 transition-colors hover:border-brand-green ${
                    empty ? "border-dashed border-border-strong" : "border-border"
                  }`}
                >
                  {empty ? (
                    <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-green-soft text-brand-green-deep">
                      <IconWhatsApp className="size-5" />
                    </span>
                  ) : (
                    <span
                      className={`size-10 shrink-0 rounded-full bg-brand-green-soft diagram ${
                        mesh ? "diagram-mesh" : "diagram-picket"
                      }`}
                      aria-hidden="true"
                    />
                  )}

                  <span className="whitespace-nowrap">
                    <span className="block text-sm leading-tight font-bold text-foreground group-hover:text-brand-green-deep">
                      {seg.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-tight font-semibold text-brand-green-deep tabular-nums">
                      {empty
                        ? "Cotizar por WhatsApp"
                        : `${seg.total} ${seg.total === 1 ? "modelo" : "modelos"}${
                            seg.from != null
                              ? ` · desde $${seg.from.toFixed(2)}/m`
                              : ""
                          }`}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        <p className="mt-4 text-xs text-muted-foreground">
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
