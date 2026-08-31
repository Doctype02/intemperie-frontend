/* Moldes del plano — sistema «Perímetro».
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POR QUÉ EXISTE ESTE MÓDULO
 *
 * El plano de inspección se levanta de pie, en un terreno, con sol y a veces
 * con guantes, dibujando con el dedo sobre una pantalla de cinco pulgadas. A
 * mano alzada y en esas condiciones, un portón sale de un garabato que sólo
 * entiende quien lo dibujó, y el plano se imprime y se lo lleva otra persona a
 * la obra. Aquí viven las piezas prefabricadas para no tener que dibujarlas:
 * el inspector coloca un tramo, un portón o un poste, y sale siempre igual.
 *
 * Las cinco piezas y sus nombres NO se han inventado: son las de la tabla de
 * materiales de esta misma pantalla, que es el vocabulario con el que esta
 * empresa cotiza. «TOTAL ML» es el tramo; «P. ESQUINERO» es la esquina; «TOTAL
 * POSTES» es el poste; y las dos columnas de accesorios —«PRTA» y «PRTON»— son
 * exactamente la distinción entre la puerta por la que entra una persona y el
 * portón por el que entra un carro. Si el inspector rellena esas dos columnas
 * abajo, el plano de arriba tiene que poder decir cuál es cuál.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * QUÉ NO SABE ESTE MÓDULO, A PROPÓSITO
 *
 *   · NO sabe de colores. Recibe la tinta ya resuelta como cadena. Los tokens
 *     `--plan-*` se leen en `page.tsx` (`readPlanPalette`) pintando un píxel,
 *     porque es la única manera fiable de convertir `lab()` a hexadecimal. Un
 *     literal de color aquí sería un color fuera del sistema.
 *   · NO sabe cuánto mide un metro. El plano no tiene escala: es un croquis de
 *     situación, no un levantamiento topográfico. Por eso ninguna pieza
 *     escribe una medida al lado, ni el módulo convierte píxeles a metros. Los
 *     metros los pone el inspector en «TOTAL ML», medidos en el terreno. Un
 *     número inventado dentro de un plano que se imprime y se lleva a la obra
 *     es material cortado de menos.
 *   · NO sabe de React ni del DOM. Es geometría sobre un contexto 2D, así que
 *     la misma función pinta la pieza en el plano y la miniatura de la paleta,
 *     y las dos no pueden discrepar nunca.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * EL SISTEMA DE COORDENADAS
 *
 * Cada pieza se dibuja en local: el origen es el punto de anclaje, el eje +x
 * corre a lo largo de la pieza y el eje +y va hacia abajo (el del lienzo). El
 * giro y el traslado los aplica `drawMolde` una sola vez, así que cada figura
 * se escribe como si estuviera horizontal. Las hojas de portón y puerta abren
 * hacia −y, que en el plano es «hacia dentro de la propiedad».
 *
 * Todas las medidas están en píxeles del MAPA DE BITS (1180 × 420), no en
 * píxeles de pantalla: son las mismas unidades en las que ya se dibuja la
 * cuadrícula, que va cada 20. Por eso las piezas se miden en múltiplos de la
 * cuadrícula y no en «lo que se ve bien en mi monitor»: la caja del lienzo es
 * elástica y lo que se ve bien depende del teléfono.
 */

export type MoldeId = "tramo" | "esquina" | "porton" | "puerta" | "poste"

/** Lado de la cuadrícula del plano, en píxeles del mapa de bits. */
const CELDA = 20

