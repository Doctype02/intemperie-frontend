import type { Product, ProductUnit } from "@/types"

import { heightRange } from "@/components/products/product-filters"

/* Datos del precotizador — sistema «Perímetro».
 *
 * Este módulo traduce el producto que devuelve la API al puñado de campos que
 * el precotizador necesita, y lo hace EN EL SERVIDOR. La isla de cliente sólo
 * recibe el resultado y el tipo (que se borra al compilar), así que ni el
 * lector de `attributes` ni las reglas de altura viajan al navegador.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LO QUE EL CATÁLOGO TIENE Y LO QUE NO
 *
 * Comprobado contra producción, los 15 modelos. Las claves que existen en
 * `attributes` son exactamente: colors, material, meshSize, warranty,
 * wireGauge, antiClimbing, heightOptions, resistance, protection,
 * reinforcement y details. Más los campos del producto: basePrice, unit,
 * stock, images, category, collection, description, slug y specifications.
 *
 * NO existe ancho de panel, ni separación entre postes, ni precio de puerta.
 * Por eso el estimado no cuenta paneles, ni postes, ni puertas: un número
 * inventado en una cotización es una promesa que alguien tiene que pagar
 * después. La calculadora anterior sumaba además un 30 % de instalación que
 * no salía de ningún campo; se ha retirado.
 *
 * Lo que sí se puede afirmar con el catálogo delante:
 *   metros × precio por metro = material,  + ITBMS 7 %,  = total.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CUANDO LLEGUEN LOS TRES DATOS QUE FALTAN
 *
 * `panelWidth`, `postSpacing` y `gatePrice` se leen aquí desde `attributes`
 * aunque hoy ningún modelo los traiga: se quedan en `null` y las filas
 * correspondientes del resumen no se pintan. El día que el admin cargue
 * cualquiera de los tres en una ficha, esa fila aparece sola, sin tocar
 * código. No es una promesa en un comentario: es la comprobación de
 * `readNumber` de abajo y los `!= null` de `fence-calculator.tsx`.
 */

export interface QuoteModel {
  id: string
  slug: string
  name: string
  description: string
  /** Precio por unidad de venta (`unit`), ya numérico: la API lo manda como
   *  cadena porque en la base es `Decimal`. */
  price: number
  unit: ProductUnit
  stock: number
  /** URL absoluta del Object Storage, tal cual la da la API. */
  image: string | null
  imageAlt: string
  /** `true` si es malla electrosoldada: decide qué alzado se dibuja sin foto. */
  mesh: boolean
  /** «1.2 – 2.1 m», ya formateado. `null` si el modelo no declara alturas. */
  height: string | null
  material: string | null
  warrantyYears: number | null
  colors: string[]

  /* Los tres que todavía no existen en ninguna ficha. Ver cabecera. */
  /** Ancho útil de panel en metros. Con él se pueden contar paneles. */
  panelWidth: number | null
  /** Separación entre postes en metros. Con ella se pueden contar postes. */
  postSpacing: number | null
  /** Precio de una puerta, en dólares. Con él se puede cobrar una puerta. */
  gatePrice: number | null
}

type Attrs = Record<string, unknown>

const readString = (a: Attrs, key: string): string | null => {
  const v = a[key]
  return typeof v === "string" && v.trim() ? v.trim() : null
}

const readStrings = (a: Attrs, key: string): string[] => {
  const v = a[key]
  return Array.isArray(v)
    ? v.map((x) => String(x).trim()).filter(Boolean)
    : []
}

/**
 * Lee un número positivo de `attributes`. Acepta `2.4` y `"2.4m"` porque el
 * admin escribe a mano y el resto del catálogo ya mezcla las dos formas
 * (`heightOptions` llega como `["1.5m","1.8m"]`). Cualquier otra cosa —vacío,
 * cero, texto sin cifra— es `null`, y `null` significa «no se pinta».
 */
function readNumber(a: Attrs, key: string): number | null {
  const raw = a[key]
  if (raw == null) return null
  const n = typeof raw === "number" ? raw : parseFloat(String(raw).replace(",", "."))
  return Number.isFinite(n) && n > 0 ? n : null
}

/** `warranty` llega como «15 anos». Interesa el número, no la ortografía. */
function warrantyYears(a: Attrs): number | null {
  const n = parseInt(String(a.warranty ?? ""), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}

export function toQuoteModel(p: Product): QuoteModel {
  const attrs = (p.attributes ?? {}) as Attrs
  const image = p.images?.[0]

  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    description: p.description ?? "",
    price: Number(p.basePrice) || 0,
    unit: p.unit ?? "METRO",
    stock: Number(p.stock) || 0,
    image: image?.url ?? null,
    imageAlt: image?.alt || p.name,
    /* Mismo criterio que la portada y la ficha: el nombre manda. No hay un
       campo «tipo» en la base y la categoría es el uso, no el material. */
    mesh: /malla/i.test(p.name),
    height: heightRange(p),
    material: readString(attrs, "material"),
    warrantyYears: warrantyYears(attrs),
    colors: readStrings(attrs, "colors"),
    panelWidth: readNumber(attrs, "panelWidth"),
    postSpacing: readNumber(attrs, "postSpacing"),
    gatePrice: readNumber(attrs, "gatePrice"),
  }
}

/**
 * Catálogo listo para el precotizador, ordenado por precio ascendente: quien
 * abre una calculadora está mirando el presupuesto, así que la primera ficha
 * del carrusel es la más barata. Se descartan los modelos sin precio: una
 * ficha a $0.00 no es una oferta, es un dato a medio cargar.
 */
export function toQuoteModels(products: Product[]): QuoteModel[] {
  return products
    .map(toQuoteModel)
    .filter((m) => m.price > 0 && m.slug)
    .sort((a, b) => a.price - b.price)
}

/**
 * Resuelve el `?producto=<slug>` con el que llega quien viene de una ficha
 * (ver `buildCalculatorHref` en `productos/[slug]/product-view.ts`). Se hace
 * en el servidor para que el modelo ya venga elegido en el primer HTML: si se
 * resolviera al hidratar, el visitante vería el paso 1 en blanco y luego un
 * salto.
 */
export function findBySlug(models: QuoteModel[], slug: string | undefined) {
  if (!slug) return null
  return models.find((m) => m.slug === slug) ?? null
}

/**
 * Metros que llegan por la URL (`?metros=`). Se acota a un rango con sentido
 * físico: `?metros=1e9` pintaría un total de mil millones de dólares en una
 * página pública, y `?metros=-5` un negativo.
 */
export function parseMeters(raw: string | undefined, fallback: number): number {
  const n = raw ? parseFloat(raw.replace(",", ".")) : NaN
  if (!Number.isFinite(n) || n <= 0) return fallback
  return Math.min(n, 100000)
}
