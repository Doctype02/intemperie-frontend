"use client";

/* El plano de muestra — sistema «Perímetro».
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
import { useEffect, useRef } from "react";

import { drawMolde, type MoldeId } from "@/lib/inspecciones/moldes";
import { cn } from "@/lib/utils";
import { readPlanPalette } from "./plan-palette";

const EJEMPLO_W = 472;
const EJEMPLO_H = 168;

/* El tope de ancho es del sitio donde se cuelga, no de la muestra: al lado de
   una lista es una miniatura de 236 px, y sola en una ficha estrecha puede
   ocupar el ancho entero y leerse de verdad. Por eso entra por `className`. */
export function PlanoEjemplo({ className }: { className?: string }) {
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
      className={cn(
        "block h-auto w-full max-w-[236px] rounded-lg border border-plan-ink/15 bg-plan-paper",
        className,
      )}
    />
  );
}
