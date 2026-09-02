"use client";

/* El banco de trabajo del plano — sistema «Perímetro».
 *
 * La botonera, la hoja y el cartel de la hoja en blanco, en un solo sitio. Lo
 * usan las DOS pantallas que levantan un plano —la solicitud del cliente en
 * `/inspecciones` y la ficha del inspector en `/admin/inspecciones`— y por eso
 * está aquí y no dentro de ninguna de las dos: son dos públicos, pero un solo
 * lienzo. Dos copias de esto divergirían en la primera ronda de ajustes, y la
 * que se quedaría atrás sería justo la del inspector, que es quien la usa a
 * diario.
 *
 * Lo que NO sabe este componente, a propósito: para qué se va a usar el plano.
 * No conoce WhatsApp, ni el informe imprimible, ni las firmas. Recibe el
 * `canvasRef` de quien lo monta y le deja hacer con el mapa de bits lo que le
 * corresponda. Así el cliente no arrastra el papeleo interno y el inspector no
 * hereda el discurso de venta.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Eraser, Grid3x3, Minus, Pencil, RectangleHorizontal, Redo2, Trash2, Type, Undo2 } from "lucide-react";

import { MOLDES } from "@/lib/inspecciones/moldes";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MoldeIcon } from "./molde-icon";
import { usePlanPalette, readPlanPalette, type PlanInk } from "./plan-palette";
import { useCanvas, PLANO_W, PLANO_H, type Tool, type TrazoTool } from "./use-canvas";

/* Los once moldes, agrupados por lo que hacen en el plano.
 *
 * Sueltos en una sola tira se leian como un amasijo: once botones envolviendo
 * en dos filas sin decir por que unos van antes que otros. Agrupados, la
 * botonera se explica sola —un tramo se estira, una union articula, un punto se
 * clava— y quien busca «donde pongo el porton» sabe en que fila mirar.
 *
 * Los ids se declaran aqui y no en `moldes.ts` a proposito: aquel modulo dibuja
 * y no debe opinar sobre como se agrupa la interfaz. Una pieza que no aparezca
 * en ninguna familia sencillamente no se pinta, y eso se ve al instante. */
const FAMILIAS: { titulo: string; ids: string[] }[] = [
  { titulo: "Tramos", ids: ["tramo", "listones", "malla"] },
  { titulo: "Uniones", ids: ["esquina", "derivacion", "tope"] },
  { titulo: "Puntos", ids: ["porton", "puerta", "cerradura", "poste", "solar"] },
];

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

