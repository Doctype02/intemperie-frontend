import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/lib/utils";

/* Resumen de importes — sistema «Perímetro».
 *
 * Cuatro cifras que se leen en columna, no en prosa: subtotal, impuesto, envío
 * y total. Van con `.tabular` porque un «1» estrecho desalinea la columna y
 * obliga a releer para comparar; con cifras de ancho fijo el total se ve
 * encajado debajo de sus sumandos.
 *
 * El bloque completo es una región viva: cambiar la cantidad de un artículo
 * reescribe estos números en otro punto de la página, y sin anuncio el cambio
 * es invisible para quien navega con lector de pantalla.
 */
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
      <h3 className="font-heading text-lg font-semibold text-foreground">Resumen del pedido</h3>

      <div role="status" aria-live="polite" aria-atomic="true" className="space-y-3">
        <div className="space-y-2 text-sm">
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">
              Subtotal ({itemCount} {itemCount === 1 ? "ítem" : "ítems"})
            </span>
            <span className="text-foreground tabular">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">ITBMS (7%)</span>
            <span className="text-foreground tabular">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">Envío estimado</span>
            <span className="text-foreground tabular">
              {shipping === 0 ? "Gratis" : formatCurrency(shipping)}
            </span>
          </div>
        </div>

        <Separator />

        <div className="flex justify-between gap-4 text-lg font-bold text-foreground">
          <span>Total</span>
          <span className="tabular">{formatCurrency(total)}</span>
        </div>
      </div>

      {showCheckout && (
        <Button asChild size="block">
          <Link href="/checkout">Ir a pagar</Link>
        </Button>
      )}

      <p className="text-center text-xs text-muted-foreground">
        * El envío es gratis para pedidos superiores a $500.00
      </p>
    </div>
  );
}
