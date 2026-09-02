"use client";

/* La miniatura de un molde — sistema «Perímetro».
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
import { useEffect, useRef } from "react";

import { drawMoldeIcon, type MoldeId } from "@/lib/inspecciones/moldes";
import { readPlanPalette } from "./plan-palette";

export function MoldeIcon({ id }: { id: MoldeId }) {
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
