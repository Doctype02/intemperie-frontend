import Link from "next/link"
import { ArrowRight, Phone } from "lucide-react"

import { CONTACT, WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

/* Cierre de la portada — sistema «Perímetro».
 *
 * El cierre anterior tenía dos titulares del mismo peso —calculadora a un
 * lado, teléfono al otro— y obligaba a leer los dos para decidir. Ahora hay
 * UNA pregunta, la única que separa a los dos compradores que llegan hasta
 * aquí: «¿ya sabe cuántos metros tiene?». El que sabe, calcula; el que no,
 * pide la inspección en sitio. Dos salidas como respuesta directa, sin
 * segundo titular que compita.
 *
 * WhatsApp y el teléfono se conservan debajo, escritos: en Panamá, en ticket
 * alto, la llamada sigue cerrando ventas que el formulario no cierra. El
 * teléfono va con sus dígitos a la vista, no escondido detrás de un icono,
 * y con el horario al lado para que nadie llame a una oficina cerrada.
 *
 * El remate superior es `.picket-rule`: el listón de la cerca dibujado en CSS.
 * Cierra la página con la firma del sistema y cuesta cero peticiones.
 */
export function QuoteBand() {
  return (
    <section className="defer-paint bg-brand-navy-deep text-on-dark">
      <div className="picket-rule" aria-hidden="true" />

      <div className="shell py-10 sm:py-12 lg:py-14">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-balance sm:text-3xl">
            ¿Ya sabe cuántos metros tiene?
          </h2>
          <p className="mt-2 text-sm text-on-dark-soft">
            Si sabe sus metros, la calculadora le da el material y el total con
            ITBMS al instante. Si no, vamos a medir su terreno.
          </p>

          <div className="mt-6 flex flex-col items-center justify-center gap-2 sm:flex-row">
            <Link
              href="/calculadora"
              className="inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
            >
              Sí
              <ArrowRight className="size-4" aria-hidden="true" />
              Calcular mi cerca
            </Link>
            <Link
              href="/inspecciones"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
            >
              No
              <ArrowRight className="size-4" aria-hidden="true" />
              Pedir inspección en sitio
            </Link>
          </div>

          <div className="mt-8 border-t border-on-dark/15 pt-6">
            <p className="eyebrow text-brand-green">
              O hable con quien fabrica la cerca
            </p>
            <div className="mt-3 flex flex-col items-center justify-center gap-2 sm:flex-row">
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
            <p className="mt-3 text-sm text-on-dark-soft">
              {CONTACT.hours}. Fábrica en {CONTACT.city}.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
