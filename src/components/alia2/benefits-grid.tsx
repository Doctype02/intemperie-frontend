import { Clock, GraduationCap, HardHat, Percent, RefreshCw, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { BENEFITS, type BenefitIcon } from "./content";

const ICONS: Record<BenefitIcon, LucideIcon> = {
  discount: Percent,
  repurchase: RefreshCw,
  quote: Clock,
  training: GraduationCap,
  freight: Truck,
  labor: HardHat,
};

/** Rejilla de beneficios del programa. */
export function Alia2Benefits() {
  return (
    <section
      aria-labelledby="alia2-beneficios-title"
      id="beneficios"
      className="scroll-mt-24 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <h2
        id="alia2-beneficios-title"
        className="text-center text-xl font-extrabold tracking-tight text-[var(--a2-navy)] sm:text-2xl"
      >
        Beneficios que impulsan tu negocio
      </h2>

      <ul className="mt-6 grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3 lg:grid-cols-6">
        {BENEFITS.map((benefit) => {
          const Icon = ICONS[benefit.icon];
          return (
            <li key={benefit.icon} className="flex flex-col items-center gap-2.5 text-center">
              <Icon aria-hidden="true" className="h-8 w-8 text-[var(--a2-navy)]" strokeWidth={1.5} />
              <span className="text-xs font-semibold leading-snug text-gray-700 sm:text-sm">
                {benefit.title}
              </span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