export function PlanoEditor({
  canvasRef,
  describedBy,
}: {
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  /* Los párrafos que explican la hoja viven en la pantalla que la monta —cada
     público lee la suya— así que el lienzo recibe sus ids y no los inventa. */
  describedBy?: string;
}) {
  const uid = useId();
  const colorId = `${uid}-color`;
  const grosorId = `${uid}-grosor`;

  const draw = useCanvas(canvasRef);

  const [activeTool, setActiveTool] = useState<Tool>("pencil");
  /* La tinta de fábrica es la del sistema y llega vacía en el servidor; en
     cuanto el visitante elige un color, manda el suyo. */
  const palette = usePlanPalette();
  const [customInk, setCustomInk] = useState("");
  const color = customInk || palette?.ink || "";
  const [strokeW, setStrokeW] = useState(2);
  const [gridOn, setGridOn] = useState(true);

  /* El cartel que ocupa la hoja mientras está en blanco. Se enciende y se
     apaga escribiendo el `display` del nodo y no con estado: ver el porqué
     donde está el cartel. `display` y no el atributo `hidden`, porque una
     utilidad de Tailwind gana a la regla de base que `hidden` trae. */
  const guiaLienzoRef = useRef<HTMLDivElement | null>(null);
  const verGuiaLienzo = useCallback((visible: boolean) => {
    const n = guiaLienzoRef.current;
    if (n) n.style.display = visible ? "" : "none";
  }, []);

  /* En cuanto se toca la hoja, el cartel sobra. Va en su propio oyente y no
     dentro del motor de dibujo, que no se toca. */
  useEffect(() => {
    const c = canvasRef.current; if (!c) return;
    const apagar = () => verGuiaLienzo(false);
    c.addEventListener("pointerdown", apagar, { passive: true });
    return () => c.removeEventListener("pointerdown", apagar);
  }, [canvasRef, verGuiaLienzo]);

  /* Arranque del lienzo del plano. */
  useEffect(() => {
    const cleanDraw = draw.init();
    return () => { cleanDraw?.(); };
  }, [draw]);

  useEffect(() => { draw.setTool(activeTool);     }, [activeTool, draw]);
  useEffect(() => { draw.setInk(color);           }, [color, draw]);
  useEffect(() => { draw.setStrokeWidth(strokeW); }, [strokeW, draw]);

  return (
    /* El `@container` va aquí y no en la sección de fuera: la barra se mide
       contra el ancho de SU columna, y las dos pantallas le dan anchos
       distintos —la del inspector pierde 256 px de barra lateral—. */
    <div className="@container min-w-0">

      {/* Barra de herramientas. Tres grupos con nombre porque son tres
          decisiones distintas —con qué dibujo, de qué color y grosor, y qué
          hago con lo dibujado—, y en un móvil se apilan en ese orden.

          Desde `@5xl` los tres grupos se reparten en dos columnas en vez de
          apilarse: a la izquierda con qué se pinta (herramientas y moldes),
          a la derecha con qué tinta y qué se hace con lo pintado. La barra
          medía 321 px de alto en 1440 px de pantalla, encima de un lienzo de
          486: un tercio del bloque del plano era botonera, y sobraba ancho de
          sobra al lado. En dos columnas baja a poco más de la mitad y el
          lienzo no pierde ni un píxel de ancho, que es lo que no se podía
          tocar. En móvil sigue siendo una sola columna y en el mismo orden.

          El corte se mide contra el ancho de su propia columna y no contra el
          de la pantalla: la barra vive dentro de la columna del plano. La
          columna derecha —tintas, grosor y acciones— pide 470 px fijos, así
          que por debajo de 1024 px de columna a la izquierda le quedan 365 y
          las cinco herramientas caen en tres filas. Se parte sólo cuando de
          verdad cabe. */}
      <div className="flex flex-col gap-3 rounded-xl border border-border bg-surface-2 p-3 @5xl:grid @5xl:grid-cols-[minmax(0,1fr)_auto] @5xl:items-start @5xl:gap-x-5">

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
          <div className="-mx-3 -my-1 overflow-x-auto px-3 py-1 scrollbar-hide sm:mx-0 sm:my-0 sm:overflow-visible sm:px-0 sm:py-0">
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
            <div className="-mx-3 -my-1 overflow-x-auto px-3 py-1 scrollbar-hide sm:mx-0 sm:my-0 sm:overflow-visible sm:px-0 sm:py-0">
              <div className="flex w-max flex-col gap-2.5 sm:w-auto">
                {FAMILIAS.map(fam => {
                  const piezas = MOLDES.filter(m => fam.ids.includes(m.id));
                  if (!piezas.length) return null;
                  return (
                    <div key={fam.titulo} className="flex items-start gap-3">
                      {/* El rotulo va al lado y no encima: once piezas en una sola tira se
                          leian como un amasijo, y tres rotulos apilados habrian sumado tres
                          lineas de alto a una botonera que ya pesaba mas que la hoja. */}
                      <span className="eyebrow w-16 shrink-0 pt-2 text-muted-foreground">
                        {fam.titulo}
                      </span>
                      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={`Moldes: ${fam.titulo}`}>
                        {piezas.map(m => (
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
                            <span className="sr-only"> — {m.hint}</span>
                          </Button>
                        ))}
                      </div>
                    </div>
                  );
                })}
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

          <div className="-mx-3 -my-1 flex w-max items-center gap-x-4 gap-y-3 overflow-x-auto px-3 py-1 scrollbar-hide sm:mx-0 sm:my-0 sm:w-auto sm:flex-wrap sm:overflow-visible sm:px-0 sm:py-0">
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

          <div className="-mx-3 -my-1 overflow-x-auto px-3 py-1 scrollbar-hide sm:mx-0 sm:my-0 sm:overflow-visible sm:px-0 sm:py-0">
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

          ── POR QUÉ EL SUELO DE ALTO SE LEVANTA DESDE `sm` ────────────────
          El mapa de bits es 1180×420, o sea 59:21, y `aspect-[59/21]` está
          justamente para que la caja conserve esa proporción: si no la
          conserva, un cuadrado dibujado con el dedo se imprime como un
          rectángulo, porque lo que se manda a la obra es el mapa de bits y no
          la caja.

          `min-h-[30rem]` le ganaba a `aspect` en TODOS los anchos: en 1440 la
          columna del plano da 880 px y la proporción pide 313 px de alto, pero
          el suelo forzaba 480. Dos daños a la vez —el plano deformado y 167 px
          de más que dejaban la columna derecha con 300 px de blanco colgando— y
          ninguno hacía falta ahí: el suelo existe para el MÓVIL, donde 358 px
          de ancho dan 127 px de alto y no se puede dibujar con el dedo en esa
          rendija.

          Así que el suelo se queda donde sirve y se levanta donde estorba: 16rem
          por debajo de `sm` —menos deformación que las 30rem de antes, y sigue
          siendo una hoja usable con el dedo— y desde `sm` manda la proporción.
          Es el mismo criterio que ya se usó con el suelo de la tabla de
          materiales: sube donde sirve y se queda donde no.

          El mapeo dedo→píxel no se toca: sigue escalando los dos ejes por
          separado, así que la tinta cae donde se toca en cualquiera de los dos
          regímenes.

          La hoja va dentro de una caja relativa para poder posarle encima la
          guía de la hoja en blanco, que cae justo sobre el papel y ni un píxel
          fuera. */}
      <div className="relative mt-4 w-full">
        <canvas
          ref={canvasRef}
          width={PLANO_W}
          height={PLANO_H}
          aria-label="Plano del terreno, para dibujar a mano alzada"
          aria-describedby={describedBy}
          className="block aspect-[59/21] max-h-[76svh] min-h-[16rem] w-full touch-none rounded-xl border-2 border-border-strong bg-plan-paper shadow-sm sm:min-h-0"
          style={{ cursor: activeTool === "eraser" ? "cell" : activeTool === "text" ? "text" : "crosshair" }}
        >
          Aquí se dibuja a mano alzada el contorno del terreno que se va a cercar.
        </canvas>

        {/* ── La hoja en blanco deja de estar en blanco ─────────────────
            Era el problema entero de esta pantalla: medio viewport ocupado
            por un rectángulo vacío que no decía qué se esperaba de él. Ahora
            el propio papel lo dice, y se quita solo en cuanto se toca.

            Se esconde tocando el nodo y NO con estado, y es a propósito: el
            motor de dibujo se vuelve a montar en cada render (fallo conocido,
            fuera de este encargo), y un render de más justo en el
            `pointerdown` repintaría la cuadrícula por encima de la tinta
            recién puesta. Escribiendo el `display` no hay render, no hay
            remonte y el trazo sale limpio.

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
    </div>
  );
}
