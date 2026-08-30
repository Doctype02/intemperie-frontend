import Link from "next/link"
import { Clock, MapPin, Building2 } from "lucide-react"

import { CONTACT, WA_MESSAGE } from "./nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

/* Banda comercial — sistema «Perímetro».
 *
 * La referencia panameña (carbonestore.com) mantiene una banda de contacto
 * pegada arriba en todo momento. Es lo que separa una ferretería que vende de
 * un catálogo que se mira: cuando el visitante decide preguntar, el teléfono
 * ya está en pantalla y no hay que ir a buscarlo al pie.
 *
 * Tres decisiones respecto a lo que había:
 *
 * 1. **Permanente.** La barra anterior se plegaba a `max-h-0` al bajar 8 px.
 *    El dato comercial desaparecía justo cuando el visitante empezaba a leer
 *    producto, que es cuando hace falta.
 * 2. **Con teléfono en móvil.** Antes el número sólo se pintaba a partir de
 *    `md`. La mayoría del tráfico es móvil y es donde un `tel:` de verdad
 *    llama. Ahora el número es lo primero de la banda en cualquier ancho.
 * 3. **Sin promesas sin respaldo.** La barra anterior anunciaba «envío gratis
 *    en pedidos mayores a $50». No hay ninguna política de envío verificada
 *    detrás de esa cifra, y una cerca se vende por metro lineal con transporte
 *    a obra: prometerlo en cabecera es crear una expectativa que el vendedor
 *    tiene que desmontar por WhatsApp. Se sustituye por lo que sí es cierto y
 *    comprobable: quién atiende, cuándo y desde dónde.
 *
 * Componente de servidor: sin estado, sin escuchas de scroll, cero JavaScript
 * en el cliente. Antes esta barra vivía dentro de una cabecera `"use client"`
 * de 700 líneas y se hidrataba entera para no hacer nada.
 */
export function CommercialBand() {
  return (
    <div className="border-b border-on-dark/10 bg-brand-navy-deep text-on-dark-soft">
      <div className="shell flex h-8 items-center justify-between gap-3 text-xs lg:h-9">
        {/* Móvil: el teléfono manda y va primero. Escritorio: cede el sitio a
            la ubicación y el horario, porque el número se repite a la derecha
            junto a la acción de WhatsApp. */}
        <a
          href={CONTACT.phoneHref}
          className="flex items-center gap-1.5 rounded-sm font-semibold tabular-nums transition-colors hover:text-on-dark lg:hidden"
        >
          <IconWhatsApp className="text-brand-green" />
          {CONTACT.phoneDisplay}
        </a>

        <div className="hidden items-center gap-5 lg:flex">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-brand-green" aria-hidden="true" />
            {CONTACT.city}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-brand-green" aria-hidden="true" />
            {CONTACT.hours}
          </span>
        </div>

        <div className="flex min-w-0 items-center gap-5">
          {/* B2B en ámbar, como en alia2: un solo acento por barra. */}
          <Link
            href="/instaladores"
            className="eyebrow hidden items-center gap-1.5 rounded-sm text-brand-amber transition-colors hover:text-on-dark lg:flex"
          >
            <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
            Programa para empresas
          </Link>

          <span aria-hidden="true" className="hidden h-4 w-px bg-on-dark/20 lg:block" />

          {/* En móvil este enlace es el horario (dato, no promesa); a partir de
              `lg` es el número otra vez, ya junto al resto del bloque de
              contacto. Un solo elemento, dos lecturas según el ancho. */}
          <span className="truncate text-2xs tracking-normal lg:hidden">
            {CONTACT.hours}
          </span>
          <a
            href={whatsappHref(WA_MESSAGE.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-1.5 rounded-sm font-semibold tabular-nums transition-colors hover:text-on-dark lg:flex"
          >
            <IconWhatsApp className="text-brand-green" />
            {CONTACT.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  )
}
