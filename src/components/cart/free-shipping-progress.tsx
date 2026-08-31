"use client";

import { Check } from "lucide-react";
import type { CartQuote } from "@/lib/api/cart";
import { centsToMoney, cn, formatMoney, moneyToCents } from "@/lib/utils";

/* Barra de «te falta X para el envío gratis».
 *
 * Vivía duplicada en el panel y en la página del carrito, y las dos copias
 * anunciaban un umbral de $50 cuando la tienda regala el envío a partir de
 * $500: prometía envío gratis a diez veces menos de lo que cuesta. Ahora el
 * umbral y el «¿sale gratis?» salen de la cotización del servidor, así que si
 * mañana la promoción cambia el texto cambia solo.
 *
 * Sin cotización no se pinta ninguna cifra: es preferible una barra en gris a
 * anunciar un umbral inventado en la pantalla donde se decide comprar más.
 */
export function FreeShippingProgress({
  quote,
  isUpdating,
  size = "md",
  className,
}: {
  quote: CartQuote | null;
  isUpdating: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const small = size === "sm";
  const textCls = small ? "text-xs" : "text-sm";
  const barCls = small ? "h-1.5" : "h-2";
  const iconCls = small ? "size-3.5" : "size-4";

  const thresholdCents = quote ? moneyToCents(quote.freeShippingThreshold) : 0;
  const subtotalCents = quote ? moneyToCents(quote.subtotal) : 0;
  const remainingCents = Math.max(thresholdCents - subtotalCents, 0);
  const progress =
    thresholdCents > 0 ? Math.min((subtotalCents / thresholdCents) * 100, 100) : 0;

  return (
    <div className={className}>
      {!quote ? (
        /* Todavía no hay dato. Ocupa el mismo alto que el mensaje real para que
           la fila no dé un salto cuando llegue la cotización. */
        <p className={cn("mb-2 text-muted-foreground", textCls)}>
          {isUpdating ? "Calculando el envío…" : "Envío pendiente de calcular"}
        </p>
      ) : quote.shippingIsFree ? (
        <p className={cn("mb-2 flex items-center gap-1.5 font-bold text-success", textCls)}>
          <Check className={iconCls} aria-hidden="true" />
          Envío gratuito incluido en tu pedido
        </p>
      ) : (
        <p className={cn("mb-2 text-muted-foreground", textCls)}>
          Agrega{" "}
          <span className="font-bold text-foreground tabular">
            {formatMoney(centsToMoney(remainingCents))}
          </span>{" "}
          más para <span className="font-bold text-success">envío gratis</span>
        </p>
      )}
      {/* El dato está en el texto: la barra sólo lo ilustra y no tiene por qué
          anunciar un porcentaje que nadie ha pedido. */}
      <div
        aria-hidden="true"
        className={cn("w-full overflow-hidden rounded-full bg-surface-sunk", barCls)}
      >
        <div
          className="h-full rounded-full bg-primary transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
