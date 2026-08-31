import Image from "next/image"
import Link from "next/link"
import type { Metadata } from "next"
import { ArrowRight, Check, HardHat } from "lucide-react"

import { Footer } from "@/components/layout/footer"
import { Header } from "@/components/layout/header"
import { CONTACT } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

import {
  BENEFITS,
  CLOSING,
  FAQ,
  HERO,
  HIRING_NOTE,
  META,
  PHOTO,
  REQUIREMENTS,
  SECTIONS,
  STEPS,
} from "./content"

/* «Instaladores» — sistema «Perímetro».
 *
 * Esta página publicaba seis empresas con teléfono pulsable y enlace de
 * WhatsApp bajo el titular «Profesionales verificados por Intemperie». Los
 * seis teléfonos eran una serie consecutiva y los conteos de obra no salían de
 * ningún sitio: era la empresa afirmando algo sobre terceros que nadie había
 * comprobado. Quien llamaba a un número que no contesta no vuelve, y a partir
 * de ahí el precio por metro tampoco se cree.
 *
 * El directorio se retira entero, y con él el buscador por provincia y el
 * estado vacío del listado: un buscador sin nada detrás es la misma promesa
 * incumplida, sólo que más lenta de descubrir. La página se queda con el único
 * trabajo que hoy puede hacer de verdad —dar de alta instaladores— y vuelve a
 * pintar el directorio el día que `INSTALLERS` tenga fichas verificadas.
 *
 * Todo el texto sale de `content.ts`. Aquí no queda ni un dato: si mañana el
 * plazo de revisión pasa de cinco días a diez, se cambia allí y no se abre
 * este archivo. También se han ido las estrellas y los conteos de obra; el
 * tipo `Installer` ya no tiene dónde meterlos.
 *
 * Cero hidratación: HTML de servidor de arriba abajo, como «nosotros».
 */

export const metadata: Metadata = {
  title: META.title,
  description: META.description,
  alternates: { canonical: "/instaladores" },
}

/* ── Primitivas de maquetación ───────────────────────────────────────────
   Las mismas cuatro decisiones —canalón, ritmo vertical, superficie y línea
   de cierre— declaradas una vez. La superficie alterna para que seis bloques
   seguidos de texto no se lean como una sola mancha. */
function Section({
  children,
  surface = "base",
  id,
}: {
  children: React.ReactNode
  surface?: "base" | "raised" | "sunk"
  id?: string
}) {
  const bg = {
    base: "bg-background",
    raised: "bg-surface",
    sunk: "bg-surface-sunk",
  }[surface]

  return (
    <section id={id} className={`defer-paint border-b border-border ${bg}`}>
      <div className="shell py-10 sm:py-12 lg:py-14">{children}</div>
    </section>
  )
}

function SectionHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub?: string }) {
  return (
    <div className="mb-6 max-w-prose">
      {/* El verde profundo lee bien sobre papel, pero en modo oscuro cae a la
          misma luminosidad que la superficie y el antetítulo se borra. Ahí
          manda el verde claro, que es el que el sistema sube para el sustrato
          oscuro. Los dos son tokens: el literal seguiría sin resolverse. */}
      <p className="eyebrow text-brand-green-deep dark:text-brand-green">{eyebrow}</p>
      <h2 className="mt-1 text-2xl font-bold tracking-tight text-balance text-foreground sm:text-3xl">
        {title}
      </h2>
      {sub && <p className="mt-2 text-sm text-muted-foreground">{sub}</p>}
    </div>
  )
}

