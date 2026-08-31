"use client";

import { useCallback, useEffect, useState } from "react";
import { getCartQuote, type CartQuote, type CartQuoteItem } from "@/lib/api/cart";

/* Cotización viva del carrito.
 *
 * Por qué existe: el subtotal es una suma sin regla de negocio y se puede hacer
 * aquí para que el botón de cantidad responda al instante, pero el impuesto, el
 * envío y el total son del servidor. Antes cada pantalla los recalculaba a su
 * manera y el mismo carrito valía una cosa en /carrito y otra en /checkout.
 *
 * Tres decisiones que no son evidentes leyendo el código:
 *
 *   · Se espera 300 ms antes de pedir. Pulsar «+» cinco veces son cinco
 *     renders; sin la espera serían cinco peticiones y la última en llegar no
 *     tiene por qué ser la del carrito actual.
 *   · Mientras se espera o se pide, la cotización anterior sigue en pantalla
 *     pero `isUpdating` queda en true: quien la pinte debe marcarla como
 *     provisional. Un total viejo con aspecto de definitivo es justo el bug que
 *     este módulo viene a arreglar.
 *   · Si la petición falla se borra la cotización. Es preferible decir «no
 *     pudimos calcular el total» a enseñar el de un carrito que ya no existe.
 *     Inventar la cifra en una pantalla de compra es peor que no darla.
 */

const DEBOUNCE_MS = 300;

export interface UseCartQuoteResult {
  /** Última cotización conocida; null si aún no hay ninguna o si la última falló. */
  quote: CartQuote | null;
  /** Hay un cambio sin confirmar: lo que se ve todavía no es definitivo. */
  isUpdating: boolean;
  /** Mensaje para el comprador cuando no se pudo cotizar este carrito. */
  error: string | null;
  /** Reintento manual: el único camino de vuelta desde el estado de error. */
  retry: () => void;
}

/** Resultado de una petición concreta, etiquetado con la petición que lo produjo. */
interface QuoteState {
  requestKey: string;
  quote: CartQuote | null;
  error: string | null;
}

const EMPTY_STATE: QuoteState = { requestKey: "", quote: null, error: null };

/** "id:cantidad|id:cantidad" — resume lo único que cambia el precio. */
function cartKey(items: CartQuoteItem[]): string {
  return items
    .filter((item) => item && item.productId && item.quantity > 0)
    .map((item) => `${item.productId}:${item.quantity}`)
    .sort()
    .join("|");
}

function itemsFromKey(key: string): CartQuoteItem[] {
  return key.split("|").map((entry) => {
    const separator = entry.lastIndexOf(":");
    return {
      productId: entry.slice(0, separator),
      quantity: Number(entry.slice(separator + 1)),
    };
  });
}

export function useCartQuote(items: CartQuoteItem[]): UseCartQuoteResult {
  /* La store entrega un array nuevo en cada render: depender de su identidad
     dispararía una petición por render. Se depende de la clave, y de la clave
     sale también el cuerpo de la petición, así que respuesta y carrito no
     pueden desincronizarse. */
  const key = cartKey(items);
  const [attempt, setAttempt] = useState(0);
  const requestKey = `${attempt}#${key}`;

  const [state, setState] = useState<QuoteState>(EMPTY_STATE);

  useEffect(() => {
    if (!key) return;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      getCartQuote(itemsFromKey(key), controller.signal)
        .then((quote) => {
          if (controller.signal.aborted) return;
          setState({ requestKey, quote, error: null });
        })
        .catch((err: unknown) => {
          // Una petición cancelada no es un fallo: el carrito cambió y ya hay
          // otra en camino. Pintar un error aquí sería un parpadeo gratuito.
          if (controller.signal.aborted) return;
          setState({
            requestKey,
            quote: null,
            error:
              err instanceof Error && err.message
                ? err.message
                : "No pudimos calcular el total de tu pedido.",
          });
        });
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [key, requestKey]);

  /* Todo lo que se devuelve se deriva del último resultado y de la petición en
     curso: no hay estado «cargando» que mantener sincronizado a mano, y por
     tanto tampoco puede quedarse encendido tras un cambio de carrito. */
  const settled = state.requestKey === requestKey;
  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  return {
    quote: key ? state.quote : null,
    isUpdating: Boolean(key) && !settled,
    error: key && settled ? state.error : null,
    retry,
  };
}

export type { CartQuote, CartQuoteItem };
