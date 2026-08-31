import Link from "next/link"

import { hrefWith } from "@/components/products/product-filters"

/* Orden del listado — sistema «Perímetro».
 *
 * Era un `<select>` de cliente con `onChange` y `router.push`. Un `<select>`
 * sin JavaScript no ordena nada, y con JavaScript sigue siendo el control que
 * peor se maneja con el pulgar: dos toques y una hoja nativa que tapa la
 * pantalla para elegir entre cuatro opciones.
 *
 * Aquí son cuatro enlaces. Un toque, prefetch al entrar en viewport, el estado
 * visible sin abrir nada, indexable y funcionando con el JS caído. En móvil
 * ruedan en horizontal para no comerse dos líneas de alto sobre la primera
 * ficha.
 *
 * «Destacados» no está: era el valor por defecto y no ordenaba por nada —la API
 * devolvía lo que le venía—. Anunciar un criterio que no existe es peor que no
 * anunciarlo. El orden por defecto se llama ahora por su nombre, «Del
 * catálogo», y los que sí son criterios reales están todos en el `SORT_MAP` de
 * `_data/catalog.ts`, que además es lista blanca: `?sort=` con cualquier otra
 * cosa se ignora en vez de llegar al ORDER BY.
 *
 * `name_asc` tampoco está, aunque la API lo acepte: los quince modelos se
 * llaman «Cerca PVC …» o «Malla Electrosoldada …», así que ordenar por nombre
 * es ordenar por tipo de producto —eso ya lo hace el filtro de uso—. El precio
 * por metro, en los dos sentidos, es la comparación real de este catálogo.
 *
 * Cambiar de orden vuelve a la página 1: lo hace `hrefWith`, que nunca arrastra
 * `page`. Quedarse en la 3 tras reordenar muestra productos distintos bajo el
 * mismo número de página y parece un fallo del sitio.
 */

const OPTIONS: { value: string; label: string; hint: string }[] = [
  { value: "", label: "Del catálogo", hint: "Orden del catálogo" },
  { value: "price_asc", label: "Precio ↑", hint: "Precio por metro, de menor a mayor" },
  { value: "price_desc", label: "Precio ↓", hint: "Precio por metro, de mayor a menor" },
  { value: "newest", label: "Novedades", hint: "Los últimos modelos dados de alta" },
]

export default function SortSelect({
  params,
}: {
  params: Record<string, string | undefined>
}) {
  const current = params.sort ?? ""

  return (
    <nav aria-label="Ordenar resultados" className="flex min-w-0 items-center gap-2">
      <span className="eyebrow shrink-0 text-muted-foreground">Ordenar</span>

      <ul className="scrollbar-hide flex min-w-0 gap-1 overflow-x-auto rounded-md border border-border bg-surface-sunk p-1">
        {OPTIONS.map((option) => {
          const on = current === option.value
          return (
            <li key={option.value || "default"} className="shrink-0">
              <Link
                href={hrefWith(params, { sort: option.value || null })}
                aria-current={on ? "true" : undefined}
                title={option.hint}
                /* El activo se distingue por relleno + tinta + sombra, no sólo
                   por color: `aria-current` lo dice al lector de pantalla y el
                   contraste del pastilla lo dice a quien no percibe el verde. */
                className={`block rounded-sm px-3 py-2 text-xs font-bold whitespace-nowrap transition-colors ${
                  on
                    ? "bg-surface text-primary shadow-2xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {option.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
