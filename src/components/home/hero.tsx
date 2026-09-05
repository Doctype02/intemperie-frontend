import Image from "next/image"

import { mediaUrl } from "@/lib/image-utils"
import { formatMoney } from "@/lib/utils"

import { HeroCounter, type HeroModel } from "./hero-counter"

/* Portada, sección 1 — «el contador cotizado», sistema «Perímetro».
 *
 * La portada se reconstruye alrededor de la respuesta («¿cuánto me cuesta?»),
 * no de la búsqueda. El hero anterior planteaba la pregunta y ofrecía un
 * buscador; este la CONTESTA: el precio real más barato del catálogo en cuerpo
 * de cartel, una cota de plano que lo rotula («1 m instalado en su terreno»)
 * y una cinta métrica que lo convierte en el precio de SU lote. El buscador
 * baja al cajetín (ValueStrip), que es donde se busca en una lámina técnica.
 *
 * Es un componente de servidor. La única isla de la portada es
 * `<HeroCounter>`, y su HTML se sirve renderizado: sin JavaScript se ve la
 * cifra del modelo más barato, el range nativo se arrastra y el CTA lleva a
 * `/calculadora?metros=10`.
 *
 * El H1 ya no es la etiqueta «Cercas de PVC y malla electrosoldada»: esa frase
 * vive en la línea de contexto. El H1 es la tesis de la casa.
 *
 * La foto del hero se conserva en el primer viewport, pero enmarcada tras
 * `.picket-screen`: la obra vista entre los listones de la propia cerca, con
 * su cota de plano debajo. En móvil va DESPUÉS del bloque contador — la cifra
 * manda.
 */
export function Hero({
  models,
  priceFrom,
}: {
  /* Los 15 del catálogo ordenados por precio ascendente (los deriva page.tsx). */
  models: HeroModel[]
  /* Precio de entrada como cadena decimal; respaldo si el catálogo llega vacío. */
  priceFrom: string
}) {
  return (
    <section className="sheet-grid border-b border-border bg-brand-navy-deep text-on-dark">
      <div className="shell py-8 sm:py-10 lg:py-12">
        <div className="max-w-3xl">
          <p className="eyebrow text-brand-green">
            Fabricamos e instalamos en La Chorrera, Panamá
          </p>

          <h1 className="mt-2 text-3xl font-bold tracking-tight text-balance text-on-dark sm:text-4xl lg:text-5xl">
            Sepa hoy cuánto cuesta cercar su terreno
          </h1>

          <p className="mt-3 max-w-prose text-base text-on-dark-soft">
            Cercas de PVC y malla electrosoldada con el precio por metro
            delante, no después de una visita.
          </p>
        </div>

        <div className="mt-6">
          {models.length > 0 ? (
            <HeroCounter models={models} />
          ) : (
            /* Respaldo sin isla: el precio de entrada, server-rendered. */
            <p className="flex items-baseline gap-2">
              <span className="tabular text-display font-bold text-on-dark">
                {formatMoney(priceFrom)}
              </span>
              <span className="text-xl font-medium text-brand-green">/metro</span>
            </p>
          )}
        </div>

        {/* La foto de siempre, ahora vista entre listones. Sigue siendo la
            única imagen del primer viewport y entra sin fundido: es la del
            LCP anterior y no se le pone cortina. */}
        <figure className="mt-8">
          <div className="relative h-36 overflow-hidden rounded-lg bg-surface-2 sm:h-48">
            <Image
              src={mediaUrl("/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg")}
              alt="Cerca de PVC blanca instalada en el frente de una vivienda"
              fill
              preload
              sizes="(max-width: 1280px) 100vw, 1216px"
              className="object-cover object-center"
            />
            <div className="picket-screen" aria-hidden="true" />
          </div>
          <figcaption className="mx-auto mt-3 max-w-sm">
            <span className="cota">
              <span className="bg-brand-navy-deep px-2">
                así se ve un tramo instalado
              </span>
            </span>
          </figcaption>
        </figure>
      </div>
    </section>
  )
}
