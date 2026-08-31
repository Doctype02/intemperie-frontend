/* Geometría del terreno — sistema «Perímetro».
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POR QUÉ EXISTE ESTE MÓDULO
 *
 * El precotizador pedía «metros lineales totales a cercar» y daba por hecho que
 * el visitante los sabía. No los sabe: sabe que su lote es de 20 × 30, o que
 * tiene 15 metros de frente. El perímetro era una cuenta que le estábamos
 * cobrando a él —y que además se equivoca sola, porque el error corriente es
 * sumar dos lados y olvidar los otros dos—.
 *
 * Aquí vive esa cuenta y NADA MÁS que esa cuenta: aritmética sobre las medidas
 * que escribe el propio visitante. Ni un dato de su terreno, ni un precio, ni
 * un plazo, ni una cantidad de material. Lo único que este módulo sabe es
 * geometría de sexto grado, y la enseña: cada forma devuelve la operación
 * escrita («2 × (20 + 30) = 100 m»), no sólo el resultado. Quien va a gastar
 * miles de dólares tiene derecho a comprobar de dónde sale el número.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ES ISOMORFO A PROPÓSITO
 *
 * Ni `"use client"` ni una sola importación de React. Lo usan los dos lados:
 *
 *   · el servidor (`calculadora/page.tsx`) para resolver `?forma=&lados=` y
 *     entregar el primer HTML con los metros ya calculados;
 *   · la isla (`fence-calculator.tsx` → `land-planner.tsx`) para recalcular
 *     mientras se teclea, que es lo único que no puede hacer el servidor.
 *
 * Una sola definición de cada forma para los dos, así que la URL que se le pega
 * a un asesor y la pantalla que ve el cliente no pueden discrepar: son la misma
 * función.
 */

/** Ninguna medida de un lado por encima de esto es un terreno. Diez kilómetros
 *  de un solo lado es un dedo apoyado en el teclado, y con cuatro lados así el
 *  perímetro sigue por debajo del tope de `parseMeters`. */
export const LAND_MAX_SIDE = 10000

export type LandShapeId = "rectangulo" | "frente-abierto" | "ele" | "frente"

/** Un lado que el visitante mide y escribe. `letter` es la del diagrama. */
export interface LandSide {
  key: string
  letter: string
  label: string
  hint: string
}

/**
 * El resultado de una forma con unas medidas.
 *
 * `incomplete` no es un error: es que todavía faltan medidas por escribir, y
 * mientras tanto no se toca el campo de metros ni se pinta ninguna queja.
 */
export type LandResult =
  | { kind: "incomplete" }
  | { kind: "invalid"; message: string; keys: string[] }
  | { kind: "ok"; meters: number; operation: string; note: string }

export interface LandShape {
  id: LandShapeId
  /** Cómo se llama en pantalla y en el mensaje de WhatsApp. */
  name: string
  /** Una línea: qué terreno es éste, en palabras de quien lo va a cercar. */
  summary: string
  sides: LandSide[]
  /** Sólo se llama con medidas ya validadas: positivas y dentro del tope. */
  resolve(values: number[]): LandResult
}

/* ── Formato ─────────────────────────────────────────────────────────────── */

/**
 * «45» y no «45.00»; «12.5» cuando el decimal dice algo.
 *
 * Vive aquí y no en la isla porque las operaciones que se pintan («2 × (20 +
 * 30) = 100 m») se escriben en este módulo y el campo de metros se rellena con
 * el mismo texto. Dos formateadores distintos darían un «100» en la operación y
 * un «100.00» en el campo, y parecerían dos números.
 */
export function meterLabel(n: number): string {
  return n.toFixed(2).replace(/\.?0+$/, "")
}

/** Al centímetro. Evita además el «100.60000000000001» del coma flotante. */
const round2 = (n: number) => Math.round(n * 100) / 100

/* ── Las formas ──────────────────────────────────────────────────────────── */

const ok = (meters: number, operation: string, note: string): LandResult => ({
  kind: "ok",
  meters: round2(meters),
  operation,
  note,
})

