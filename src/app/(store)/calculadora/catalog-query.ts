import { toQuoteModels, type QuoteModel } from "@/components/calculator/quote-models"
import { hrefWith, type FacetKey } from "@/components/products/product-filters"

import { getProductBySlug } from "../_data/catalog"
import { loadListing, type ListingQuery } from "../productos/listing"

/* Búsqueda del precotizador — sistema «Perímetro».
 *
 * ─────────────────────────────────────────────────────────────────────────
 * EL PROBLEMA QUE RESUELVE ESTE MÓDULO
 *
 * La página pedía `listProducts({}, 100)` y le pasaba el catálogo ENTERO a la
 * isla de cliente. Con quince modelos el HTML de `/calculadora` pesaba 234 kB,
 * porque cada modelo viaja dos veces: una como tarjeta pintada y otra como
 * datos serializados para hidratar la isla. Medido sobre ese coste por modelo,
 * cincuenta modelos son ~780 kB y cien ~1.5 MB de HTML antes de que el
 * visitante toque nada.
 *
 * Y ese `100` era un tope callado: el producto 101 no existía en el
 * precotizador. Sin error, sin aviso, sin forma de enterarse.
 *
 * Ahora el filtrado ocurre AQUÍ, en el servidor, con los parámetros de la URL,
 * y la isla recibe sólo la página de modelos que coinciden. El peso del HTML
 * deja de depender del tamaño del catálogo: quince modelos y quinientos cuestan
 * lo mismo.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POR QUÉ REUTILIZA `productos/listing.ts` TAL CUAL
 *
 * Es el mismo problema: la API resuelve uso, texto y precio, pero la altura
 * vive en `attributes.heightOptions` —una columna Json sin parámetro de
 * consulta— y hay que filtrarla en memoria sobre una carga ancha, sólo cuando
 * se pide franja, avisando con `truncated` cuando el catálogo desborda esa
 * carga. Escribir aquí una segunda versión de esa regla sería garantizar que
 * dentro de un mes el listado y el precotizador metan modelos distintos en la
 * misma franja de altura. Se reutiliza, y con ella el tamaño de página.
 */

/**
 * Parámetros propios del precotizador, ajenos a las facetas del catálogo:
 * `producto` es el modelo con el que se llega desde una ficha y `metros` la
 * medida que ya traía. Se arrastran al cambiar de faceta porque quien llega
 * desde una ficha con 120 m escritos no quiere volver a escribirlos por haber
 * tocado un filtro.
 */
export const QUOTE_KEYS = ["producto", "metros"] as const

/** URL del precotizador con las facetas actuales más un parche. */
export function quoteHref(
  params: Record<string, string | undefined>,
  patch: Partial<Record<FacetKey, string | null>> = {},
) {
  return hrefWith(params, patch, { basePath: "/calculadora", carry: QUOTE_KEYS })
}

export interface QuoteCatalog {
  /** Los modelos que se pintan: una página, nunca el catálogo entero. */
  models: QuoteModel[]
  /** Cuántos coinciden de verdad con el filtro. Puede ser mayor que `models`. */
  total: number
  /** La carga ancha del filtro de altura se quedó corta (ver `listing.ts`). */
  truncated: boolean
}

/**
 * Los modelos que coinciden con la búsqueda, listos para el precotizador.
 *
 * `total` sale de la paginación de la API y NO de `models.length`: es lo que
 * permite decir en pantalla «coinciden 40, se muestran 12» en lugar de recortar
 * en silencio. Un recorte callado se lee como «esto es todo lo que hay», que es
 * exactamente la mentira que contaba el `100` de antes.
 */
export async function loadQuoteCatalog(query: ListingQuery): Promise<QuoteCatalog> {
  const { products, pagination, truncated } = await loadListing(query)
  return { models: toQuoteModels(products), total: pagination.total, truncated }
}

/**
 * Resuelve `?producto=<slug>` pidiendo ESE producto por su slug, no buscándolo
 * dentro de la página de resultados.
 *
 * Es la diferencia entre que el enlace profundo funcione siempre o sólo cuando
 * el modelo cae por casualidad en los doce que se están pintando. Quien llega
 * desde una ficha ya eligió: el filtro de la calculadora no tiene por qué
 * poder desautorizarle, ni el modelo dejar de existir por estar en la página 2.
 *
 * Devuelve `null` si el slug no existe (la API responde 404 y `getProductBySlug`
 * lo traduce a `null`) o si el modelo no tiene precio: una ficha a $0.00 no se
 * puede cotizar. Un fallo de infraestructura sí propaga, como en el resto del
 * catálogo, para que la página reintente en lugar de publicarse a medias.
 */
export async function loadChosenModel(slug: string | undefined): Promise<QuoteModel | null> {
  if (!slug) return null
  const product = await getProductBySlug(slug)
  if (!product) return null
  return toQuoteModels([product])[0] ?? null
}
