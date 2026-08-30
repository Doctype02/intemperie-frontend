import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Search, ShieldCheck } from "lucide-react"

import { WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

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
 * El buscador se repite aquí a propósito: en móvil la cabecera no tiene sitio
 * para un campo de texto usable, y este es el primer elemento interactivo de
 * la página. Es un `<form method="get">` — funciona sin JavaScript.
 */
export function Hero({
  priceFrom,
  modelCount,
  warrantyYears,
}: {
  priceFrom: number | null
  modelCount: number
  warrantyYears: number | null
}) {
  return (
    <section className="border-b border-border bg-brand-navy-deep text-on-dark">
      <div className="shell grid gap-6 py-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:py-14">
        <div className="min-w-0">
          <p className="eyebrow text-brand-green">Fabricación e instalación en Panamá</p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance lg:text-5xl">
            Cercas de PVC y malla electrosoldada
          </h1>

          <p className="mt-3 max-w-prose text-base text-on-dark-soft">
            Cercado perimetral para casas, naves, fincas e instituciones. Le
            decimos cuánto cuesta cercar su terreno con el precio por metro
            lineal delante, no después de una visita.
          </p>

          {/* Cifras leídas del catálogo, no escritas a mano. */}
          <dl className="mt-5 flex flex-wrap items-end gap-x-6 gap-y-3">
            {priceFrom != null && (
              <div>
                <dt className="eyebrow text-on-dark-soft">Desde</dt>
                <dd className="text-2xl font-bold tabular-nums">
                  ${priceFrom.toFixed(2)}
                  <span className="text-base font-medium text-on-dark-soft"> / metro</span>
                </dd>
              </div>
            )}
            <div className="border-l border-on-dark/20 pl-6">
              <dt className="eyebrow text-on-dark-soft">En catálogo</dt>
              <dd className="text-2xl font-bold tabular-nums">
                {modelCount}
                <span className="text-base font-medium text-on-dark-soft"> modelos</span>
              </dd>
            </div>
            {warrantyYears != null && (
              <div className="border-l border-on-dark/20 pl-6">
                <dt className="eyebrow text-on-dark-soft">Garantía</dt>
                <dd className="flex items-center gap-1.5 text-2xl font-bold tabular-nums">
                  <ShieldCheck className="size-5 text-brand-green" aria-hidden="true" />
                  hasta {warrantyYears}
                  <span className="text-base font-medium text-on-dark-soft"> años</span>
                </dd>
              </div>
            )}
          </dl>

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
            <a
              href={whatsappHref(WA_MESSAGE.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-12 items-center gap-2 rounded-lg bg-whatsapp px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-whatsapp-deep"
            >
              <IconWhatsApp />
              Cotizar por WhatsApp
            </a>
            <Link
              href="/calculadora"
              className="flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
            >
              Calcular metros
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        {/* La única imagen que descarga el primer viewport de la portada.
            `preload` es el sustituto de `priority` en Next 16. Relación de
            aspecto fija en ambos anchos: no hay salto de maquetación. */}
        <div className="relative aspect-[16/10] overflow-hidden rounded-xl lg:aspect-[4/3]">
          <Image
            src="/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg"
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
