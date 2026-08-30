import { PAGE_SIZE } from "@/app/(store)/_data/catalog"

/* Hueco de la parrilla mientras responde `/products` — sistema «Perímetro».
 *
 * Es el fallback del `<Suspense>` del listado: se ve durante el streaming de la
 * primera carga y cada vez que cambia una faceta (la `key` del boundary es la
 * consulta). No es un spinner: un spinner dice «espera» y nada más; un
 * esqueleto dice cuántos resultados vienen, con qué forma y en qué retícula, de
 * modo que al llegar los datos no se mueve ni un píxel.
 *
 * Por eso reproduce exactamente la caja de `ProductCard` —foto 4/3, categoría,
 * dos líneas de título, precio, existencias y botón de 44 px— y usa las MISMAS
 * clases de retícula que `ProductGrid`. Si las dos rejillas se separan, vuelve
 * el salto de maquetación que esto existe para evitar.
 *
 * Tantas cajas como productos trae una página: doce. Pintar ocho y recibir doce
 * es prometer una pantalla más corta de la que llega.
 *
 * El pulso va una sola vez en el contenedor, no en cada bloque: es una
 * animación de opacidad que resuelve el compositor, y una vale por 84. Con
 * `prefers-reduced-motion` queda neutralizada desde `globals.css`.
 */
export function ProductGridSkeleton({ count = PAGE_SIZE }: { count?: number }) {
  return (
    <>
      <p role="status" className="sr-only">
        Cargando productos…
      </p>

      <div
        aria-hidden="true"
        className="grid animate-pulse grid-cols-1 items-stretch gap-3 sm:grid-cols-2 sm:gap-4 lg:gap-5 xl:grid-cols-3"
      >
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface"
          >
            <div className="aspect-[4/3] bg-surface-2" />

            <div className="flex flex-1 flex-col p-3.5 sm:p-4">
              {/* Categoría */}
              <div className="h-2.5 w-20 rounded-sm bg-muted" />
              {/* Título, dos líneas */}
              <div className="mt-2 h-4 w-3/4 rounded-sm bg-muted" />
              <div className="mt-1.5 h-4 w-1/2 rounded-sm bg-muted" />
              {/* Precio por metro */}
              <div className="mt-3 h-6 w-24 rounded-sm bg-muted" />
              {/* Existencias */}
              <div className="mt-2 h-3 w-16 rounded-sm bg-muted" />
              {/* Botón de compra */}
              <div className="mt-auto pt-3">
                <div className="h-11 w-full rounded-lg bg-muted" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
