import Image from "next/image"
import Link from "next/link"

import { PROJECTS } from "@/app/nosotros/content" // solo lectura: lo posee /nosotros
import { SectionHeader } from "@/components/home/section"

/* Obras entregadas — sistema «Perímetro».
 *
 * Prueba social verificable, no testimonios: cada tarjeta es una obra real ya
 * publicada en `/nosotros#obras`, con lugar, mes de entrega, metros y modelo.
 * Mismo criterio que `NewArrivals`: si el dato no da para una franja (menos de
 * dos obras), la sección no se pinta. Hoy `PROJECTS` está vacío, así que esta
 * franja no aparece hasta que el cliente entregue obras documentadas.
 *
 * Componente de servidor; fotos en carga diferida: la franja vive bajo el
 * pliegue y no compite con el LCP del hero. */

/* «2026-03» → «marzo de 2026». Se ancla la fecha a UTC para que el mes no se
   deslice un día (y un mes) según la zona horaria del servidor. */
function deliveryMonth(deliveredOn: string): string {
  const [year, month] = deliveredOn.split("-").map(Number)
  return new Intl.DateTimeFormat("es-PA", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(Date.UTC(year, month - 1, 1)))
}

export function WorksStrip() {
  if (PROJECTS.length < 2) return null

  return (
    <section className="defer-paint border-b border-border bg-surface-sunk">
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          eyebrow="Obras entregadas"
          title="Cercas que ya están en pie"
          href="/nosotros#obras"
          linkLabel="Ver todas las obras"
        />
        <ul className="scrollbar-hide -mx-gutter flex snap-x gap-3 overflow-x-auto px-gutter pb-1">
          {PROJECTS.map((project) => (
            <li
              key={`${project.location}-${project.deliveredOn}`}
              className="w-64 shrink-0 snap-start"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-surface">
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  fill
                  sizes="256px"
                  loading="lazy"
                  className="object-cover"
                />
              </div>
              <p className="mt-2.5 text-sm font-semibold text-foreground">{project.location}</p>
              <p className="tabular mt-0.5 text-xs text-muted-foreground">
                Entregada en {deliveryMonth(project.deliveredOn)}
                {project.meters ? ` · ${project.meters} m` : ""}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {project.modelHref ? (
                  <Link
                    href={project.modelHref}
                    className="font-semibold text-brand-green-deep transition-colors hover:text-brand-green"
                  >
                    {project.model}
                  </Link>
                ) : (
                  project.model
                )}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
