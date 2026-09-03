import type { ReactNode } from "react";
import { Breadcrumbs, type Crumb } from "@/components/shared/breadcrumbs";

/* Cabecera de página — codifica los dos patrones ya aprobados:
 * `light` es la banda bg-surface de /productos; `navy` es la banda
 * bg-brand-navy-deep con .picket-rule de /calculadora. */

export function PageHeader({
  eyebrow,
  title,
  sub,
  crumbs,
  tone = "light",
  children,
}: {
  eyebrow?: string;
  title: string;
  sub?: ReactNode;
  crumbs?: Crumb[];
  tone?: "light" | "navy";
  children?: ReactNode;
}) {
  if (tone === "navy") {
    return (
      <div className="bg-brand-navy-deep text-on-dark">
        <div className="picket-rule" aria-hidden="true" />
        <div className="shell py-8 sm:py-10">
          {crumbs && <Breadcrumbs items={crumbs} tone="dark" className="mb-3" />}
          {eyebrow && <p className="eyebrow text-brand-green">{eyebrow}</p>}
          <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">{title}</h1>
          {sub && <p className="mt-3 max-w-prose text-sm text-on-dark-soft">{sub}</p>}
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="border-b border-border bg-surface">
      <div className="shell py-5 sm:py-6">
        {crumbs && <Breadcrumbs items={crumbs} className="mb-3" />}
        {eyebrow && <p className="eyebrow text-muted-foreground">{eyebrow}</p>}
        <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
        {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
        {children}
      </div>
    </div>
  );
}
