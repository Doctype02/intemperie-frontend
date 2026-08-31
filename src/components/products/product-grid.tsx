import type { Product } from "@/types"

import { ProductCard } from "./product-card"

/* Parrilla del catálogo — sistema «Perímetro».
 *
 * Era `"use client"` sin necesitarlo: no tiene estado, ni efectos, ni
 * manejadores. Lo único interactivo es la tarjeta (carrito y favoritos), que ya
 * es su propia isla. Al quitar la directiva, la parrilla se queda en el
 * servidor y sólo cruza la frontera lo que la tarjeta necesita.
 *
 * También llevaba una copia a mano del tipo `Product` —doce campos redeclarados—
 * que se había quedado corta: no incluía `attributes`, así que la altura de cada
 * modelo (el primer dato que pregunta quien compra cerca) nunca llegaba a la
 * tarjeta aunque la tarjeta supiera pintarla. Ahora se usa el tipo del catálogo.
 *
 * Es una `<ul>`: para un lector de pantalla la diferencia entre «12 resultados»
 * y un montón de artículos sueltos es poder saltarlos de uno en uno y saber
 * cuántos quedan.
 */

/**
 * Lo que la API añade sobre el tipo compartido. Ambos son opcionales, así que
 * un `Product[]` normal encaja aquí sin conversiones.
 */
export interface GridProduct extends Product {
  comparePrice?: number
  isNew?: boolean
}

/**
 * `attributes` es una columna `Json` en Prisma: el tipo compartido la declara
 * como `Record<string, unknown>` porque su contenido no está garantizado. La
 * tarjeta valida cada campo con `Array.isArray` antes de usarlo, de modo que
 * aquí sólo hace falta darle la forma que espera.
 */
type CardAttributes = {
  heightOptions?: string[]
  colors?: string[]
  material?: string
  warranty?: string
}

export function ProductGrid({ products }: { products: GridProduct[] }) {
  return (
    <ul className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5 xl:grid-cols-3">
      {products.map((product, i) => (
        <li key={product.id} className="h-full">
          <ProductCard
            id={product.id}
            name={product.name}
            slug={product.slug}
            basePrice={product.basePrice}
            comparePrice={product.comparePrice}
            unit={product.unit}
            stock={product.stock}
            isNew={product.isNew}
            attributes={(product.attributes as CardAttributes | null) ?? null}
            category={product.category}
            collection={product.collection}
            images={product.images}
            /* `priority` implica `<link rel="preload" fetchpriority="high">`:
               la imagen se pide antes que el CSS y el JS, y sin `lazy`. Sólo la
               primera tarjeta, que es la única candidata a LCP; con dos, los
               dos preloads compiten entre sí y con lo que bloquea el render. */
            priority={i === 0}
          />
        </li>
      ))}
    </ul>
  )
}
