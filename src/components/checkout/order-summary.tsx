import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  addressName?: string;
}

/* Resumen del pedido — sistema «Perímetro».
 *
 * Lo que se compara aquí son cifras, no palabras: subtotal, impuesto, envío y
 * total se leen en columna. Por eso los importes van alineados a la derecha y
 * con `.tabular`, para que el punto decimal caiga siempre en el mismo sitio y
 * un total de 1.204,50 no parezca menor que uno de 987,00.
 *
 * Los conceptos y sus importes son una lista de definiciones (`dl`), no filas
 * sueltas: un lector de pantalla anuncia «Subtotal, 240 dólares» en lugar de
 * dos textos sin relación entre sí.
 */
export function OrderSummary({ items, subtotal, addressName }: OrderSummaryProps) {
  const tax = subtotal * 0.07;
  const shipping = subtotal > 500 ? 0 : 5.99;
  const total = subtotal + tax + shipping;

  return (
    <div className="space-y-4">
      <h3 className="font-heading text-lg font-bold text-foreground">Resumen de tu pedido</h3>

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
              {formatCurrency(Number(item.product.basePrice) * item.quantity)}
            </span>
          </li>
        ))}
      </ul>

      <Separator />

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Subtotal</dt>
          <dd className="text-foreground tabular">{formatCurrency(subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">ITBMS (7%)</dt>
          <dd className="text-foreground tabular">{formatCurrency(tax)}</dd>
        </div>
        <div className="flex justify-between gap-3">
          <dt className="text-muted-foreground">Envío</dt>
          <dd className="text-foreground tabular">
            {shipping === 0 ? "Gratis" : formatCurrency(shipping)}
          </dd>
        </div>
      </dl>

      <Separator />

      <dl className="flex items-baseline justify-between gap-3">
        <dt className="font-heading text-lg font-bold text-foreground">Total</dt>
        <dd className="font-heading text-lg font-bold text-foreground tabular">
          {formatCurrency(total)}
        </dd>
      </dl>

      {addressName && (
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">Dirección de envío:</span> {addressName}
        </p>
      )}
    </div>
  );
}
