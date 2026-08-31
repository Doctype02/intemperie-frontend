"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OrderTotals } from "@/components/cart/order-totals";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { useCartStore } from "@/lib/store/cart-store";
import { formatMoney } from "@/lib/utils";

/* Resumen de importes — sistema «Perímetro».
 *
 * Cuatro cifras que se leen en columna, no en prosa: subtotal, impuesto, envío
 * y total. Van con `.tabular` porque un «1» estrecho desalinea la columna y
 * obliga a releer para comparar; con cifras de ancho fijo el total se ve
 * encajado debajo de sus sumandos. Eso, y el anuncio del bloque como región
 * viva, los aporta ahora `OrderTotals`.
 *
 * ── Importes ──────────────────────────────────────────────────────────────
 * Esta pantalla cobraba $35 de envío cuando la tarifa real son $5.99: $29.01
 * de más, inventados por una constante que nadie volvió a mirar. Era la cuarta
 * copia de la misma regla de negocio en el embudo, y la que más se desviaba.
 *
 * Ya no recibe el subtotal por props: lo lee de la store, junto a los artículos
 * con los que se pide la cotización. Así es imposible pintar un subtotal de un
 * carrito y un total de otro, que es exactamente la incoherencia que este
 * componente exhibía.
 */
interface CartSummaryProps {
  showCheckout?: boolean;
}

export function CartSummary({ showCheckout = false }: CartSummaryProps) {
  const items = useCartStore((s) => s.items);
  const subtotal = useCartStore((s) => s.subtotal());
  const itemCount = useCartStore((s) => s.itemCount());
  const { quote, isUpdating, error, retry } = useCartQuote(items);

  return (
    <div className="space-y-3">
      <h3 className="font-heading text-lg font-semibold text-foreground">Resumen del pedido</h3>

      <OrderTotals
        subtotal={subtotal}
        quote={quote}
        isUpdating={isUpdating}
        error={error}
        onRetry={retry}
        subtotalLabel={`Subtotal (${itemCount} ${itemCount === 1 ? "ítem" : "ítems"})`}
      />

      {showCheckout && (
        <Button asChild size="block">
          <Link href="/checkout">Ir a pagar</Link>
        </Button>
      )}

      {/* El umbral se anuncia con el dato del servidor: escrito a mano ya
          mintió una vez en este mismo embudo. Sin cotización no se promete
          nada. */}
      {quote && (
        <p className="text-center text-xs text-muted-foreground">
          * El envío es gratis para pedidos superiores a{" "}
          <span className="tabular">{formatMoney(quote.freeShippingThreshold)}</span>
        </p>
      )}
    </div>
  );
}
