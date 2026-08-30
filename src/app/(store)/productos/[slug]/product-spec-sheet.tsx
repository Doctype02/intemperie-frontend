import { Ruler, Palette, ShieldCheck, Layers } from "lucide-react";
import type { ProductView, SpecRow } from "./product-view";

/* Ficha técnica.
 *
 * Componente de servidor: la tabla que decide la compra no cuesta un solo byte
 * de JavaScript ni espera a la hidratación para leerse.
 */

/** Las claves que se pintan como etiquetas sueltas y no como texto corrido. */
const CHIP_KEYS = new Set(["altura", "colores"]);

const HIGHLIGHT_ICONS: Record<string, typeof Ruler> = {
  altura: Ruler,
  colores: Palette,
  garantia: ShieldCheck,
  material: Layers,
};

/**
 * Tira de datos destacados: lo que un comprador de cercas mira antes que el
 * precio. Va bajo el título, visible sin desplazarse.
 */
export function ProductHighlights({ highlights }: { highlights: SpecRow[] }) {
  if (highlights.length === 0) return null;

  return (
    <dl className="flex flex-wrap gap-x-5 gap-y-2">
      {highlights.map((row) => {
        const Icon = HIGHLIGHT_ICONS[row.key];
        return (
          <div key={row.key} className="flex items-baseline gap-1.5 text-sm">
            {Icon && (
              <Icon className="size-3.5 shrink-0 translate-y-0.5 text-brand-green" aria-hidden="true" />
            )}
            <dt className="text-muted-foreground">{row.label}:</dt>
            <dd className="font-semibold text-foreground">{row.value}</dd>
          </div>
        );
      })}
    </dl>
  );
}

function Chips({ values }: { values: string[] }) {
  return (
    <span className="flex flex-wrap gap-1.5">
      {values.map((value) => (
        <span
          key={value}
          className="inline-flex items-center rounded-md border border-hairline bg-surface-2 px-2 py-0.5 text-xs font-semibold text-foreground tabular-nums"
        >
          {value}
        </span>
      ))}
    </span>
  );
}

export function ProductSpecSheet({ product }: { product: ProductView }) {
  if (product.specs.length === 0) return null;

  return (
    <section aria-labelledby="ficha-tecnica" className="rounded-xl border border-hairline bg-surface">
      <div className="border-b border-hairline px-4 py-4 sm:px-5">
        <h2 id="ficha-tecnica" className="font-heading text-lg font-bold text-foreground">
          Ficha técnica
        </h2>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Datos de fábrica de {product.name}
          {product.collectionName ? ` · colección ${product.collectionName}` : ""}
        </p>
      </div>

      <dl className="divide-y divide-hairline">
        {product.specs.map((row) => (
          <div
            key={row.key}
            className="grid grid-cols-[minmax(6.5rem,34%)_1fr] items-baseline gap-3 px-4 py-3 sm:px-5"
          >
            <dt className="text-sm text-muted-foreground">{row.label}</dt>
            <dd className="text-sm font-semibold text-foreground">
              {CHIP_KEYS.has(row.key) ? (
                <Chips values={row.value.split(/\s*[·,]\s*/).filter(Boolean)} />
              ) : (
                row.value
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
