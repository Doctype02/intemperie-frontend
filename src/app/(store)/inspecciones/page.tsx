"use client";

import { useRef, useEffect, useId, useState, useCallback, useSyncExternalStore } from "react";
import { ChevronDown, ClipboardList, Eraser, Grid3x3, Minus, Pencil, RectangleHorizontal, Redo2, Send, Trash2, Type, Undo2 } from "lucide-react";

import { useAuthStore } from "@/lib/store/auth-store";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

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
 */

type Tool = "pencil" | "line" | "rect" | "text" | "eraser";

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
 * La conversión a hexadecimal la hace el propio contexto 2D: `fillStyle`
 * devuelve siempre «#rrggbb», que es además lo único que acepta un
 * <input type="color">. Cada lectura estrena contexto porque el suyo empieza
 * en negro: si el navegador no supiera leer oklch(), la asignación se ignora y
 * nos quedamos con tinta negra sobre papel, que es el peor caso aceptable —y
 * no con el color que se hubiera leído justo antes.
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
    const probe = document.createElement("canvas").getContext("2d");
    if (!probe) return root.getPropertyValue(token).trim();
    probe.fillStyle = root.getPropertyValue(token).trim();
    return String(probe.fillStyle);
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

/* ══ DRAWING ENGINE ═════════════════════════════════════════ */
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

