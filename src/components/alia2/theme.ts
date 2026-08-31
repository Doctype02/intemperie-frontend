/**
 * Paleta de la landing ALIA2 (azul marino + naranja), aislada del tema global
 * de la tienda (verde). Se declara como custom properties en el contenedor raíz
 * de la página para no tocar `globals.css`, que pertenece a la tienda.
 *
 * Todas las clases son literales completos para que Tailwind v4 las detecte al
 * escanear el código fuente.
 */
export const ALIA2_THEME =
  "[--a2-navy:#0a2342] [--a2-navy-soft:#123566] [--a2-navy-deep:#071a33] " +
  "[--a2-orange:#ee7623] [--a2-orange-strong:#c95c14] " +
  "[--a2-blue:#1b4f8f] [--a2-teal:#127f7a]";

/** Anillo de foco visible (WCAG 2.2 – 2.4.11) reutilizado en toda la página. */
export const FOCUS_RING =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--a2-orange)]";

/** Área táctil mínima cómoda en móvil (WCAG 2.2 – 2.5.8 pide 24px; usamos 44px). */
export const TAP_TARGET = "min-h-11";
