import type { Product, ProductImage, ProductUnit } from "@/types";

/* ═══════════════════════════════════════════════════════════════════════════
   Modelo de vista de la ficha de producto.
   ---------------------------------------------------------------------------
   La API devuelve los datos que deciden una compra de cercas repartidos en dos
   sitios y con formatos distintos:

     · `attributes`     — objeto Json libre: heightOptions, colors, material,
                          warranty, wireGauge, meshSize, reinforcement,
                          resistance, protection, details, antiClimbing.
     · `specifications` — array de { label, value } escrito a mano por el admin.

   Los dos se solapan (`attributes.material` y una fila «Material», la altura
   como array y como texto «1.5m, 1.8m, 2.1m»...). Aquí se funden en UNA tabla
   sin filas repetidas, y de ahí salen también los cuatro datos destacados.

   Nada se inventa: si el producto no trae el campo, la fila no existe.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Acentos ──────────────────────────────────────────────────────────────
   El catálogo se cargó sin tildes ni eñes («15 anos», «Diseno», «maxima»).
   Corregirlo en la base de datos es otro trabajo; mientras tanto la ficha no
   puede leerse como un error de codificación. Lista blanca de palabras: sólo
   se toca lo que está aquí, nunca se adivina. */
const ACCENTS: Record<string, string> = {
  ano: "año",
  anos: "años",
  arquitectonico: "arquitectónico",
  caracteristica: "característica",
  caracteristicas: "características",
  clasica: "clásica",
  clasico: "clásico",
  contemporaneo: "contemporáneo",
  corrosion: "corrosión",
  critica: "crítica",
  diseno: "diseño",
  disenada: "diseñada",
  disenado: "diseñado",
  estandar: "estándar",
  estetica: "estética",
  exposicion: "exposición",
  facil: "fácil",
  garantia: "garantía",
  ingenieria: "ingeniería",
  instalacion: "instalación",
  laminas: "láminas",
  maxima: "máxima",
  maximo: "máximo",
  nucleo: "núcleo",
  perfileria: "perfilería",
  proteccion: "protección",
  quimica: "química",
  quimicos: "químicos",
  tamano: "tamaño",
  version: "versión",
};

const WORD = /[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+/g;

/** Repone tildes y eñes de una lista cerrada de palabras, conservando la caja. */
export function fixText(input: string): string {
  return input.replace(WORD, (word) => {
    const fixed = ACCENTS[word.toLowerCase()];
    if (!fixed) return word;
    return word[0] === word[0].toUpperCase()
      ? fixed[0].toUpperCase() + fixed.slice(1)
      : fixed;
  });
}

/* ── Lectura defensiva de `attributes` (Json libre en Prisma) ───────────── */

function readString(value: unknown): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? fixText(trimmed) : undefined;
}

function readStringList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .filter((v): v is string => typeof v === "string" && v.trim().length > 0)
    .map((v) => fixText(v.trim()));
}

/* ── Fusión de filas ────────────────────────────────────────────────────── */

export interface SpecRow {
  /** Clave canónica; sirve para no repetir la misma fila dos veces. */
  key: string;
  label: string;
  value: string;
}

