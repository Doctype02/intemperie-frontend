import { Skeleton } from "@/components/ui/skeleton";

/**
 * Esqueleto de la ficha, no un spinner.
 *
 * Las quince fichas se prerenderizan, así que esto sólo aparece cuando se
 * genera un slug nuevo bajo demanda. Reproduce la retícula real (foto, panel,
 * ficha técnica) para que el contenido no dé un salto al llegar.
 */
export default function ProductDetailLoading() {
  return (
    <div className="mx-auto max-w-7xl px-4 pt-4 pb-28 sm:px-6 lg:pt-6 lg:pb-14">
      <Skeleton className="mb-4 hidden h-3 w-56 sm:block" />

      <div className="max-w-3xl space-y-3">
        <Skeleton className="h-3 w-32" />
        <Skeleton className="h-8 w-3/4" />
        <Skeleton className="h-4 w-full max-w-xl" />
        <Skeleton className="h-4 w-64" />
      </div>

      <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]">
        <div className="space-y-2.5 lg:col-start-1 lg:row-start-1">
          <Skeleton className="aspect-[4/3] w-full rounded-xl sm:aspect-[3/2]" />
          <div className="flex gap-2">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="size-16 shrink-0 rounded-lg sm:size-20" />
            ))}
          </div>
        </div>

        <div className="space-y-4 lg:col-start-2 lg:row-start-1">
          <Skeleton className="h-28 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl" />
          <Skeleton className="h-13 w-full rounded-lg" />
          <Skeleton className="h-13 w-full rounded-lg" />
        </div>

        <div className="space-y-6 lg:col-start-1 lg:row-start-2">
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
