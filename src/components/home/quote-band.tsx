import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"

import { CONTACT, WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

/* Cierre de la portada — sistema «Perímetro».
 *
 * El perímetro se cierra donde se abrió: navy con la rejilla de lámina, como
 * el hero. Un solo H2 —el cierre anterior tenía dos compitiendo— y es una
 * pregunta con dos respuestas posibles, que son las dos únicas salidas que la
 * empresa atiende de verdad: quien ya sabe sus metros va a la calculadora;
 * quien no, pide que un técnico los mida en sitio.
 *
 * El teléfono va escrito, no escondido detrás de un icono. En Panamá, en
 * ticket alto, la llamada sigue cerrando ventas que el formulario no cierra.
 *
 * El remate superior es `.picket-rule`: el listón de la cerca dibujado en CSS.
 */
export function QuoteBand() {
  return (
    <section className="defer-paint sheet-grid bg-brand-navy-deep text-on-dark">
      <div className="picket-rule" aria-hidden="true" />

      <div className="shell py-10 sm:py-12 lg:py-14">
        <div className="max-w-2xl">
          <p className="eyebrow text-brand-green">El último paso</p>
          <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            ¿Ya sabe cuántos metros tiene?
          </h2>
          <p className="mt-2 max-w-prose text-sm text-on-dark-soft">
            Si los sabe, la calculadora le da el total con los precios del
            catálogo, sin dejar el correo. Si no, un técnico levanta el terreno,
            dibuja el plano y confirma la medida antes de comprar.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            <Link
              href="/calculadora"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
            >
              Sí <ArrowRight className="size-4" aria-hidden="true" /> Calcular mi cerca
            </Link>
            <Link
              href="/inspecciones"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
            >
              No <ArrowRight className="size-4" aria-hidden="true" /> Pedir inspección en sitio
            </Link>
          </div>

          <div className="mt-6 flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-on-dark/15 pt-5">
            <a
              href={whatsappHref(WA_MESSAGE.quote)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-11 items-center gap-2 rounded-lg bg-whatsapp px-4 font-heading font-semibold text-on-dark transition-colors hover:bg-whatsapp-deep"
            >
              <IconWhatsApp />
              Escribir por WhatsApp
            </a>
            <a
              href={CONTACT.phoneHref}
              className="inline-flex h-11 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-4 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
            >
              <Phone className="size-4" aria-hidden="true" />
              <span className="tabular">{CONTACT.phoneDisplay}</span>
            </a>
            <p className="text-xs text-on-dark-soft">
              {CONTACT.hours}. Fábrica en {CONTACT.city}.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
