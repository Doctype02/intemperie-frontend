"use client";

import { useRef, useEffect, useId, useState, useCallback, useSyncExternalStore } from "react";
import { ChevronDown, ChevronRight, ClipboardList, Eraser, Grid3x3, Lock, Minus, Pencil, RectangleHorizontal, Redo2, Send, Trash2, Type, Undo2 } from "lucide-react";

import { useAuthStore } from "@/lib/store/auth-store";
import {
  MOLDES,
  drawMolde,
  drawMoldeIcon,
  findMolde,
  isMolde,
  placeMolde,
  type MoldeId,
} from "./moldes";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { whatsappHref } from "@/components/ui/icon-whatsapp";

/* Ficha de inspección — sistema «Perímetro».
 *
 * Es la única pantalla del sitio que se usa de pie, en un terreno, con sol y a
 * veces con guantes: un inspector dibuja el contorno de la finca, apunta los
 * materiales y recoge dos firmas. Llegaba con 67 colores escritos a mano
 * —green-700, gray-300, blue-900, red-500 y tres hexadecimales metidos dentro
 * del contexto 2D—, botones de 26 px, campos de 9 px que obligan a Safari a
 * hacer zoom al enfocarlos y una tabla de once columnas que reventaba el ancho
 * de la página en cualquier móvil.
 *
 * Lo que cambia en el motor de dibujo (lo demás, más abajo):
 *
 *   · Color. El contexto 2D no entiende clases de Tailwind, así que hay que
 *     darle cadenas. Se las damos leídas del propio sistema, no escritas a
 *     mano: ver `readPlanPalette`.
 *   · Dedo. Eventos de puntero en vez de ratón+tacto, y con captura: el trazo
 *     sigue al dedo aunque se salga de la hoja, y un segundo dedo apoyado ya
 *     no parte la línea en dos.
 *   · Dedo y píxel. Las coordenadas se escalan al mapa de bits. Sin eso, en un
 *     móvil de 360 px la tinta aparecía a un tercio de distancia de donde
 *     tocabas: el lienzo mide 1180×420 píxeles de mapa de bits y la caja es
 *     elástica, y el código anterior restaba la posición de la caja sin
 *     convertir la unidad. Es la única corrección de comportamiento del
 *     encargo y va declarada en el informe: sin ella, «responde al dedo» no
 *     significa nada.
 *
 * NO se toca qué dibuja cada herramienta, ni el historial de deshacer, ni el
 * contador de localStorage, ni los cálculos de la tabla, ni las firmas.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LOS MOLDES
 *
 * Encima de todo eso hay ahora cinco piezas prefabricadas (`moldes.ts`): un
 * tramo de cerca, una esquina, un portón de carro, una puerta de persona y un
 * poste. Dibujar un portón a mano alzada con el dedo, de pie y a pleno sol, da
 * un garabato que sólo entiende quien lo hizo; y esta hoja se imprime y se la
 * lleva otra persona a la obra.
 *
 * Se colocan con EL MISMO gesto que ya hace la herramienta «Línea»: se toca
 * donde empieza la pieza y se arrastra hasta donde termina, con vista previa
 * bajo el dedo. Un toque sin arrastre deja la pieza del tamaño de fábrica, así
 * que colocar un poste es un toque y no un gesto de precisión. Al soltar, la
 * pieza se pinta en el mapa de bits y entra en el historial: «deshacer» la
 * retira como cualquier trazo, y el PDF y las firmas no se enteran de que
 * existe.
 *
 * Un molde ES una herramienta y comparte el estado `activeTool` con las cinco
 * de trazo libre, no un modo aparte: son excluyentes —o dibujas a mano o
 * colocas una pieza— y así elegir un molde apaga el lápiz sin una sola línea
 * de coordinación, y sin añadir un render por encima de los que ya cuesta
 * cambiar de herramienta hoy.
 */

/** Las cinco de trazo libre. Los moldes son herramientas, pero no de éstas. */
type TrazoTool = "pencil" | "line" | "rect" | "text" | "eraser";
type Tool = TrazoTool | MoldeId;

/* ══ LA MEDIDA DE ESTA PANTALLA ═════════════════════════════
 *
 * El `.shell` del sistema con el techo subido de 80rem a 90rem, y por una
 * razón medida, no por gusto: esta pantalla tiene dos piezas con ancho
 * intrínseco y las dos se salían de 80rem.
 *
 *   · El plano es un mapa de bits de 1180 px. Con 80rem quedaban 1216 px
 *     útiles en 1440 y en 1920: la hoja se pintaba prácticamente a tamaño
 *     natural y no crecía ni un píxel al pasar de un monitor a otro.
 *   · La tabla de materiales pide 1167 px para no partir ni una etiqueta
 *     («CERRADURAS SENC. PEQUEÑA» en dos líneas) y 922 px para caber a la
 *     fuerza. Vivía dentro de una ficha de 1020 px que dejaba 980 útiles, con
 *     un suelo de 1024: rodaba en horizontal en TODOS los anchos, también en
 *     1920, mientras 704 px de pantalla se quedaban en blanco a los lados.
 *
 * 90rem deja 1376 px útiles desde 1440: por encima de los dos números. Es el
 * escalón más pequeño que hace caber lo que ya había, no un ensanche
 * decorativo. Por debajo de 1440 no ata nada y el móvil no se entera.
 */
/* 90rem dejaba 480 px en blanco a cada lado en un monitor de 1920. El resto
   del sitio usa el tope de `.shell` (80rem) porque son paginas de lectura y una
   linea de texto muy larga se lee peor; esta no lo es: es un banco de trabajo
   con un plano y un formulario al lado, y ahi el ancho es superficie util. */
const MEDIDA = "shell max-w-[100rem]";

/* ══ PALETA DEL PLANO ════════════════════════════════════════
 *
 * La paleta del plano no es la paleta de la interfaz, y es a propósito.
 *
 * El lienzo se exporta con toDataURL, se pega en el informe y se imprime: es
 * un documento en papel, no una superficie de la aplicación. Por eso los
 * tokens --plan-* de globals.css se declaran una sola vez y no tienen
 * contraparte en .dark —un plano levantado de noche saldría en tinta casi
 * blanca sobre un PNG transparente, o sea, una hoja en blanco en la obra—, y
 * por eso la hoja se pinta con `bg-plan-paper` también cuando la pantalla de
 * alrededor está a oscuras.
 *
 * La conversión a hexadecimal se hace pintando: se rellena un píxel con el
 * valor leído y se mira qué color ha salido. Parece un rodeo y no lo es. El
 * compilador de CSS deja los tokens en `lab()` para los navegadores modernos,
 * y `fillStyle` sólo devuelve «#rrggbb» cuando el color entró en sRGB: con
 * `lab()` devuelve `lab()` otra vez. Al lienzo le da igual —acepta las dos—,
 * pero <input type="color"> sólo entiende «#rrggbb» y ante cualquier otra cosa
 * se pone en negro sin avisar. El píxel pintado no miente en ningún caso.
 *
 * Cada lectura estrena contexto porque el suyo empieza en negro: si el
 * navegador no supiera leer el valor, la asignación se ignora y nos quedamos
 * con tinta negra sobre papel —el peor caso aceptable— y no con el color que
 * se hubiera leído justo antes.
 */
const PLAN_TOKENS = {
  paper: "--plan-paper",
  ink: "--plan-ink",
  grid: "--plan-grid",
  inkGreen: "--plan-ink-green",
  inkNavy: "--plan-ink-navy",
  inkAmber: "--plan-ink-amber",
  inkRed: "--plan-ink-red",
} as const;

type PlanPalette = Record<keyof typeof PLAN_TOKENS, string> & { font: string };

/** Las tintas que se ofrecen para dibujar; ni el papel ni la cuadrícula lo son. */
type PlanInk = Exclude<keyof typeof PLAN_TOKENS, "paper" | "grid">;

/* Se lee una vez por carga: son siete lecturas de estilo calculado y siete
   lienzos de usar y tirar, y el resultado no cambia mientras viva la página. */
let planPalette: PlanPalette | null = null;

function readPlanPalette(): PlanPalette {
  if (planPalette) return planPalette;

  const root = getComputedStyle(document.documentElement);
  const hex = (token: string) => {
    const raw = root.getPropertyValue(token).trim();
    const probe = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
    if (!probe) return raw;
    probe.fillStyle = raw;
    probe.fillRect(0, 0, 1, 1);
    const [r, g, b] = probe.getImageData(0, 0, 1, 1).data;
    const dosDigitos = (n: number) => n.toString(16).padStart(2, "0");
    return `#${dosDigitos(r)}${dosDigitos(g)}${dosDigitos(b)}`;
  };

  planPalette = {
    paper: hex(PLAN_TOKENS.paper),
    ink: hex(PLAN_TOKENS.ink),
    grid: hex(PLAN_TOKENS.grid),
    inkGreen: hex(PLAN_TOKENS.inkGreen),
    inkNavy: hex(PLAN_TOKENS.inkNavy),
    inkAmber: hex(PLAN_TOKENS.inkAmber),
    inkRed: hex(PLAN_TOKENS.inkRed),
    /* La familia ya resuelta por el navegador, no el token: --font-sans lleva
       dentro un var(--font-brand) que el contexto 2D no sabe resolver. Así el
       rótulo del plano sale en la letra de la marca y no en la de fábrica. */
    font: root.fontFamily,
  };
  return planPalette;
}

/* Valor de sólo-cliente sin desajuste de hidratación: el servidor no tiene
   getComputedStyle, así que pinta cadena vacía y el navegador la sustituye en
   cuanto hidrata. Es lo que `useSyncExternalStore` hace bien y un efecto con
   setState hace mal. No hay suscripción porque la paleta no cambia. */
const neverChanges = () => () => {};
const noPaletteOnServer = () => null;

function usePlanPalette(): PlanPalette | null {
  return useSyncExternalStore(neverChanges, readPlanPalette, noPaletteOnServer);
}

/* ══ LA MINIATURA DE UN MOLDE ═══════════════════════════════
 *
 * Un lienzo diminuto pintado con la MISMA función que pinta la pieza en el
 * plano (`drawMoldeIcon` -> `drawMolde`). Dibujar el icono aparte, a mano y en
 * SVG, sería garantizar que dentro de tres meses el botón prometa una figura y
 * la hoja reciba otra.
 *
 * Va sobre `bg-plan-paper` y con tinta `--plan-ink` —papel y tinta, los mismos
 * tokens del plano— y no sobre la superficie de la interfaz: la miniatura es
 * una muestra de lo que va a salir impreso, y el papel no cambia de color
 * porque la pantalla de alrededor esté a oscuras.
 *
 * `aria-hidden` porque es un dibujo: qué es cada pieza y cómo se coloca va en
 * el texto del botón y en su `sr-only`, no aquí.
 */
