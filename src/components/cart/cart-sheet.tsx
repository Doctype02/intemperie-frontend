"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { ShoppingCart, Minus, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function CartSheet() {
  const { items, updateQuantity, removeItem, subtotal, itemCount } = useCartStore();
  const [open, setOpen] = useState(false);
  const count = itemCount();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <ShoppingCart className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-orange-500 text-[10px] font-bold text-white">
              {count}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="flex w-full flex-col sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Carrito de compras
            {count > 0 && <span className="text-sm font-normal text-gray-500">({count} items)</span>}
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center">
            <ShoppingCart className="mb-4 h-16 w-16 text-gray-200" />
            <p className="text-lg font-medium text-gray-900">Tu carrito está vacío</p>
            <p className="mt-1 text-sm text-gray-500">Agrega productos para comenzar</p>
            <Button className="mt-6 bg-green-700 hover:bg-green-800" asChild onClick={() => setOpen(false)}>
              <Link href="/productos">Ver productos</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 -mx-6 px-6 overflow-y-auto">
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4 rounded-lg border border-gray-100 p-3">
                    <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-green-50 text-2xl">
                      🏗️
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.product.name}</p>
                      <p className="text-xs text-gray-400">{item.product.collection?.name || ""}</p>
                      <p className="mt-1 text-sm font-semibold text-green-700">
                        ${(item.product.basePrice * item.quantity).toFixed(2)}
                      </p>
                      <div className="mt-2 flex items-center gap-2">
                        <div className="flex items-center rounded border border-gray-200">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                          >
                            <Minus className="h-3 w-3" />
                          </button>
                          <span className="min-w-[2rem] text-center text-sm">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="px-2 py-1 text-gray-500 hover:bg-gray-50"
                          >
                            <Plus className="h-3 w-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="ml-auto p-1 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between text-lg font-bold">
                <span>Subtotal</span>
                <span>${subtotal().toFixed(2)}</span>
              </div>
              <p className="mt-1 text-xs text-gray-400">ITBMS y envío calculados en el checkout</p>
              <Button className="mt-4 w-full bg-green-700 hover:bg-green-800 h-12 text-base" asChild onClick={() => setOpen(false)}>
                <Link href="/carrito">Ver carrito</Link>
              </Button>
              <Button variant="outline" className="mt-2 w-full h-12 text-base" asChild onClick={() => setOpen(false)}>
                <Link href="/checkout">Proceder al checkout</Link>
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
