import { Lock, ShieldCheck, Users } from "lucide-react";
import type { LucideIcon } from "lucide-react";

import { TRUST_ITEMS, type TrustIcon } from "./content";

const ICONS: Record<TrustIcon, LucideIcon> = {
  shield: ShieldCheck,
  users: Users,
  lock: Lock,
};

/** Banda de confianza en azul marino, al pie del bloque de contenido. */
export function Alia2TrustBand() {
  return (
    <section
      aria-labelledby="alia2-confianza-title"
      className="rounded-2xl bg-[var(--a2-navy)] px-5 py-7 text-white sm:px-7"
    >
      <h2 id="alia2-confianza-title" className="sr-only">
        Por qué confiar en el programa ALIA2
      </h2>

      <ul className="grid gap-6 sm:grid-cols-3 sm:gap-5">
        {TRUST_ITEMS.map((item, index) => {
          const Icon = ICONS[item.icon];
          return (
            <li
              key={item.icon}
              className={
                index === 0
                  ? "flex items-start gap-3"
                  : "flex items-start gap-3 sm:border-l sm:border-white/15 sm:pl-5"
              }
            >
              <Icon aria-hidden="true" className="h-7 w-7 shrink-0 text-white/90" strokeWidth={1.5} />
              <div>
                <h3 className="text-sm font-bold">{item.title}</h3>
                <p className="mt-1 text-xs leading-relaxed text-white/70">{item.description}</p>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
