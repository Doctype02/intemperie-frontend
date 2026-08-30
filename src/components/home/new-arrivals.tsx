import type { HomeProduct } from "./catalog-data"
import { ProductTile, ViewAllTile } from "./product-tile"
import { SectionHeader } from "./section"

/* Novedades — sistema «Perímetro».
 *
 * Sección condicionada al dato, no al calendario. `newArrivals()` devuelve
 * lista vacía mientras todo el catálogo comparta fecha de alta, y hoy la
 * comparte: las quince fichas se cargaron el mismo día. En ese estado esta
 * sección no pinta nada, y es lo correcto — «Novedades» con las quince fichas
 * dentro es el catálogo entero con otro título, y el cliente que vuelve a la
 * semana siguiente y ve lo mismo bajo «Novedades» aprende a no mirar ahí.
 *
 * En cuanto entre una ficha con fecha distinta —el día que se cargue el primer
 * modelo nuevo— la sección aparece sola, sin tocar código y sin que nadie se
 * acuerde de acordarse. Ese es el motivo de que exista ya montada: la
 * alternativa es que el modelo nuevo entre al catálogo y no lo anuncie nadie.
 */
export function NewArrivals({ products }: { products: HomeProduct[] }) {
  if (products.length < 2) return null

  return (
    <section className="defer-paint border-b border-border bg-background">
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          eyebrow="Recién incorporado"
          title="Novedades del catálogo"
          sub="Los últimos modelos que hemos dado de alta, con su precio y su altura desde el primer día."
          href="/productos?sort=newest"
          linkLabel="Ver el catálogo"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {products.slice(0, 7).map((p) => (
            <ProductTile key={p.id} p={p} />
          ))}
          <ViewAllTile
            href="/productos"
            label="Ver todo el catálogo"
            hint="Precio por metro y altura en cada ficha"
          />
        </div>
      </div>
    </section>
  )
}
