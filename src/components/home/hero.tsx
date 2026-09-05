import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Factory, Search, ShieldCheck, Truck } from "lucide-react"

import { WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"
import { mediaUrl } from "@/lib/image-utils"

/* Portada, sección 1 — sistema «Perímetro».
 *
 * Aquí había un carrusel de cuatro diapositivas: componente de cliente, dos
 * `useEffect`, un `setInterval` de 5.5 s y cuatro fotografías a pantalla
 * completa. Se cambió por una sola imagen fija por tres razones, en este
 * orden:
 *
 * 1. **Comercial.** Una cerca no se compra por impulso: es ticket alto y
 *    decisión meditada. Un carrusel que rota cada 5.5 s obliga a leer contra
 *    reloj y reparte la atención entre cuatro modelos en lugar de plantear la
 *    única pregunta que importa —«¿cuánto cuesta cercar lo mío?»— y ofrecer
 *    las dos formas de responderla: buscar o preguntar por WhatsApp.
 * 2. **Rendimiento.** Las cuatro diapositivas eran `absolute inset-0`, así que
 *    el navegador las consideraba visibles y competían por ancho de banda con
 *    el LCP. Una imagen, una petición.
 * 3. **Accesibilidad.** Un carrusel con autoavance es un patrón que hay que
 *    pausar, anunciar y controlar por teclado. El que no existe no falla.
 *
 * El titular es la promesa con el precio dentro: «Cerque su terreno desde $X
 * el metro». El precio llega por prop desde la portada —contado del catálogo
 * en el momento de renderizar, no escrito a mano— y la etiqueta de categoría
 * («Cercas de PVC y malla electrosoldada») baja a la línea de contexto, que
 * es donde informa sin robarle el sitio a la promesa.
 *
 * Un solo botón sólido: «Calcular mi cerca». WhatsApp cierra ventas, pero es
 * el canal, no la acción; va en contorno. Y bajo los botones, tres señales
 * comprobables —garantía, envío, fábrica— para que la credencial se lea antes
 * del primer scroll, no en el pie.
 *
 * El buscador se repite aquí a propósito: en móvil la cabecera no tiene sitio
 * para un campo de texto usable, y este es el primer elemento interactivo de
 * la página. Es un `<form method="get">` — funciona sin JavaScript.
 */
export function Hero({
  priceFrom,
  warrantyYears,
}: {
  priceFrom: number | null
  warrantyYears: number | null
}) {
  const signals = [
    warrantyYears != null && {
      Icon: ShieldCheck,
      text: `Garantía hasta ${warrantyYears} años`,
    },
    { Icon: Truck, text: "Envío gratis (pedido mín. 10 m)" },
    { Icon: Factory, text: "Fábrica propia en Panamá Oeste" },
  ].filter(Boolean) as Array<{ Icon: typeof ShieldCheck; text: string }>

  return (
    <section className="border-b border-border bg-brand-navy-deep text-on-dark">
      <div className="shell grid gap-6 py-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:py-14">
        <div className="min-w-0">
          <p className="eyebrow text-brand-green">
            Fabricamos e instalamos en La Chorrera, Panamá
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance lg:text-5xl">
            {priceFrom != null ? (
              <>
                Cerque su terreno desde{" "}
                <span className="tabular">${priceFrom.toFixed(2)}</span> el
                metro
              </>
            ) : (
              <>Cerque su terreno con el precio por metro a la vista</>
            )}
          </h1>

          <p className="mt-3 max-w-prose text-base text-on-dark-soft">
            Cercas de PVC y malla electrosoldada con el precio a la vista. Sin
            visitas ni esperas: usted mira, calcula y pide.
          </p>

          <form action="/productos" method="get" role="search" className="mt-6">
            <label htmlFor="hero-search" className="sr-only">
              Buscar modelo, material o altura
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  id="hero-search"
                  type="search"
                  name="search"
                  enterKeyHint="search"
                  className="h-12 w-full rounded-lg border border-transparent bg-surface pr-3 pl-10 text-base text-foreground transition-colors placeholder:text-muted-foreground focus:border-primary"
                  placeholder="Ej.: malla, Atenea, PVC costero…"
                />
              </div>
              <button
                type="submit"
                className="h-12 shrink-0 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
              >
                Buscar
              </button>
            </div>
          </form>

          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/calculadora"
              className="flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
            >
              Calcular mi cerca
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a
              href={whatsappHref(WA_MESSAGE.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
            >
              <IconWhatsApp className="text-brand-green" />
              Cotizar por WhatsApp
            </a>
          </div>

          <ul className="mt-4 flex flex-wrap gap-x-5 gap-y-1.5 text-sm text-on-dark-soft">
            {signals.map(({ Icon, text }) => (
              <li key={text} className="flex items-center gap-1.5">
                <Icon
                  className="size-4 shrink-0 text-brand-green"
                  aria-hidden="true"
                />
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* La única imagen que descarga el primer viewport de la portada.
            `preload` es el sustituto de `priority` en Next 16. Relación de
            aspecto fija en ambos anchos: no hay salto de maquetación, y
            `bg-surface-2` da el tono de espera mientras la foto viaja.

            Entra directa, sin desvanecido: ésta es la candidata a LCP de la
            portada y animarle la opacidad retrasaría la métrica justo lo que
            durase el fundido. Un efecto de carga que hace ver la foto más
            tarde no es un efecto de carga, es una cortina. */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface-2 lg:aspect-[4/3]">
          <Image
            src={mediaUrl("/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg")}
            alt="Cerca de PVC blanca instalada en el frente de una vivienda"
            fill
            preload
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="object-cover object-center"
          />
        </div>
      </div>
    </section>
  )
}