/** «Tamaño de malla» y «tamano de malla» son la misma fila. */
function normalizeLabel(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Etiquetas distintas que el admin usa para el mismo dato. */
const LABEL_ALIASES: Record<string, string> = {
  altura: "altura",
  alturas: "altura",
  alturadisponible: "altura",
  alturasdisponibles: "altura",
  color: "colores",
  colores: "colores",
  coloresdisponibles: "colores",
  material: "material",
  materiales: "material",
  garantia: "garantia",
  calibre: "calibre",
  calibredelalambre: "calibre",
  tamanodemalla: "malla",
  medidademalla: "malla",
  refuerzo: "refuerzo",
  resistencia: "resistencia",
  proteccion: "proteccion",
  detalles: "detalles",
  detalle: "detalles",
  acabado: "acabado",
  uso: "uso",
  diseno: "diseno",
};

function canonicalKey(label: string): string {
  const normalized = normalizeLabel(label);
  return LABEL_ALIASES[normalized] ?? normalized;
}

/** Orden de lectura de un comprador de cercas: primero el alto, luego el resto. */
const KEY_ORDER = [
  "altura",
  "colores",
  "material",
  "calibre",
  "malla",
  "refuerzo",
  "resistencia",
  "proteccion",
  "acabado",
  "diseno",
  "detalles",
  "uso",
  "caracteristica",
  "garantia",
];

function rank(key: string): number {
  const i = KEY_ORDER.indexOf(key);
  return i === -1 ? KEY_ORDER.length : i;
}

/**
 * Añade una fila si aporta algo. Ante la misma clave gana el valor más
 * específico: `attributes.material` dice «PVC virgen» y la fila escrita a mano
 * dice «PVC virgen de alta densidad» — la segunda es la que sirve al cliente.
 */
function upsert(rows: Map<string, SpecRow>, label: string, value: string | undefined) {
  if (!value) return;
  const key = canonicalKey(label);
  const current = rows.get(key);
  if (!current) {
    rows.set(key, { key, label, value });
    return;
  }
  if (value.length > current.value.length) {
    rows.set(key, { key, label: current.label, value });
  }
}

/* ── Unidades ───────────────────────────────────────────────────────────── */

interface UnitCopy {
  /** Sufijo del precio: «$25.00 /m lineal». */
  price: string;
  /** Nombre del campo de cantidad: «Metros lineales». */
  field: string;
  /** Sufijo corto tras una cifra: «40 m». */
  abbr: string;
  /** Cantidad mínima de venta. */
  min: number;
}

const UNITS: Record<ProductUnit, UnitCopy> = {
  METRO: { price: "/m lineal", field: "Metros lineales", abbr: "m", min: 10 },
  PANEL: { price: "/panel", field: "Cantidad de paneles", abbr: "paneles", min: 1 },
  UNIDAD: { price: "/unidad", field: "Cantidad", abbr: "unidades", min: 1 },
};

/* ── Vista ──────────────────────────────────────────────────────────────── */

export interface ProductView {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  unit: ProductUnit;
  unitCopy: UnitCopy;
  stock: number;
  categoryName?: string;
  collectionName?: string;
  images: ProductImage[];
  /** Alturas de fábrica: el primer dato que pregunta quien va a cercar. */
  heights: string[];
  colors: string[];
  material?: string;
  warranty?: string;
  /** Tabla técnica completa, sin filas repetidas. */
  specs: SpecRow[];
  /** Los cuatro datos que se pintan grandes junto al precio. */
  highlights: SpecRow[];
}

/** Claves que merecen sitio destacado, por orden de interés comercial. */
const HIGHLIGHT_KEYS = ["altura", "material", "garantia", "calibre", "refuerzo", "proteccion"];

export function toProductView(product: Product): ProductView {
  const attributes = (product.attributes ?? {}) as Record<string, unknown>;

  const heights = readStringList(attributes.heightOptions);
  const colors = readStringList(attributes.colors);
  const material = readString(attributes.material);
  const warranty = readString(attributes.warranty);
  const wireGauge = readString(attributes.wireGauge);
  const meshSize = readString(attributes.meshSize);
  const reinforcement = readString(attributes.reinforcement);
  const resistance = readString(attributes.resistance);
  const protection = readString(attributes.protection);
  const details = readString(attributes.details);
  const antiClimbing = attributes.antiClimbing === true;

  const rows = new Map<string, SpecRow>();

  // 1. Lo estructurado manda: sale de columnas, no de texto libre.
  upsert(rows, "Altura disponible", heights.length > 0 ? heights.join(" · ") : undefined);
  upsert(rows, "Colores", colors.length > 0 ? colors.join(", ") : undefined);
  upsert(rows, "Material", material);
  // «Calibre 6 (4.9mm)» ya lleva la etiqueta dentro del valor.
  upsert(rows, "Calibre", wireGauge?.replace(/^calibre\s+/i, ""));
  upsert(rows, "Tamaño de malla", meshSize);
  upsert(rows, "Refuerzo", reinforcement);
  upsert(rows, "Resistencia", resistance);
  upsert(rows, "Protección", protection);
  upsert(rows, "Detalles", details);
  upsert(rows, "Característica", antiClimbing ? "Anti-escalable" : undefined);
  upsert(rows, "Garantía", warranty);

  // 2. Las filas escritas a mano completan lo que no cabe en `attributes`.
  if (Array.isArray(product.specifications)) {
    for (const spec of product.specifications) {
      const label = readString(spec?.label);
      const value = readString(spec?.value);
      if (label && value) upsert(rows, label, value);
    }
  }

  const specs = [...rows.values()].sort((a, b) => rank(a.key) - rank(b.key));

  const highlights = HIGHLIGHT_KEYS.map((key) => rows.get(key)).filter(
    (row): row is SpecRow => row !== undefined,
  ).slice(0, 4);

  const images = [...(product.images ?? [])]
    .filter((img) => typeof img?.url === "string" && img.url.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const unit: ProductUnit = product.unit ?? "METRO";

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    // `basePrice` viaja como string decimal («"25"») en la respuesta JSON.
    description: product.description ? fixText(product.description) : "",
    price: Number(product.basePrice ?? 0),
    unit,
    unitCopy: UNITS[unit] ?? UNITS.METRO,
    stock: Number(product.stock ?? 0),
    categoryName: product.category?.name,
    collectionName: product.collection?.name,
    images,
    heights,
    colors,
    material,
    warranty,
    specs,
    highlights,
  };
}

/* ── Lo que cruza al cliente ────────────────────────────────────────────── */

/**
 * Subconjunto que necesita el panel de compra. La ficha técnica completa, la
 * descripción y el resto de imágenes se quedan en el servidor: cada campo que
 * cruza la frontera se serializa otra vez en la carga RSC del HTML.
 */
export type PurchaseTarget = Pick<
  ProductView,
  | "id"
  | "name"
  | "slug"
  | "price"
  | "unit"
  | "unitCopy"
  | "stock"
  | "heights"
  | "colors"
  | "categoryName"
  | "collectionName"
> & { imageUrl?: string };

export function toPurchaseTarget(product: ProductView): PurchaseTarget {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price: product.price,
    unit: product.unit,
    unitCopy: product.unitCopy,
    stock: product.stock,
    heights: product.heights,
    colors: product.colors,
    categoryName: product.categoryName,
    collectionName: product.collectionName,
    imageUrl: product.images[0]?.url,
  };
}

