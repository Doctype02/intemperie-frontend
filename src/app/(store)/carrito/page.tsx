"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useCartStore } from "@/lib/store/cart-store";
import { CartItem } from "@/components/cart/cart-item";
import { CartSummary } from "@/components/cart/cart-summary";

export default function CartPage() {
  const items = useCartStore((s) => s.items);
  const itemCount = useCartStore((s) => s.itemCount());
  const subtotal = useCartStore((s) => s.subtotal());
  const clearCart = useCartStore((s) => s.clearCart);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Carrito de Compras</h1>
          <p className="text-gray-600 mt-1">
            {itemCount} {itemCount === 1 ? "ítem" : "ítems"} en tu carrito
          </p>
        </div>
        {items.length > 0 && (
          <Button variant="ghost" className="text-red-500" onClick={clearCart}>
            Vaciar carrito
          </Button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-20 h-20 mx-auto rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="h-10 w-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">Tu carrito está vacío</h2>
          <p className="text-gray-500">Agrega productos desde nuestro catálogo para comenzar.</p>
          <Button asChild className="bg-green-700 hover:bg-green-800">
            <Link href="/productos">Explorar Productos</Link>
          </Button>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {items.map((item) => (
              <div key={`${item.productId}-${item.unit}`}>
                <CartItem item={item} />
                <Separator className="last:hidden" />
              </div>
            ))}
            <div className="mt-4">
              <Button asChild variant="outline" size="sm">
                <Link href="/productos">
                  <ArrowLeft className="h-4 w-4 mr-1" /> Seguir comprando
                </Link>
              </Button>
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-6 h-fit">
            <CartSummary subtotal={subtotal} itemCount={itemCount} showCheckout />
          </div>
        </div>
      )}
    </div>
  );
}
