import Image from "next/image"
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
 * El caso interesante es el segmento sin modelos cargados. Hoy es Agropecuario:
 * la categoría existe, la empresa vende ahí, pero el catálogo no tiene ninguna
 * ficha. Enviar a `/productos?category=agropecuario` es enviar a un listado
 * vacío —la peor página de una tienda—. Se envía a WhatsApp, que es donde ese
 * pedido se atiende de verdad, y la tarjeta lo dice en vez de fingir surtido.
 *
 * Las cinco tarjetas van por debajo del pliegue, así que sus fotos son
 * perezosas: no compiten con el LCP. La quinta no tiene foto propia y se
 * resuelve con la trama de malla del sistema, no con una foto prestada de otro
 * segmento que induciría a error sobre lo que se vende.
 */
export function SegmentGrid({ segments }: { segments: SegmentSection[] }) {
  if (!segments.length) return null

  return (
    <section className="border-b border-border bg-background">
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          eyebrow="Empiece por aquí"
          title="Comprar por uso"
          sub="Cada uso pide una altura, un calibre y un acabado distintos. Elija el suyo y el catálogo se filtra solo."
          href="/productos"
          linkLabel="Todo el catálogo"
        />

        <ul className="-mx-[var(--gutter)] flex snap-x snap-mandatory gap-3 overflow-x-auto px-[var(--gutter)] pb-1 scrollbar-hide sm:mx-0 sm:grid sm:grid-cols-3 sm:px-0 lg:grid-cols-5">
          {segments.map((seg) => {
            const empty = seg.total === 0
            const href = empty
              ? whatsappHref(
                  `Hola Intemperie, necesito cercado ${seg.name.toLowerCase()}: ${seg.who.toLowerCase()}.`,
                )
              : `/productos?category=${seg.slug}`

            return (
              <li key={seg.slug} className="w-[46vw] shrink-0 snap-start sm:w-auto">
                <Link
                  href={href}
                  {...(empty
                    ? { target: "_blank", rel: "noopener noreferrer" }
                    : {})}
                  className="group relative flex aspect-[3/4] flex-col justify-end overflow-hidden rounded-lg bg-brand-navy-deep"
                >
                  {seg.image ? (
                    <Image
                      src={seg.image}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 46vw, (max-width: 1024px) 31vw, 237px"
                      className="object-cover object-center opacity-80 transition-transform duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div
                      className="absolute inset-0 mesh-rule opacity-25"
                      aria-hidden="true"
                    />
                  )}

                  <div
                    className="absolute inset-0 bg-gradient-to-t from-brand-navy-deep via-brand-navy-deep/55 to-transparent"
                    aria-hidden="true"
                  />

                  <div className="relative p-3">
                    <h3 className="text-sm leading-tight font-bold text-on-dark">
                      {seg.name}
                    </h3>
                    <p className="mt-0.5 text-xs leading-snug text-on-dark-soft">
                      {seg.who}
                    </p>
                    <p className="mt-2 text-2xs font-bold text-brand-green tabular-nums">
                      {empty
                        ? "Consultar por WhatsApp"
                        : `${seg.total} ${seg.total === 1 ? "modelo" : "modelos"}${
                            seg.from != null ? ` · desde $${seg.from.toFixed(2)}/m` : ""
                          }`}
                    </p>
                  </div>
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
