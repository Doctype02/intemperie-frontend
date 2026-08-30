import type { ProductImage, ProductUnit } from "@/types"

/* Datos de la portada — sistema «Perímetro».
 *
 * Una sola petición al catálogo, un solo sitio donde se decide qué producto
 * entra en qué sección. La portada anterior repetía la lógica de agrupación
 * dentro del JSX con listas de nombres escritas a mano («afrodita», «atenea»,
 * «poseid»…): cuando entre un modelo nuevo, no aparecería en ninguna sección
 * y nadie se enteraría. Aquí se agrupa por los campos que la API ya devuelve.
 *
 * Regla de la casa: no se pinta ningún dato que la API no dé. Sin reseñas
 * cargadas no hay estrellas; sin política de envío verificada no hay promesa
 * de envío; sin `createdAt` distintos no hay sección de novedades.
 */

export interface HomeProduct {
  id: string
  name: string
  slug: string
  basePrice: number
  unit: ProductUnit
  stock: number
  createdAt: string
  attributes?: {
    heightOptions?: string[]
    colors?: string[]
    material?: string
    warranty?: string
  } | null
  category?: { name: string; slug: string } | null
  collection?: { name: string; slug: string } | null
  images?: ProductImage[]
}

type Raw = Record<string, unknown>

const str = (v: unknown, fallback = "") => (typeof v === "string" ? v : fallback)
const num = (v: unknown) => (v == null ? 0 : Number(v) || 0)

function normalize(p: Raw): HomeProduct {
  const cat = p.category as Raw | undefined
  const col = p.collection as Raw | undefined
  const attrs = (p.attributes ?? null) as HomeProduct["attributes"]

  return {
    id: str(p.id),
    name: str(p.name),
    slug: str(p.slug),
    /* `basePrice` viaja como cadena («25») porque en la base es Decimal. */
    basePrice: num(p.basePrice),
    unit: (str(p.unit, "METRO") as ProductUnit) ?? "METRO",
    stock: num(p.stock),
    createdAt: str(p.createdAt),
    attributes: attrs,
    category: cat ? { name: str(cat.name), slug: str(cat.slug) } : null,
    collection: col ? { name: str(col.name), slug: str(col.slug) } : null,
    images: Array.isArray(p.images) ? (p.images as ProductImage[]) : [],
  }
}

export async function getCatalog(): Promise<HomeProduct[]> {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"
  try {
    const res = await fetch(`${base}/products?limit=100`, {
      next: { revalidate: 3600, tags: ["products"] },
    })
    if (!res.ok) return []
    const json = await res.json()
    const list = (json?.data ?? json ?? []) as Raw[]
    return Array.isArray(list) ? list.map(normalize).filter((p) => p.slug) : []
  } catch {
    /* La portada tiene que servirse igual si la API está caída: se degrada a
       las secciones estáticas (hero, proceso, cotización) en vez de a un 500. */
    return []
  }
}

/* ── Utilidades de agrupación ──────────────────────────────────────────────
   Todas devuelven listas ya ordenadas por precio ascendente: en un producto
   que se vende por metro lineal, el precio de entrada es el gancho. */

const byPrice = (a: HomeProduct, b: HomeProduct) => a.basePrice - b.basePrice

export const inCategory = (list: HomeProduct[], ...slugs: string[]) =>
  list.filter((p) => p.category && slugs.includes(p.category.slug)).sort(byPrice)

export const isMesh = (p: HomeProduct) => /malla/i.test(p.name)

export const meshes = (list: HomeProduct[]) => list.filter(isMesh).sort(byPrice)

export const cheapest = (list: HomeProduct[], n: number) =>
  [...list].sort(byPrice).slice(0, n)

/* Novedades sólo si hay novedades de verdad. Si todo el catálogo se cargó el
   mismo día —que es el caso hoy: las 15 fichas tienen la misma fecha— la
   sección sería el catálogo entero con otro título, y eso es ruido. */
export function newArrivals(list: HomeProduct[], n: number): HomeProduct[] {
  const days = new Set(list.map((p) => p.createdAt.slice(0, 10)).filter(Boolean))
  if (days.size < 2) return []
  return [...list]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, n)
}

/* ── Alturas ───────────────────────────────────────────────────────────────
   `heightOptions` viene como ["1.5m","1.8m","2.1m"]. Se convierte a número
   para poder ordenar y agrupar sin depender del formato del texto. */
export function heightsOf(p: HomeProduct): number[] {
  const raw = p.attributes?.heightOptions
  if (!Array.isArray(raw)) return []
  return raw
    .map((h) => parseFloat(String(h).replace(",", ".")))
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b)
}

export interface HeightBand {
  label: string
  range: string
  use: string
  products: HomeProduct[]
}

/* Tres franjas que corresponden a tres decisiones distintas de comprador:
   delimitar, cerrar un perímetro y disuadir. Un producto puede aparecer en
   más de una franja si su rango de alturas la cruza — porque es cierto. */
export function heightBands(list: HomeProduct[]): HeightBand[] {
  const bands: Array<Omit<HeightBand, "products"> & { min: number; max: number }> = [
    { label: "Hasta 1.5 m", range: "0.9 – 1.5 m", use: "Delimitar jardines, piscinas y frentes", min: 0, max: 1.5 },
    { label: "De 1.8 a 2.1 m", range: "1.8 – 2.1 m", use: "Cerrar el perímetro de una casa o una nave", min: 1.6, max: 2.1 },
    { label: "2.4 m o más", range: "2.4 – 3.0 m", use: "Disuadir: obra, planta e instalación pública", min: 2.2, max: 99 },
  ]

  return bands
    .map(({ min, max, ...rest }) => ({
      ...rest,
      products: list
        .filter((p) => heightsOf(p).some((h) => h >= min && h <= max))
        .sort(byPrice),
    }))
    .filter((b) => b.products.length > 0)
}

