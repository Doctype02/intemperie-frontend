import Link from "next/link"
import { Calculator, ChevronRight, ClipboardList, HardHat, type LucideIcon } from "lucide-react"

import { SectionHeader } from "@/components/home/section"

/* Banda de servicios — sistema «Perímetro».
 *
 * Tres rutas reales que hasta ahora solo vivían en la navegación: el
 * precotizador, la inspección en sitio y el programa de instaladores. Sin
 * promesas nuevas: el texto de instaladores usa las palabras exactas de los
 * beneficios ya publicados en `instaladores/content.ts` («Precio de
 * instalador», «Despacho con prioridad»).
 *
 * Componente de servidor sin props: los tres servicios son estáticos. */

const SERVICES: {
  href: string
  Icon: LucideIcon
  title: string
  body: string
  cta: string
}[] = [
  {
    href: "/calculadora",
    Icon: Calculator,
    title: "Precotizador",
    body: "Modelo + metros = total con ITBMS, con los precios del catálogo. Sin dejar el correo.",
    cta: "Calcular mi cerca",
  },
  {
    href: "/inspecciones",
    Icon: ClipboardList,
    title: "Inspección en sitio",
    body: "Un técnico levanta el terreno, dibuja el plano y confirma la medida antes de comprar.",
    cta: "Solicitar inspección",
  },
  {
    href: "/instaladores",
    Icon: HardHat,
    title: "Programa de instaladores",
    body: "Precio de instalador y despacho con prioridad para quien monta cercas por oficio.",
    cta: "Conocer el programa",
  },
]

export function ServicesBand() {
  return (
    <section className="defer-paint border-b border-border bg-surface">
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          eyebrow="Más que material"
          title="Tres maneras de empezar"
          sub="Calcule solo, pida que midan por usted, o instale con nosotros si es su oficio."
        />
        <ul className="grid gap-3 sm:grid-cols-3">
          {SERVICES.map(({ href, Icon, title, body, cta }) => (
            <li key={href}>
              <Link
                href={href}
                className="group flex h-full flex-col rounded-xl border border-border bg-surface-sunk p-5 transition-colors hover:border-brand-green"
              >
                <span className="flex size-11 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-5 text-secondary-foreground" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-brand-green-deep">
                  {title}
                </h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-green-deep">
                  {cta}
                  <ChevronRight
                    className="size-4 transition-transform group-hover:translate-x-0.5"
                    aria-hidden="true"
                  />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
