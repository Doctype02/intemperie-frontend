import Link from "next/link"
import { Clock, MapPin, Building2 } from "lucide-react"

import { CONTACT, WA_MESSAGE } from "./nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

/* Barra superior — sistema «Perímetro».
 *
 * El azul de la referencia alia2: el sustrato de autoridad sobre el que se
 * apoya la marca. No lleva promociones ni cuenta atrás; lleva las tres cosas
 * que un cliente de obra comprueba antes de escribir: dónde estás, cuándo
 * atiendes y por dónde te escribo.
 *
 * Componente de servidor: no hay estado, no hay JS en el cliente. Y no se
 * pinta por debajo de `lg` — en móvil ese alto vale más para el buscador y el
 * botón de WhatsApp, que es la acción de verdad.
 */
export function TopBar() {
  return (
    <div className="hidden border-b border-on-dark/10 bg-brand-navy-deep text-on-dark-soft lg:block">
      <div className="shell flex h-9 items-center justify-between gap-6 text-xs">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <MapPin className="size-3.5 shrink-0 text-brand-green" aria-hidden="true" />
            {CONTACT.city}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="size-3.5 shrink-0 text-brand-green" aria-hidden="true" />
            {CONTACT.hours}
          </span>
        </div>

        <div className="flex items-center gap-5">
          {/* B2B en ámbar, como en alia2: un solo acento por barra. */}
          <Link
            href="/instaladores"
            className="eyebrow flex items-center gap-1.5 rounded-sm text-brand-amber transition-colors hover:text-on-dark"
          >
            <Building2 className="size-3.5 shrink-0" aria-hidden="true" />
            Programa para empresas
          </Link>

          <span aria-hidden="true" className="h-4 w-px bg-on-dark/20" />

          <a
            href={whatsappHref(WA_MESSAGE.general)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 rounded-sm font-semibold tabular-nums transition-colors hover:text-on-dark"
          >
            <IconWhatsApp className="text-brand-green" />
            {CONTACT.phoneDisplay}
          </a>
        </div>
      </div>
    </div>
  )
}