/* ── Enlaces salientes con contexto ─────────────────────────────────────── */

export interface QuoteContext {
  /** Sólo si el visitante escribió una cantidad; el valor por defecto no cuenta. */
  quantity?: number;
  height?: string;
  color?: string;
}

/**
 * Mensaje de WhatsApp con el producto ya puesto. Sin contexto, el vendedor
 * abre el chat preguntando «¿de qué producto?»; con él, responde un precio.
 */
export function buildQuoteMessage(product: PurchaseTarget, ctx: QuoteContext = {}): string {
  const lines = [
    "Hola Intemperie, quiero cotizar:",
    `• Producto: ${product.name}`,
  ];
  if (ctx.quantity && ctx.quantity > 0) {
    lines.push(`• ${product.unitCopy.field}: ${ctx.quantity}`);
  }
  if (ctx.height) lines.push(`• Altura: ${ctx.height}`);
  if (ctx.color) lines.push(`• Color: ${ctx.color}`);
  lines.push(`• Referencia: intemperie.com.pa/productos/${product.slug}`);
  return lines.join("\n");
}

/**
 * Precotizador con el producto preseleccionado.
 * Contrato de la URL: `?producto=<slug>` y, si se sabe, `&metros=<n>`.
 */
export function buildCalculatorHref(product: PurchaseTarget, quantity?: number): string {
  const params = new URLSearchParams({ producto: product.slug });
  if (quantity && quantity > 0) params.set("metros", String(quantity));
  return `/calculadora?${params}`;
}
