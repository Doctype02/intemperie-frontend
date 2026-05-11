import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";
import type { CartItem } from "@/types";

interface OrderSummaryProps {
  items: CartItem[];
  subtotal: number;
  addressName: string;
}

export function OrderSummary({ items, subtotal, addressName }: OrderSummaryProps) {
  const tax = subtotal * 0.07;
  const shipping = subtotal > 500 ? 0 : 35;
  const total = subtotal + tax + shipping;

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Resumen de tu Pedido</h3>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={item.id} className="flex justify-between text-sm">
            <div className="flex-1">
              <p className="font-medium">{item.product.name}</p>
              <p className="text-gray-500">
                {item.quantity} {item.unit === "meters" ? "metros" : "paneles"}
              </p>
            </div>
            <span className="font-medium">
              {formatCurrency(
                item.unit === "meters"
                  ? item.quantity * item.product.pricePerMeter
                  : item.quantity *
                      (item.product.pricePerPanel ??
                        item.product.pricePerMeter * (item.product.panelWidth ?? 2.5))
              )}
            </span>
          </div>
        ))}
      </div>

      <Separator />

      <div className="text-sm space-y-2">
        <div className="flex justify-between">
          <span className="text-gray-600">Subtotal</span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">ITBMS (7%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Envío</span>
          <span>{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
        </div>
      </div>

      <Separator />

      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span className="text-green-700">{formatCurrency(total)}</span>
      </div>

      <div className="text-sm text-gray-500">
        <p>
          <span className="font-medium">Dirección de envío:</span> {addressName}
        </p>
      </div>
    </div>
  );
}
