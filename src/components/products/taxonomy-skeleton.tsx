import { ProductGridSkeleton } from "./product-grid-skeleton"

/* Hueco de una pantalla de taxonomía (categoría o colección).
 *
 * Las dos rutas están prerenderizadas para los slugs que ya existen, así que
 * lo normal es que nadie vea esto. Se ve en dos casos que sí ocurren: un slug
 * nuevo que aún no se ha generado, y la primera visita después de que expire
 * la revalidación de diez minutos. En ambos hay que esperar a la API.
 *
 * Reproduce la geometría de la pantalla real —franja de migas, título, línea
 * de descripción, contador y parrilla— porque un esqueleto que promete otra
 * maqueta provoca el salto que existe para evitar. La parrilla la delega en
 * `ProductGridSkeleton`, que ya usa exactamente las mismas clases de retícula
 * que `ProductGrid`: si algún día se separan, se separan en un solo sitio.
 *
 * El pulso va una vez en el contenedor y no en cada bloque: es una animación
 * de opacidad que resuelve el compositor, y una vale por todas. Con
 * `prefers-reduced-motion` queda neutralizada desde globals.css.
 */
export function TaxonomySkeleton() {
  return (
    <div className="flex-1">
      <p role="status" className="sr-only">
        Cargando la sección…
      </p>

      <div aria-hidden="true" className="animate-pulse">
        {/* Franja de migas */}
        <div className="border-b border-border bg-surface-2">
          <div className="shell py-2.5">
            <div className="h-3 w-56 rounded-sm bg-muted" />
          </div>
        </div>

        <div className="shell py-8">
          <div className="mb-8">
            {/* Título */}
            <div className="h-7 w-64 rounded-sm bg-muted md:h-9 md:w-80" />
            {/* Descripción */}
            <div className="mt-3 h-4 w-full max-w-2xl rounded-sm bg-muted" />
            {/* Contador */}
            <div className="mt-2 h-3.5 w-40 rounded-sm bg-muted" />
          </div>

          <ProductGridSkeleton />
        </div>
      </div>
    </div>
  )
}
