import Link from "next/link";
import { ArrowRight, CheckCircle2, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import { ALIA2_ANCHOR, TIERS, TIERS_COPY, type TierAccent } from "./content";
import { FOCUS_RING, TAP_TARGET } from "./theme";

/** Clases literales por nivel: Tailwind necesita ver la cadena completa. */
const ACCENT: Record<
  TierAccent,
  {
    header: string;
    name: string;
    tagline: string;
    rule: string;
    bullet: string;
    shield: string;
    cta: string;
  }
> = {
  blue: {
    header: "bg-[var(--a2-navy)]",
    name: "text-[var(--a2-navy)]",
    tagline: "text-[var(--a2-blue)]",
    rule: "bg-[var(--a2-blue)]",
    bullet: "text-[var(--a2-blue)]",
    shield: "text-[var(--a2-navy)]",
    cta: "border-[var(--a2-navy)] text-[var(--a2-navy)] hover:bg-[var(--a2-navy)] hover:text-white",
  },
  teal: {
    header: "bg-[var(--a2-teal)]",
    name: "text-[var(--a2-teal)]",
    tagline: "text-[var(--a2-teal)]",
    rule: "bg-[var(--a2-teal)]",
    bullet: "text-[var(--a2-teal)]",
    shield: "text-[var(--a2-teal)]",
    cta: "border-[var(--a2-teal)] text-[var(--a2-teal)] hover:bg-[var(--a2-teal)] hover:text-white",
  },
  orange: {
    header: "bg-[var(--a2-orange)]",
    name: "text-[var(--a2-orange-strong)]",
    tagline: "text-[var(--a2-orange-strong)]",
    rule: "bg-[var(--a2-orange)]",
    bullet: "text-[var(--a2-orange)]",
    shield: "text-[var(--a2-orange-strong)]",
    cta: "border-[var(--a2-orange)] text-[var(--a2-orange-strong)] hover:bg-[var(--a2-orange)] hover:text-white",
  },
};

/** Los tres niveles del programa, con sus ventajas. */
export function Alia2Tiers() {
  return (
    <section aria-labelledby="alia2-niveles-title" className="scroll-mt-24" id="niveles">
      <h2
        id="alia2-niveles-title"
        className="text-center text-2xl font-extrabold tracking-tight text-[var(--a2-navy)] sm:text-3xl"
      >
        {TIERS_COPY.title}
      </h2>

      <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {TIERS.map((tier) => {
          const accent = ACCENT[tier.accent];
          return (
            <li
              key={tier.id}
              className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm"
            >
              <div className={cn("flex items-center justify-center py-5", accent.header)}>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/15">
                  <ShieldCheck aria-hidden="true" className="h-7 w-7 text-white" />
                </span>
              </div>

              <div className="px-5 pb-6 pt-5 text-center">
                <h3 className={cn("text-xl font-extrabold tracking-tight sm:text-2xl", accent.name)}>
                  {tier.name}
                </h3>
                <p className={cn("mt-1 text-sm font-semibold", accent.tagline)}>{tier.tagline}</p>
                <span aria-hidden="true" className={cn("mx-auto mt-4 block h-0.5 w-24", accent.rule)} />

                <ul className="mt-5 space-y-3 text-left">
                  {tier.bullets.map((bullet) => (
                    <li key={bullet} className="flex items-start gap-2.5">
                      <CheckCircle2
                        aria-hidden="true"
                        className={cn("mt-0.5 h-4 w-4 shrink-0", accent.bullet)}
                      />
                      <span className="text-sm leading-snug text-gray-700">{bullet}</span>
                    </li>
                  ))}
                </ul>

                {/* Baja al formulario con el nivel ya preseleccionado: la URL
                    queda compartible (`?nivel=pro#solicitud`). */}
                <Link
                  href={`/alia2?nivel=${tier.level.toLowerCase()}#${ALIA2_ANCHOR}`}
                  data-track="alia2-submit"
                  data-track-location={`tier-${tier.level.toLowerCase()}`}
                  aria-label={TIERS_COPY.ctaLabel(tier.name)}
                  className={cn(
                    "mt-6 inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 px-4 text-sm font-bold transition-colors",
                    TAP_TARGET,
                    FOCUS_RING,
                    accent.cta,
                  )}
                >
                  {TIERS_COPY.cta}
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </Link>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
