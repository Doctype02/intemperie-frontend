import {
  PAGE_SIZE,
  loadProductPage,
  type Pagination,
  type ProductListResult,
  type ProductQuery,
} from "../_data/catalog"
import { findHeightBand, matchesHeight } from "@/components/products/product-filters"

/* Carga del listado — sistema «Perímetro».
 *
 * La API resuelve uso, línea, texto, precio, orden y paginación. La altura no:
 * vive dentro de `attributes.heightOptions`, una columna Json, y `/products` no
 * tiene parámetro para consultarla. Se puede pedir a la API que lo añada, pero
 * mientras tanto la altura es la primera pregunta de quien compra cerca y ya
 * está en la base de datos; dejarla fuera del listado por una limitación del
 * endpoint es esconder el dato que decide la compra.
 *
 * Así que cuando —y sólo cuando— hay franja de altura pedida, la página se pide
 * entera de una vez y se filtra y pagina aquí. Es correcto para este catálogo y
 * es honesto sobre su límite: quince modelos hoy, `WIDE_LIMIT` de techo. Si el
 * catálogo lo supera, `truncated` lo dice en voz alta en lugar de mentir en el
 * contador, y ése es el momento de pedir el filtro a la API.
 *
 * Sin franja de altura no se paga nada de esto: se delega en `loadProductPage`
 * tal cual, con su paginación de servidor y su memoización por render.
 */

/** Techo de la carga ancha. El catálogo real tiene 15 modelos. */
const WIDE_LIMIT = 200

export interface ListingQuery extends ProductQuery {
  height?: string
}

export interface ListingResult extends ProductListResult {
  /** Había más catálogo del que cupo en la carga ancha: el conteo se queda corto. */
  truncated: boolean
}

/** Página >= 1. La misma regla que usa la API, aplicada antes de recortar. */
function pageOf(value: string | undefined): number {
  const n = Number(value)
  return Number.isInteger(n) && n >= 1 ? n : 1
}

export async function loadListing(query: ListingQuery): Promise<ListingResult> {
  const band = findHeightBand(query.height)

  if (!band) {
    const result = await loadProductPage(query)
    return { ...result, truncated: false }
  }

  /* `page: undefined` a propósito: se pide el conjunto entero y se pagina
     abajo, sobre lo que de verdad ha pasado el filtro de altura. Paginar antes
     de filtrar daría páginas de tamaño irregular y un contador falso. */
  const { products, pagination } = await loadProductPage(
    { ...query, page: undefined },
    WIDE_LIMIT,
  )

  const matching = products.filter((p) => matchesHeight(p, band))
  const total = matching.length
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const page = Math.min(pageOf(query.page), totalPages)
  const start = (page - 1) * PAGE_SIZE

  const paginated: Pagination = {
    total,
    page,
    limit: PAGE_SIZE,
    totalPages: total ? totalPages : 0,
    hasPrevPage: page > 1,
    hasNextPage: page < totalPages && total > 0,
  }

  return {
    products: matching.slice(start, start + PAGE_SIZE),
    pagination: paginated,
    truncated: pagination.total > products.length,
  }
}
