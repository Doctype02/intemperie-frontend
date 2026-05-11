"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/store/cart-store";
import { Minus, Plus, ShoppingCart, ChevronRight, Shield, Truck } from "lucide-react";

export function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(10);
  const [loaded, setLoaded] = useState(false);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore((s) => s.addItem);
  const price = Number(product.basePrice);

  const specs = Array.isArray(product.specifications) ? product.specifications
    : typeof product.specifications === "object" && product.specifications !== null
    ? Object.entries(product.specifications).map(([l, v]) => ({ label: l, value: v })) : [];

  const attrs = typeof product.attributes === "object" && product.attributes !== null ? product.attributes : {};
  const heightOptions = attrs?.heightOptions || "";
  const colorOptions = attrs?.colors || "";

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, slug: product.slug, basePrice: price, unit: product.unit, stock: product.stock, collection: product.collection, category: product.category }, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-10 animate-fade-in">
      {/* Breadcrumb */}
      <div className="mb-6 hidden sm:flex items-center gap-1.5 text-sm text-gray-400">
        <Link href="/" className="hover:text-green-600 transition-colors">Inicio</Link><ChevronRight className="h-3.5 w-3.5" />
        <Link href="/productos" className="hover:text-green-600 transition-colors">Productos</Link><ChevronRight className="h-3.5 w-3.5" />
        <span className="text-gray-600 truncate">{product.name}</span>
      </div>

      <div className="grid gap-8 md:gap-12 lg:grid-cols-2">
        {/* Image */}
        <div className="flex items-center justify-center rounded-3xl bg-gradient-to-br from-green-50 to-emerald-50 h-72 sm:h-96 lg:h-[520px] relative overflow-hidden ring-1 ring-gray-100">
          <svg viewBox="0 0 400 520" className="absolute inset-0 h-full w-full opacity-50">
            <defs>
              <linearGradient id="gd" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stopColor="#bbf7d0"/><stop offset="100%" stopColor="#86efac"/></linearGradient>
              <pattern id="f" x="0" y="0" width="20" height="36" patternUnits="userSpaceOnUse">
                <rect width="7" height="36" rx="2" fill="url(#gd)" opacity="0.5" />
                <rect y="5" width="20" height="3.5" rx="1" fill="url(#gd)" opacity="0.25" />
                <rect y="16" width="20" height="3.5" rx="1" fill="url(#gd)" opacity="0.25" />
                <rect y="27" width="20" height="3.5" rx="1" fill="url(#gd)" opacity="0.25" />
              </pattern>
            </defs>
            <rect width="400" height="520" fill="url(#f)" />
          </svg>
          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/80 backdrop-blur px-4 py-2 text-sm font-medium text-green-700 shadow-sm">
              {product.collection?.name || product.category?.name}
            </div>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-xs font-medium uppercase tracking-widest text-gray-400 mb-2">
            {product.collection?.name || product.category?.name || "Intemperie"}
            <span className="mx-2 text-gray-300">|</span>
            SKU: {product.slug}
          </p>

          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 leading-tight tracking-tight">{product.name}</h1>

          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-4xl md:text-5xl font-extrabold text-gray-900 tabular-nums">${price.toFixed(2)}</span>
            <span className="text-lg text-gray-400">/m lineal</span>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <Badge className={product.stock === 0 ? "border-0 bg-red-50 text-red-600 text-xs" : product.stock <= 5 ? "border-0 bg-amber-50 text-amber-700 text-xs" : "border-0 bg-green-50 text-green-700 text-xs"}>
              {product.stock === 0 ? "Agotado" : product.stock <= 5 ? `Solo ${product.stock} disponibles` : "En inventario"}
            </Badge>
          </div>

          <p className="mt-6 text-gray-600 leading-relaxed text-sm md:text-base">{product.description}</p>

          {(heightOptions || colorOptions) && (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {heightOptions && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Alturas</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{String(heightOptions).replace(/,/g, "m, ")}m</p>
                </div>
              )}
              {colorOptions && (
                <div className="rounded-xl bg-gray-50 p-4">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Colores</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 capitalize">{String(colorOptions).replace(/,/g, ", ")}</p>
                </div>
              )}
            </div>
          )}

          {product.stock > 0 && (
            <div className="mt-8 space-y-4">
              <div className="flex items-center gap-4">
                <p className="text-sm font-medium text-gray-700">Metros:</p>
                <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-green-400 transition-colors">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-gray-400 hover:text-gray-600 transition-colors"><Minus className="h-5 w-5" /></button>
                  <span className="min-w-[3rem] text-center font-bold text-gray-900 text-lg tabular-nums">{quantity}</span>
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-4 py-3 text-gray-400 hover:text-gray-600 transition-colors"><Plus className="h-5 w-5" /></button>
                </div>
              </div>

              <Button size="lg" className="w-full bg-green-600 hover:bg-green-700 font-bold text-base h-14 rounded-xl shadow-lg shadow-green-200 btn-press" onClick={handleAdd}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                {added ? "¡Agregado!" : `Agregar al carrito — $${(price * quantity).toFixed(2)}`}
              </Button>

              <Button size="lg" variant="outline" className="w-full border-2 border-green-100 text-green-700 hover:bg-green-50 h-14 rounded-xl font-bold" asChild>
                <Link href={`https://wa.me/50762874042?text=Hola%20quiero%20cotizar%20${encodeURIComponent(product.name)}%20-%20${quantity}%20metros`} target="_blank">Cotizar por WhatsApp</Link>
              </Button>
            </div>
          )}

          <div className="mt-6 flex gap-4">
            <div className="flex items-center gap-2 text-xs text-gray-400"><Truck className="h-4 w-4 text-gray-300" />Envíos a todo Panamá</div>
            <div className="flex items-center gap-2 text-xs text-gray-400"><Shield className="h-4 w-4 text-gray-300" />Garantía incluida</div>
          </div>

          <div className="mt-6 rounded-2xl border border-gray-100 p-4 bg-gray-50/50">
            <p className="text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-2">Pago seguro</p>
            <div className="flex gap-2">{["Visa","Mastercard","Yappy","Clave"].map(m => <span key={m} className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-medium text-gray-500">{m}</span>)}</div>
          </div>
        </div>
      </div>

      {specs.length > 0 && (
        <div className="mt-16">
          <h2 className="text-2xl font-extrabold text-gray-900 mb-6">Especificaciones</h2>
          <Card className="overflow-hidden rounded-2xl border-gray-100">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <tbody>{specs.map((spec: any, i: number) => (
                    <tr key={i} className={`${i % 2 === 0 ? "bg-gray-50/30" : ""} transition-colors hover:bg-green-50/30`}>
                      <td className="px-6 py-4 font-semibold text-gray-500 w-1/3">{spec.label}</td>
                      <td className="px-6 py-4 text-gray-900">{spec.value}</td>
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