export interface Molde {
  id: MoldeId
  /** Cómo se llama en la paleta y en el nombre accesible del botón. */
  label: string
  /** Qué coloca y desde dónde, en una línea. Va en el `title` del botón. */
  hint: string
  /**
   * Tamaño de fábrica, para cuando se toca el plano sin arrastrar. Un toque
   * tiene que dejar una pieza usable: obligar a arrastrar para que aparezca
   * algo convierte el molde en un gesto de precisión, que es lo que veníamos a
   * quitar.
   */
  length: number
  /**
   * `true` si la pieza se queda debajo del dedo mientras se arrastra en vez de
   * crecer desde donde se tocó. Sólo el poste: no tiene largo que estirar, así
   * que arrastrar sólo puede significar «ponlo un poco más allá».
   */
  follows: boolean
  /** Dónde y de qué largo se pinta en la miniatura de 48 × 30 de la paleta. */
  icon: { x: number; y: number; length: number }
}

/**
 * Las cinco piezas, en el orden en que se levanta un plano: primero el cerco,
 * luego por dónde se entra, y al final los postes sueltos que haya que marcar.
 */
export const MOLDES: Molde[] = [
  {
    id: "tramo",
    label: "Tramo",
    hint: "Tramo de cerca. Toca donde empieza y arrastra hasta donde termina.",
    length: 10 * CELDA,
    follows: false,
    icon: { x: 5, y: 15, length: 38 },
  },
  {
    id: "esquina",
    label: "Esquina",
    hint: "Esquina con poste esquinero. Toca la esquina y arrastra por uno de los dos lados.",
    length: 7 * CELDA,
    follows: false,
    icon: { x: 9, y: 25, length: 21 },
  },
  {
    id: "porton",
    label: "Portón de carro",
    hint: "Portón de dos hojas, por donde entra un carro. Toca una jamba y arrastra hasta la otra.",
    length: 8 * CELDA,
    follows: false,
    icon: { x: 5, y: 25, length: 38 },
  },
  {
    id: "puerta",
    label: "Puerta de persona",
    hint: "Puerta de una hoja, por donde entra una persona. Toca una jamba y arrastra hasta la otra.",
    length: 4 * CELDA,
    follows: false,
    icon: { x: 13, y: 25, length: 22 },
  },
  {
    id: "poste",
    label: "Poste",
    hint: "Un poste suelto: tope, ciego o 3WAY. Toca donde va.",
    length: CELDA,
    follows: true,
    icon: { x: 24, y: 15, length: CELDA },
  },
]

export function findMolde(id: string): Molde | null {
  return MOLDES.find((m) => m.id === id) ?? null
}

/** ¿Esta herramienta es un molde? Lo usa el motor de dibujo para bifurcar. */
export function isMolde(tool: string): tool is MoldeId {
  return MOLDES.some((m) => m.id === tool)
}

/* ── El gesto ────────────────────────────────────────────────────────────── */

/**
 * Cuánto hay que arrastrar para que el gesto cuente como «dame este largo» en
 * vez de «colócalo del tamaño de fábrica».
 *
 * Son píxeles del mapa de bits. En un teléfono de 360 px la caja del lienzo
 * mide unos 328 px de ancho para 1180 de mapa de bits, así que 16 aquí son
 * menos de 5 px bajo el dedo: por debajo de eso no hay intención de arrastrar,
 * hay pulso. Y un dedo tiembla.
 */
export const MIN_ARRASTRE = 16

/** Imán de los ángulos rectos, en radianes (6°). */
const IMAN = (6 * Math.PI) / 180

/**
 * Ajusta el giro a los múltiplos de 45° cuando el dedo se queda cerca de uno.
 *
 * Casi todo lo que se cerca es recto, y un tramo a 2° de la horizontal está
 * torcido, no inclinado: quien lo lea en la obra verá un error de dibujo donde
 * no lo hay. Pero el imán es corto a propósito —6°— porque un terreno real sí
 * puede tener un lado a 30°, y forzarlo a 45° sería dibujar un terreno que no
 * existe. Se ayuda al pulso, no se corrige el terreno.
 */
export function snapAngle(angle: number): number {
  const paso = Math.PI / 4
  const recto = Math.round(angle / paso) * paso
  return Math.abs(angle - recto) <= IMAN ? recto : angle
}

