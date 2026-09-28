"use client";

import { useEffect } from "react";
import { preload } from "react-dom";

/**
 * Precarga la imagen principal de la ficha ANTES de navegar a ella.
 *
 * El problema que resuelve: el optimizador de Next sirve variantes por ancho,
 * así que la miniatura del catálogo y la foto grande de la ficha son ficheros
 * DISTINTOS; al entrar a la ficha el navegador descargaba la variante grande
 * desde cero y la foto aparecía tarde.
 *
 * Cómo: un único listener delegado (no un island por tarjeta). Cuando el
 * cliente muestra intención sobre un enlace marcado con `data-pdp-image`
 * —puntero encima, foco de teclado o primer toque en móvil— se emite un
 * preload con el MISMO srcset/sizes que usará el héroe de la galería
 * (product-gallery.tsx), de modo que el navegador elige y cachea exactamente
 * la variante que la ficha va a pedir.
 *
 * Coste: cero hasta la intención; una descarga anticipada por producto como
 * máximo (el Set deduplica). Se monta una sola vez en el layout de la tienda.
 */

/* Debe coincidir con `deviceSizes` de next.config.ts y con el `sizes` del
   héroe de la galería. Si cambian allí, cambia aquí. */
const DEVICE_WIDTHS = [400, 640, 768, 1024, 1280, 1536];
const HERO_SIZES = "(max-width: 1024px) 100vw, 640px";
const QUALITY = 75;

const optimizedUrl = (src: string, w: number) =>
  `/_next/image?url=${encodeURIComponent(src)}&w=${w}&q=${QUALITY}`;

export function PdpImagePrefetch() {
  useEffect(() => {
    const done = new Set<string>();

    const prefetch = (target: EventTarget | null) => {
      if (!(target instanceof Element)) return;
      const link = target.closest<HTMLElement>("[data-pdp-image]");
      const src = link?.dataset.pdpImage;
      if (!src || done.has(src)) return;
      done.add(src);
      preload(optimizedUrl(src, DEVICE_WIDTHS[DEVICE_WIDTHS.length - 1]), {
        as: "image",
        imageSrcSet: DEVICE_WIDTHS.map((w) => `${optimizedUrl(src, w)} ${w}w`).join(", "),
        imageSizes: HERO_SIZES,
      });
    };

    const onPointerOver = (e: PointerEvent) => prefetch(e.target);
    const onFocusIn = (e: FocusEvent) => prefetch(e.target);
    /* En móvil no hay hover: el primer contacto con la tarjeta dispara la
       precarga; la navegación llega unos cientos de ms después. */
    const onTouchStart = (e: TouchEvent) => prefetch(e.target);

    document.addEventListener("pointerover", onPointerOver, { passive: true });
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("touchstart", onTouchStart, { passive: true });
    return () => {
      document.removeEventListener("pointerover", onPointerOver);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("touchstart", onTouchStart);
    };
  }, []);

  return null;
}
