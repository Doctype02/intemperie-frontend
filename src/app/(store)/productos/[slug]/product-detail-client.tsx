"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/store/cart-store";
import { Minus, Plus, ShoppingCart, ChevronRight, Shield, Truck } from "lucide-react";

export function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(10);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const price = Number(product.basePrice);
  const attrs = typeof product.attributes === "object" && product.attributes !== null ? product.attributes : {};
  const specs = Array.isArray(product.specifications) ? product.specifications
    : typeof product.specifications === "object" && product.specifications !== null
    ? Object.entries(product.specifications).map(([l, v]: any) => ({ label: l, value: v })) : [];

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, slug: product.slug, basePrice: price, unit: product.unit, stock: product.stock, collection: product.collection, category: product.category }, quantity);
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10">
      <div className="mb-4 hidden sm:flex items-center gap-1 text-sm text-gray-400">
        <Link href="/" className="hover:text-green-600">Inicio</Link><ChevronRight className="h-3 w-3" />
        <Link href="/productos" className="hover:text-green-600">Productos</Link><ChevronRight className="h-3 w-3" />
        <span className="text-gray-600 truncate">{product.name}</span>
      </div>

      <div className="grid gap-6 md:gap-10 lg:grid-cols-2">
        <div className="flex items-center justify-center rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 h-72 sm:h-96 lg:h-[480px] border border-gray-100">
          <div className="text-center">
            <div className="w-20 h-20 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center">
              <span className="text-3xl font-extrabold text-green-600">IP</span>
            </div>
            <p className="mt-3 text-sm font-semibold text-green-700">{product.collection?.name || product.category?.name}</p>
          </div>
        </div>

        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">
            {product.collection?.name || product.category?.name || "Intemperie"} | SKU: {product.slug}
          </p>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-extrabold text-gray-900">${price.toFixed(2)}</span>
            <span className="text-base text-gray-400">/m lineal</span>
          </div>

          <div className="mt-3 flex gap-2">
            <span className={`inline-flex items-center rounded-full px-3 py-0.5 text-xs font-medium ${product.stock === 0 ? "bg-red-50 text-red-700" : product.stock <= 5 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
              {product.stock === 0 ? "Agotado" : product.stock <= 5 ? `Solo ${product.stock} disponibles` : "En inventario"}
            </span>
          </div>

          <p className="mt-4 text-sm text-gray-600 leading-relaxed">{product.description}</p>

          {(attrs.heightOptions || attrs.colors) && (
            <div className="mt-5 grid grid-cols-2 gap-3">
              {attrs.heightOptions && <div className="rounded-lg border p-3"><p className="text-[10px] font-semibold uppercase text-gray-400">Alturas</p><p className="mt-1 text-sm font-medium">{String(attrs.heightOptions)}m</p></div>}
              {attrs.colors && <div className="rounded-lg border p-3"><p className="text-[10px] font-semibold uppercase text-gray-400">Colores</p><p className="mt-1 text-sm font-medium capitalize">{String(attrs.colors)}</p></div>}
            </div>
          )}

          {product.stock > 0 && (
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Metros:</span>
                <div className="flex items-center rounded-lg border">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-gray-500 hover:bg-gray-50"><Minus className="h-4 w-4" /></button>
                  <span className="min-w-[3rem] text-center font-bold text-base">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 text-gray-500 hover:bg-gray-50"><Plus className="h-4 w-4" /></button>
                </div>
              </div>
              <Button size="lg" className="w-full bg-green-700 hover:bg-green-800 font-bold text-sm h-12" onClick={handleAdd}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {added ? "¡Agregado!" : `Agregar — $${(price * quantity).toFixed(2)}`}
              </Button>
              <Button size="lg" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 h-12" asChild>
                <Link href={`https://wa.me/50762874042`} target="_blank">Cotizar por WhatsApp</Link>
              </Button>
            </div>
          )}

          <div className="mt-5 flex gap-4 text-xs text-gray-400">
            <span className="flex items-center gap-1.5"><Truck className="h-3.5 w-3.5" />Envíos nacionales</span>
            <span className="flex items-center gap-1.5"><Shield className="h-3.5 w-3.5" />Garantía incluida</span>
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <div className="mt-12">
          <h2 className="text-xl font-extrabold text-gray-900 mb-4">Especificaciones</h2>
          <Card className="border-gray-200">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>{specs.map((spec: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                      <td className="px-6 py-3 font-semibold text-gray-500 w-1/3">{spec.label}</td>
                      <td className="px-6 py-3 text-gray-900">{spec.value}</td>
                    </tr>
                  ))}</tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