export const LAND_SHAPES: LandShape[] = [
  /* 1. El lote de toda la vida: cuatro lados, los cuatro cercados. */
  {
    id: "rectangulo",
    name: "Terreno rectangular",
    summary: "Cuatro lados, los cuatro cercados.",
    sides: [
      { key: "a", letter: "a", label: "Frente", hint: "El lado corto, el de la entrada." },
      { key: "b", letter: "b", label: "Fondo", hint: "De la entrada hacia dentro." },
    ],
    resolve([a, b]) {
      const total = 2 * (a + b)
      return ok(
        total,
        `2 × (${meterLabel(a)} + ${meterLabel(b)}) = ${meterLabel(round2(total))} m`,
        "Los cuatro lados: el frente y el fondo se miden dos veces cada uno.",
      )
    },
  },

  /* 2. El mismo lote con la calle delante. Se cerca todo menos el frente: es la
        forma real de media urbanización, y cercar de más son metros pagados de
        más. */
  {
    id: "frente-abierto",
    name: "Rectangular con el frente abierto",
    summary: "Como el rectangular, pero el lado de la calle se queda sin cercar.",
    sides: [
      {
        key: "a",
        letter: "a",
        label: "Frente, a la calle",
        hint: "Este lado NO se cerca. El de atrás, que mide lo mismo, sí.",
      },
      { key: "b", letter: "b", label: "Fondo", hint: "Los dos costados, de la calle hacia dentro." },
    ],
    resolve([a, b]) {
      const total = a + 2 * b
      return ok(
        total,
        `${meterLabel(a)} + 2 × ${meterLabel(b)} = ${meterLabel(round2(total))} m`,
        `No se cerca el frente (${meterLabel(a)} m, el lado de la calle). Sí se cercan los dos costados y el lado de atrás, que mide lo mismo que el frente.`,
      )
    },
  },

  /* 3. En L: el lote con un saliente o con una esquina recortada. Se piden los
        cuatro lados que se pueden medir andando; los otros dos salen de restar,
        y la resta se enseña en la operación. */
  {
    id: "ele",
    name: "Terreno en L",
    summary: "Rectangular con una esquina recortada, o con un saliente.",
    sides: [
      { key: "a", letter: "a", label: "Frente completo", hint: "De punta a punta, el lado largo." },
      { key: "b", letter: "b", label: "Fondo completo", hint: "De punta a punta, el lado largo." },
      { key: "c", letter: "c", label: "Ancho del recorte", hint: "Lo que le falta al frente. Menor que a." },
      { key: "d", letter: "d", label: "Fondo del recorte", hint: "Lo que le falta al fondo. Menor que b." },
    ],
    resolve([a, b, c, d]) {
      if (c >= a) {
        return {
          kind: "invalid",
          message: "El ancho del recorte (c) tiene que ser menor que el frente completo (a): un recorte no puede comerse el lado entero.",
          keys: ["c"],
        }
      }
      if (d >= b) {
        return {
          kind: "invalid",
          message: "El fondo del recorte (d) tiene que ser menor que el fondo completo (b): un recorte no puede comerse el lado entero.",
          keys: ["d"],
        }
      }
      /* Los seis lados en el orden en que se anda el terreno: frente, costado
         hasta el recorte, entrada del recorte, subida del recorte, resto del
         lado de atrás y costado largo de vuelta. */
      const rest = b - d
      const back = a - c
      const total = a + rest + c + d + back + b
      return ok(
        total,
        `${meterLabel(a)} + ${meterLabel(round2(rest))} + ${meterLabel(c)} + ${meterLabel(d)} + ${meterLabel(round2(back))} + ${meterLabel(b)} = ${meterLabel(round2(total))} m`,
        `Los seis lados, dando la vuelta al terreno. Dos salen de restar: ${meterLabel(b)} − ${meterLabel(d)} = ${meterLabel(round2(rest))} y ${meterLabel(a)} − ${meterLabel(c)} = ${meterLabel(round2(back))}.`,
      )
    },
  },

  /* 4. Sólo el frente: un tramo recto. No hay perímetro que calcular y se dice,
        en vez de fingir una cuenta. */
  {
    id: "frente",
    name: "Sólo el frente",
    summary: "Un tramo recto, sin dar la vuelta al terreno.",
    sides: [
      { key: "a", letter: "a", label: "Tramo a cercar", hint: "De un extremo al otro, en línea recta." },
    ],
    resolve([a]) {
      return ok(
        a,
        `${meterLabel(a)} m en línea recta = ${meterLabel(round2(a))} m`,
        "Un solo lado: no hay vuelta que dar ni más tramos que sumar.",
      )
    },
  },
]

export function findLandShape(id: string | undefined): LandShape | null {
  return LAND_SHAPES.find((s) => s.id === id) ?? null
}

/**
 * Resuelve una forma con unas medidas.
 *
 * Las dos comprobaciones que se hacen aquí y no en cada forma son las que valen
 * para todas: falta una medida (no es un error, es que aún se está escribiendo)
 * y una medida absurda. El tope se avisa en vez de recortarse en silencio:
 * recortar «100000» a «10000» bajo los dedos de quien teclea es cambiarle el
 * número sin decírselo.
 */
export function solveLand(shape: LandShape, values: number[]): LandResult {
  const sides = shape.sides.map((_, i) => values[i] ?? 0)

  if (sides.some((v) => !Number.isFinite(v) || v <= 0)) return { kind: "incomplete" }

  const oversized = shape.sides.filter((_, i) => sides[i] > LAND_MAX_SIDE)
  if (oversized.length > 0) {
    return {
      kind: "invalid",
      message: `Ninguna medida puede pasar de ${LAND_MAX_SIDE} m: eso ya no es un terreno. Revisa ${oversized.map((s) => s.label.toLowerCase()).join(" y ")}.`,
      keys: oversized.map((s) => s.key),
    }
  }

  return shape.resolve(sides)
}

