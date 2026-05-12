"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const [ready, setReady] = useState(false);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal);

  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return <main className="flex-1 bg-gray-50" />;
  }

  if (!items || items.length === 0) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center py-20">
        <div className="text-center max-w-md px-4">
          <ShoppingCart className="mx-auto mb-4 h-16 w-16 text-gray-200" />
          <h1 className="text-xl font-bold text-gray-900">Tu carrito está vacío</h1>
          <p className="mt-2 text-sm text-gray-500">Agrega productos desde nuestro catálogo</p>
          <Button className="mt-6 bg-green-700 hover:bg-green-800" asChild>
            <Link href="/productos">Ver productos</Link>
          </Button>
        </div>
      </main>
    );
  }

  const total = subtotal();
  const tax = total * 0.07;

  return (
    <main className="flex-1 bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Carrito ({items.length} {items.length === 1 ? "producto" : "productos"})
          </h1>
          <Link href="/productos" className="flex items-center gap-1 text-sm text-green-700 hover:text-green-800">
            <ArrowLeft className="h-4 w-4" /> Seguir comprando
          </Link>
        </div>

        <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
          <div className="divide-y">
            {items.map((item) => (
              <div key={item.id} className="p-4">
                <div className="flex gap-4 items-center">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-green-50 text-lg font-bold text-green-600">
                    {item.product?.collection?.name?.charAt(0) || "I"}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-bold text-gray-900 truncate">{item.product?.name || "Producto"}</p>
                    <p className="text-xs text-gray-400">{item.product?.collection?.name}</p>
                    <div className="mt-1 flex items-center gap-4">
                      <div className="flex items-center rounded border">
                        <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-50"><Minus className="h-3.5 w-3.5" /></button>
                        <span className="min-w-[2rem] text-center text-sm font-medium">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-50"><Plus className="h-3.5 w-3.5" /></button>
                      </div>
                      <span className="text-sm font-bold">${((item.product?.basePrice || 0) * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>
                  <button onClick={() => removeItem(item.productId)} className="p-2 text-gray-400 hover:text-red-500"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            ))}
          </div>

          <div className="border-t bg-gray-50 p-4">
            <div className="sm:flex sm:justify-end">
              <div className="w-full sm:w-72 space-y-2">
                <div className="flex justify-between text-sm"><span className="text-gray-500">Subtotal</span><span className="font-medium">${total.toFixed(2)}</span></div>
                <div className="flex justify-between text-sm"><span className="text-gray-500">ITBMS (7%)</span><span className="font-medium">${tax.toFixed(2)}</span></div>
                <div className="flex justify-between border-t pt-2 text-lg font-bold"><span>Total</span><span>${(total + tax).toFixed(2)}</span></div>
                <Button className="mt-4 w-full bg-green-700 hover:bg-green-800 h-12" asChild><Link href="/checkout">Proceder al checkout</Link></Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
