import Image from "next/image"
import Link from "next/link"

import {
  heightRange,
  isMesh,
  unitSuffix,
  warrantyYears,
  type HomeProduct,
} from "./catalog-data"

/* Ficha de producto de portada — sistema «Perímetro».
 *
 * No reutiliza `ProductCard`: aquella es un componente de cliente con el
 * almacén del carrito, el gancho de favoritos y `sonner` dentro. La portada
 * pinta más de treinta fichas; hidratar treinta islas para dos botones que
 * casi nadie pulsa desde la portada es exactamente el coste que estamos
 * quitando. Esta ficha es HTML de servidor: cero kilobytes de JavaScript.
 *
 * El botón «Agregar al carrito» no se pierde, se mueve a donde se decide de
 * verdad: la ficha de producto, donde además hay que elegir altura y metros.
 * Desde la portada, un clic lleva a esa ficha. Un metro lineal de cerca no se
 * compra sin elegir altura.
 *
 * Qué se pinta y por qué, en el orden en que lo pregunta un comprador:
 *   1. Altura — el primer dato que decide la compra. Los 15 productos la traen.
 *   2. Precio por metro — el gancho; es lo que la competencia esconde.
 *   3. Existencias reales, en metros. El catálogo las tiene y a un comprador
 *      de 80 m de cerca «600 m disponibles» le dice más que «En stock».
 *   4. Garantía, cuando el producto la declara.
 * Nada de estrellas: el modelo no tiene reseñas y no se inventan.
 */
export function ProductTile({
  p,
  sizes = "(max-width: 640px) 45vw, (max-width: 1024px) 30vw, 292px",
}: {
  p: HomeProduct
  sizes?: string
}) {
  const image = p.images?.[0]?.url ?? null
  const range = heightRange(p)
  const years = warrantyYears(p)
  const mesh = isMesh(p)
  const soldOut = p.stock <= 0
  const stockUnit = p.unit === "METRO" ? "m" : "u"

  return (
    <Link
      href={`/productos/${p.slug}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-border bg-surface transition-colors hover:border-brand-green focus-visible:border-brand-green"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
        {image ? (
          <Image
            src={image}
            alt={p.name}
            fill
            sizes={sizes}
            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
          />
        ) : (
          /* Sin foto: alzado dibujado en CSS (ver .diagram en globals.css).
             Es decorativo —toda la información va en texto debajo—, así que
             se oculta al lector de pantalla. */
          <div
            className={`size-full diagram ${mesh ? "diagram-mesh" : "diagram-picket"}`}
            aria-hidden="true"
          />
        )}

        {/* La altura, encima de la imagen: es el filtro mental del comprador. */}
        {range && (
          <span className="absolute bottom-2 left-2 rounded-sm bg-surface/92 px-1.5 py-0.5 text-2xs font-bold text-foreground tabular-nums">
            {range}
          </span>
        )}

        {soldOut && (
          <span className="absolute top-2 left-2 rounded-sm bg-brand-navy px-1.5 py-0.5 text-2xs font-bold text-on-dark">
            Agotado
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-3">
        {p.category && (
          <p className="eyebrow truncate text-muted-foreground">{p.category.name}</p>
        )}

        <h3 className="mt-1 line-clamp-2 text-sm leading-snug font-semibold text-foreground transition-colors group-hover:text-brand-green-deep">
          {p.name}
        </h3>

        {(p.attributes?.material || years != null) && (
          <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">
            {p.attributes?.material}
            {p.attributes?.material && years != null ? " · " : ""}
            {years != null ? `${years} años de garantía` : ""}
          </p>
        )}

        <div className="mt-auto pt-3">
          <p className="flex items-baseline gap-1">
            <span className="text-xl leading-none font-bold text-foreground tabular-nums">
              ${p.basePrice.toFixed(2)}
            </span>
            <span className="text-xs font-medium text-muted-foreground">
              {unitSuffix(p.unit)}
            </span>
          </p>
          <p className="mt-1 text-2xs font-semibold text-muted-foreground tabular-nums">
            {soldOut ? "Sin existencias" : `${p.stock} ${stockUnit} disponibles`}
          </p>
        </div>
      </div>
    </Link>
  )
}

/* Última casilla de la parrilla: la salida al listado completo.
 *
 * Un segmento con dos modelos deja dos huecos vacíos en una fila de cuatro y
 * la sección parece rota. Esta tarjeta ocupa el hueco con lo único que falta
 * ahí: el enlace a todo el segmento, con su recuento real. Densidad comercial
 * sin relleno inventado. */
export function ViewAllTile({
  href,
  label,
  hint,
}: {
  href: string
  label: string
  hint?: string
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col items-start justify-center gap-1 rounded-lg border border-dashed border-border-strong bg-surface-sunk p-4 transition-colors hover:border-brand-green hover:bg-brand-green-soft"
    >
      <span className="text-sm font-semibold text-brand-green-deep">{label} →</span>
      {hint && <span className="text-xs text-muted-foreground">{hint}</span>}
    </Link>
  )
}