function MoldeIcon({ id }: { id: MoldeId }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const g = c.getContext("2d"); if (!g) return;
    g.clearRect(0, 0, c.width, c.height);
    /* Siempre en tinta base, no en la que el inspector tenga elegida: la
       paleta es una leyenda de formas, y una fila de miniaturas que cambian de
       color al tocar el selector se lee como si algo se hubiera roto. */
    drawMoldeIcon(g, id, { color: readPlanPalette().ink, width: 1.5 });
  }, [id]);

  return (
    <canvas
      ref={ref}
      width={48}
      height={30}
      aria-hidden="true"
      className="pointer-events-none block rounded-sm border border-plan-ink/15 bg-plan-paper"
    />
  );
}

/* ══ EL PLANO DE MUESTRA ════════════════════════════════════
 *
 * Un terreno rectangular con sus cuatro esquinas, sus cuatro lados, un portón
 * de carro arriba y una puerta de persona a la izquierda. Sirve para lo único
 * que le faltaba a la hoja en blanco: enseñar a qué se parece un plano
 * terminado antes de tener que dibujarlo.
 *
 * No es una ilustración: son las MISMAS piezas de `moldes.ts` pintadas con la
 * MISMA función que las pinta en el plano de verdad (`drawMolde`), sobre la
 * misma cuadrícula de 20 px y con la misma tinta de papel. Un dibujo aparte,
 * hecho a mano en SVG, prometería una figura y la herramienta entregaría otra
 * en cuanto alguien tocara un molde. Este no puede mentir.
 *
 * La colocación se le da hecha —`{x, y, angle, length}`— en vez de simular un
 * gesto: aquí no hay dedo que seguir, hay una figura que cuadrar. `esquina`
 * ancla en el vértice y saca un lado por +x y otro por −90°, así que los
 * cuatro giros salen de ahí: 0 abajo-izquierda, −90° abajo-derecha, 180°
 * arriba-derecha y +90° arriba-izquierda.
 *
 * El mapa de bits es 472×168 porque es la proporción exacta de la hoja de
 * verdad (59:21), y así la muestra no enseña un formato que luego no existe.
 * `aria-hidden` y con el texto de al lado como explicación: un dibujo de
 * ejemplo no se describe, se acompaña.
 */
const EJEMPLO_W = 472;
const EJEMPLO_H = 168;

function PlanoEjemplo() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const c = ref.current; if (!c) return;
    const g = c.getContext("2d"); if (!g) return;
    const paint = readPlanPalette();

    g.clearRect(0, 0, c.width, c.height);

    /* La misma cuadrícula de 20 px del plano: es la misma hoja, a otro tamaño. */
    g.save();
    g.strokeStyle = paint.grid;
    g.lineWidth = 0.5;
    for (let x = 0; x <= c.width;  x += 20) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, c.height); g.stroke(); }
    for (let y = 0; y <= c.height; y += 20) { g.beginPath(); g.moveTo(0, y); g.lineTo(c.width, y); g.stroke(); }
    g.restore();

    const tinta = { color: paint.ink, width: 2 };
    const pieza = (id: MoldeId, x: number, y: number, angle: number, length: number) =>
      drawMolde(g, id, { x, y, angle, length }, tinta);

    const IZQ = 60, DER = 412, ARR = 36, ABA = 132, BRAZO = 30;
    const CUARTO = Math.PI / 2;

    /* Las cuatro esquinas, cada una con su esquinero. */
    pieza("esquina", IZQ, ABA, 0, BRAZO);
    pieza("esquina", DER, ABA, -CUARTO, BRAZO);
    pieza("esquina", DER, ARR, Math.PI, BRAZO);
    pieza("esquina", IZQ, ARR, CUARTO, BRAZO);

    /* Arriba, el portón de carro entre dos tramos. */
    pieza("tramo", IZQ + BRAZO, ARR, 0, 100);
    pieza("porton", IZQ + BRAZO + 100, ARR, 0, 92);
    pieza("tramo", IZQ + BRAZO + 192, ARR, 0, DER - BRAZO - (IZQ + BRAZO + 192));

    /* Abajo, un lado entero. */
    pieza("tramo", IZQ + BRAZO, ABA, 0, (DER - BRAZO) - (IZQ + BRAZO));

    /* A la izquierda, la puerta de persona; a la derecha, cerca. */
    pieza("puerta", IZQ, ARR + BRAZO, CUARTO, (ABA - BRAZO) - (ARR + BRAZO));
    pieza("tramo",  DER, ARR + BRAZO, CUARTO, (ABA - BRAZO) - (ARR + BRAZO));
  }, []);

  return (
    <canvas
      ref={ref}
      width={EJEMPLO_W}
      height={EJEMPLO_H}
      aria-hidden="true"
      className="block h-auto w-full max-w-[236px] rounded-lg border border-plan-ink/15 bg-plan-paper"
    />
  );
}

/* ══ LOS TRES PASOS ═════════════════════════════════════════
 *
 * La pantalla no se leía como un procedimiento sino como un montón de piezas
 * del mismo peso: título, botonera, hoja en blanco, párrafo y un botón suelto
 * al final. Quien la abría no sabía qué se esperaba de él primero ni qué iba a
 * pasar al terminar.
 *
 * Se numeran los tres momentos que ya existían —dibujar, dar los datos,
 * enviar— y el número se repite en dos sitios: en la tira de arriba, que es el
 * mapa, y en la cabecera de cada sección, que es el sitio. Es el mismo gesto
 * de versalitas y paso numerado que el precotizador ya usa («PASO 1 ·
 * CATÁLOGO»), así que no se inventa un lenguaje nuevo para esta pantalla.
 *
 * No añade ningún dato: pone nombre al orden que la página ya tenía.
 */
function NumeroPaso({ n, tono = "activo" }: { n: number; tono?: "activo" | "apagado" }) {
  return (
    <span
      aria-hidden="true"
      className={`tabular flex size-7 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
        tono === "activo"
          ? "bg-primary text-primary-foreground"
          : "border border-border-strong text-muted-foreground"
      }`}
    >
      {n}
    </span>
  );
}

/* Cabecera de sección: el número, el título y, debajo, la explicación.
   El número es decorativo (`aria-hidden`) y el orden también va en el texto
   del encabezado —«Paso 1 · …»— para quien lo escuche en voz alta. */
function CabeceraPaso({
  n, titulo, id, children, nivel = "h2",
}: {
  n: number; titulo: string; id: string;
  children?: React.ReactNode; nivel?: "h2" | "h3";
}) {
  const H = nivel;
  return (
    <div>
      <div className="flex items-center gap-2.5">
        <NumeroPaso n={n} />
        <H id={id} className="font-heading text-xl font-bold text-foreground">
          <span className="sr-only">Paso {n}: </span>
          {titulo}
        </H>
      </div>
      {children}
    </div>
  );
}

/* ══ EL MOTOR DE DIBUJO ═════════════════════════════════════ */
function useCanvas(ref: React.RefObject<HTMLCanvasElement | null>) {
  const tool     = useRef<Tool>("pencil");
  const color    = useRef("");
  const width    = useRef(2);
  const drawing  = useRef(false);
  const pointer  = useRef<number | null>(null);
  const last     = useRef({ x: 0, y: 0 });
  const start    = useRef({ x: 0, y: 0 });
  const snap     = useRef<ImageData | null>(null);
  const hist     = useRef<string[]>([]);
  const idx      = useRef(-1);
  const grid     = useRef(true);

  const ctx = useCallback(() => ref.current?.getContext("2d") ?? null, [ref]);

  const drawGrid = useCallback(() => {
    const c = ref.current; if (!c || !grid.current) return;
    const g = ctx(); if (!g) return;
    g.save(); g.strokeStyle = readPlanPalette().grid; g.lineWidth = 0.5;
    for (let x = 0; x <= c.width;  x += 20) { g.beginPath(); g.moveTo(x,0); g.lineTo(x,c.height); g.stroke(); }
    for (let y = 0; y <= c.height; y += 20) { g.beginPath(); g.moveTo(0,y); g.lineTo(c.width,y);   g.stroke(); }
    g.restore();
  }, [ref, ctx]);

  const push = useCallback(() => {
    const c = ref.current; if (!c) return;
    hist.current = hist.current.slice(0, idx.current + 1);
    hist.current.push(c.toDataURL());
    if (hist.current.length > 50) hist.current.shift();
    idx.current = hist.current.length - 1;
  }, [ref]);

  const restore = useCallback((i: number) => {
    const c = ref.current; if (!c) return;
    const g = ctx(); if (!g) return;
    const img = new window.Image();
    img.onload = () => { g.clearRect(0,0,c.width,c.height); drawGrid(); g.drawImage(img,0,0); };
    img.src = hist.current[i];
  }, [ref, ctx, drawGrid]);

  const undo  = useCallback(() => { if (idx.current > 0)                       { idx.current--; restore(idx.current); } }, [restore]);
  const redo  = useCallback(() => { if (idx.current < hist.current.length - 1) { idx.current++; restore(idx.current); } }, [restore]);

  const clear = useCallback(() => {
    const c = ref.current; if (!c) return;
    const g = ctx(); if (!g) return;
    g.clearRect(0, 0, c.width, c.height);
    drawGrid(); push();
  }, [ref, ctx, drawGrid, push]);

  const toggleGrid = useCallback(() => {
    grid.current = !grid.current;
    if (idx.current >= 0) restore(idx.current); else clear();
    return grid.current;
  }, [restore, clear]);

  /* Los ajustes entran por función y no tocando el ref desde fuera: un ref que
     devuelve un hook es suyo, y escribirlo desde el componente es justo lo que
     el compilador de React marca como mutación de un valor ajeno. */
  const setTool = useCallback((t: Tool) => { tool.current = t; }, []);
  const setInk = useCallback((c: string) => { if (c) color.current = c; }, []);
  const setStrokeWidth = useCallback((w: number) => { width.current = w; }, []);

  /* Del dedo al mapa de bits. `getBoundingClientRect` da píxeles de pantalla y
     el lienzo mide 1180×420 de mapa de bits: hay que convertir la unidad, o el
     trazo aparece lejos de donde se toca. Los dos ejes se escalan por separado
     porque la caja no conserva la proporción. */
  const pos = (e: PointerEvent, c: HTMLCanvasElement) => {
    const r = c.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * (c.width / (r.width || c.width)),
      y: (e.clientY - r.top) * (c.height / (r.height || c.height)),
    };
  };

  const init = useCallback(() => {
    const c = ref.current; if (!c) return;
    const g = ctx(); if (!g) return;
    const paint = readPlanPalette();
    /* La tinta por defecto es la del sistema, no una constante del archivo. */
    if (!color.current) color.current = paint.ink;
    drawGrid(); push();

    /* Vista previa de un molde bajo el dedo. Repone la instantánea antes de
       cada repintado —igual que ya hacen la línea y el rectángulo—, así que
       mientras se arrastra no queda rastro de las posiciones intermedias.
       Colocación y dibujo salen de `moldes.ts`: la pieza de la vista previa y
       la que queda al soltar son literalmente la misma cuenta, o la figura
       daría un salto al levantar el dedo. */
    const stampMolde = (id: MoldeId, x: number, y: number) => {
      const molde = findMolde(id);
      if (!molde) return;
      if (snap.current) g.putImageData(snap.current, 0, 0);
      drawMolde(
        g,
        id,
        placeMolde(molde, { startX: start.current.x, startY: start.current.y, x, y }),
        { color: color.current, width: width.current },
      );
    };

    const down = (e: PointerEvent) => {
      e.preventDefault();
      /* Un trazo cada vez: el segundo dedo que se apoya en la hoja mientras se
         dibuja se ignora en lugar de partir la línea. */
      if (drawing.current) return;
      const p = pos(e, c);
      drawing.current = true; last.current = p; start.current = p;
      pointer.current = e.pointerId;
      /* Con la captura, el trazo sigue al dedo aunque salga del lienzo y el
         `pointerup` llega igual: antes, soltar fuera dejaba el trazo a medias
         y sin guardar en el historial. */
      c.setPointerCapture(e.pointerId);
      snap.current = g.getImageData(0, 0, c.width, c.height);
      if (tool.current === "text") {
        drawing.current = false;
        const t = prompt("Texto:");
        if (t) {
          const size = Math.max(12, width.current * 5);
          g.font = `${size}px ${paint.font}`;
          /* Si el navegador rechazara la lista de familias, el contexto se
             queda en su tamaño de fábrica —10 px— y el rótulo saldría
             ilegible en la hoja impresa. Se comprueba y se recae en la
             genérica, que siempre parsea. */
          if (!g.font.startsWith(`${size}px`)) g.font = `${size}px sans-serif`;
          g.fillStyle = color.current;
          g.fillText(t, p.x, p.y);
          push();
        }
      } else if (isMolde(tool.current)) {
        /* Se pinta ya en el toque y no sólo al arrastrar: si tocar y levantar
           el dedo no dejara nada, el molde parecería roto justo en el gesto
           más corto, que es el que se hace con guantes. */
        stampMolde(tool.current, p.x, p.y);
      }
    };

    const move = (e: PointerEvent) => {
      if (!drawing.current || e.pointerId !== pointer.current) return; e.preventDefault();
      const { x, y } = pos(e, c);
      if (tool.current === "pencil") {
        g.beginPath(); g.moveTo(last.current.x, last.current.y); g.lineTo(x, y);
        g.strokeStyle = color.current; g.lineWidth = width.current;
        g.lineCap = "round"; g.lineJoin = "round"; g.stroke();
        last.current = { x, y };
      } else if (tool.current === "eraser") {
        g.beginPath(); g.arc(x, y, Math.max(8, width.current * 4), 0, Math.PI * 2);
        g.fillStyle = paint.paper; g.fill(); last.current = { x, y };
      } else if (tool.current === "line") {
        g.putImageData(snap.current!, 0, 0);
        g.beginPath(); g.moveTo(start.current.x, start.current.y); g.lineTo(x, y);
        g.strokeStyle = color.current; g.lineWidth = width.current; g.lineCap = "round"; g.stroke();
      } else if (tool.current === "rect") {
        g.putImageData(snap.current!, 0, 0);
        g.beginPath(); g.rect(start.current.x, start.current.y, x - start.current.x, y - start.current.y);
        g.strokeStyle = color.current; g.lineWidth = width.current; g.stroke();
      } else if (isMolde(tool.current)) {
        stampMolde(tool.current, x, y);
      }
    };

    const up = (e: PointerEvent) => {
      if (e.pointerId !== pointer.current) return;
      pointer.current = null;
      if (drawing.current) { drawing.current = false; push(); }
    };

    c.addEventListener("pointerdown",   down);
    c.addEventListener("pointermove",   move);
    c.addEventListener("pointerup",     up);
    /* El sistema puede quitarnos el puntero —una llamada entrante, el gesto de
       volver atrás—: es un trazo terminado, no uno perdido. */
    c.addEventListener("pointercancel", up);
    return () => {
      c.removeEventListener("pointerdown",   down);
      c.removeEventListener("pointermove",   move);
      c.removeEventListener("pointerup",     up);
      c.removeEventListener("pointercancel", up);
    };
  }, [ref, ctx, drawGrid, push]);

  return { setTool, setInk, setStrokeWidth, undo, redo, clear, toggleGrid, init };
}