/* ══ PAGE ═══════════════════════════════════════════════════ */
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

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
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

  /* form state (auto-filled where possible) */
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

  useEffect(() => {
    const n = localStorage.getItem("insp_counter");
    if (n) setInspNum(String(+n).padStart(4, "0"));
  }, []);

  useEffect(() => { if (user?.name)  setClientName(user.name);   }, [user?.name]);
  useEffect(() => { if (user?.email) setCorreo(user.email);      }, [user?.email]);

  /* init canvases */
  useEffect(() => {
    const cleanDraw = draw.init();
    return () => { cleanDraw?.(); };
  }, [draw]);

  /* init sig pads */
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

  useEffect(() => { draw.setTool(activeTool);      }, [activeTool, draw]);
  useEffect(() => { draw.setInk(color);            }, [color, draw]);
  useEffect(() => { draw.setStrokeWidth(strokeW);  }, [strokeW, draw]);

  const TOOLS: { id: Tool; label: string; icon: React.ReactNode }[] = [
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

  const inputCls = "w-full border-0 border-b border-gray-300 text-[10.5px] outline-none bg-transparent px-1 py-0.5 focus:border-green-600 font-sans";
  const qCls     = "w-10 border-0 border-b border-gray-200 text-[9.5px] text-center outline-none bg-transparent py-0.5 focus:border-green-600";

  return (
    <div className="bg-background">

      {/* ── Encabezado de la página ───────────────────────────────────── */}
      <div className="border-b border-border bg-surface">
        <div className="shell py-section-sm">
          <p className="eyebrow text-brand-green">Inspección en sitio</p>
          <h1 className="mt-2 text-3xl font-bold text-foreground">Solicitar inspección</h1>
          <p className="mt-2 max-w-2xl text-base text-muted-foreground">
            Dibuja el contorno de tu propiedad para que nuestro equipo planifique tu instalación.
          </p>
        </div>
      </div>

      {/* ── Sección 1: el plano ───────────────────────────────────────── */}
      <section aria-labelledby={planoTituloId} className="shell pt-section-sm">
        <h2 id={planoTituloId} className="font-heading text-xl font-bold text-foreground">
          Plano del terreno
        </h2>
        <p id={planoAyudaId} className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Marca los límites de tu propiedad, los portones, los accesos y las zonas
          especiales. No hace falta que sea exacto: sirve para que el inspector
          llegue sabiendo qué va a encontrarse.
        </p>

        {/* Barra de herramientas. Tres grupos con nombre porque son tres
            decisiones distintas —con qué dibujo, de qué color y grosor, y qué
            hago con lo dibujado—, y en un móvil se apilan en ese orden. */}
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-3">

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Herramienta de dibujo">
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

          <div className="flex flex-wrap items-center gap-x-4 gap-y-3">
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Color de la tinta">
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

          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Acciones sobre el plano">
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
              onClick={draw.clear}
            >
              <Trash2 className="size-4" aria-hidden="true" /> Limpiar
            </Button>
          </div>
        </div>

        {/* La hoja. `bg-plan-paper` y no `bg-surface`: es papel, y el papel no
            cambia de color porque la pantalla esté a oscuras (ver la paleta). */}
        <canvas
          ref={canvasRef}
          width={1180}
          height={420}
          aria-label="Plano del terreno, para dibujar a mano alzada"
          aria-describedby={`${planoAyudaId} ${planoAlternativaId}`}
          className="mt-3 block max-h-[60svh] w-full touch-none rounded-xl border-2 border-border-strong bg-plan-paper shadow-sm"
          style={{ cursor: activeTool === "eraser" ? "cell" : activeTool === "text" ? "text" : "crosshair" }}
        >
          Aquí se dibuja a mano alzada el contorno del terreno que se va a cercar.
        </canvas>

        {/* Alternativa honesta: un dibujo a mano no se puede describir, así que
            no se finge una descripción. Se dice qué es, para qué sirve y por
            dónde se hace lo mismo sin dibujar. Está a la vista de todos y no
            escondida en un sr-only, porque a quien dibuja con el dedo en una
            pantalla de 5 pulgadas también le sirve saberlo. */}
        <p id={planoAlternativaId} className="mt-2 text-sm text-muted-foreground">
          El plano se dibuja con el dedo o con el ratón y no tiene equivalente con
          teclado. Si no puedes dibujarlo, descríbelo por escrito al pedir la
          inspección: un inspector de Intemperie levanta el plano en sitio.
        </p>
      </section>

      {/* ── Sección 2: qué hacer con el plano ─────────────────────────── */}
      <div className="shell flex flex-col items-start gap-4 py-section-sm sm:flex-row sm:items-center">
        {isAdmin ? (
          <Button type="button" size="lg" onClick={generatePDF}>
            <ClipboardList className="size-4" aria-hidden="true" />
            Generar informe de inspección (PDF)
          </Button>
        ) : (
          <Button
            type="button"
            size="lg"
            onClick={() => alert("Tu solicitud fue enviada. Un inspector de Intemperie se contactará contigo pronto.")}
          >
            <Send className="size-4" aria-hidden="true" />
            Enviar solicitud de inspección
          </Button>
        )}

        {isAdmin && (
          <Button
            type="button"
            variant="link"
            aria-expanded={showForm}
            aria-controls="printForm"
            onClick={() => setShowForm(v => !v)}
          >
            {showForm ? "Ocultar formulario" : "Ver formulario completo"}
            <ChevronDown className={`size-4 transition-transform ${showForm ? "rotate-180" : ""}`} aria-hidden="true" />
          </Button>
        )}
      </div>

      {/* ══ FULL INSPECTION FORM (admin only, collapsible + printable) ══ */}
      {(showForm || false) && isAdmin && (
        <div id="printForm" className="mx-auto bg-white shadow-lg mb-8 px-5 py-4 print:shadow-none print:m-0"
          style={{ width: "min(1020px, 100%)" }}>

          {/* HEADER */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <svg width="44" height="44" viewBox="0 0 60 60">
                <polygon points="30,5 55,52 5,52" fill="none" stroke="#1a6b2e" strokeWidth="3"/>
                <polygon points="30,18 44,42 16,42" fill="#1a6b2e"/>
              </svg>
              <div className="leading-tight">
                <div className="text-sm font-black text-green-800">INTEMPERIE</div>
                <div className="text-[10px] text-gray-500">ESPECIALISTAS EN CERCAS</div>
              </div>
            </div>
            <h2 className="text-xl font-black tracking-widest uppercase">Control de Inspecciones</h2>
            <div className="text-right">
              <div className="text-xs">Nº inspección:&nbsp;
                <input value={inspNum} onChange={e => setInspNum(e.target.value)}
                  className="w-14 text-center font-black text-red-600 text-lg border-0 border-b-2 border-red-500 outline-none bg-transparent" maxLength={6}/>
              </div>
              <div className="text-base font-black text-blue-900 border-2 border-blue-900 px-2 inline-block mt-0.5">GRUPOVAZ</div>
            </div>
          </div>

          {/* CLIENT INFO */}
          <div className="border-b border-gray-400 pb-1 mb-2 space-y-1 text-[10.5px]">
            {[
              [["NOMBRE DEL CLIENTE:", clientName, setClientName, "text"], ["Fecha:", fecha, setFecha, "date"]],
              [["Dirección:", direccion, setDireccion, "text"], ["Pto de referencia:", referencia, setReferencia, "text"]],
              [["Teléfono:", telefono, setTelefono, "tel"], ["Correo:", correo, setCorreo, "email"]],
            ].map((row, ri) => (
              <div key={ri} className="flex gap-4">
                {row.map(([lbl, val, setter, type]) => (
                  <div key={lbl as string} className="flex items-baseline gap-1 flex-1">
                    <label className="font-bold whitespace-nowrap text-[10px]">{lbl as string}</label>
                    <input type={type as string} value={val as string} onChange={e => (setter as (v:string)=>void)(e.target.value)} className={inputCls} />
                  </div>
                ))}
              </div>
            ))}
          </div>

          {/* CANVAS SNAPSHOT */}
          <div className="mb-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={canvasRef.current?.toDataURL() ?? ""}
              alt="Plano de inspección"
              className="w-full border-2 border-blue-800"
              style={{ imageRendering: "pixelated" }}
            />
          </div>

          {/* SPECS TABLE */}
          <SpecsTable qCls={qCls} />

          {/* BOTTOM */}
          <div className="grid grid-cols-2 gap-2 mt-2">
            <ConsultasBox />
            <div className="border border-gray-400">
              <div className="bg-green-800 text-white text-center text-[9.5px] font-bold py-1">OBSERVACIONES ADICIONALES</div>
              <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)}
                className="w-full min-h-[90px] p-2 text-[10.5px] outline-none resize-none border-0 font-sans"
                placeholder="Observaciones sobre la inspección..." />
            </div>
          </div>

          {/* SIGNATURES */}
          <div className="grid grid-cols-3 gap-2 mt-2">
            {([
              { title: "FIRMA DEL CLIENTE", ref: sig1Ref, nameVal: clientName, setName: setClientName, ph: "Nombre del cliente" },
              { title: "NOMBRE DEL INSPECTOR", ref: sig2Ref, nameVal: nombreInspector, setName: setNombreInspector, ph: "Inspector" },
              { title: "VENDEDOR QUE COTIZA", ref: null, nameVal: nombreVendedor, setName: setNombreVendedor, ph: "Vendedor" },
            ]).map(({ title, ref, nameVal, setName, ph }) => (
              <div key={title} className="border border-gray-400">
                <div className="bg-red-700 text-white text-center text-[8.5px] font-bold py-1 uppercase">{title}</div>
                <div className="p-2 flex flex-col items-center gap-1.5">
                  {ref ? (
                    <canvas ref={ref} width={280} height={65}
                      className="border border-dashed border-gray-300 rounded bg-gray-50 block touch-none w-full" style={{ cursor: "crosshair" }} />
                  ) : (
                    <div className="w-full h-[65px] border border-dashed border-gray-200 rounded bg-gray-50" />
                  )}
                  {ref && (
                    <button onClick={() => ref.current?.getContext("2d")?.clearRect(0,0,280,65)}
                      className="print:hidden text-[10px] text-red-500 bg-transparent border-none cursor-pointer underline self-end">
                      ✕ Limpiar
                    </button>
                  )}
                  <input value={nameVal} onChange={e => setName(e.target.value)}
                    className="w-full border-0 border-b border-gray-300 text-[10.5px] text-center outline-none bg-transparent pb-0.5"
                    placeholder={ph} />
                </div>
              </div>
            ))}
          </div>
        </div>
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

/* ══ SUB-COMPONENTS (specs + consultas, admin-form only) ════ */
function SpecsTable({ qCls }: { qCls: string }) {
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

  return (
    <table className="w-full border-collapse text-[9px]">
      <thead>
        <tr className="text-white text-center font-bold text-[9px]">
          <th colSpan={2} className="border border-gray-600 bg-green-800 py-0.5">1) ESPECIFICACIONES</th>
          <th colSpan={2} className="border border-gray-600 bg-blue-900 py-0.5">2) POSTES ADICIONALES</th>
          <th colSpan={2} className="border border-gray-600 bg-blue-900 py-0.5">3) ADICIONALES</th>
          <th colSpan={2} className="border border-gray-600 bg-red-800 py-0.5">3) ADICIONALES</th>
          <th className="border border-gray-600 bg-green-800 py-0.5">4) ACCESORIOS</th>
          <th className="border border-gray-600 bg-green-800 py-0.5">PRTA</th>
          <th className="border border-gray-600 bg-green-800 py-0.5">PRTON</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r,i) => (
          <tr key={i} className={i%2===0?"bg-white":"bg-slate-50"}>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px] font-semibold bg-indigo-50 whitespace-nowrap">{r.s1}</td>
            <td className="border border-gray-200 p-0.5">{r.s1k && <input type={r.s1t} value={v[r.s1k]??""} onChange={s(r.s1k)} className={qCls} />}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px]">{r.p2}</td>
            <td className="border border-gray-200 p-0.5">{r.p2k ? <input type="number" min={0} value={v[r.p2k]??""} onChange={s(r.p2k)} className={qCls} /> : <input readOnly value={totalPostes||""} className={`${qCls} bg-gray-100`} />}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px]">{r.a3}</td>
            <td className="border border-gray-200 p-0.5">{r.a3k && <input type="number" min={0} value={v[r.a3k]??""} onChange={s(r.a3k)} className={qCls} />}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px]">{r.a4}</td>
            <td className="border border-gray-200 p-0.5">{r.a4k && <input type="number" min={0} value={v[r.a4k]??""} onChange={s(r.a4k)} className={qCls} />}</td>
            <td className="border border-gray-200 px-1 py-0.5 text-[9px]">{r.ac}</td>
            <td className="border border-gray-200 p-0.5"><input type="number" min={0} value={v[r.ap]??""} onChange={s(r.ap)} className={qCls} /></td>
            <td className="border border-gray-200 p-0.5"><input type="number" min={0} value={v[r.at]??""} onChange={s(r.at)} className={qCls} /></td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function ConsultasBox() {
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

  return (
    <div className="border border-gray-400">
      <div className="bg-blue-900 text-white text-center text-[9.5px] font-bold py-1">CONSULTAS FRECUENTES</div>
      <div className="p-2 space-y-1.5 text-[9.5px]">
        <div>
          <strong>CON INSTALACIÓN:</strong>&nbsp;
          {["si","no"].map(v => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="radio" name="inst" value={v} checked={inst===v} onChange={() => setInst(v)} />{v.toUpperCase()}</label>)}
        </div>
        {inst==="si" && (
          <div className="pl-3 border-l-2 border-green-300 space-y-1.5">
            <div><strong>PASE DE ACCESO:</strong>&nbsp;{["si","no"].map(v => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="radio" name="pase" value={v} checked={pase===v} onChange={() => setPase(v)} />{v.toUpperCase()}</label>)}</div>
            <div><strong>TIPO DE TERRENO:</strong>&nbsp;{[["optimo","ÓPTIMO"],["regular","REGULAR"],["desfavorable","DESFAVORABLE"]].map(([v,l]) => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="radio" name="ter" value={v} checked={terreno===v} onChange={() => setTerreno(v)} />{l}</label>)}</div>
            <div><strong>AGREGADOS:</strong>&nbsp;{[["arena","ARENA"],["piedra","PIEDRA"],["cemento","CEMENTO"],["ninguno","NINGUNO"]].map(([v,l]) => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="checkbox" checked={agg.includes(v)} onChange={() => toggleArr(agg, v, setAgg, "ninguno")} />{l}</label>)}</div>
            <div><strong>LUGAR CUENTA CON:</strong>&nbsp;{[["agua","AGUA"],["electrica","ELÉCTRICA"],["ninguno","NINGUNO"]].map(([v,l]) => <label key={v} className="inline-flex items-center gap-1 mr-2 cursor-pointer"><input type="checkbox" checked={svc.includes(v)} onChange={() => toggleArr(svc, v, setSvc, "ninguno")} />{l}</label>)}</div>
            <div className="flex items-center gap-2"><strong>ENTRADA:</strong><input type="time" value={entrada} onChange={e=>setEntrada(e.target.value)} className="border-0 border-b border-gray-300 text-[9.5px] outline-none bg-transparent" /><strong>SALIDA:</strong><input type="time" value={salida} onChange={e=>setSalida(e.target.value)} className="border-0 border-b border-gray-300 text-[9.5px] outline-none bg-transparent" /></div>
          </div>
        )}
      </div>
    </div>
  );
}