/* ── Página ──────────────────────────────────────────────────────────────── */
export default function InstaladoresPage() {
  return (
    <>
      <Header />

      {/* Ancla del «Saltar al contenido» de la cabecera. */}
      <main id="main-content" tabIndex={-1} className="flex-1">
        {/* ── 1. El programa ───────────────────────────────────────────────
            Sin `defer-paint`: está en el primer viewport y aplazar su pintado
            retrasaría el LCP. */}
        <section className="border-b border-border bg-brand-navy-deep text-on-dark">
          <div className="shell grid gap-8 py-10 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-12 lg:py-16">
            <div className="min-w-0">
              <p className="eyebrow text-brand-green">{HERO.eyebrow}</p>

              <h1 className="mt-2 text-4xl font-bold tracking-tight text-balance lg:text-5xl">
                {HERO.title}
              </h1>

              <p className="mt-4 max-w-prose text-base text-on-dark-soft">{HERO.lead}</p>

              <p className="mt-3 max-w-prose text-sm text-on-dark-soft">{HERO.aside}</p>

              <div className="mt-6 flex flex-wrap gap-2">
                <Link
                  href="/instaladores/registro"
                  className="flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
                >
                  {HERO.cta}
                  <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
                <a
                  href={whatsappHref(CLOSING.askMessage)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
                >
                  <IconWhatsApp />
                  {CLOSING.askCta}
                </a>
              </div>
            </div>

            {/* Relación de aspecto fija en los dos anchos: la imagen reserva su
                sitio antes de descargarse y no hay salto de maquetación. */}
            <figure className="min-w-0">
              <div className="relative aspect-[16/10] overflow-hidden rounded-xl bg-surface-2 lg:aspect-[4/3]">
                <Image
                  src={PHOTO.src}
                  alt={PHOTO.alt}
                  fill
                  preload
                  sizes="(max-width: 1024px) 100vw, 46vw"
                  className="object-cover object-center"
                />
              </div>
              <figcaption className="mt-2 text-xs text-on-dark-soft">
                Modelo de catálogo{" "}
                <Link
                  href={PHOTO.href}
                  className="rounded-sm font-semibold text-on-dark underline underline-offset-4 transition-colors hover:text-brand-green"
                >
                  {PHOTO.model}
                </Link>
                . {PHOTO.note}
              </figcaption>
            </figure>
          </div>
        </section>

        {/* ── 2. Para quien buscaba instalador ─────────────────────────────
            El menú manda aquí a los dos públicos. El que quiere contratar ya no
            encuentra un listado, así que encuentra la vía que sí existe —y por
            qué el listado ya no está—, no un buscador que no devuelve nada. */}
        <section className="border-b border-border bg-surface-2">
          <div className="shell flex flex-col gap-3 py-5 sm:flex-row sm:items-start sm:gap-5">
            <div className="min-w-0 flex-1">
              <h2 className="flex items-center gap-2 text-sm font-bold text-foreground">
                <HardHat className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
                {HIRING_NOTE.title}
              </h2>
              <p className="mt-1 max-w-prose text-sm text-muted-foreground">{HIRING_NOTE.body}</p>
            </div>
            <a
              href={whatsappHref(HIRING_NOTE.message)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-11 shrink-0 items-center gap-2 rounded-lg border border-border-strong bg-surface px-4 font-heading text-sm font-semibold text-foreground transition-colors hover:bg-surface-sunk"
            >
              <IconWhatsApp />
              {HIRING_NOTE.cta}
            </a>
          </div>
        </section>

        {/* ── 3. Qué obtiene ──────────────────────────────────────────────── */}
        <Section surface="base">
          <SectionHead {...SECTIONS.benefits} />
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {BENEFITS.map((benefit) => (
              <li key={benefit.title} className="rounded-xl border border-border bg-surface p-5">
                {/* `bg-secondary` y no `bg-brand-green-soft`: en modo oscuro el
                    verde suave y el verde profundo caen a la misma luminosidad
                    y el icono desaparece dentro de su propia caja. */}
                <span className="flex size-11 items-center justify-center rounded-lg bg-secondary">
                  <benefit.Icon className="size-5 text-secondary-foreground" aria-hidden="true" />
                </span>
                <h3 className="mt-4 text-base font-bold text-foreground">{benefit.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{benefit.body}</p>
              </li>
            ))}
          </ul>
        </Section>

        {/* ── 4. Requisitos ───────────────────────────────────────────────── */}
        <Section surface="sunk">
          <SectionHead {...SECTIONS.requirements} />
          <ul className="max-w-prose space-y-3">
            {REQUIREMENTS.map((requirement) => (
              <li key={requirement} className="flex items-start gap-2.5">
                <Check className="mt-0.5 size-5 shrink-0 text-brand-green" aria-hidden="true" />
                <span className="text-sm text-foreground">{requirement}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/instaladores/registro"
            className="mt-6 inline-flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
          >
            {HERO.cta}
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </Section>

        {/* ── 5. Cómo funciona ────────────────────────────────────────────
            Lista ordenada de verdad: son cuatro pasos con un orden que importa,
            y el número que se ve es el mismo que anuncia el lector de pantalla. */}
        <Section surface="raised">
          <SectionHead {...SECTIONS.steps} />
          <ol className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <li key={step.num} className="border-t-2 border-brand-green pt-4">
                <p className="eyebrow text-brand-green-deep tabular dark:text-brand-green">
                  Paso {step.num}
                </p>
                <h3 className="mt-1 text-base font-bold text-foreground">{step.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground">{step.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        {/* ── 6. Preguntas frecuentes ─────────────────────────────────────
            Sin acordeón: son seis respuestas cortas, caben abiertas y así se
            buscan con Ctrl+F y las indexa el buscador. Cero JavaScript. */}
        <Section surface="base">
          <SectionHead {...SECTIONS.faq} />
          <dl className="grid gap-4 sm:grid-cols-2">
            {FAQ.map((item) => (
              <div key={item.q} className="rounded-xl border border-border bg-surface p-5">
                <dt className="text-sm font-bold text-foreground">{item.q}</dt>
                <dd className="mt-2 text-sm text-muted-foreground">{item.a}</dd>
              </div>
            ))}
          </dl>
        </Section>

        {/* ── 7. Cierre ───────────────────────────────────────────────────── */}
        <section className="defer-paint bg-brand-navy-deep text-on-dark">
          <div className="picket-rule" aria-hidden="true" />
          <div className="shell py-10 sm:py-12 lg:py-14">
            <div className="max-w-prose">
              <p className="eyebrow text-brand-green">{CLOSING.eyebrow}</p>
              <h2 className="mt-2 text-2xl font-bold tracking-tight text-balance sm:text-3xl">
                {CLOSING.title}
              </h2>
              <p className="mt-2 text-sm text-on-dark-soft">{CLOSING.body}</p>
            </div>

            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                href="/instaladores/registro"
                className="flex h-12 items-center gap-2 rounded-lg bg-primary px-5 font-heading font-semibold text-primary-foreground transition-colors hover:bg-brand-green-deep"
              >
                {CLOSING.cta}
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <a
                href={whatsappHref(CLOSING.askMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 bg-on-dark/10 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/20"
              >
                <IconWhatsApp />
                {CLOSING.askCta}
              </a>
              <a
                href={`${CONTACT.emailHref}?subject=${encodeURIComponent("Programa de instaladores")}`}
                className="flex h-12 items-center gap-2 rounded-lg border border-on-dark/45 px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-on-dark/10"
              >
                {CONTACT.email}
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