/* Precio de entrada de un conjunto: «desde $X/m». Sale del catálogo, no de
   una cifra escrita a mano que se queda vieja en la primera subida de precio. */
export function priceFrom(list: HomeProduct[]): number | null {
  const prices = list.map((p) => p.basePrice).filter((n) => n > 0)
  return prices.length ? Math.min(...prices) : null
}

/* Garantía máxima real del catálogo, leída de `attributes.warranty`
   («15 anos»). Si mañana el modelo tope baja a 12, el titular baja con él. */
export function maxWarrantyYears(list: HomeProduct[]): number | null {
  const years = list
    .map((p) => parseInt(String(p.attributes?.warranty ?? ""), 10))
    .filter((n) => Number.isFinite(n) && n > 0)
  return years.length ? Math.max(...years) : null
}

/* ── Segmentos ─────────────────────────────────────────────────────────────
   El cliente no busca «categoría 68e7ece4»: busca cercar su casa, su nave o
   su finca. Los `slug` son los de la API (`/categories`), así que el enlace
   «Ver todo» cae en un listado que existe y trae resultados.

   La foto es la que la propia API asigna a la categoría, que apunta a un
   fichero real de `/public/products`. No hay foto inventada ni de banco.

   `who` y `promise` son texto editorial —no dato— y están aquí para que la
   portada y la navegación no se contradigan entre sí. */
export interface Segment {
  slug: string
  name: string
  who: string
  promise: string
  image: string | null
}

export const SEGMENTS: Segment[] = [
  {
    slug: "residencial",
    name: "Residencial",
    who: "Casas, quintas y urbanizaciones",
    promise: "Cerrar el frente sin volver a pintar",
    image: "/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg",
  },
  {
    slug: "industrial",
    name: "Industrial",
    who: "Naves, depósitos y obra",
    promise: "Altura y calibre para perímetro pesado",
    image: "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg",
  },
  {
    slug: "zonas-costeras",
    name: "Zonas costeras",
    who: "Frente al mar y al salitre",
    promise: "PVC marino: ni óxido ni decoloración",
    image: "/products/cerca-pvc-poseidon-502/1-pagina-principal.jpg",
  },
  {
    slug: "gubernamental",
    name: "Gubernamental",
    who: "Escuelas, entidades y espacio público",
    promise: "Malla anti-escalable de 3 m",
    image: "/products/cerca-pvc-atenea-305/2.jpg",
  },
  {
    slug: "agropecuario",
    name: "Agropecuario",
    who: "Fincas, potreros y haciendas",
    promise: "Tramos largos a coste por metro",
    image: null,
  },
]

export interface SegmentSection extends Segment {
  products: HomeProduct[]
  total: number
  from: number | null
}

/* Un segmento con un solo modelo no llena una fila y parece un fallo de carga.
   Los que no llegan al mínimo siguen visibles en la parrilla «comprar por uso»,
   que es donde toca: existen, pero no merecen sección propia. */
export function segmentSections(list: HomeProduct[], min = 2): SegmentSection[] {
  return SEGMENTS.map((seg) => {
    const products = inCategory(list, seg.slug)
    return { ...seg, products, total: products.length, from: priceFrom(products) }
  }).filter((s) => s.total >= min)
}

/* La parrilla de usos sí los muestra todos, con su recuento real. Un segmento
   sin modelos cargados no manda a un listado vacío: manda a WhatsApp. */
export function segmentCards(list: HomeProduct[]): SegmentSection[] {
  return SEGMENTS.map((seg) => {
    const products = inCategory(list, seg.slug)
    return { ...seg, products, total: products.length, from: priceFrom(products) }
  })
}

/* ── Formato ───────────────────────────────────────────────────────────────
   Un solo sitio decide cómo se escribe un precio y su unidad. `unit` es un
   enum de Prisma (METRO | PANEL | UNIDAD); si mañana aparece otro valor, se
   traduce aquí y no en quince plantillas. */
export const unitSuffix = (unit: ProductUnit) =>
  unit === "METRO" ? "/m" : unit === "PANEL" ? "/panel" : "c/u"

export const unitLong = (unit: ProductUnit) =>
  unit === "METRO" ? "por metro lineal" : unit === "PANEL" ? "por panel" : "por unidad"

/* Rango de alturas listo para pintar: «0.9 – 1.5 m». Es el primer dato que
   pregunta quien cerca un terreno y lo tienen los 15 productos del catálogo. */
export function heightRange(p: HomeProduct): string | null {
  const h = heightsOf(p)
  if (!h.length) return null
  const fmt = (n: number) => `${n.toFixed(1)} m`
  return h.length === 1 ? fmt(h[0]) : `${h[0].toFixed(1)} – ${fmt(h[h.length - 1])}`
}

/* Años de garantía de un producto concreto. `warranty` viaja como «15 anos». */
export function warrantyYears(p: HomeProduct): number | null {
  const n = parseInt(String(p.attributes?.warranty ?? ""), 10)
  return Number.isFinite(n) && n > 0 ? n : null
}
