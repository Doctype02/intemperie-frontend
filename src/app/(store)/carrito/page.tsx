"use client";

import Link from "next/link";
import { useCartStore } from "@/lib/store/cart-store";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ArrowLeft, ShoppingCart } from "lucide-react";

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCartStore();

  if (items.length === 0) {
    return (
      <main className="flex-1 bg-gray-50 flex items-center justify-center">
          <div className="mx-auto max-w-3xl px-4 py-12 text-center">
            <ShoppingCart className="mx-auto mb-4 h-20 w-20 text-gray-200" />
            <h1 className="text-2xl font-bold text-gray-900">Tu carrito está vacío</h1>
            <p className="mt-2 text-gray-500">Parece que aún no has agregado productos a tu carrito</p>
            <Button className="mt-8 bg-green-700 hover:bg-green-800" size="lg" asChild>
              <Link href="/productos">Explorar productos</Link>
            </Button>
          </div>
        </main>
    );
  }

  return (
    <main className="flex-1 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Carrito de compras</h1>
            <Link href="/productos" className="flex items-center gap-1 text-sm text-green-700 hover:text-green-800">
              <ArrowLeft className="h-4 w-4" />
              Seguir comprando
            </Link>
          </div>

          <div className="rounded-xl bg-white border border-gray-200 overflow-hidden">
            {/* Header - desktop only */}
            <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 text-xs font-medium text-gray-500 uppercase tracking-wider">
              <div className="col-span-5">Producto</div>
              <div className="col-span-2 text-center">Precio</div>
              <div className="col-span-2 text-center">Cantidad</div>
              <div className="col-span-2 text-right">Total</div>
              <div className="col-span-1"></div>
            </div>

            {/* Items */}
            <div className="divide-y">
              {items.map((item) => (
                <div key={item.id}>
                  {/* Mobile card layout */}
                  <div className="block sm:hidden p-4">
                    <div className="flex gap-3">
                      <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-green-50 text-2xl">
                        🏗️
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-400">{item.product.collection?.name}</p>
                        <p className="mt-1 text-sm font-bold text-gray-900">${item.product.basePrice.toFixed(2)}</p>
                      </div>
                      <button onClick={() => removeItem(item.productId)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors self-start">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex items-center rounded border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-2 text-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[2.5rem] text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, Math.min(item.product.stock, item.quantity + 1))}
                          className="px-2.5 py-2 text-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-bold">${(item.product.basePrice * item.quantity).toFixed(2)}</span>
                    </div>
                  </div>

                  {/* Desktop table row */}
                  <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 items-center">
                    <div className="col-span-5 flex gap-3 items-center">
                      <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-green-50 text-2xl">
                        🏗️
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-900 truncate">{item.product.name}</p>
                        <p className="text-xs text-gray-400">{item.product.collection?.name}</p>
                      </div>
                    </div>
                    <div className="col-span-2 text-center text-sm font-medium">
                      ${item.product.basePrice.toFixed(2)}
                    </div>
                    <div className="col-span-2 flex justify-center">
                      <div className="flex items-center rounded border border-gray-200">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="px-2.5 py-2 text-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          <Minus className="h-3.5 w-3.5" />
                        </button>
                        <span className="min-w-[2.5rem] text-center text-sm font-medium">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.productId, Math.min(item.product.stock, item.quantity + 1))}
                          className="px-2.5 py-2 text-gray-400 hover:bg-gray-50 transition-colors"
                        >
                          <Plus className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    <div className="col-span-2 text-right text-sm font-bold">
                      ${(item.product.basePrice * item.quantity).toFixed(2)}
                    </div>
                    <div className="col-span-1 flex justify-end">
                      <button onClick={() => removeItem(item.productId)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="border-t bg-gray-50 px-4 sm:px-6 py-4">
              <div className="sm:flex sm:justify-end">
                <div className="w-full sm:w-72 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="font-medium">${subtotal().toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">ITBMS (7%)</span>
                    <span className="font-medium">${(subtotal() * 0.07).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Envío</span>
                    <span className="text-gray-400">Calculado en checkout</span>
                  </div>
                  <div className="flex justify-between border-t pt-2 text-lg font-bold">
                    <span>Total estimado</span>
                    <span>${(subtotal() * 1.07).toFixed(2)}</span>
                  </div>
                  <Button className="mt-4 w-full bg-green-700 hover:bg-green-800 h-12 text-base" asChild>
                    <Link href="/checkout">Proceder al checkout</Link>
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
  );
}
