"use client";

import { AlertCircle, Loader2 } from "lucide-react";
import type { CartQuote } from "@/lib/api/cart";
import { cn, formatMoney, formatTaxRatePercent } from "@/lib/utils";

/* Bloque de importes del pedido: subtotal, ITBMS, envío y total.
 *
 * Se pinta en las cuatro pantallas del embudo (panel del carrito, /carrito,
 * resumen plegable del checkout y su columna derecha) y por eso vive aquí:
 * cuando cada una hacía su propia suma, la tienda llegó a anunciar $35 de envío
 * en el carrito, $5.99 en el checkout y ningún envío en el panel. El comprador
 * veía aparecer un cargo en el último paso, que es donde se abandona la compra.
 *
 * Reparto de responsabilidades:
 *   · El subtotal se calcula en el cliente —es una suma, no una regla— para que
 *     pulsar «+» se note al instante.
 *   · ITBMS, envío y total SIEMPRE los dicta el servidor. No se derivan aquí ni
 *     aunque se conozca la fórmula: conocerla y copiarla bien es lo que hasta
 *     ahora daba la falsa sensación de que el checkout estaba bien.
 *
 * Estados: mientras la cotización se rehace las tres cifras del servidor se
 * atenúan y se anuncia «Actualizando»; si falla, no se enseña ningún total y
 * aparece el reintento. Un total inventado en una pantalla de compra es peor
 * que no dar total.
 */
export interface OrderTotalsProps {
  /** Suma de precio × cantidad hecha en el cliente. */
  subtotal: number;
  quote: CartQuote | null;
  isUpdating: boolean;
  error: string | null;
  onRetry: () => void;
  /** "Subtotal (3 ítems)" en las pantallas que cuentan artículos. */
  subtotalLabel?: string;
  size?: "sm" | "md";
  className?: string;
}

/** Marca de hueco: se usa siempre que el servidor aún no ha dicho la cifra. */
const PENDING = "—";

export function OrderTotals({
  subtotal,
  quote,
  isUpdating,
  error,
  onRetry,
  subtotalLabel = "Subtotal",
  size = "md",
  className,
}: OrderTotalsProps) {
  const small = size === "sm";
  const rowCls = "flex justify-between gap-4";
  const labelCls = "text-muted-foreground";
  const valueCls = "font-medium text-foreground tabular";
  const totalCls = cn(
    "flex justify-between gap-4 border-t border-hairline pt-2 font-bold text-foreground",
    small ? "text-base" : "text-lg",
  );

  /* Las cifras del servidor se atenúan en bloque mientras no estén confirmadas:
     es la señal de que lo que se lee todavía puede cambiar. */
  const pendingCls = isUpdating ? "opacity-60" : "";

  return (
    <div className={cn("space-y-2 text-sm", className)}>
      {/* Región viva: los pasos de cantidad están lejos de estas cifras y sin
          anuncio quien no ve la pantalla no se entera de que cambió su total. */}
      <div role="status" aria-live="polite" aria-atomic="true" className="space-y-2">
        <div className={rowCls}>
          <span className={labelCls}>{subtotalLabel}</span>
          <span className={valueCls}>{formatMoney(subtotal.toFixed(2))}</span>
        </div>

        <div className={cn(rowCls, pendingCls)}>
          <span className={labelCls}>
            ITBMS{quote ? ` (${formatTaxRatePercent(quote.taxRate)})` : ""}
          </span>
          <span className={valueCls}>{quote ? formatMoney(quote.tax) : PENDING}</span>
        </div>

        <div className={cn(rowCls, pendingCls)}>
          <span className={labelCls}>Envío</span>
          <span className={valueCls}>
            {!quote ? PENDING : quote.shippingIsFree ? "Gratis" : formatMoney(quote.shipping)}
          </span>
        </div>

        <div className={cn(totalCls, pendingCls)}>
          <span>Total</span>
          <span className="tabular">{quote ? formatMoney(quote.total) : PENDING}</span>
        </div>

        {isUpdating && (
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Loader2 className="size-3 animate-spin" aria-hidden="true" />
            Actualizando el total…
          </p>
        )}
      </div>

      {error && (
        <div
          role="alert"
          className="flex flex-col gap-2 rounded-lg border border-destructive/35 bg-destructive/8 px-3 py-2.5 text-xs text-destructive"
        >
          <span className="flex items-start gap-1.5">
            <AlertCircle className="mt-px size-3.5 shrink-0" aria-hidden="true" />
            No pudimos calcular el total de tu pedido.
          </span>
          <button
            type="button"
            onClick={onRetry}
            className="min-h-tap self-start rounded-lg px-2 font-bold underline underline-offset-2 hover:no-underline"
          >
            Reintentar
          </button>
        </div>
      )}
    </div>
  );
}
