import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"

import { CONTACT, WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

/* Cierre de la portada — sistema «Perímetro».
 *
 * Los dos cierres anteriores eran dos bandas casi idénticas, cada una con su
 * fotografía a 384 px: 160 kB de imagen para decir dos veces «cotiza». Aquí
 * hay una sola banda, sin fotografías, con las dos únicas salidas que la
 * empresa atiende de verdad: la calculadora (el cliente que ya sabe sus
 * metros) y WhatsApp o teléfono (el que no).
 *
 * El teléfono va escrito, no escondido detrás de un icono. En Panamá, en
 * ticket alto, la llamada sigue cerrando ventas que el formulario no cierra.
 *
 * El remate superior es `.picket-rule`: el listón de la cerca dibujado en CSS.
 * Cierra la página con la firma del sistema y cuesta cero peticiones.
 */
export function QuoteBand() {
  return (
    <section className="defer-paint bg-brand-navy-deep text-on-dark">
      <div className="picket-rule" aria-hidden="true" />

      <div className="shell grid gap-8 py-10 sm:py-12 lg:grid-cols-2 lg:gap-12 lg:py-14">
        <div className="min-w-0">
          <p className="eyebrow text-brand-green">Ya sabe cuánto mide su terreno</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Calcule su presupuesto en un minuto
          </h2>
          <p className="mt-2 max-w-prose text-sm text-on-dark-soft">
            Metros lineales, modelo y altura. La calculadora devuelve el
            material que hace falta y lo que cuesta, con el precio por metro
            del catálogo. Sin dejar el correo y sin esperar a nadie.
          </p>
          <Link
            href="/calculadora"
            className="mt-5 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
          >
            Abrir la calculadora
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="min-w-0 border-t border-on-dark/15 pt-8 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-12">
          <p className="eyebrow text-brand-green">O prefiere que le digan</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            Hable con quien fabrica la cerca
          </h2>
          <p className="mt-2 max-w-prose text-sm text-on-dark-soft">
            Díganos qué quiere cercar y le decimos el modelo, la altura y el
            precio. {CONTACT.hours}. Fábrica en {CONTACT.city}.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <a
              href={whatsappHref(WA_MESSAGE.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-whatsapp px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-whatsapp-deep"
            >
              <IconWhatsApp />
              Escribir por WhatsApp
            </a>
            <a
              href={CONTACT.phoneHref}
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
            >
              <Phone className="size-4" aria-hidden="true" />
              {CONTACT.phoneDisplay}
            </a>
          </div>
        </div>
      </div>
    </section>
  )
}