/* ══ LA PÁGINA ══════════════════════════════════════════════ */
export default function InspeccionesPage() {
  const { user } = useAuthStore();
  const isAdmin  = user?.role === "ADMIN";

  /* Identificadores propios de esta instancia: los mismos que cosen cada
     etiqueta con su campo y el lienzo con su alternativa de texto. */
  const uid = useId();
  const planoTituloId = `${uid}-plano`;
  const planoAyudaId = `${uid}-plano-ayuda`;
  const planoAlternativaId = `${uid}-plano-alternativa`;
  const colorId = `${uid}-color`;
  const grosorId = `${uid}-grosor`;
  const fichaTituloId = `${uid}-ficha`;
  const inspNumId = `${uid}-numero`;
  const datosId = `${uid}-datos`;
  const planoFichaId = `${uid}-plano-ficha`;
  const materialesId = `${uid}-materiales`;
  const observacionesId = `${uid}-observaciones`;
  const observacionesCampoId = `${uid}-observaciones-campo`;
  const firmasId = `${uid}-firmas`;
  const datosTituloId = `${uid}-datos-titulo`;
  const envioTituloId = `${uid}-envio`;
  const guiaTituloId = `${uid}-guia`;
  const adminTituloId = `${uid}-admin`;
  const pasosId = `${uid}-pasos`;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  /* El cartel que ocupa la hoja mientras está en blanco. Se enciende y se
     apaga escribiendo el `display` del nodo y no con estado: ver el porqué
     donde está el cartel. `display` y no el atributo `hidden`, porque una
     utilidad de Tailwind gana a la regla de base que `hidden` trae. */
  const guiaLienzoRef = useRef<HTMLDivElement | null>(null);
  const verGuiaLienzo = useCallback((visible: boolean) => {
    const n = guiaLienzoRef.current;
    if (n) n.style.display = visible ? "" : "none";
  }, []);
  const planoImgRef = useRef<HTMLImageElement | null>(null);
  const sig1Ref   = useRef<HTMLCanvasElement | null>(null);
  const sig2Ref   = useRef<HTMLCanvasElement | null>(null);
  const draw      = useCanvas(canvasRef);

  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  /* La tinta de fábrica es la del sistema y llega vacía en el servidor; en
     cuanto el visitante elige un color, manda el suyo. */
  const palette = usePlanPalette();
  const [customInk,  setCustomInk]  = useState("");
  const color = customInk || palette?.ink || "";
  const [strokeW,    setStrokeW]    = useState(2);
  const [gridOn,     setGridOn]     = useState(true);
  const [showForm,   setShowForm]   = useState(false);

  /* Los datos de la ficha. Los que ya se saben por la sesión llegan puestos. */
  const today = new Date().toISOString().split("T")[0];
  const [inspNum,     setInspNum]     = useState("0001");
  const [clientName,  setClientName]  = useState(user?.name  ?? "");
  const [telefono,    setTelefono]    = useState(user?.phone ?? "");
  const [correo,      setCorreo]      = useState(user?.email ?? "");
  const [fecha,       setFecha]       = useState(today);
  const [direccion,   setDireccion]   = useState("");
  const [referencia,  setReferencia]  = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [nombreInspector, setNombreInspector] = useState("");
  const [nombreVendedor,  setNombreVendedor]  = useState("");

  /* Los tres avisos del compilador de React que vienen a continuación son
     correctos: son estados que se fijan desde un efecto y encadenan un render
     de más. Quitarlos es rehacer el contador de inspecciones y la manera en
     que la ficha se rellena con la sesión, o sea, lógica —y este encargo es de
     diseño y usabilidad—. Se silencian uno a uno, señalados, en vez de
     dejarlos sueltos o de tocar lo que no toca. Están en el informe. */
  useEffect(() => {
    const n = localStorage.getItem("insp_counter");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- el contador vive en localStorage y sólo puede leerse ya hidratado
    if (n) setInspNum(String(+n).padStart(4, "0"));
  }, []);

  // eslint-disable-next-line react-hooks/set-state-in-effect -- la sesión llega tarde y rellena la ficha; no se rehace aquí
  useEffect(() => { if (user?.name)  setClientName(user.name);   }, [user?.name]);
  // eslint-disable-next-line react-hooks/set-state-in-effect -- ídem
  useEffect(() => { if (user?.email) setCorreo(user.email);      }, [user?.email]);

  /* En cuanto se toca la hoja, el cartel sobra. Va en su propio oyente y no
     dentro del motor de dibujo, que no se toca. */
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const apagar = () => verGuiaLienzo(false);
    c.addEventListener("pointerdown", apagar, { passive: true });
    return () => c.removeEventListener("pointerdown", apagar);
  }, [verGuiaLienzo]);

  /* Arranque del lienzo del plano. */
  useEffect(() => {
    const cleanDraw = draw.init();
    return () => { cleanDraw?.(); };
  }, [draw]);

  /* Arranque de los recuadros de firma. Se mantienen con eventos de ratón y
     tacto tal cual estaban: las firmas quedaban explícitamente fuera de este
     encargo y sólo se les ha cambiado el color de la tinta.

     Lo que sí ha cambiado es la CAJA, y por obligación. Este código, a
     diferencia del plano, no convierte la posición del dedo a píxeles del mapa
     de bits: resta la posición de la caja y ya. Mientras la caja midiera lo
     mismo que el mapa de bits (280 px) eso daba igual; en cuanto se estira, la
     tinta se separa del dedo en la misma proporción. La ficha pasó de 980 a
     1366 px útiles y el recuadro se habría ido de 3,5x a 4,9x de desajuste. Se
     topa en 280 px —su tamaño natural, que además es el 1:1— para no agravar
     algo que no toca arreglar aquí. De paso ahorra 29 px de alto: el recuadro
     crecía al ensancharse porque su proporción está fijada por el mapa de bits.

     En papel el tope se levanta. Ahí no hay dedo que valga: el recuadro se
     rellena con un bolígrafo y cuanto más ancho, mejor. La hoja impresa sale
     exactamente igual que antes (363 px de recuadro en papel de carta). */
  useEffect(() => {
    const pads = [sig1Ref, sig2Ref];
    const cleanups: (() => void)[] = [];
    pads.forEach(ref => {
      const c = ref.current; if (!c) return;
      const g = c.getContext("2d")!;
      let pen = false, lx = 0, ly = 0;
      const getP = (e: MouseEvent | TouchEvent) => {
        const r = c.getBoundingClientRect();
        const s = "touches" in e ? e.touches[0] : e;
        return { x: s.clientX - r.left, y: s.clientY - r.top };
      };
      const d = (e: MouseEvent | TouchEvent) => { e.preventDefault(); pen = true; const p = getP(e); lx=p.x; ly=p.y; g.beginPath(); g.arc(lx,ly,0.8,0,Math.PI*2); g.fillStyle=readPlanPalette().ink; g.fill(); };
      const m = (e: MouseEvent | TouchEvent) => { if(!pen) return; e.preventDefault(); const {x,y}=getP(e); g.beginPath(); g.moveTo(lx,ly); g.lineTo(x,y); g.strokeStyle=readPlanPalette().ink; g.lineWidth=1.5; g.lineCap="round"; g.stroke(); lx=x; ly=y; };
      const u = () => { pen=false; };
      c.addEventListener("mousedown",d); c.addEventListener("mousemove",m); c.addEventListener("mouseup",u); c.addEventListener("mouseleave",u);
      c.addEventListener("touchstart",d,{passive:false}); c.addEventListener("touchmove",m,{passive:false}); c.addEventListener("touchend",u);
      cleanups.push(() => { c.removeEventListener("mousedown",d); c.removeEventListener("mousemove",m); c.removeEventListener("mouseup",u); c.removeEventListener("mouseleave",u); c.removeEventListener("touchstart",d); c.removeEventListener("touchmove",m); c.removeEventListener("touchend",u); });
    });
    return () => cleanups.forEach(fn => fn());
  }, [showForm]);

  /* La instantánea del plano para la hoja impresa se recoge después de pintar
     y no durante el render: leer un ref mientras se renderiza no es seguro.
     Sin lista de dependencias a propósito —se recogía en cada render antes y
     se sigue recogiendo igual—, para que quien abra el formulario y siga
     dibujando vea el trazo nuevo en la hoja. */
  useEffect(() => {
    const img = planoImgRef.current;
    const data = canvasRef.current?.toDataURL();
    if (img && data) img.src = data;
  });

  useEffect(() => { draw.setTool(activeTool);      }, [activeTool, draw]);
  useEffect(() => { draw.setInk(color);            }, [color, draw]);
  useEffect(() => { draw.setStrokeWidth(strokeW);  }, [strokeW, draw]);

  const TOOLS: { id: TrazoTool; label: string; icon: React.ReactNode }[] = [
    { id: "pencil",  label: "Lápiz",      icon: <Pencil className="size-4" aria-hidden="true" /> },
    { id: "line",    label: "Línea",      icon: <Minus  className="size-4" aria-hidden="true" /> },
    { id: "rect",    label: "Rectángulo", icon: <RectangleHorizontal className="size-4" aria-hidden="true" /> },
    { id: "text",    label: "Texto",      icon: <Type   className="size-4" aria-hidden="true" /> },
    { id: "eraser",  label: "Borrador",   icon: <Eraser className="size-4" aria-hidden="true" /> },
  ];

  /* Las cinco tintas del sistema, a un toque. Abrir la rueda de color del
     sistema operativo con guantes y a pleno sol es un gesto imposible, y son
     de todas formas los colores con los que se marca un plano: el contorno, el
     portón, el obstáculo y el aviso. La rueda sigue estando para el resto. */
  const INKS: { key: PlanInk; label: string; swatch: string }[] = [
    { key: "ink",      label: "Tinta",  swatch: "bg-plan-ink" },
    { key: "inkGreen", label: "Verde",  swatch: "bg-plan-ink-green" },
    { key: "inkNavy",  label: "Azul",   swatch: "bg-plan-ink-navy" },
    { key: "inkAmber", label: "Ámbar",  swatch: "bg-plan-ink-amber" },
    { key: "inkRed",   label: "Rojo",   swatch: "bg-plan-ink-red" },
  ];

  const generatePDF = () => {
    const next = (+inspNum || 0) + 1;
    localStorage.setItem("insp_counter", String(next));
    setShowForm(true);
    setTimeout(() => window.print(), 300);
  };

  /* Los datos del cliente, en el orden en que se preguntan de pie en un
     terreno. Cada uno con su etiqueta, su tipo y su autocompletado: en un
     móvil, `tel` abre el teclado numérico y `email` el que trae la arroba. */
  const DATOS: {
    id: string; label: string; value: string; set: (v: string) => void;
    type: string; autoComplete: string; inputMode?: "tel" | "email";
  }[] = [
    { id: `${uid}-nombre`,     label: "Nombre del cliente",  value: clientName, set: setClientName, type: "text",  autoComplete: "name" },
    { id: `${uid}-fecha`,      label: "Fecha",               value: fecha,      set: setFecha,      type: "date",  autoComplete: "off" },
    { id: `${uid}-direccion`,  label: "Dirección",           value: direccion,  set: setDireccion,  type: "text",  autoComplete: "street-address" },
    { id: `${uid}-referencia`, label: "Punto de referencia", value: referencia, set: setReferencia, type: "text",  autoComplete: "off" },
    { id: `${uid}-telefono`,   label: "Teléfono",            value: telefono,   set: setTelefono,   type: "tel",   autoComplete: "tel",   inputMode: "tel" },
    { id: `${uid}-correo`,     label: "Correo",              value: correo,     set: setCorreo,     type: "email", autoComplete: "email", inputMode: "email" },
  ];

  /* ══ LAS DOS LECTURAS DE LA MISMA PANTALLA ═══════════════
   *
   * Aquí entran dos personas muy distintas y hasta ahora leían lo mismo: un
   * administrador veía «Solicitar inspección» y «Para poder responderle», que
   * es lo que se le dice a un cliente, y su única diferencia era que el botón
   * verde ponía otra cosa. Es la misma pantalla y las mismas piezas —no se
   * duplica nada—, pero el rótulo dice de quién es el trabajo:
   *
   *   · El cliente PIDE una inspección: dibuja lo que tiene, deja cómo
   *     localizarle y la solicitud sale por WhatsApp.
   *   · El administrador LEVANTA la inspección en el terreno: dibuja lo que
   *     ve, anota los datos del cliente y termina en un informe imprimible.
   *
   * Sólo cambian tres cadenas y el destino del paso 3. Nada de lo que se
   * afirma aquí es nuevo: es lo que los dos botones ya hacían.
   */
  const CABECERA = isAdmin
    ? {
        antetitulo: "Administración · inspección en sitio",
        titulo: "Ficha de inspección",
        entrada: "Levanta el plano del terreno, anota los datos del cliente y genera el informe para imprimir.",
      }
    : {
        antetitulo: "Inspección en sitio",
        titulo: "Solicitar inspección",
        entrada: "Dibuja el contorno de tu propiedad y déjanos cómo localizarte. Un inspector de Intemperie levanta el plano en sitio.",
      };

  const PASOS = isAdmin
    ? ["Levanta el plano", "Datos del cliente", "Genera el informe"]
    : ["Dibuja el plano", "Deja tus datos", "Envía la solicitud"];

  return (
    <div className="bg-background">

      {/* ── Encabezado de la página ─────────────────────────────────────
          Antes eran tres líneas de texto y nada más; el orden de la pantalla
          había que adivinarlo bajando. La tira de pasos lo dice de entrada y
          en una sola línea desde `sm`: es un mapa, no un menú, así que no es
          navegable —no lleva a ningún sitio— sino una lista ordenada. */}
      <div className="border-b border-border bg-surface">
        <div className={`${MEDIDA} py-section-sm`}>
          <p className="eyebrow text-brand-green">{CABECERA.antetitulo}</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">{CABECERA.titulo}</h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">{CABECERA.entrada}</p>

          <h2 id={pasosId} className="sr-only">Cómo funciona</h2>
          {/* Apilada ocupaba 110 px de un teléfono para decir tres palabras.
              En una línea, y rodando si no cabe, ocupa 28 y se lee igual: es
              un mapa de tres paradas, no una lista que haya que leer entera. */}
          <div className="-mx-gutter mt-5 overflow-x-auto px-gutter scrollbar-hide sm:mx-0 sm:overflow-visible sm:px-0">
            <ol aria-labelledby={pasosId} className="flex w-max items-center gap-x-1 sm:w-auto sm:flex-wrap">
              {PASOS.map((paso, i) => (
                <li key={paso} className="flex items-center gap-2.5">
                  <NumeroPaso n={i + 1} tono={i === 0 ? "activo" : "apagado"} />
                  <span className="whitespace-nowrap text-sm font-semibold text-foreground">{paso}</span>
                  {i < PASOS.length - 1 && (
                    <ChevronRight className="mx-1 size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </li>
              ))}
            </ol>
          </div>
        </div>
      </div>

      {/* ══ EL CUERPO: LA HERRAMIENTA Y LA SOLICITUD ══════════════════
          Dos columnas desde `lg` y en el orden en que se trabaja: a la
          izquierda se dibuja, a la derecha se entrega. Antes el botón de
          enviar caía suelto al final de la página, a media pantalla del último
          campo que había que rellenar, y la columna del plano se quedaba con
          230 px en blanco debajo del lienzo mientras la de los datos seguía
          bajando. Metiendo el paso 3 en la misma columna que el paso 2 las dos
          columnas terminan a la vez y no sobra hueco en ninguna.

          En móvil se apilan en el mismo orden —plano, datos, enviar—, que es
          además el orden en que se hace de pie en un terreno. */}
      <div className={`${MEDIDA} grid items-start gap-x-8 gap-y-section-sm py-section-sm lg:grid-cols-[minmax(0,1.9fr)_minmax(0,1fr)]`}>

      {/* ── Paso 1: el plano ──────────────────────────────────────────── */}
      <section aria-labelledby={planoTituloId} className="@container min-w-0">
        <CabeceraPaso n={1} id={planoTituloId} titulo="Plano del terreno">
          {/* Seis líneas en un teléfono, y cuatro de ellas repetían la lista
              de «Así se ve un plano terminado» que ahora está debajo del
              lienzo. Queda lo que la lista no dice: que hay moldes. */}
          <p id={planoAyudaId} className="mt-2 max-w-2xl text-sm text-muted-foreground">
            Marca los límites del terreno, los portones y los accesos. Los tramos,
            las esquinas, los portones y los postes tienen molde: se colocan tocando
            la hoja y salen siempre iguales, sin dibujarlos a pulso.
          </p>
        </CabeceraPaso>

        {/* Barra de herramientas. Tres grupos con nombre porque son tres
            decisiones distintas —con qué dibujo, de qué color y grosor, y qué
            hago con lo dibujado—, y en un móvil se apilan en ese orden.

            Desde `lg` los tres grupos se reparten en dos columnas en vez de
            apilarse: a la izquierda con qué se pinta (herramientas y moldes),
            a la derecha con qué tinta y qué se hace con lo pintado. La barra
            medía 321 px de alto en 1440 px de pantalla, encima de un lienzo de
            486: un tercio del bloque del plano era botonera, y sobraba ancho de
            sobra al lado. En dos columnas baja a poco más de la mitad y el
            lienzo no pierde ni un píxel de ancho, que es lo que no se podía
            tocar. En móvil sigue siendo una sola columna y en el mismo orden.

            El corte se medía antes contra el ANCHO DE PANTALLA (`xl`, 1280) y
            ahora contra el ancho de su propia columna (`@3xl`, 768 px de
            contenedor), porque la barra ya no ocupa la página entera: vive
            dentro de la columna del plano. El número medido sigue siendo el
            mismo —con menos de ~570 px las dos columnas parten cada grupo en
            dos filas y la barra sale MÁS alta que apilada—, sólo que ahora se
            comprueba donde de verdad importa, y el corte está medido otra vez
            sobre la pantalla nueva: la columna derecha de la barra —tintas,
            grosor y acciones— pide 470 px fijos, así que por debajo de 1024 px
            de columna a la izquierda le quedan 365 y las cinco herramientas
            caen en tres filas. En 1440 la columna del plano da 855 px: la
            barra se apila en cuatro filas de 288 px de alto, contra los 420
            que salían partida en dos. Se parte sólo cuando de verdad cabe. */}
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-3 @5xl:grid @5xl:grid-cols-[minmax(0,1fr)_auto] @5xl:items-start @5xl:gap-x-5">

          <div className="flex flex-col gap-3">

            {/* ── Por qué ruedan en vez de envolverse ────────────────────
                En 390 px las cinco herramientas caían en tres filas y los
                cinco moldes en dos: 660 px de botonera por encima de una hoja
                de 127 px de alto. En una tira que rueda, cada grupo es una
                fila y se ve dónde termina —el quinto botón asoma cortado, que
                es la señal de que hay más—. Desde `sm` vuelve a envolverse,
                que es lo correcto cuando hay ancho.

                El `-my-1 py-1` no es relleno decorativo: `overflow-x` recorta
                también en vertical, y sin ese margen el anillo de foco de un
                botón se cortaría por arriba y por abajo. */}
            <div className="-mx-3 overflow-x-auto px-3 py-1 -my-1 scrollbar-hide sm:mx-0 sm:my-0 sm:overflow-visible sm:px-0 sm:py-0">
            <div className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap" role="group" aria-label="Herramienta de dibujo">
              {TOOLS.map(t => (
                <Button
                  key={t.id}
                  type="button"
                  variant={activeTool === t.id ? "default" : "outline"}
                  aria-pressed={activeTool === t.id}
                  onClick={() => setActiveTool(t.id)}
                >
                  {t.icon} {t.label}
                </Button>
              ))}
            </div>
            </div>

            {/* Los moldes. Van en su propio grupo y debajo de las herramientas
                de trazo porque son la otra manera de poner algo en la hoja, no
                una variante del lápiz. Comparten `activeTool` con ellas: elegir
                un molde apaga la herramienta de arriba, que es lo correcto —o
                dibujas a mano o colocas una pieza—. */}
            <div className="border-t border-border pt-3">
              <div className="-mx-3 overflow-x-auto px-3 py-1 -my-1 scrollbar-hide sm:mx-0 sm:my-0 sm:overflow-visible sm:px-0 sm:py-0">
              <div className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap" role="group" aria-label="Moldes de cerca">
                {MOLDES.map(m => (
                  <Button
                    key={m.id}
                    type="button"
                    variant={activeTool === m.id ? "default" : "outline"}
                    aria-pressed={activeTool === m.id}
                    title={m.hint}
                    onClick={() => setActiveTool(m.id)}
                    className="h-auto flex-col gap-1 px-2.5 py-2 text-xs"
                  >
                    <MoldeIcon id={m.id} />
                    {m.label}
                    {/* El dibujo de la miniatura es `aria-hidden`: lo que la
                        pieza es y cómo se coloca sólo existe como texto aquí. */}
                    <span className="sr-only"> — {m.hint}</span>
                  </Button>
                ))}
              </div>
              </div>
              <p className="mt-2 max-w-2xl text-xs text-muted-foreground">
                Toca el plano y la pieza aparece del tamaño de fábrica; arrastra sin levantar el
                dedo para darle el largo y el giro. Los ángulos rectos se ajustan solos. Se
                coloca con la tinta y el grosor de aquí abajo, y «deshacer» la retira como
                cualquier otro trazo.
              </p>
            </div>
          </div>

          {/* Columna derecha: la tinta, el grosor y las acciones. El filete
              vertical sólo aparece cuando de verdad hay dos columnas. */}
          <div className="flex flex-col gap-3 @5xl:border-l @5xl:border-border @5xl:pl-5">

            <div className="-mx-3 overflow-x-auto px-3 py-1 -my-1 scrollbar-hide sm:mx-0 sm:my-0 sm:overflow-visible sm:px-0 sm:py-0 flex w-max items-center gap-x-4 gap-y-3 sm:w-auto sm:flex-wrap">
              <div className="flex items-center gap-2 sm:flex-wrap" role="group" aria-label="Color de la tinta">
                {INKS.map(i => (
                  <button
                    key={i.key}
                    type="button"
                    aria-label={i.label}
                    aria-pressed={palette !== null && color === palette[i.key]}
                    onClick={() => setCustomInk(readPlanPalette()[i.key])}
                    className={`size-11 rounded-lg border-2 transition-colors ${
                      palette !== null && color === palette[i.key]
                        ? "border-primary"
                        : "border-border-strong hover:border-foreground"
                    }`}
                  >
                    {/* La muestra vive dentro para que el borde de selección se
                        vea siempre, también sobre una tinta oscura. */}
                    <span className={`block size-full rounded-[3px] border border-plan-ink/20 ${i.swatch}`} />
                  </button>
                ))}

                <Label htmlFor={colorId} className="sr-only">Otro color</Label>
                <input
                  id={colorId}
                  type="color"
                  value={color}
                  onChange={e => setCustomInk(e.target.value)}
                  className="size-11 cursor-pointer rounded-lg border border-border-strong bg-surface p-1"
                />
              </div>

              <div className="flex min-h-tap items-center gap-2">
                <Label htmlFor={grosorId} className="text-sm text-muted-foreground">Grosor</Label>
                <input
                  id={grosorId}
                  type="range"
                  min={1}
                  max={12}
                  value={strokeW}
                  onChange={e => setStrokeW(+e.target.value)}
                  className="h-11 w-28 accent-primary"
                />
                <span className="tabular w-5 text-sm text-muted-foreground" aria-hidden="true">{strokeW}</span>
              </div>
            </div>

            <div className="-mx-3 overflow-x-auto px-3 py-1 -my-1 scrollbar-hide sm:mx-0 sm:my-0 sm:overflow-visible sm:px-0 sm:py-0">
            <div className="flex w-max items-center gap-2 sm:w-auto sm:flex-wrap" role="group" aria-label="Acciones sobre el plano">
              <Button type="button" variant="outline" size="icon" aria-label="Deshacer" title="Deshacer" onClick={draw.undo}>
                <Undo2 className="size-4" aria-hidden="true" />
              </Button>
              <Button type="button" variant="outline" size="icon" aria-label="Rehacer" title="Rehacer" onClick={draw.redo}>
                <Redo2 className="size-4" aria-hidden="true" />
              </Button>
              <Button
                type="button"
                variant={gridOn ? "secondary" : "outline"}
                aria-pressed={gridOn}
                onClick={() => { const on = draw.toggleGrid(); setGridOn(on); }}
              >
                <Grid3x3 className="size-4" aria-hidden="true" /> Cuadrícula
              </Button>
              <Button
                type="button"
                variant="outline"
                className="border-destructive/40 text-destructive hover:border-destructive hover:bg-destructive/10 hover:text-destructive"
                /* Si la hoja vuelve a estar en blanco, el cartel vuelve: es el
                   mismo estado de partida y decirlo otra vez no estorba. */
                onClick={() => { draw.clear(); verGuiaLienzo(true); }}
              >
                <Trash2 className="size-4" aria-hidden="true" /> Limpiar
              </Button>
            </div>
            </div>
          </div>
        </div>

        {/* La hoja. `bg-plan-paper` y no `bg-surface`: es papel, y el papel no
            cambia de color porque la pantalla esté a oscuras (ver la paleta).

            El tope de alto lleva ahora su tope de ancho equivalente
            (1180/420 = 59/21). Sin él, en un portátil de 800 px de alto la
            hoja se quedaba en 480 px de alto y seguía midiendo lo que diera el
            ancho: la caja dejaba de guardar la proporción del mapa de bits y
            un cuadrado dibujado salía rectangular en la hoja impresa. Con los
            dos topes se alcanzan a la vez y el plano no se deforma. El mapeo
            dedo→píxel no se toca: sigue escalando los dos ejes por separado. */}
        {/* La hoja va dentro de una caja relativa para poder posarle encima
            la guía de la hoja en blanco. La caja lleva el tope de ancho y el
            lienzo se estira a ella, así los dos siguen midiendo lo mismo y la
            guía cae justo sobre el papel y ni un píxel fuera. */}
        {/* El tope de ancho va atado al mismo alto que el lienzo (72svh) y a su
              relacion 59:21. Estaba en 60svh mientras el lienzo decia 72: el
              contenedor lo estrangulaba y subir el alto no ensanchaba nada. */}
          <div className="relative mt-4 w-full max-w-[calc(72svh*59/21)]">
          <canvas
            ref={canvasRef}
            width={1180}
            height={420}
            aria-label="Plano del terreno, para dibujar a mano alzada"
            aria-describedby={`${planoAyudaId} ${planoAlternativaId}`}
            className="block max-h-[72svh] min-h-[26rem] w-full touch-none rounded-xl border-2 border-border-strong bg-plan-paper shadow-sm"
            style={{ cursor: activeTool === "eraser" ? "cell" : activeTool === "text" ? "text" : "crosshair" }}
          >
            Aquí se dibuja a mano alzada el contorno del terreno que se va a cercar.
          </canvas>

          {/* ── La hoja en blanco deja de estar en blanco ─────────────────
              Era el problema entero de esta pantalla: medio viewport ocupado
              por un rectángulo vacío que no decía qué se esperaba de él. Ahora
              el propio papel lo dice, y se quita solo en cuanto se toca.

              Se esconde tocando el nodo y NO con estado, y es a propósito:
              este archivo vuelve a montar el motor de dibujo en cada render
              (fallo conocido, fuera de este encargo), y un render de más justo
              en el `pointerdown` repintaría la cuadrícula por encima de la
              tinta recién puesta. Escribiendo el `display` no hay render, no
              hay remonte y el trazo sale limpio.

              `aria-hidden` porque no dice nada nuevo: es el mismo texto de
              ayuda que el lienzo ya declara en `aria-describedby`, puesto
              donde se mira. Repetirlo en el árbol de accesibilidad sería
              leerlo dos veces. */}
          <div
            ref={guiaLienzoRef}
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5 px-4 text-center sm:gap-2.5"
          >
            <span className="flex size-9 items-center justify-center rounded-full border border-dashed border-plan-ink/30 text-plan-ink/50 sm:size-11">
              <Pencil className="size-4 sm:size-5" />
            </span>
            <span className="font-heading text-sm font-bold text-plan-ink/70 sm:text-lg">
              Empieza por un lado del terreno
            </span>
            <span className="hidden max-w-sm text-xs text-plan-ink/55 sm:block sm:text-sm">
              Toca la hoja y arrastra. Con los moldes de arriba, un tramo o un
              portón salen de un solo gesto.
            </span>
          </div>
        </div>

        

        {/* Alternativa honesta: un dibujo a mano no se puede describir, así que
            no se finge una descripción. Se dice qué es, para qué sirve y por
            dónde se hace lo mismo sin dibujar. Está a la vista de todos y no
            escondida en un sr-only, porque a quien dibuja con el dedo en una
            pantalla de 5 pulgadas también le sirve saberlo. */}
        <p id={planoAlternativaId} className="mt-3 text-sm text-muted-foreground">
          El plano se dibuja con el dedo o con el ratón y no tiene equivalente con
          teclado; los moldes tampoco, porque hay que decir en qué punto de la hoja
          va cada pieza. Si no puedes dibujarlo, descríbelo por escrito al pedir la
          inspección: un inspector de Intemperie levanta el plano en sitio.
        </p>
      </section>

      {/* ══ LA COLUMNA DE LA SOLICITUD (pasos 2 y 3) ══════════════════
          Los datos y el envío son el mismo trabajo —entregar la solicitud— y
          por eso van juntos y en dos fichas seguidas, no a media pantalla de
          distancia. Se rellena y se envía sin mover la vista. */}
      <div className="flex min-w-0 flex-col gap-5">

        {/* ── Paso 2: los datos ─────────────────────────────────────────
            Los mismos seis campos que ya existían dentro de la hoja
            imprimible, a la vista desde el principio. El rótulo cambia según
            quién mire: al cliente se le piden SUS datos para poder
            contestarle; el administrador está anotando los de OTRA persona. */}
        <section aria-labelledby={datosTituloId} className="rounded-xl border border-border bg-surface p-4 shadow-sm sm:p-5">
          <CabeceraPaso n={2} id={datosTituloId} nivel="h2" titulo={isAdmin ? "Datos del cliente" : "Sus datos"}>
            <p className="mt-2 text-sm text-muted-foreground">
              {isAdmin
                ? "Quién pide la cerca y dónde está el terreno."
                : "Para poder responderle y saber a dónde ir."}
            </p>
          </CabeceraPaso>
          {/* Seis campos en una sola columna son 456 px de alto, y en 768 px de
              pantalla —donde la ficha ocupa el ancho entero— sobraban 350 px a
              la derecha de cada campo. En dos columnas son tres filas. Desde
              `lg` la ficha vuelve a ser una columna estrecha al lado del plano
              y los campos vuelven a apilarse, que es lo que cabe. */}
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {DATOS.map((f) => (
              <p key={f.id}>
                <label htmlFor={`v-${f.id}`} className="mb-1 block text-xs font-semibold text-foreground">
                  {f.label}
                </label>
                <input
                  id={`v-${f.id}`}
                  type={f.type}
                  inputMode={f.inputMode}
                  autoComplete={f.autoComplete}
                  value={f.value}
                  onChange={(e) => f.set(e.target.value)}
                  className="min-h-tap w-full rounded-md border border-border-strong bg-surface px-3 text-base text-foreground"
                />
              </p>
            ))}
          </div>
        </section>

        {/* ── Paso 3: qué pasa al enviar ────────────────────────────────
            El botón estaba solo en medio de la página y no decía a dónde
            llevaba. Ahora va en una ficha con el borde de la marca —es la
            acción principal de la pantalla y se ve que lo es— y debajo, en una
            línea, lo que ocurre al pulsarlo. No se promete nada nuevo: es
            literalmente lo que el botón ya hacía —abrir WhatsApp con los datos
            escritos— y el plano sigue sin viajar por el enlace, que es la
            única letra pequeña que había que contar y no se contaba. */}
        <section aria-labelledby={envioTituloId} className="rounded-xl border-2 border-primary/30 bg-surface p-4 shadow-sm sm:p-5 lg:sticky lg:top-24">
          <CabeceraPaso n={3} id={envioTituloId} nivel="h2" titulo={isAdmin ? "El informe" : "Enviar la solicitud"} />

          {isAdmin ? (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Abre la hoja de la inspección con el plano pegado y lanza la
                impresión del navegador. El número de inspección sube uno.
              </p>
              <Button type="button" size="lg" className="mt-4 w-full" onClick={generatePDF}>
                <ClipboardList className="size-4" aria-hidden="true" />
                Generar informe de inspección (PDF)
              </Button>
            </>
          ) : (
            <>
              <p className="mt-2 text-sm text-muted-foreground">
                Se abre WhatsApp con tus datos ya escritos; sólo tienes que
                darle a enviar. El plano no viaja por el enlace: lo enseñas
                desde esta misma pantalla cuando te contesten.
              </p>
              <Button
                type="button"
                size="lg"
                className="mt-4 w-full"
                /* Antes esto era un `alert()` y nada mas: la solicitud no salia
                   de la pantalla. WhatsApp es el canal que esta tienda ya usa en
                   el cotizador y en instaladores, y `whatsappHref` codifica una
                   sola vez. El plano no viaja por un enlace de WhatsApp, asi que
                   se dice en el mensaje en vez de fingir que va adjunto. */
                onClick={() => {
                  const l = (t: string, v: string) => (v.trim() ? [`\u2022 ${t}: ${v.trim()}`] : [])
                  window.open(
                    whatsappHref(
                      [
                        "Hola Intemperie, quiero solicitar una inspeccion.",
                        "",
                        ...l("Nombre", clientName),
                        ...l("Telefono", telefono),
                        ...l("Correo", correo),
                        ...l("Direccion", direccion),
                        ...l("Punto de referencia", referencia),
                        ...l("Fecha deseada", fecha),
                        "",
                        "Tengo el plano dibujado en la web y se lo enseno cuando me escriban.",
                      ].join("\n"),
                    ),
                    "_blank",
                    "noopener,noreferrer",
                  )
                }}
              >
                <Send className="size-4" aria-hidden="true" />
                Enviar solicitud de inspección
              </Button>
            </>
          )}
        </section>

        {/* La guia vivia dentro de la columna del plano, y con ella la izquierda
            acababa ~300 px por debajo de la derecha: un bloque de blanco colgando
            bajo la tarjeta de envio en cualquier pantalla ancha. Movida a la
            columna derecha, las dos columnas terminan a la par y el hueco
            desaparece sin encoger nada. En movil el orden de lectura no cambia:
            una sola columna, y la guia sigue despues del plano. */}
{/* ── Qué se espera que salga de aquí ───────────────────────────
            Debajo del lienzo quedaban 230 px en blanco en 1440 px de pantalla:
            la columna del plano se acababa y la de los datos seguía bajando.
            Ese hueco lo ocupa ahora lo único que faltaba de verdad —un ejemplo
            de plano terminado y la lista de lo que hay que marcar—, que además
            es lo que convierte una hoja en blanco en un encargo entendido.

            El ejemplo NO es un dibujo aparte: sale de las mismas piezas y de
            la misma función que pinta el plano de verdad (`moldes.ts`), así
            que promete exactamente lo que la herramienta entrega. */}
        <section aria-labelledby={guiaTituloId} className="mt-4 rounded-xl lg:col-start-2 border border-border bg-surface-2 p-3 sm:p-4">
          <h3 id={guiaTituloId} className="eyebrow text-muted-foreground">
            Así se ve un plano terminado
          </h3>
          {/* En paralelo desde el primer píxel: apilados, la muestra y la
              lista sumaban 330 px de un teléfono. La muestra encoge, que para
              eso es una muestra. */}
          <div className="mt-3 grid grid-cols-[minmax(0,9rem)_minmax(0,1fr)] items-start gap-3 sm:gap-4 @xl:grid-cols-[minmax(0,auto)_minmax(0,1fr)]">
            <PlanoEjemplo />
            <ul className="grid gap-2 text-sm text-muted-foreground">
              {[
                "Los límites del terreno, lado por lado.",
                "Dónde va el portón de carro y dónde la puerta de persona.",
                "Los accesos y las zonas especiales que haya que tener en cuenta.",
                "No hace falta que esté a escala ni que salga bonito.",
              ].map(linea => (
                <li key={linea} className="flex gap-2">
                  <span aria-hidden="true" className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                  {linea}
                </li>
              ))}
            </ul>
          </div>
        </section>
      </div>
      </div>

      {/* ══ LA BANDA DE ADMINISTRACIÓN ═══════════════════════════════
          Los dos públicos estaban mal contados: el administrador veía la
          misma pantalla de cliente y su única diferencia era un enlace suelto,
          «Ver formulario completo», al lado del botón principal y sin decir
          qué formulario ni por qué a él sí. Detrás hay la hoja de materiales,
          las consultas del terreno y las firmas: papeleo interno que un
          cliente no debe ver y que a un administrador no se le puede esconder
          en un enlace de texto.

          Va en banda aparte, a lo ancho y por debajo del trabajo compartido,
          para que se lea como lo que es: otra sección, de otra persona. El
          ámbar es el papel que el sistema le da a lo interno y al B2B, así que
          no hace falta inventar un color para decir «esto es de la casa».

          `print:hidden` porque es interfaz, no hoja: en papel sólo va la
          ficha. */}
      {isAdmin && (
        <section
          aria-labelledby={adminTituloId}
          className="border-y border-brand-amber-deep/25 bg-accent print:hidden"
        >
          <div className={`${MEDIDA} py-section-sm`}>
            <p className="eyebrow flex items-center gap-1.5 text-accent-foreground">
              <Lock className="size-3.5" aria-hidden="true" />
              Sólo administración
            </p>
            <h2 id={adminTituloId} className="mt-2 font-heading text-xl font-bold text-foreground">
              La hoja interna de la inspección
            </h2>
            <p className="mt-2 max-w-2xl text-sm text-foreground/80">
              Materiales y especificaciones, las consultas del terreno, las
              observaciones y las firmas. Es lo que se imprime y se lleva a la
              obra; quien pide la inspección desde la web no lo ve.
            </p>
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="mt-4 border-brand-amber-deep/40 bg-surface hover:border-brand-amber-deep"
              aria-expanded={showForm}
              onClick={() => setShowForm(v => !v)}
            >
              {showForm ? "Ocultar la hoja interna" : "Ver la hoja interna"}
              <ChevronDown className={`size-4 transition-transform ${showForm ? "rotate-180" : ""}`} aria-hidden="true" />
            </Button>
          </div>
        </section>
      )}

      {/* ══ LA FICHA IMPRESA (sólo administración, plegable) ══════════ */}
      {(showForm || false) && isAdmin && (
        <section
          id="printForm"
          aria-labelledby={fichaTituloId}
          className={`${MEDIDA} mb-8 bg-surface py-4 shadow-lg print:m-0 print:shadow-none`}
        >

          {/* ── Cabecera de la hoja ─────────────────────────────────── */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              {/* El triángulo del logotipo hereda el color del texto: así el
                  sistema decide la tinta y no el atributo `fill`. */}
              <svg width="44" height="44" viewBox="0 0 60 60" aria-hidden="true" className="text-brand-green-deep">
                <polygon points="30,5 55,52 5,52" fill="none" stroke="currentColor" strokeWidth="3" />
                <polygon points="30,18 44,42 16,42" fill="currentColor" />
              </svg>
              <div className="leading-tight">
                <p className="font-heading text-sm font-bold text-brand-green-deep">INTEMPERIE</p>
                <p className="text-2xs text-muted-foreground">ESPECIALISTAS EN CERCAS</p>
              </div>
            </div>

            <h2 id={fichaTituloId} className="font-heading text-xl font-bold uppercase tracking-widest text-foreground">
              Control de inspecciones
            </h2>

            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <Label htmlFor={inspNumId} className="whitespace-nowrap text-xs">Nº inspección</Label>
                <Input
                  id={inspNumId}
                  value={inspNum}
                  onChange={e => setInspNum(e.target.value)}
                  maxLength={6}
                  inputMode="numeric"
                  className="w-24 text-center font-bold text-brand-amber-deep"
                />
              </div>
              <p className="inline-block border-2 border-brand-navy px-2 font-heading text-base font-bold text-brand-navy">
                GRUPOVAZ
              </p>
            </div>
          </div>

          {/* ── Datos del cliente ───────────────────────────────────── */}
          <section aria-labelledby={datosId} className="mt-5 border-t border-border pt-4">
            <h3 id={datosId} className="eyebrow text-muted-foreground">Datos del cliente</h3>
            {/* Seis campos. En dos columnas son tres filas y 257 px de alto;
                desde `xl` la ficha da 1366 px útiles y caben tres columnas de
                447 px —más que de sobra para una dirección—, o sea dos filas.
                No se pliegan ni se esconden: son lo primero que se rellena y
                la mitad llega ya puesta desde la sesión. */}
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {DATOS.map(f => (
                <div key={f.id} className="min-w-0">
                  <Label htmlFor={f.id} className="mb-1.5">{f.label}</Label>
                  <Input
                    id={f.id}
                    type={f.type}
                    inputMode={f.inputMode}
                    autoComplete={f.autoComplete}
                    value={f.value}
                    onChange={e => f.set(e.target.value)}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* ── El plano, tal y como se imprime ─────────────────────── */}
          <section aria-labelledby={planoFichaId} className="mt-5 border-t border-border pt-4">
            <h3 id={planoFichaId} className="eyebrow text-muted-foreground">Plano del terreno</h3>
            {/* `width` y `height` en el atributo: el navegador reserva la caja
                antes de tener la imagen y la hoja no da el salto al abrirse.
                El `src` lo pone el efecto, ya con el lienzo pintado. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              ref={planoImgRef}
              width={1180}
              height={420}
              alt="Plano del terreno dibujado a mano para esta inspección."
              /* Tope al tamaño natural del mapa de bits (1180 px). Con la
                 ficha ya a la medida de la página, la vista previa se estiraba
                 a 1366 px: 486 px de alto de una imagen ampliada y pixelada,
                 justo debajo del lienzo que muestra lo mismo. Ampliar un mapa
                 de bits no añade información, sólo alto. En papel manda la
                 hoja, así que ahí el tope se levanta. */
              className="mt-2 block w-full max-w-[1180px] border-2 border-border-strong bg-plan-paper print:max-w-none"
              style={{ imageRendering: "pixelated" }}
            />
          </section>

          {/* ── Materiales ──────────────────────────────────────────── */}
          <section aria-labelledby={materialesId} className="mt-5 border-t border-border pt-4">
            <h3 id={materialesId} className="eyebrow text-muted-foreground">Materiales y especificaciones</h3>
            <SpecsTable />
          </section>

          {/* ── Consultas y observaciones ───────────────────────────── */}
          <div className="mt-5 grid gap-3 border-t border-border pt-4 md:grid-cols-2">
            <ConsultasBox />
            <section aria-labelledby={observacionesId} className="rounded-lg border border-border">
              <h3 id={observacionesId} className="rounded-t-[7px] bg-brand-green-deep px-3 py-1.5 text-center text-2xs font-bold text-on-dark">
                OBSERVACIONES ADICIONALES
              </h3>
              <div className="p-3">
                <Label htmlFor={observacionesCampoId} className="sr-only">Observaciones adicionales</Label>
                <Textarea
                  id={observacionesCampoId}
                  value={observaciones}
                  onChange={e => setObservaciones(e.target.value)}
                  placeholder="Qué se encontró en el terreno, qué falta, qué hay que tener en cuenta el día del montaje."
                  className="min-h-28"
                />
              </div>
            </section>
          </div>

          {/* ── Firmas ──────────────────────────────────────────────── */}
          <section aria-labelledby={firmasId} className="mt-5 border-t border-border pt-4">
            <h3 id={firmasId} className="eyebrow text-muted-foreground">Firmas</h3>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {([
                { title: "FIRMA DEL CLIENTE",    ref: sig1Ref, nameVal: clientName,      setName: setClientName,      ph: "Nombre del cliente" },
                { title: "NOMBRE DEL INSPECTOR", ref: sig2Ref, nameVal: nombreInspector, setName: setNombreInspector, ph: "Inspector" },
                { title: "VENDEDOR QUE COTIZA",  ref: null,    nameVal: nombreVendedor,  setName: setNombreVendedor,  ph: "Vendedor" },
              ]).map(({ title, ref, nameVal, setName, ph }, fi) => (
                <div key={title} className="rounded-lg border border-border">
                  <p className="rounded-t-[7px] bg-brand-navy px-2 py-1.5 text-center text-2xs font-bold uppercase text-on-dark">
                    {title}
                  </p>
                  <div className="flex flex-col gap-2 p-3">
                    {ref ? (
                      <canvas
                        ref={ref}
                        width={280}
                        height={65}
                        aria-label={`Recuadro para firmar: ${title.toLowerCase()}`}
                        className="block w-full max-w-[280px] touch-none rounded-md border border-dashed border-border-strong bg-plan-paper print:max-w-none"
                        style={{ cursor: "crosshair" }}
                      >
                        Se firma con el dedo o con el ratón dentro de este recuadro.
                      </canvas>
                    ) : (
                      /* Sin lienzo: esta casilla se rellena a mano sobre el
                         papel una vez impresa. Se declara para que no parezca
                         un recuadro roto. */
                      <div
                        className="h-[65px] w-full max-w-[280px] rounded-md border border-dashed border-border bg-surface-2 print:max-w-none"
                        role="img"
                        aria-label="Espacio para firmar a mano sobre la hoja impresa"
                      />
                    )}
                    {ref && (
                      <Button
                        type="button"
                        variant="link"
                        className="min-h-tap self-end text-destructive decoration-destructive/35 hover:decoration-destructive print:hidden"
                        onClick={() => ref.current?.getContext("2d")?.clearRect(0, 0, 280, 65)}
                      >
                        Limpiar firma
                      </Button>
                    )}
                    <div>
                      <Label htmlFor={`${uid}-firma-${fi}`} className="mb-1.5 text-xs">{ph}</Label>
                      <Input
                        id={`${uid}-firma-${fi}`}
                        value={nameVal}
                        onChange={e => setName(e.target.value)}
                        placeholder={ph}
                        className="text-center"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </section>
      )}

      <style>{`
        @media print {
          body > *:not(#printForm) { display: none !important; }
          #printForm { display: block !important; margin: 0; padding: 8px; width: 100%; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  );
}

/* ══ LA TABLA DE MATERIALES ═════════════════════════════════
 *
 * Once columnas —cinco pares de concepto y cantidad, más puerta y portón— que
 * en la hoja impresa caben y en un teléfono no caben de ninguna manera. Antes
 * la tabla estiraba el ancho de la página entera y había que apartarla con dos
 * dedos para leer cualquier otra cosa; ahora rueda dentro de su caja y el
 * resto de la ficha se queda quieto.
 *
 * EL SUELO. Medido en el navegador: la tabla pide 922 px para caber partiendo
 * etiquetas y 1167 px para no partir ninguna. El suelo estaba en 1024 —entre
 * los dos— y la caja que lo contenía daba 980, así que rodaba en horizontal en
 * todos los anchos, también en un monitor de 1920 con 704 px en blanco a los
 * lados. Desde `lg` el suelo baja a 928, justo por encima del mínimo real: la
 * caja da 950 en 1024 px, así que la tabla cabe entera y deja de rodar. Y como
 * sigue siendo `w-full`, en 1440 se estira hasta 1376 y ninguna etiqueta se
 * parte.
 *
 * Por debajo de `lg` el suelo se queda en 1024 a propósito. Ahí la tabla no cabe
 * de ninguna manera —en un teléfono de 390 px la caja da 358—, así que bajarle
 * el suelo no la hacía caber: sólo apretaba más las etiquetas, que pasaban a dos
 * líneas y estiraban la ficha 31 px. Se ahorraban 104 px de arrastre lateral a
 * cambio de 31 px de página; en el móvil, que es donde se rellena de pie, no
 * compensa. El suelo sube donde sirve y se queda donde no.
 *
 * Ni un concepto, ni una clave, ni la suma de postes cambian: sólo el suelo.
 *
 * Los campos miden 44 px de alto y 16 px de cuerpo. Por debajo de 16, Safari
 * en iOS hace zoom al enfocar el campo y deja la página descolocada: escribir
 * doce cantidades seguidas se convierte en doce zooms y doce reencuadres. En
 * papel se compactan con las variantes `print:`, que es donde la densidad sí
 * hace falta.
 *
 * Cada cantidad lleva `aria-label` con su grupo y su concepto —«Accesorios,
 * CERRADURAS MAGNÉTICAS, puerta»—: en una rejilla de once columnas, el nombre
 * del campo leído en voz alta es lo único que dice qué se está rellenando.
 *
 * Los conceptos, las claves y la suma de postes no se tocan.
 */
function SpecsTable() {
  type Vals = Record<string, string>;
  const [v, setV] = useState<Vals>({});
  const s = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setV(p => ({ ...p, [k]: e.target.value }));
  const totalPostes = ["pEsq","pLin","pTop","p3w","pCie","p3x3"].reduce((acc,k) => acc + (+v[k]||0), 0);

  const rows = [
    { s1:"TOTAL PACKS",    s1k:"packs",  s1t:"number", p2:"☑ P. ESQUINERO",    p2k:"pEsq", a3:"CANALETA ACOPLE",       a3k:"cAcp", a4:"BASES ALUM. 4x4",    a4k:"b4x4", ac:"ESTÁNDAR S/MODELO",      ap:"aEsp",  at:"aEst" },
    { s1:"MODELO",         s1k:"modelo", s1t:"text",   p2:"/ P. LINIERO",      p2k:"pLin", a3:"CANALETA LATTICCE",    a3k:"cLat", a4:"BASES ALUM. 5x5",    a4k:"b5x5", ac:"PASADOR DE PISO",        ap:"aPasp", at:"aPast" },
    { s1:"TOTAL ML",       s1k:"ml",     s1t:"number", p2:"■ P. TOPE",         p2k:"pTop", a3:"RIEL TAPA LUZ 7/8\"", a3k:"rTap", a4:"ALUMINIO ADR",        a4k:"aAdr", ac:"TIRADOR SENCILLO",       ap:"aTirp", at:"aTirt" },
    { s1:"ARENA (sacos)",  s1k:"sAre",   s1t:"number", p2:"3 P. 3WAY",         p2k:"p3w",  a3:"SOPORTE DE PARED",     a3k:"sPar", a4:"KIT ANCLAJE CABILLA", a4k:"kAnc", ac:"CERRADURAS 2 CARAS",     ap:"aCr2p", at:"aCr2t" },
    { s1:"CEMENTO (sacos)",s1k:"sCem",   s1t:"number", p2:"P. CIEGO",          p2k:"pCie", a3:"PIE DE POSTE",         a3k:"pPos", a4:"TAPA GÓTICA",         a4k:"tGot", ac:"CERRADURAS MAGNÉTICAS",  ap:"aMgp",  at:"aMgt" },
    { s1:"PIEDRA (sacos)", s1k:"sPie",   s1t:"number", p2:"P. 3X3",            p2k:"p3x3", a3:"TAPA DECORATIVA",      a3k:"tDec", a4:"TAPA INGLESA",        a4k:"tIng", ac:"CERRADURAS SENC. GRANDE",ap:"aSGp",  at:"aSGt" },
    { s1:"",               s1k:"",       s1t:"",       p2:"TOTAL POSTES",      p2k:null,   a3:"OREJA DE PERRO",       a3k:"oPer", a4:"TAPA SOLAR",          a4k:"tSol", ac:"CERRADURAS SENC. PEQUEÑA",ap:"aSPp", at:"aSPt" },
  ];

  const qCls = [
    "h-11 w-16 rounded-md border border-input bg-surface px-1",
    "text-center text-[1rem] tabular-nums text-foreground",
    "transition-colors outline-none hover:border-foreground/35 focus-visible:border-ring",
    "print:h-6 print:w-12 print:text-xs",
  ].join(" ");
  const labelCell = "border border-border px-2 py-1 text-xs font-semibold text-foreground";
  const inputCell = "border border-border p-1";
  const headCell = "border border-border-strong px-2 py-1 text-2xs font-bold";

  return (
    <>
      {/* El aviso sólo aparece donde la tabla rueda de verdad. Desde 1024 px
          cabe entera —el suelo bajó de 1024 a 928 y la caja da 960— y dejarlo
          puesto sería mandar a arrastrar una tabla que no se mueve. `lg:hidden`
          y no un estado: la condición es el ancho, y el ancho ya lo sabe CSS. */}
      <p className="mt-2 text-xs text-muted-foreground print:hidden lg:hidden">
        La tabla rueda en horizontal: arrástrala con el dedo para llegar a las
        últimas columnas.
      </p>
      <div className="mt-2 overflow-x-auto print:overflow-visible">
        <table className="w-full min-w-[64rem] lg:min-w-[58rem] border-collapse text-xs print:min-w-0">
          <caption className="sr-only">
            Materiales y accesorios de la inspección, en cinco bloques: especificaciones,
            postes adicionales, dos de adicionales y accesorios con su cantidad en puerta y portón.
          </caption>
          <thead>
            <tr className="text-center">
              <th colSpan={2} scope="colgroup" className={`${headCell} bg-brand-green-deep text-on-dark`}>1) ESPECIFICACIONES</th>
              <th colSpan={2} scope="colgroup" className={`${headCell} bg-brand-navy text-on-dark`}>2) POSTES ADICIONALES</th>
              <th colSpan={2} scope="colgroup" className={`${headCell} bg-brand-navy text-on-dark`}>3) ADICIONALES</th>
              <th colSpan={2} scope="colgroup" className={`${headCell} bg-brand-amber-deep text-on-dark`}>3) ADICIONALES</th>
              <th scope="col" className={`${headCell} bg-brand-green-deep text-on-dark`}>4) ACCESORIOS</th>
              <th scope="col" className={`${headCell} bg-brand-green-deep text-on-dark`}>PRTA</th>
              <th scope="col" className={`${headCell} bg-brand-green-deep text-on-dark`}>PRTON</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r,i) => (
              <tr key={i} className={i%2===0 ? "bg-surface" : "bg-surface-2"}>
                <td className={`${labelCell} whitespace-nowrap bg-brand-navy-soft`}>{r.s1}</td>
                <td className={inputCell}>{r.s1k && <input type={r.s1t} value={v[r.s1k]??""} onChange={s(r.s1k)} aria-label={`Especificaciones, ${r.s1}`} className={qCls} />}</td>
                <td className={labelCell}>{r.p2}</td>
                <td className={inputCell}>{r.p2k
                  ? <input type="number" min={0} value={v[r.p2k]??""} onChange={s(r.p2k)} aria-label={`Postes adicionales, ${r.p2}`} className={qCls} />
                  : <input readOnly value={totalPostes||""} aria-label="Total de postes, calculado" className={`${qCls} bg-surface-sunk`} />}</td>
                <td className={labelCell}>{r.a3}</td>
                <td className={inputCell}>{r.a3k && <input type="number" min={0} value={v[r.a3k]??""} onChange={s(r.a3k)} aria-label={`Adicionales, ${r.a3}`} className={qCls} />}</td>
                <td className={labelCell}>{r.a4}</td>
                <td className={inputCell}>{r.a4k && <input type="number" min={0} value={v[r.a4k]??""} onChange={s(r.a4k)} aria-label={`Adicionales, ${r.a4}`} className={qCls} />}</td>
                <td className={labelCell}>{r.ac}</td>
                <td className={inputCell}><input type="number" min={0} value={v[r.ap]??""} onChange={s(r.ap)} aria-label={`Accesorios, ${r.ac}, puerta`} className={qCls} /></td>
                <td className={inputCell}><input type="number" min={0} value={v[r.at]??""} onChange={s(r.at)} aria-label={`Accesorios, ${r.ac}, portón`} className={qCls} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

/* ══ CONSULTAS FRECUENTES ═══════════════════════════════════
 *
 * Son cuatro preguntas encadenadas y una franja horaria. Van en <fieldset> con
 * <legend> porque «SÍ / NO» leído en voz alta sin la pregunta delante no
 * significa nada, y cada opción es una fila pulsable de 44 px: se contestan de
 * pie, con el teléfono en una mano.
 *
 * Las respuestas, la exclusividad de «NINGUNO» y el desplegado condicional no
 * se tocan.
 */
function ConsultasBox() {
  const uid = useId();
  const [inst,    setInst]    = useState("");
  const [pase,    setPase]    = useState("");
  const [terreno, setTerreno] = useState("");
  const [agg,     setAgg]     = useState<string[]>([]);
  const [svc,     setSvc]     = useState<string[]>([]);
  const [entrada, setEntrada] = useState("");
  const [salida,  setSalida]  = useState("");

  const toggleArr = (arr: string[], val: string, set: (v:string[])=>void, exclusive?: string) => {
    if (val === exclusive) { set([exclusive]); return; }
    const next = arr.includes(val) ? arr.filter(x=>x!==val) : [...arr.filter(x=>x!==exclusive), val];
    set(next);
  };

  const rowCls = "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-lg border border-border bg-surface px-3 py-2 text-sm text-foreground transition-colors hover:border-border-strong has-checked:border-primary has-checked:bg-secondary has-checked:text-secondary-foreground";
  const controlCls = "size-5 shrink-0 accent-primary";
  const legendCls = "mb-2 font-heading text-xs font-bold text-foreground";

  return (
    <section aria-labelledby={`${uid}-titulo`} className="rounded-lg border border-border">
      <h3 id={`${uid}-titulo`} className="rounded-t-[7px] bg-brand-navy px-3 py-1.5 text-center text-2xs font-bold text-on-dark">
        CONSULTAS FRECUENTES
      </h3>
      <div className="space-y-4 p-3">
        <fieldset>
          <legend className={legendCls}>¿Con instalación?</legend>
          <div className="flex flex-wrap gap-2">
            {["si","no"].map(val => (
              <label key={val} className={rowCls}>
                <input type="radio" name={`${uid}-inst`} value={val} checked={inst===val} onChange={() => setInst(val)} className={controlCls} />
                {val.toUpperCase()}
              </label>
            ))}
          </div>
        </fieldset>

        {inst==="si" && (
          <div className="space-y-4 border-l-2 border-primary pl-3">
            <fieldset>
              <legend className={legendCls}>¿Hay pase de acceso?</legend>
              <div className="flex flex-wrap gap-2">
                {["si","no"].map(val => (
                  <label key={val} className={rowCls}>
                    <input type="radio" name={`${uid}-pase`} value={val} checked={pase===val} onChange={() => setPase(val)} className={controlCls} />
                    {val.toUpperCase()}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendCls}>Tipo de terreno</legend>
              <div className="flex flex-wrap gap-2">
                {[["optimo","ÓPTIMO"],["regular","REGULAR"],["desfavorable","DESFAVORABLE"]].map(([val,lbl]) => (
                  <label key={val} className={rowCls}>
                    <input type="radio" name={`${uid}-ter`} value={val} checked={terreno===val} onChange={() => setTerreno(val)} className={controlCls} />
                    {lbl}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendCls}>Agregados</legend>
              <div className="flex flex-wrap gap-2">
                {[["arena","ARENA"],["piedra","PIEDRA"],["cemento","CEMENTO"],["ninguno","NINGUNO"]].map(([val,lbl]) => (
                  <label key={val} className={rowCls}>
                    <input type="checkbox" checked={agg.includes(val)} onChange={() => toggleArr(agg, val, setAgg, "ninguno")} className={controlCls} />
                    {lbl}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendCls}>El lugar cuenta con</legend>
              <div className="flex flex-wrap gap-2">
                {[["agua","AGUA"],["electrica","ELÉCTRICA"],["ninguno","NINGUNO"]].map(([val,lbl]) => (
                  <label key={val} className={rowCls}>
                    <input type="checkbox" checked={svc.includes(val)} onChange={() => toggleArr(svc, val, setSvc, "ninguno")} className={controlCls} />
                    {lbl}
                  </label>
                ))}
              </div>
            </fieldset>

            <fieldset>
              <legend className={legendCls}>Horario de trabajo en sitio</legend>
              <div className="flex flex-wrap items-end gap-3">
                <div>
                  <Label htmlFor={`${uid}-entrada`} className="mb-1.5 text-xs">Entrada</Label>
                  <Input id={`${uid}-entrada`} type="time" value={entrada} onChange={e=>setEntrada(e.target.value)} className="w-36" />
                </div>
                <div>
                  <Label htmlFor={`${uid}-salida`} className="mb-1.5 text-xs">Salida</Label>
                  <Input id={`${uid}-salida`} type="time" value={salida} onChange={e=>setSalida(e.target.value)} className="w-36" />
                </div>
              </div>
            </fieldset>
          </div>
        )}
      </div>
    </section>
  );
}
