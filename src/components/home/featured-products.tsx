import Image from "next/image"
import Link from "next/link"
import { Calculator } from "lucide-react"

import {
  heightRange,
  isMesh,
  unitSuffix,
  warrantyYears,
  type HomeProduct,
} from "./catalog-data"
import { Section, SectionHeader } from "./section"

/* «Los más pedidos» con tarjeta de mercado — dirección B.
 *
 * Mismo lugar y misma selección auditable de siempre: primero los productos
 * CON foto real —la foto vende más que el alzado dibujado— y, dentro de cada
 * grupo, por existencias de mayor a menor, que es el dato real más cercano a
 * «lo más pedido» que la API da hoy. Sin reseñas no hay estrellas.
 *
 * Lo que cambia es la tarjeta: markup propio en vez de ProductTile, porque el
 * dueño eligió la gramática de tienda —foto 4:3, píldora blanca con el rango
 * de altura encima, precio grande en verde y una fila de acción con el botón
 * «Comprar» a lo ancho más el acceso directo a la calculadora. «Comprar»
 * lleva a la ficha, que es donde se elige altura y metros: un metro lineal de
 * cerca no se compra sin elegir altura. Todo enlaces y HTML de servidor:
 * cero JavaScript hidratado.
 */
export function FeaturedProducts({ products }: { products: HomeProduct[] }) {
  if (products.length === 0) return null

  const withPhotoFirst = [...products].sort((a, b) => {
    const aPhoto = a.images?.length ? 1 : 0
    const bPhoto = b.images?.length ? 1 : 0
    if (aPhoto !== bPhoto) return bPhoto - aPhoto
    return b.stock - a.stock
  })

  const featured = withPhotoFirst.slice(0, 4)

  return (
    <Section surface="base">
      <SectionHeader
        eyebrow="Directo del catálogo"
        title="Los más pedidos"
        sub="Precio por metro de material, con altura y garantía en cada ficha."
        href="/productos"
        count={products.length}
      />

      <ul className="grid grid-cols-2 gap-3 lg:grid-cols-4 lg:gap-5">
        {featured.map((p) => {
          const image = p.images?.[0]?.url ?? null
          const range = heightRange(p)
          const years = warrantyYears(p)
          const meta = [
            p.category?.name,
            years != null ? `${years} años de garantía` : null,
          ]
            .filter(Boolean)
            .join(" · ")

          return (
            <li
              key={p.id}
              className="flex flex-col overflow-hidden rounded-2xl border border-border bg-surface"
            >
              <div className="relative aspect-[4/3] bg-surface-2">
                {image ? (
                  <Image
                    src={image}
                    alt={p.name}
                    fill
                    sizes="(max-width: 1024px) 45vw, 292px"
                    className="object-cover object-center"
                  />
                ) : (
                  /* Sin foto: alzado dibujado en CSS (ver .diagram en
                     globals.css). Decorativo; el texto va debajo. */
                  <div
                    className={`size-full diagram ${
                      isMesh(p) ? "diagram-mesh" : "diagram-picket"
                    }`}
                    aria-hidden="true"
                  />
                )}

                {/* El rango de altura, encima de la foto: es el filtro mental
                    del comprador y lo traen los 15 productos. */}
                {range && (
                  <span className="tabular absolute top-3 left-3 rounded-full bg-surface px-3 py-1 text-xs font-bold text-foreground shadow-sm">
                    {range}
                  </span>
                )}
              </div>

              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-base leading-snug font-bold text-foreground">
                  {p.name}
                </h3>

                {meta && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{meta}</p>
                )}

                <p className="mt-2 flex items-baseline gap-1">
                  <span className="tabular text-2xl leading-none font-bold text-brand-green-deep">
                    ${p.basePrice.toFixed(2)}
                  </span>
                  <span className="text-sm font-medium text-muted-foreground">
                    {p.unit === "METRO" ? "/metro" : unitSuffix(p.unit)}
                  </span>
                </p>

                <div className="mt-auto flex gap-2 pt-3">
                  <Link
                    href={`/productos/${p.slug}`}
                    className="flex h-11 flex-1 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-green-deep"
                  >
                    Comprar
                  </Link>
                  <Link
                    href={`/calculadora?producto=${p.slug}`}
                    aria-label={`Calcular ${p.name}`}
                    className="grid size-11 shrink-0 place-items-center rounded-xl border border-border text-foreground transition-colors hover:border-brand-green hover:text-brand-green-deep"
                  >
                    <Calculator className="size-5" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </Section>
  )
}
