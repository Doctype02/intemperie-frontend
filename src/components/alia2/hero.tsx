import Image from "next/image";
import { Building2, Handshake, ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import { ALIA2_ANCHOR, HERO, INTRO } from "./content";
import { FOCUS_RING, TAP_TARGET } from "./theme";

/**
 * Cabecera de la landing: distintivo del programa, título y llamada a la acción
 * que baja al formulario. Componente de servidor: no necesita interactividad.
 */
export function Alia2Hero() {
  return (
    <section
      aria-labelledby="alia2-hero-title"
      className="relative overflow-hidden bg-[var(--a2-navy)] text-white"
    >
      {/* Halos decorativos: puramente ornamentales, ocultos a lectores de pantalla. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-32 -left-24 h-72 w-72 rounded-full bg-white/5 blur-3xl" />
        <div className="absolute -bottom-40 right-1/3 h-96 w-96 rounded-full bg-[var(--a2-orange)]/10 blur-3xl" />
      </div>

      {/* Banda superior del programa (como en el diseño aprobado). */}
      <div className="relative border-b border-white/10 bg-[var(--a2-navy-deep)]/60">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-x-8 gap-y-2 px-4 py-3 sm:px-6 lg:justify-end">
          <p className="flex items-center gap-2 text-[11px] leading-tight tracking-wide sm:text-xs">
            <Handshake aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--a2-orange)]" />
            <span>
              <span className="font-bold">{HERO.eyebrowLeft}</span>
              <span className="block text-white/70">{HERO.eyebrowLeftSub}</span>
            </span>
          </p>
          <span aria-hidden="true" className="hidden h-8 w-px bg-white/15 lg:block" />
          <p className="flex items-center gap-2 text-[11px] leading-tight tracking-wide sm:text-xs">
            <Building2 aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--a2-orange)]" />
            <span>
              <span className="font-bold">{HERO.eyebrowRight}</span>
              <span className="block text-white/70">{HERO.eyebrowRightSub}</span>
            </span>
          </p>
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-2 lg:items-center lg:gap-12 lg:py-20">
        <div>
          <h1
            id="alia2-hero-title"
            className="text-3xl font-extrabold leading-[1.1] tracking-tight sm:text-4xl lg:text-5xl"
          >
            {HERO.titleLead}
            <span className="mt-1 block">
              <span className="text-[var(--a2-orange)]">{HERO.titleBrand}</span> {HERO.titleTail}
            </span>
          </h1>

          <p className="mt-6 inline-flex items-start gap-2 rounded-full bg-[var(--a2-orange)] px-4 py-2.5 text-sm font-semibold text-white sm:items-center">
            <Building2 aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0 sm:mt-0" />
            {HERO.badge}
          </p>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 sm:text-lg">
            {HERO.description}
          </p>

          <a
            href={`#${ALIA2_ANCHOR}`}
            data-track="alia2-submit"
            data-track-location="hero"
            className={cn(
              "mt-8 inline-flex items-center justify-center gap-2 rounded-xl bg-[var(--a2-orange)] px-6 text-base font-bold text-white transition-colors hover:bg-[var(--a2-orange-strong)]",
              TAP_TARGET,
              FOCUS_RING,
              "focus-visible:outline-white",
            )}
          >
            {HERO.cta}
            <ArrowRight aria-hidden="true" className="h-5 w-5" />
          </a>
        </div>

        {/* Imagen con proporción fija: evita saltos de diseño (CLS). */}
        <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl bg-[var(--a2-navy-soft)] lg:aspect-[5/4]">
          <Image
            src="/products/cerca-pvc-vesta-601/vesta-1.jpg"
            alt="Cerramiento instalado por una empresa aliada de Intemperie en Panamá"
            fill
            sizes="(max-width: 1024px) 100vw, 45vw"
            className="object-cover"
            priority
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-gradient-to-tr from-[var(--a2-navy)]/70 via-transparent to-transparent"
          />
        </div>
      </div>

      {/* Descripción larga del programa, sobre banda naranja/oscura. */}
      <div className="relative border-t border-white/10 bg-[var(--a2-navy-deep)]">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:py-12">
          <p className="text-sm font-bold uppercase tracking-wide text-[var(--a2-orange)]">
            {INTRO.eyebrow}
          </p>
          <p className="mt-3 max-w-4xl text-base leading-relaxed text-white/85 sm:text-lg">
            {INTRO.body}
          </p>
        </div>
      </div>
    </section>
  );
}
