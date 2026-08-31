"use client";

import { Separator } from "@/components/ui/separator";
import { OrderTotals } from "@/components/cart/order-totals";
import { useCartQuote } from "@/hooks/use-cart-quote";
import { formatMoney } from "@/lib/utils";
import type { CartItem } from "@/types";

/* Resumen del pedido — sistema «Perímetro».
 *
 * Lo que se compara aquí son cifras, no palabras: subtotal, impuesto, envío y
 * total se leen en columna. Por eso los importes van alineados a la derecha y
 * con `.tabular`, para que el punto decimal caiga siempre en el mismo sitio y
 * un total de 1.204,50 no parezca menor que uno de 987,00.
 *
 * ── Importes ──────────────────────────────────────────────────────────────
 * Era la quinta copia de la regla de negocio del embudo: ITBMS del 7 %, envío
 * de $5.99 y umbral de $500 escritos a mano. Aunque hoy nadie monte este
 * componente, dejarlo así garantizaba que el día que alguien lo reviva vuelva
 * a aparecer la discrepancia que este cambio elimina. Ahora impuesto, envío y
 * total salen de `POST /cart/quote` como en el resto del embudo.
 */
interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  addressName?: string;
}

export function OrderSummary({ items, subtotal, addressName }: OrderSummaryProps) {
  const { quote, isUpdating, error, retry } = useCartQuote(items);

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">Resumen de tu pedido</h3>

      {/* Los importes por línea son precio × cantidad: aritmética sin regla de
          negocio, así que se puede hacer aquí y responder al instante. */}
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex justify-between gap-3 text-sm">
            <div className="min-w-0 flex-1">
              <p className="font-medium text-foreground">{item.product.name}</p>
              <p className="text-muted-foreground tabular">
                {item.quantity} {item.product.unit === "METRO" ? "m" : "unid."}
              </p>
            </div>
            <span className="font-semibold text-foreground tabular">
              {formatMoney(((Number(item.product.basePrice) || 0) * item.quantity).toFixed(2))}
            </span>
          </li>
        ))}
      </ul>

      <Separator />

      <OrderTotals
        subtotal={subtotal}
        quote={quote}
        isUpdating={isUpdating}
        error={error}
        onRetry={retry}
      />

      {addressName && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Dirección de envío:</span> {addressName}
        </p>
      )}
    </div>
  );
}
