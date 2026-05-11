import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

interface CartSummaryProps {
  subtotal: number;
  itemCount: number;
  showCheckout?: boolean;
}

export function CartSummary({ subtotal, itemCount, showCheckout = false }: CartSummaryProps) {
  const tax = subtotal * 0.07;
  const shipping = subtotal > 500 ? 0 : 35;
  const total = subtotal + tax + shipping;

  return (
    <div className="space-y-3">
      <h3 className="font-semibold text-lg">Resumen del Pedido</h3>
      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span className="text-gray-600">
            Subtotal ({itemCount} {itemCount === 1 ? "ítem" : "ítems"})
          </span>
          <span>{formatCurrency(subtotal)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">ITBMS (7%)</span>
          <span>{formatCurrency(tax)}</span>
        </div>
        <div className="flex justify-between">
          <span className="text-gray-600">Envío estimado</span>
          <span>{shipping === 0 ? "Gratis" : formatCurrency(shipping)}</span>
        </div>
      </div>
      <Separator />
      <div className="flex justify-between font-bold text-lg">
        <span>Total</span>
        <span className="text-green-700">{formatCurrency(total)}</span>
      </div>

      {showCheckout && (
        <Button asChild className="w-full bg-green-700 hover:bg-green-800" size="lg">
          <Link href="/checkout">Proceder al Checkout</Link>
        </Button>
      )}

      <p className="text-xs text-gray-400 text-center">
        * El envío es gratis para pedidos superiores a $500.00
      </p>
    </div>
  );
}
