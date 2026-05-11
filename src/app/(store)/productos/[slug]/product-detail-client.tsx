"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/store/cart-store";
import { Minus, Plus, ShoppingCart, ChevronRight } from "lucide-react";

const unitLabel = (unit: string) => unit === "METRO" ? "metros" : unit === "PANEL" ? "paneles" : "unidades";

export function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(10);
  const addItem = useCartStore((s) => s.addItem);
  const price = Number(product.basePrice);
  const stockLabel = product.stock === 0
    ? "Agotado"
    : product.stock <= 5
    ? `Solo quedan ${product.stock} unidades`
    : "En inventario";

  const specs = Array.isArray(product.specifications)
    ? product.specifications
    : typeof product.specifications === "object" && product.specifications !== null
    ? Object.entries(product.specifications).map(([label, value]) => ({ label, value }))
    : [];

  const attrs = typeof product.attributes === "object" && product.attributes !== null
    ? product.attributes
    : {};

  const heightOptions = attrs?.heightOptions || "";
  const colorOptions = attrs?.colors || "";

  const handleAddToCart = () => {
    addItem({
      id: product.id,
      name: product.name,
      slug: product.slug,
      basePrice: price,
      unit: product.unit,
      stock: product.stock,
      collection: product.collection,
      category: product.category,
    }, quantity);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <div className="mb-6 hidden sm:flex items-center gap-2 text-xs md:text-sm text-gray-400">
        <Link href="/" className="hover:text-green-600">Inicio</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/productos" className="hover:text-green-600">Productos</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-gray-600">{product.name}</span>
      </div>

      <div className="grid gap-6 lg:gap-10 lg:grid-cols-2">
        {/* Image */}
        <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-green-50 to-green-100 h-72 sm:h-96 lg:h-[500px]">
          <div className="text-center select-none">
            <span className="text-8xl opacity-20">🏗️</span>
            <p className="mt-4 text-sm font-medium text-green-700">
              {product.collection?.name || product.category?.name || "Intemperie"}
            </p>
          </div>
        </div>

        {/* Info */}
        <div>
          <p className="text-sm text-gray-400 mb-1">
            {product.collection?.name || product.category?.name || "Intemperie"} · SKU: {product.slug}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{product.name}</h1>

          {/* Price */}
          <div className="mt-6 flex items-baseline gap-2">
            <span className="text-3xl md:text-4xl font-bold text-gray-900">${price.toFixed(2)}</span>
            <span className="text-base md:text-lg text-gray-500">/ {unitLabel(product.unit).slice(0, -1)} lineal</span>
          </div>

          {/* Stock */}
          <div className="mt-4">
            <Badge className={
              product.stock === 0 ? "bg-red-100 text-red-700 border-0" :
              product.stock <= 5 ? "bg-orange-100 text-orange-700 border-0" :
              "bg-green-100 text-green-700 border-0"
            }>
              {stockLabel}
            </Badge>
          </div>

          {/* Description */}
          <p className="mt-6 text-gray-600 leading-relaxed">{product.description}</p>

          {/* Quick specs */}
          {(heightOptions || colorOptions) && (
            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              {heightOptions && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">Alturas disponibles</p>
                  <p className="mt-1 text-sm font-medium text-gray-900">{String(heightOptions).replace(/,/g, "m, ")}m</p>
                </div>
              )}
              {colorOptions && (
                <div className="rounded-lg bg-gray-50 p-3">
                  <p className="text-xs text-gray-400 font-medium uppercase">Colores</p>
                  <p className="mt-1 text-sm font-medium text-gray-900 capitalize">{String(colorOptions).replace(/,/g, ", ")}</p>
                </div>
              )}
            </div>
          )}

          {/* Quantity + Add to cart */}
          {product.stock > 0 && (
            <>
              <div className="mt-8">
                <p className="mb-3 text-sm font-medium text-gray-700">
                  {unitLabel(product.unit).charAt(0).toUpperCase() + unitLabel(product.unit).slice(1)} a cotizar:
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center rounded-lg border border-gray-200">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="px-3 py-3 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Minus className="h-4 w-4" />
                    </button>
                    <span className="min-w-[3rem] text-center font-semibold text-gray-900">{quantity}</span>
                    <button
                      onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                      className="px-3 py-3 text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Button
                  size="lg"
                  className="w-full bg-green-700 hover:bg-green-800 font-bold text-lg h-14"
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-5 w-5" />
                  Agregar al carrito — ${(price * quantity).toFixed(2)}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full border-green-200 text-green-700 hover:bg-green-50 h-14"
                  asChild
                >
                  <Link href={`https://wa.me/50762874042?text=Hola%20quiero%20cotizar%20${encodeURIComponent(product.name)}%20-%20${quantity}%20metros`} target="_blank">
                    Cotizar por WhatsApp
                  </Link>
                </Button>
              </div>
            </>
          )}

          {/* Payment info */}
          <div className="mt-6 rounded-lg border border-gray-200 p-3 md:p-4">
            <p className="text-xs text-gray-400 font-medium uppercase mb-2">Pago seguro con</p>
            <div className="flex gap-2">
              {["Visa", "Mastercard", "Yappy", "Clave"].map((m) => (
                <div key={m} className="rounded border border-gray-200 bg-gray-50 px-3 py-1 text-xs font-medium text-gray-500">
                  {m}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Specifications */}
      {specs.length > 0 && (
        <div className="mt-12 md:mt-16">
          <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Especificaciones</h2>
          <Card>
            <CardContent className="p-0 overflow-x-auto">
              <table className="w-full text-xs md:text-sm min-w-[400px]">
                <tbody>
                  {specs.map((spec: any, i: number) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                      <td className="px-6 py-3 font-medium text-gray-600 w-1/3">{spec.label}</td>
                      <td className="px-6 py-3 text-gray-900">{spec.value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