/* ── La URL ──────────────────────────────────────────────────────────────── */

/**
 * Forma y medidas, tal como viajan en la URL y como se le pasan a la isla.
 * Plano a propósito: cruza la frontera servidor → cliente como propiedad.
 */
export interface LandSelection {
  shapeId: LandShapeId
  sides: number[]
}

/** `[20, 30]` → «20x30». Una sola clave para todas las medidas: `?lados=`. */
export function serializeSides(values: number[]): string {
  return values.map(meterLabel).join("x")
}

/** «20x30» → `[20, 30]`. Cualquier cosa que no sea un número positivo, fuera. */
function parseSideList(raw: string): number[] {
  return raw
    .split("x")
    .map((part) => parseFloat(part.replace(",", ".")))
    .filter((n) => Number.isFinite(n) && n > 0 && n <= LAND_MAX_SIDE)
}

/** Una forma resuelta: los metros, la cuenta y cómo se cuenta por WhatsApp. */
export interface LandDescription {
  shape: LandShape
  meters: number
  operation: string
  note: string
  /**
   * La línea que se le manda al asesor: de qué forma salen los metros y con qué
   * cuenta. No es decoración. Es lo que permite a quien recibe el mensaje ver
   * que el cliente se dejó un lado ANTES de cortar material.
   */
  summary: string
}

/**
 * Resuelve una forma con sus medidas, en una sola llamada.
 *
 * La usan los dos lados —el servidor al leer la URL y la isla en cada tecla—,
 * así que la operación que se pinta, la que se manda por WhatsApp y la que
 * rellena el campo de metros salen siempre del mismo sitio.
 */
export function describeLand(selection: LandSelection): LandDescription | null {
  const shape = findLandShape(selection.shapeId)
  if (!shape) return null

  const result = solveLand(shape, selection.sides)
  if (result.kind !== "ok") return null

  return {
    shape,
    meters: result.meters,
    operation: result.operation,
    note: result.note,
    summary: `${shape.name} · ${result.operation}`,
  }
}

export interface LandFromUrl {
  selection: LandSelection
  meters: number
  operation: string
  note: string
  summary: string
}

/**
 * Lee `?forma=&lados=` como lista blanca, igual que el resto de parámetros de
 * esta pantalla.
 *
 * O los dos son válidos y completos, o no hay forma: `?forma=ele` a secas, o
 * con tres medidas de las cuatro, devuelve `null` y la página se comporta como
 * si nunca hubiera venido. Media forma en la URL no reproduce ninguna pantalla,
 * y el contrato de estos enlaces es justo ése: pegarle la URL a un asesor tiene
 * que enseñarle lo mismo que está viendo el cliente.
 */
export function parseLand(
  forma: string | undefined,
  lados: string | undefined,
): LandFromUrl | null {
  const shape = findLandShape(forma)
  if (!shape || !lados) return null

  const sides = parseSideList(lados)
  if (sides.length !== shape.sides.length) return null

  const selection: LandSelection = { shapeId: shape.id, sides }
  const described = describeLand(selection)
  if (!described) return null

  return {
    selection,
    meters: described.meters,
    operation: described.operation,
    note: described.note,
    summary: described.summary,
  }
}

/* ── Configuraciones listas ──────────────────────────────────────────────── */

/**
 * Combinaciones de un toque que rellenan forma y medidas.
 *
 * NO SON UNA AFIRMACIÓN SOBRE EL TERRENO DE NADIE. Por eso cada una se llama
 * exactamente por los números que escribe —«20 × 30 m», no «lote residencial
 * típico»—: un nombre así sería una estadística inventada sobre los lotes de
 * Panamá, del mismo género que los seis instaladores falsos y el 30 % de
 * instalación que este sitio lleva el día entero retirando. Son medidas
 * redondas para arrancar en un toque y corregir encima, y la pantalla lo dice
 * con esas palabras.
 *
 * El resultado en metros de cada una NO se escribe aquí: se calcula con
 * `solveLand` al pintarlas, así que no puede quedarse desfasado respecto a la
 * fórmula.
 */
export interface LandPreset {
  id: string
  label: string
  shapeId: LandShapeId
  sides: number[]
}

export const LAND_PRESETS: LandPreset[] = [
  { id: "r20x30", label: "20 × 30 m", shapeId: "rectangulo", sides: [20, 30] },
  { id: "r10x25", label: "10 × 25 m", shapeId: "rectangulo", sides: [10, 25] },
  { id: "a20x30", label: "20 × 30 m sin cercar el frente", shapeId: "frente-abierto", sides: [20, 30] },
  { id: "l20x30", label: "En L de 20 × 30 m", shapeId: "ele", sides: [20, 30, 8, 10] },
  { id: "f15", label: "Sólo 15 m de frente", shapeId: "frente", sides: [15] },
]
