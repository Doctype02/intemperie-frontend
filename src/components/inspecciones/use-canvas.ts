/* El motor de dibujo del plano — sistema «Perímetro».
 *
 * Está aquí, y no dentro de una pantalla, porque hay DOS que dibujan el mismo
 * plano: la solicitud del cliente en `/inspecciones` y la ficha del inspector
 * en `/admin/inspecciones`. Es un solo lienzo con dos puertas, no dos lienzos:
 * si el motor se copiara, la conversión dedo→píxel —que es la corrección más
 * delicada de toda la herramienta— tendría dos versiones y sólo una se
 * arreglaría la próxima vez.
 *
 * Lo que hace, y por qué:
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
 *     convertir la unidad.
 *
 * Los moldes (`moldes.ts`) son herramientas y comparten el estado `activeTool`
 * con las cinco de trazo libre, no un modo aparte: son excluyentes —o dibujas
 * a mano o colocas una pieza— y así elegir un molde apaga el lápiz sin una
 * sola línea de coordinación.
 *
 * BUG CONOCIDO, NO INTRODUCIDO AQUÍ: `init()` devuelve una función nueva en
 * cada render, así que el efecto que la llama vuelve a montar los oyentes en
 * cada render. Se ha movido tal cual, sin agravarlo ni arreglarlo: arreglarlo
 * es lógica y toca el historial de deshacer.
 */
import { useCallback, useRef } from "react";

import {
  drawMolde,
  findMolde,
  isMolde,
  placeMolde,
  type MoldeId,
} from "@/lib/inspecciones/moldes";
import { readPlanPalette } from "./plan-palette";

/** Las cinco de trazo libre. Los moldes son herramientas, pero no de éstas. */
export type TrazoTool = "pencil" | "line" | "rect" | "text" | "eraser";
export type Tool = TrazoTool | MoldeId;

/** El mapa de bits de la hoja. Fijo, y su proporción manda en la caja (59:21). */
export const PLANO_W = 1180;
export const PLANO_H = 420;

export function useCanvas(ref: React.RefObject<HTMLCanvasElement | null>) {
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
