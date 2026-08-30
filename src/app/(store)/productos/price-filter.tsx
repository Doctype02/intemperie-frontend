import { FACET_KEYS } from "@/components/products/product-filters"

/* Rango de precio a medida — sistema «Perímetro».
 *
 * Era un componente de cliente: `useState` por campo, `useEffect` para
 * resincronizar con la URL, `useSearchParams` (que obliga a `<Suspense>` en el
 * padre) y `router.push`. Sesenta líneas de JavaScript, un bundle de cliente y
 * una hidratación para lo que el navegador hace solo desde 1995: un formulario
 * `GET` con dos campos numéricos.
 *
 * Ahora es HTML de servidor. El navegador construye
 * `/productos?minPrice=20&maxPrice=30` con los `name` de los campos, y los
 * `<input type="hidden">` arrastran las demás facetas para que ajustar el
 * precio no borre el uso ni la altura elegidos. `page` no se arrastra a
 * propósito: un rango nuevo tiene menos páginas y quedarse en la 3 daría un
 * vacío que parece un error del sitio.
 *
 * Los tramos de un toque («Hasta $20», «$20 – $30»…) están arriba, en el panel
 * de facetas, y cubren el caso normal. Esto es la salida para quien tiene un
 * presupuesto exacto por metro, que en obra y en licitación es lo habitual.
 */
export default function PriceFilter({
  params,
}: {
  params: Record<string, string | undefined>
}) {
  /* Todo lo que no sea precio ni página viaja escondido en el formulario. */
  const carried = FACET_KEYS.filter(
    (k) => k !== "minPrice" && k !== "maxPrice" && k !== "page",
  ).filter((k) => params[k])

  const field =
    "tabular h-11 w-full rounded-md border border-border-strong bg-surface px-2.5 text-sm text-foreground placeholder:text-muted-foreground"

  return (
    <form action="/productos" method="get" className="mt-3">
      {carried.map((k) => (
        <input key={k} type="hidden" name={k} value={params[k]} />
      ))}

      <fieldset className="flex items-end gap-2">
        <legend className="sr-only">Rango de precio por metro, en dólares</legend>

        <p className="min-w-0 flex-1">
          <label htmlFor="minPrice" className="mb-1 block text-2xs text-muted-foreground">
            Desde $
          </label>
          <input
            id="minPrice"
            name="minPrice"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.5"
            placeholder="8.50"
            defaultValue={params.minPrice ?? ""}
            className={field}
          />
        </p>

        <p className="min-w-0 flex-1">
          <label htmlFor="maxPrice" className="mb-1 block text-2xs text-muted-foreground">
            Hasta $
          </label>
          <input
            id="maxPrice"
            name="maxPrice"
            type="number"
            inputMode="decimal"
            min={0}
            step="0.5"
            placeholder="45.00"
            defaultValue={params.maxPrice ?? ""}
            className={field}
          />
        </p>

        {/* `primary`/`primary-foreground` y no `brand-green`/`on-dark`: en modo
            oscuro el verde sube de luminosidad y un texto casi blanco encima se
            cae del AA. El par de roles se invierte solo. Es el mismo botón que
            cierra la portada. */}
        <button
          type="submit"
          className="h-11 shrink-0 rounded-md bg-primary px-3.5 text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-green-deep"
        >
          Aplicar
        </button>
      </fieldset>
    </form>
  )
}
