"use client";

import { useCallback } from "react";

/**
 * Shim de compatibilidad — el bloqueo de render fue eliminado.
 *
 * Qué hacía antes
 * ---------------
 * Este contexto contaba cada `next/image` de la página (`registerImage`) y no
 * marcaba `allLoaded` hasta que TODAS habían disparado su `onLoad`, con un tope
 * de espera de 8 s (`MAX_WAIT`). Mientras tanto, `PageLoadingOverlay` pintaba un
 * `fixed inset-0 z-[9999]` opaco sobre el documento entero.
 *
 * Por qué se elimina
 * ------------------
 * El efecto era que el visitante no veía NADA —ni texto, ni cabecera, ni
 * precios— hasta que la última imagen del listado terminaba de descargarse. En
 * una parrilla de 15 productos sobre red móvil irregular eso son varios
 * segundos, y en el peor caso los 8 s completos del tope.
 *
 * Además arruinaba las métricas de la manera más literal posible: el LCP es el
 * mayor elemento *pintado*, y durante todo ese tiempo lo único pintado era el
 * overlay gris. El HTML ya llegaba del servidor en ~0.3 s (el servidor nunca fue
 * el problema); era el cliente quien lo escondía.
 *
 * Lo correcto es lo contrario de esperar: enseñar el HTML en cuanto llega y
 * dejar que cada imagen aparezca cuando esté, que es justo lo que `next/image`
 * hace por sí solo con su `placeholder="blur"`.
 *
 * Por qué queda el módulo
 * -----------------------
 * `useImageOnLoad` se sigue importando desde componentes fuera del alcance de
 * este cambio (p. ej. `components/cart/cart-item.tsx`) y `ImageLoadProvider`
 * desde el layout raíz. Se conserva la superficie pública como no-op para no
 * romperlos; el borrado de las importaciones ya muertas corresponde a quien
 * tenga esos ficheros.
 */

interface ImageLoadContextType {
  registerImage: () => () => void;
  allLoaded: boolean;
}

const NOOP = () => {};

/** Se mantiene el contrato previo, pero nada queda pendiente jamás. */
export function useImageLoad(): ImageLoadContextType {
  return { registerImage: () => NOOP, allLoaded: true };
}

/**
 * Devuelve un `onLoad` inerte. Se conserva para que los `<Image onLoad={...} />`
 * existentes sigan compilando sin cambios.
 */
export function useImageOnLoad(): () => void {
  return useCallback(NOOP, []);
}

/** Simple paso a través: ya no hay estado que proveer. */
export function ImageLoadProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
