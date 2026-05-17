"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart-store";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";
import { useImageOnLoad } from "@/lib/image-load-context";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const [ready, setReady] = useState(false);
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const subtotal = useCartStore((s) => s.subtotal);
  const onLoad = useImageOnLoad();

  useEffect(() => { setReady(true); }, []);

  if (!ready) {
    return (
      <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8 space-y-4 animate-pulse">
          <div className="h-8 w-52 rounded-lg bg-gray-200" />
          <div className="rounded-xl bg-white border border-gray-200 overflow-hidden divide-y">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-4 flex gap-4 items-center">
                <div className="h-16 w-16 rounded-lg bg-gray-200 shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-2/3 rounded bg-gray-200" />
                  <div className="h-3 w-1/3 rounded bg-gray-200" />
                  <div className="h-7 w-24 rounded bg-gray-200" />
                </div>
                <div className="h-5 w-16 rounded bg-gray-200" />
              </div>
            ))}
            <div className="p-4 bg-gray-50 flex justify-end">
              <div className="h-12 w-52 rounded-xl bg-gray-200" />
            </div>
          </div>
        </div>
      </main>
    );
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
                <div key={item.id} className="p-3 sm:p-4">
                  <div className="flex gap-3 sm:gap-4 items-center">
                    <div className="relative h-14 w-14 sm:h-16 sm:w-16 shrink-0 rounded-lg bg-gray-100 overflow-hidden">
                      {item.product?.images?.[0]?.url ? (
                        <Image
                          src={item.product.images[0].url}
                          alt={item.product?.name || "Producto"}
                          fill
                          sizes="64px"
                          className="object-cover"
                          placeholder="blur"
                          blurDataURL={BLUR_PLACEHOLDER}
                          onLoad={onLoad}
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-green-50 text-lg font-bold text-green-600">
                          {item.product?.collection?.name?.charAt(0) || "I"}
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-bold text-gray-900 truncate">{item.product?.name || "Producto"}</p>
                      <p className="text-xs text-gray-400">{item.product?.collection?.name}</p>
                      <div className="mt-1.5 flex items-center gap-3 sm:gap-4">
                        <div className="flex items-center rounded border">
                          <button onClick={() => updateQuantity(item.productId, item.quantity - 1)} className="px-2 sm:px-3 py-1.5 text-gray-400 hover:bg-gray-50 active:bg-gray-100"><Minus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button>
                          <span className="min-w-[1.8rem] sm:min-w-[2rem] text-center text-sm font-medium">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.productId, item.quantity + 1)} className="px-2 sm:px-3 py-1.5 text-gray-400 hover:bg-gray-50 active:bg-gray-100"><Plus className="h-3.5 w-3.5 sm:h-4 sm:w-4" /></button>
                        </div>
                        <span className="text-sm font-bold">${((item.product?.basePrice || 0) * item.quantity).toFixed(2)}</span>
                      </div>
                    </div>
                    <button onClick={() => removeItem(item.productId)} className="p-2 text-gray-400 hover:text-red-500 active:bg-red-50 rounded-lg"><Trash2 className="h-4 w-4" /></button>
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
