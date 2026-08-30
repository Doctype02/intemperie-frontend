import { Search } from "lucide-react"

import { FACET_KEYS } from "@/components/products/product-filters"

/* Buscador del catálogo — sistema «Perímetro».
 *
 * Otro componente de cliente que no necesitaba serlo: `useSearchParams`,
 * `useRouter` y un `onSubmit` que leía el input por `form.elements` para hacer
 * exactamente lo que hace un `<form method="get">`.
 *
 * Ahora es servidor. Además el buscador ya no borra en silencio lo que estabas
 * mirando: las demás facetas viajan en campos ocultos, así que buscar «atenea»
 * dentro de «Industrial» sigue dentro de Industrial. Antes, `router.push` sí
 * las conservaba, pero el formulario no las declaraba en ningún sitio; con GET
 * hay que decirlo explícitamente y eso es una ventaja, porque se lee.
 *
 * `type="search"` da el aspa de borrar nativa en móvil y el teclado correcto.
 * `enterKeyHint="search"` pone «Buscar» en la tecla de retorno de Android.
 */
export default function SearchWrapper({
  params,
}: {
  params: Record<string, string | undefined>
}) {
  const carried = FACET_KEYS.filter((k) => k !== "search" && k !== "page").filter(
    (k) => params[k],
  )

  return (
    <form action="/productos" method="get" role="search" className="relative">
      {carried.map((k) => (
        <input key={k} type="hidden" name={k} value={params[k]} />
      ))}

      <label htmlFor="search" className="sr-only">
        Buscar en el catálogo de cercas
      </label>

      <Search
        className="pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted-foreground"
        aria-hidden="true"
      />

      <input
        id="search"
        name="search"
        type="search"
        enterKeyHint="search"
        autoComplete="off"
        defaultValue={params.search ?? ""}
        placeholder="Buscar modelo: Atenea, Titan, malla…"
        className="h-12 w-full rounded-lg border border-border-strong bg-surface pr-24 pl-10 text-sm text-foreground placeholder:text-muted-foreground"
      />

      <button
        type="submit"
        className="absolute top-1.5 right-1.5 bottom-1.5 rounded-md bg-primary px-4 text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-green-deep"
      >
        Buscar
      </button>
    </form>
  )
}