export interface Gesto {
  /** Dónde se tocó el plano, en píxeles del mapa de bits. */
  startX: number
  startY: number
  /** Dónde está el dedo ahora. En un toque sin arrastre, lo mismo. */
  x: number
  y: number
}

export interface Colocacion {
  x: number
  y: number
  angle: number
  length: number
}

/**
 * Traduce el gesto a una colocación concreta.
 *
 * Se calcula aquí y no en el motor de dibujo para que la vista previa que
 * sigue al dedo y la pieza que queda al soltar salgan de la misma cuenta: si
 * cada una decidiera su tamaño por su lado, la pieza se movería al levantar el
 * dedo, que es la manera más rápida de que nadie se fíe de la herramienta.
 */
export function placeMolde(molde: Molde, g: Gesto): Colocacion {
  const dx = g.x - g.startX
  const dy = g.y - g.startY
  const arrastre = Math.hypot(dx, dy)

  if (molde.follows) {
    /* El poste no tiene largo ni giro: va donde está el dedo y ya está. */
    return { x: g.x, y: g.y, angle: 0, length: molde.length }
  }

  if (arrastre < MIN_ARRASTRE) {
    return { x: g.startX, y: g.startY, angle: 0, length: molde.length }
  }

  return {
    x: g.startX,
    y: g.startY,
    angle: snapAngle(Math.atan2(dy, dx)),
    length: arrastre,
  }
}

/* ── El dibujo ───────────────────────────────────────────────────────────── */

export interface Tinta {
  /** Color ya resuelto a algo que entienda el contexto 2D. */
  color: string
  /** El grosor que el inspector eligió con el deslizador. */
  width: number
}

/** Radio del poste. Crece con el grosor para que no desaparezca a trazo fino. */
const radioPoste = (w: number) => Math.max(4, w * 2)

/** Un poste: círculo relleno. Es la marca que la tabla cuenta como «P.». */
function poste(g: CanvasRenderingContext2D, x: number, y: number, w: number) {
  g.beginPath()
  g.arc(x, y, radioPoste(w), 0, Math.PI * 2)
  g.fill()
}

/**
 * Un tramo de cerca desde el origen hacia +x.
 *
 * Se dibuja como el eje más los travesaños perpendiculares: es la notación de
 * cerca de toda la vida en un plano de situación, y es lo que distingue de un
 * vistazo un lado cercado de una línea cualquiera —el lindero, una pared, el
 * borde de la calle— en un croquis lleno de rayas.
 */
function tramo(
  g: CanvasRenderingContext2D,
  length: number,
  w: number,
  postes: { inicio: boolean; fin: boolean },
) {
  g.beginPath()
  g.moveTo(0, 0)
  g.lineTo(length, 0)
  g.stroke()

  /* Travesaños cada celda de cuadrícula larga, y nunca menos de dos: un tramo
     corto sin ni un travesaño se lee como una raya suelta. */
  const paso = Math.max(length / 6, CELDA)
  const alto = Math.max(6, w * 3)
  g.save()
  g.lineWidth = Math.max(1, w * 0.75)
  for (let d = paso / 2; d < length; d += paso) {
    g.beginPath()
    g.moveTo(d, -alto)
    g.lineTo(d, alto)
    g.stroke()
  }
  g.restore()

  if (postes.inicio) poste(g, 0, 0, w)
  if (postes.fin) poste(g, length, 0, w)
}

/**
 * Una hoja de portón con su arco de apertura.
 *
 * El arco no es decoración: dice hacia dónde barre la hoja al abrirse, que es
 * justo el dato por el que se vuelve a la obra —una hoja que abre contra el
 * talud, contra el carro aparcado o contra la pared del vecino—. Se dibuja con
 * trazo discontinuo porque es un recorrido, no un material.
 */
