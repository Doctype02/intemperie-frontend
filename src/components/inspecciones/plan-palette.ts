/* La paleta del plano — sistema «Perímetro».
 *
 * Vive aparte de las dos pantallas que dibujan planos —la solicitud del
 * cliente en `/inspecciones` y la ficha del inspector en `/admin/inspecciones`—
 * porque las dos pintan sobre EL MISMO papel y con la misma tinta. Duplicar la
 * lectura sería aceptar que dentro de tres meses el plano del cliente y el del
 * inspector salgan impresos en dos verdes distintos.
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
import { useSyncExternalStore } from "react";

export const PLAN_TOKENS = {
  paper: "--plan-paper",
  ink: "--plan-ink",
  grid: "--plan-grid",
  inkGreen: "--plan-ink-green",
  inkNavy: "--plan-ink-navy",
  inkAmber: "--plan-ink-amber",
  inkRed: "--plan-ink-red",
} as const;

export type PlanPalette = Record<keyof typeof PLAN_TOKENS, string> & { font: string };

/** Las tintas que se ofrecen para dibujar; ni el papel ni la cuadrícula lo son. */
export type PlanInk = Exclude<keyof typeof PLAN_TOKENS, "paper" | "grid">;

/* Se lee una vez por carga: son siete lecturas de estilo calculado y siete
   lienzos de usar y tirar, y el resultado no cambia mientras viva la página. */
let planPalette: PlanPalette | null = null;

export function readPlanPalette(): PlanPalette {
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

export function usePlanPalette(): PlanPalette | null {
  return useSyncExternalStore(neverChanges, readPlanPalette, noPaletteOnServer);
}
