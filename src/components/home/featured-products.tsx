import type { HomeProduct } from "./catalog-data"
import { ProductTile } from "./product-tile"
import { Section, SectionHeader } from "./section"

/* «Los más pedidos» — sistema «Perímetro».
 *
 * La primera sección de contenido después de la banda de confianza es
 * producto comprable con fotografía: el lenguaje que un comprador de
 * e-commerce reconoce al instante. El catálogo tiene cinco fichas con foto
 * real hecha por fotógrafo; eran el material de merchandising de la casa y
 * ninguna sección de la portada las ponía delante.
 *
 * La selección no se inventa: primero los productos CON foto real —la foto
 * vende más que el alzado dibujado— y, dentro de cada grupo, por existencias
 * de mayor a menor, que es el dato real más cercano a «lo más pedido» que la
 * API da hoy. Sin reseñas no hay estrellas y sin ventas contadas no hay
 * «bestseller»: hay inventario, y el inventario es auditable.
 *
 * Cuatro fichas, ni una más: una fila completa en escritorio, dos por dos en
 * móvil, y la salida «Ver los N» para el que quiere el catálogo entero.
 * Render con `ProductTile` tal cual: HTML de servidor, cero JavaScript.
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

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {featured.map((p) => (
          <ProductTile
            key={p.id}
            p={p}
            sizes="(max-width: 1024px) 45vw, 292px"
          />
        ))}
      </div>
    </Section>
  )
}
