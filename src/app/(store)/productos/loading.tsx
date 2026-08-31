import { ProductGridSkeleton } from "@/components/products/product-grid-skeleton"

/* Hueco del listado entero — sistema «Perímetro».
 *
 * Esto es el fallback de la RUTA, no el de la parrilla: se ve al entrar en
 * `/productos` desde cualquier otra pantalla, antes de que el servidor tenga
 * siquiera las taxonomías. Dura poco, y por eso mismo tiene que prometer la
 * pantalla exacta que va a llegar.
 *
 * La versión anterior prometía otra cosa: una retícula de cuatro columnas y
 * una barra lateral de otra medida, ninguna de las dos existe ya. Al llegar la
 * página real se recolocaba todo —tres columnas donde había cuatro, cabecera
 * donde había un título suelto— y ese salto es CLS medido en la métrica que
 * más se nota en móvil.
 *
 * Aquí se calca el armazón de `page.tsx`: banda de cabecera sobre superficie,
 * migas, antetítulo, título, contador, buscador, la barra de usos rodante, la
 * barra lateral de 16rem sólo desde `lg` y el cajón de filtros sólo debajo. La
 * parrilla no se dibuja a mano: es `ProductGridSkeleton`, el mismo componente
 * que usa el `<Suspense>` de la página, así que las dos retículas no pueden
 * separarse aunque alguien cambie una.
 *
 * Un solo `animate-pulse` por bloque, en el contenedor: es una animación de
 * opacidad que resuelve el compositor. Todo va `aria-hidden`; quien usa lector
 * de pantalla ya recibe el «Cargando productos…» del esqueleto de la parrilla.
 */

/* Anchos irregulares a propósito: cinco pastillas idénticas parecen una tabla,
   no una fila de nombres de uso. */
const CHIPS = ["w-28", "w-24", "w-32", "w-24", "w-28", "w-20"]

export default function ProductsLoading() {
  return (
    <div className="pb-section-sm">
      <div className="border-b border-border bg-surface">
        <div className="shell animate-pulse py-5 sm:py-6" aria-hidden="true">
          <div className="h-3 w-40 rounded-sm bg-muted" />
          <div className="mt-4 h-2.5 w-36 rounded-sm bg-muted" />
          <div className="mt-2 h-7 w-56 rounded-sm bg-muted sm:h-8 sm:w-80" />
          <div className="mt-2.5 h-4 w-64 rounded-sm bg-muted sm:w-96" />
          <div className="mt-4 h-12 w-full max-w-xl rounded-lg bg-muted" />
        </div>
      </div>

      <div className="shell pt-5 sm:pt-6">
        <div className="flex animate-pulse gap-2 overflow-hidden pb-1" aria-hidden="true">
          {CHIPS.map((w) => (
            <div key={w} className={`h-8 shrink-0 rounded-full bg-muted ${w}`} />
          ))}
        </div>

        <div className="mt-5 flex flex-col gap-5 lg:flex-row lg:gap-8">
          {/* Misma medida y misma posición que `ProductFiltersRail`. */}
          <div className="hidden w-64 shrink-0 lg:block" aria-hidden="true">
            <div className="animate-pulse overflow-hidden rounded-lg border border-border bg-surface">
              <div className="border-b border-border px-4 py-4">
                <div className="h-2.5 w-16 rounded-sm bg-muted" />
                <div className="mt-2 h-3 w-full rounded-sm bg-muted" />
                <div className="mt-3 space-y-1.5">
                  <div className="h-13 rounded-md bg-muted" />
                  <div className="h-13 rounded-md bg-muted" />
                  <div className="h-13 rounded-md bg-muted" />
                </div>
              </div>
              <div className="border-b border-border px-4 py-4">
                <div className="h-2.5 w-28 rounded-sm bg-muted" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="h-7 w-24 rounded-full bg-muted" />
                  <div className="h-7 w-20 rounded-full bg-muted" />
                  <div className="h-7 w-20 rounded-full bg-muted" />
                </div>
                <div className="mt-3 h-11 rounded-md bg-muted" />
              </div>
              <div className="px-4 py-4">
                <div className="h-2.5 w-24 rounded-sm bg-muted" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <div className="h-7 w-24 rounded-full bg-muted" />
                  <div className="h-7 w-28 rounded-full bg-muted" />
                </div>
              </div>
            </div>
          </div>

          <div className="min-w-0 flex-1">
            {/* El cajón de filtros de móvil: cerrado, que es como llega. */}
            <div
              aria-hidden="true"
              className="h-12 animate-pulse rounded-lg border border-border bg-surface lg:hidden"
            />

            <div className="mt-4 flex animate-pulse justify-end" aria-hidden="true">
              <div className="h-11 w-64 rounded-md bg-muted" />
            </div>

            <div className="mt-4 sm:mt-5">
              <ProductGridSkeleton />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
