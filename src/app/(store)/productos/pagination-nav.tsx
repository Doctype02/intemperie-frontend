import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"

import { hrefWith } from "@/components/products/product-filters"

import type { Pagination } from "../_data/catalog"

/* Paginación del listado — sistema «Perímetro».
 *
 * Componente de servidor: son enlaces normales, así que funciona sin
 * JavaScript, no añade nada al bundle y `<Link>` precarga la página siguiente
 * al entrar en viewport.
 *
 * Dos cosas cambian respecto a la versión anterior:
 *
 * 1. La URL la construye `hrefWith`, la misma función que usan las facetas, el
 *    orden y el buscador. Antes había aquí un `hrefForPage` propio que copiaba
 *    esas reglas: dos vocabularios de URL para el mismo listado es dos sitios
 *    donde arreglar el día que cambie un parámetro, y sólo se arregla uno.
 *    De paso, `hrefWith` es lista blanca: lo que no sea una faceta conocida no
 *    sobrevive al cambio de página.
 *
 * 2. En móvil no se pinta la ventana de números. Nueve pastillas de 44 px no
 *    caben en 390 px de ancho: o se encogen por debajo del objetivo táctil o
 *    saltan de línea. Debajo de `sm` quedan las dos flechas y «Página 2 de 5»,
 *    que es lo que se necesita cuando se navega con el pulgar.
 */

/**
 * Ventana de páginas alrededor de la actual, con la primera y la última
 * siempre visibles. `null` marca un salto («…»).
 */
function pageWindow(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1)
  const around = [current - 1, current, current + 1].filter((p) => p > 1 && p < total)
  const pages = [1, ...around, total]
  const out: (number | null)[] = []
  let prev = 0
  for (const p of pages) {
    if (p - prev > 1) out.push(null)
    out.push(p)
    prev = p
  }
  return out
}

/* 44 px de alto y de ancho mínimo: es el objetivo táctil de la casa y el que
   pide la WCAG 2.2 para controles que se pulsan con el dedo. */
const cell =
  "inline-flex h-11 min-w-11 items-center justify-center rounded-lg border px-3 text-sm font-semibold transition-colors"
const cellIdle =
  "border-border bg-surface text-foreground hover:border-brand-green hover:text-brand-green-deep"
const cellOff = "border-border bg-surface-sunk text-muted-foreground"
const cellOn = "border-brand-green-deep bg-brand-green-deep text-on-dark"

export function PaginationNav({
  params,
  pagination,
}: {
  params: Record<string, string | undefined>
  pagination: Pagination
}) {
  const { page, totalPages } = pagination
  if (totalPages <= 1) return null

  const hasPrev = pagination.hasPrevPage ?? page > 1
  const hasNext = pagination.hasNextPage ?? page < totalPages

  /* La página 1 no se escribe en la URL: `/productos` y `/productos?page=1`
     son la misma pantalla y dos direcciones para un mismo contenido reparten
     el enlazado y confunden al rastreador. */
  const href = (n: number) => hrefWith(params, { page: n > 1 ? String(n) : null })

  return (
    <nav aria-label="Paginación de productos" className="mt-8 flex items-center justify-center gap-1.5">
      {hasPrev ? (
        <Link href={href(page - 1)} rel="prev" aria-label="Página anterior" className={`${cell} ${cellIdle}`}>
          <ChevronLeft className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${cell} ${cellOff}`}>
          <ChevronLeft className="size-4" />
        </span>
      )}

      {/* Móvil: la posición en texto, sin ventana de números. */}
      <p className="tabular px-3 text-sm font-semibold text-foreground sm:hidden">
        Página {page} <span className="font-normal text-muted-foreground">de {totalPages}</span>
      </p>

      <ul className="hidden items-center gap-1.5 sm:flex">
        {pageWindow(page, totalPages).map((n, i) => (
          <li key={n ?? `salto-${i}`}>
            {n === null ? (
              <span aria-hidden="true" className="px-1 text-sm text-muted-foreground">
                …
              </span>
            ) : n === page ? (
              <span aria-current="page" className={`tabular ${cell} ${cellOn}`}>
                <span className="sr-only">Página </span>
                {n}
              </span>
            ) : (
              <Link href={href(n)} aria-label={`Página ${n}`} className={`tabular ${cell} ${cellIdle}`}>
                {n}
              </Link>
            )}
          </li>
        ))}
      </ul>

      {hasNext ? (
        <Link href={href(page + 1)} rel="next" aria-label="Página siguiente" className={`${cell} ${cellIdle}`}>
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      ) : (
        <span aria-hidden="true" className={`${cell} ${cellOff}`}>
          <ChevronRight className="size-4" />
        </span>
      )}
    </nav>
  )
}
