/**
 * Overlay de carga — desactivado a propósito.
 *
 * Este componente pintaba un `fixed inset-0 z-[9999]` opaco sobre toda la página
 * y no se retiraba hasta que cada `next/image` del documento había cargado, con
 * un tope de 8 s. En la práctica escondía contenido que el servidor ya había
 * entregado en ~0.3 s y convertía el LCP en "el momento en que se va el overlay"
 * en lugar de "el momento en que se ve el producto". Ver la explicación completa
 * en `src/lib/image-load-context.tsx`.
 *
 * Se deja como componente vacío en vez de borrarlo porque el layout raíz
 * (fuera del alcance de este cambio) todavía lo importa. Al no renderizar nada,
 * el contenido es visible en cuanto llega el HTML.
 */
export function PageLoadingOverlay() {
  return null;
}
