import type { ReactNode } from "react";

/* Plantilla de página legal — /envios, /devoluciones, /privacidad, /terminos.
 * Cabecera navy con la firma del sistema, índice lateral sticky en escritorio
 * (la columna que antes quedaba vacía pasa a ser navegación) y prosa
 * tokenizada en una medida de lectura de 42rem. */

export interface LegalSection {
  /** Ancla, p.ej. "cobertura". */
  id: string;
  /** Título visible; se conserva el texto actual EXACTO. */
  title: string;
  children: ReactNode;
}

export function LegalPage({
  eyebrow,
  title,
  updated,
  intro,
  sections,
  footer,
}: {
  eyebrow: string;
  title: string;
  updated: string;
  intro?: ReactNode;
  sections: LegalSection[];
  footer?: ReactNode;
}) {
  return (
    <div>
      <div className="bg-brand-navy-deep text-on-dark">
        <div className="picket-rule" aria-hidden="true" />
        <div className="shell py-10 text-center sm:py-12 sm:text-left">
          <p className="eyebrow text-brand-green">{eyebrow}</p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-sm text-on-dark-soft">{updated}</p>
        </div>
      </div>

      <div className="shell grid gap-10 py-10 sm:py-12 lg:grid-cols-[14rem_minmax(0,42rem)] lg:gap-16">
        <nav aria-label="Secciones" className="hidden lg:block">
          <div className="sticky top-24">
            <p className="eyebrow text-muted-foreground">En esta página</p>
            <ul className="mt-3 space-y-2">
              {sections.map((s) => (
                <li key={s.id}>
                  <a
                    href={`#${s.id}`}
                    className="block text-sm text-muted-foreground transition-colors hover:text-brand-green-deep"
                  >
                    {s.title}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </nav>

        <div>
          {intro && <div className="mb-10">{intro}</div>}
          <div className="space-y-8">
            {sections.map((s) => (
              <section
                key={s.id}
                id={s.id}
                className="scroll-mt-24 border-t border-border pt-8 first:border-t-0 first:pt-0"
              >
                <h2 className="text-xl font-bold text-foreground">{s.title}</h2>
                <div className="mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground [&_a]:font-semibold [&_a]:text-brand-green-deep [&_a]:underline [&_a]:underline-offset-2 [&_strong]:font-semibold [&_strong]:text-foreground">
                  {s.children}
                </div>
              </section>
            ))}
          </div>
          {footer && (
            <div className="mt-12 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
