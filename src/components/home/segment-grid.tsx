import Link from "next/link"

import { WA_MESSAGE } from "@/components/layout/nav-data"
import { whatsappHref } from "@/components/ui/icon-whatsapp"

import type { SegmentSection } from "./catalog-data"
import { SectionHeader } from "./section"

/* «Comprar por uso» — sistema «Perímetro».
 *
 * Es la primera bifurcación de la portada porque es la primera del comprador:
 * nadie busca «PVC», busca cercar su casa, su nave, su finca o una escuela.
 * Los cinco usos son las cinco categorías reales de la API, con su recuento y
 * su precio de entrada calculados en el servidor.
 *
 * Sin fotografías, y no por rendimiento. La foto que la API asigna a cada
 * categoría es la foto de uno de los cinco productos que sí tienen fotógrafo:
 * «Agropecuario» ilustraba con una cerca blanca residencial y «Gubernamental»
 * con otra de PVC, cuando lo que se vende ahí es malla de acero. Una imagen
 * que contradice al producto no vende: devuelve el pedido. Se sustituye por el
 * alzado del sistema —listón o cuadrícula, según lo que haya de verdad en ese
 * segmento— que sí distingue un uso de otro.
 *
 * Efecto secundario medido: esta parrilla cae justo bajo el pliegue en móvil,
 * dentro del margen con el que Chrome dispara las imágenes perezosas. Quitando
 * sus cinco fotos, la portada entera descarga UNA sola imagen antes de que el
 * visitante haga scroll: la del hero.
 *
 * El caso del segmento sin modelos cargados —hoy Agropecuario— no enlaza a
 * `/productos?category=agropecuario`, que devolvería un listado vacío: enlaza
 * a WhatsApp, que es donde ese pedido se atiende, y la tarjeta lo dice.
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

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
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
                  className="group flex h-full flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-brand-green"
                >
                  <span
                    className={`h-14 shrink-0 border-b border-border diagram ${
                      mesh ? "diagram-mesh" : "diagram-picket"
                    }`}
                    aria-hidden="true"
                  />

                  <span className="flex flex-1 flex-col p-3">
                    <span className="block text-sm leading-tight font-bold text-foreground group-hover:text-brand-green-deep">
                      {seg.name}
                    </span>
                    <span className="mt-0.5 block text-xs leading-snug text-muted-foreground">
                      {seg.who}
                    </span>
                    <span className="mt-2 block text-2xs font-bold text-brand-green-deep tabular-nums">
                      {empty
                        ? "Consultar por WhatsApp"
                        : `${seg.total} ${seg.total === 1 ? "modelo" : "modelos"}${
                            seg.from != null ? ` · desde $${seg.from.toFixed(2)}/m` : ""
                          }`}
                    </span>
                  </span>
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
