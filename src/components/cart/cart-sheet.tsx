"use client";

import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";

const FREE_SHIPPING_THRESHOLD = 50;

export function CartSheet() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCartStore();
  const [open, setOpen] = useState(false);
  const count = itemCount();
  const total = subtotal();
  const shippingProgress = Math.min((total / FREE_SHIPPING_THRESHOLD) * 100, 100);
  const remaining = Math.max(FREE_SHIPPING_THRESHOLD - total, 0);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Abrir carrito">
          <ShoppingCart className="h-5 w-5 text-gray-700" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-green-600 text-[10px] font-bold text-white">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md p-0">
        <SheetHeader className="px-5 pt-5 pb-4 border-b border-gray-100">
          <SheetTitle className="flex items-center gap-2 text-base">
            <ShoppingCart className="h-4.5 w-4.5" />
            Carrito
            {count > 0 && <span className="text-sm font-normal text-gray-400">({count} {count === 1 ? "producto" : "productos"})</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center px-6">
            <div className="h-16 w-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
              <ShoppingCart className="h-8 w-8 text-gray-300" />
            </div>
            <p className="text-base font-bold text-gray-900">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-gray-500">Agrega productos para comenzar</p>
            <Button className="mt-6 bg-green-700 hover:bg-green-800 rounded-xl" asChild onClick={() => setOpen(false)}>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Free shipping bar */}
            <div className="px-5 py-3 bg-gray-50 border-b border-gray-100">
              {remaining > 0 ? (
                <p className="text-xs text-gray-500 mb-1.5">
                  Agrega <span className="font-bold text-gray-800">${remaining.toFixed(2)}</span> más para envío gratis
                </p>
              ) : (
                <p className="text-xs font-bold text-green-700 mb-1.5">✓ Envío gratuito incluido en tu pedido</p>
              )}
              <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500 rounded-full transition-all duration-500"
                  style={{ width: `${shippingProgress}%` }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="relative h-16 w-16 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                    {item.product.images?.[0]?.url ? (
                      <Image
                        src={item.product.images[0].url}
                        alt={item.product.images[0].alt || item.product.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                        placeholder="blur"
                        blurDataURL={BLUR_PLACEHOLDER}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-green-50">
                        <span className="text-xl font-black text-green-600">{item.product.name.charAt(0)}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate leading-tight">{item.product.name}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{item.product.collection?.name}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex items-center rounded-lg border border-gray-200 overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <span className="min-w-[2rem] text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="px-2.5 py-1.5 text-gray-400 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-gray-900">
                          ${(item.product.basePrice * item.quantity).toFixed(2)}
                        </span>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="p-1.5 text-gray-300 hover:text-red-400 transition-colors rounded-lg hover:bg-red-50"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-4 border-t border-gray-100 bg-white">
              <div className="space-y-1.5 mb-4">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-gray-800">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>ITBMS (7%)</span>
                  <span className="font-medium text-gray-800">${(total * 0.07).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-black text-base pt-1.5 border-t border-gray-100">
                  <span>Total</span>
                  <span>${(total * 1.07).toFixed(2)}</span>
                </div>
              </div>
              <Button className="w-full bg-green-700 hover:bg-green-800 h-12 font-bold rounded-xl text-base" asChild onClick={() => setOpen(false)}>
                <Link href="/checkout">Ir al checkout</Link>
              </Button>
              <Button variant="ghost" className="mt-2 w-full h-10 text-sm text-gray-500 hover:text-gray-700" asChild onClick={() => setOpen(false)}>
                <Link href="/carrito">Ver carrito completo</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
