/**
 * Hueco de la parrilla mientras se resuelve el `fetch` del listado.
 *
 * Reproduce la caja de `ProductCard` (imagen 4/3 + tres líneas + botón) para
 * que al llegar los datos no haya salto de layout. Es un componente de
 * servidor: no lleva estado ni se envía al bundle del cliente.
 */
export function ProductGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <div
      className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 sm:gap-4 md:gap-6 items-stretch"
      aria-busy="true"
      aria-label="Cargando productos"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col h-full bg-white border border-gray-200 rounded-xl overflow-hidden"
        >
          <div className="aspect-[4/3] bg-gray-100 animate-pulse" />
          <div className="flex flex-col flex-1 p-3.5 sm:p-4">
            <div className="h-2.5 w-20 rounded bg-gray-100 animate-pulse" />
            <div className="mt-2 h-4 w-3/4 rounded bg-gray-100 animate-pulse" />
            <div className="mt-1.5 h-4 w-1/2 rounded bg-gray-100 animate-pulse" />
            <div className="mt-3 h-6 w-24 rounded bg-gray-100 animate-pulse" />
            <div className="mt-2 h-3 w-16 rounded bg-gray-100 animate-pulse" />
            <div className="mt-auto pt-3">
              <div className="h-10 w-full rounded-lg bg-gray-100 animate-pulse" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