function hoja(
  g: CanvasRenderingContext2D,
  cx: number,
  radio: number,
  desde: number,
  hasta: number,
  w: number,
) {
  g.beginPath()
  g.moveTo(cx, 0)
  g.lineTo(cx + Math.cos(hasta) * radio, Math.sin(hasta) * radio)
  g.stroke()

  g.save()
  g.lineWidth = Math.max(1, w * 0.6)
  g.setLineDash([6, 6])
  g.beginPath()
  g.arc(cx, 0, radio, desde, hasta, hasta < desde)
  g.stroke()
  g.restore()
}

/** Cuánto se abre la hoja en el dibujo. No es una medida: es que se vea. */
const APERTURA = (-55 * Math.PI) / 180

/**
 * Pinta una pieza en el contexto, ya colocada y girada.
 *
 * Todo va dentro de un `save`/`restore` y con el trazo declarado entero
 * —color, grosor, remates, discontinuo— porque el contexto es compartido: si
 * una pieza se dejara el `setLineDash` puesto, el siguiente trazo a mano
 * alzada saldría de puntos y nadie sabría por qué.
 */
export function drawMolde(
  g: CanvasRenderingContext2D,
  id: MoldeId,
  place: Colocacion,
  tinta: Tinta,
) {
  const molde = findMolde(id)
  if (!molde) return

  const { length } = place
  const w = tinta.width

  g.save()
  g.translate(place.x, place.y)
  g.rotate(place.angle)
  g.strokeStyle = tinta.color
  g.fillStyle = tinta.color
  g.lineWidth = w
  g.lineCap = "round"
  g.lineJoin = "round"
  g.setLineDash([])

  if (id === "tramo") {
    tramo(g, length, w, { inicio: true, fin: true })
  }

  if (id === "esquina") {
    /* El anclaje es la esquina misma y no un extremo: quien levanta un plano
       se pone en la esquina del lote y tira desde ahí. Los dos lados salen del
       mismo punto, uno por +x y otro por −y, con el esquinero en el vértice. */
    tramo(g, length, w, { inicio: false, fin: true })
    g.save()
    g.rotate(-Math.PI / 2)
    tramo(g, length, w, { inicio: false, fin: true })
    g.restore()
    /* El esquinero se pinta más gordo que un poste de línea: en la tabla de
       materiales es una fila aparte y en el terreno es otra pieza. */
    poste(g, 0, 0, w * 1.6)
  }

  if (id === "porton") {
    /* Dos hojas, cada una la mitad del vano. El vano queda VACÍO a propósito:
       un portón es el hueco de la cerca, y taparlo con una línea sería dibujar
       precisamente lo que no hay. */
    poste(g, 0, 0, w * 1.4)
    poste(g, length, 0, w * 1.4)
    hoja(g, 0, length / 2, 0, APERTURA, w)
    hoja(g, length, length / 2, Math.PI, Math.PI - APERTURA, w)
  }

  if (id === "puerta") {
    /* Una sola hoja, del ancho entero del vano: es la diferencia dibujada
       entre «PRTA» y «PRTON» de la tabla de materiales. */
    poste(g, 0, 0, w * 1.4)
    poste(g, length, 0, w * 1.4)
    hoja(g, 0, length, 0, APERTURA, w)
  }

  if (id === "poste") {
    poste(g, 0, 0, w * 1.4)
  }

  g.restore()
}

/**
 * La misma pieza, encajada en la miniatura de la paleta.
 *
 * Existe para que el botón enseñe EXACTAMENTE lo que va a caer en el plano:
 * dibujar el icono aparte —en SVG, a mano— es garantizar que dentro de tres
 * meses la paleta prometa una figura y el lienzo pinte otra.
 */
export function drawMoldeIcon(
  g: CanvasRenderingContext2D,
  id: MoldeId,
  tinta: Tinta,
) {
  const molde = findMolde(id)
  if (!molde) return
  const { x, y, length } = molde.icon
  drawMolde(g, id, { x, y, angle: 0, length }, tinta)
}
