"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";
import { Card, CardContent } from "@/components/ui/card";
import { useCartStore } from "@/lib/store/cart-store";
import { Minus, Plus, ShoppingCart, ChevronRight, Calculator } from "lucide-react";

export function ProductDetailClient({ product }: { product: any }) {
  const [quantity, setQuantity] = useState(10);
  const [includeInstallation, setIncludeInstallation] = useState(true);
  const [added, setAdded] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const addItem = useCartStore((s) => s.addItem);
  const price = Number(product.basePrice);

  const attrs = typeof product.attributes === "object" && product.attributes !== null ? product.attributes : {};
  const specs = Array.isArray(product.specifications) ? product.specifications
    : typeof product.specifications === "object" && product.specifications !== null
    ? Object.entries(product.specifications).map(([l, v]: any) => ({ label: l, value: v })) : [];

  const installationCost = includeInstallation ? price * quantity * 0.3 : 0;
  const subtotal = price * quantity;
  const tax = (subtotal + installationCost) * 0.07;
  const total = subtotal + installationCost + tax;

  const handleAdd = () => {
    addItem({ id: product.id, name: product.name, slug: product.slug, basePrice: price, unit: product.unit, stock: product.stock, collection: product.collection, category: product.category }, quantity);
    setAdded(true); setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-6 md:py-8">
      <div className="mb-4 hidden sm:flex items-center gap-1 text-xs text-gray-400">
        <Link href="/" className="hover:text-green-600">Inicio</Link><ChevronRight className="h-3 w-3" />
        <Link href="/productos" className="hover:text-green-600">Productos</Link><ChevronRight className="h-3 w-3" />
        <span className="text-gray-600 truncate">{product.name}</span>
      </div>

      <div className="grid gap-6 md:gap-8 lg:grid-cols-3">
        {/* Image Gallery */}
        <div className="lg:col-span-2">
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-center rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 relative h-56 sm:h-72 lg:h-96">
              {product.images?.length > 0 ? (
                <Image
                  src={product.images[selectedImage]?.url || product.images[0].url}
                  alt={product.images[selectedImage]?.alt || product.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 66vw"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto rounded-full bg-white shadow-sm flex items-center justify-center">
                      <span className="text-2xl font-extrabold text-green-600">IP</span>
                    </div>
                    <p className="mt-2 text-sm font-semibold text-green-700">{product.collection?.name}</p>
                  </div>
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img: any, i: number) => (
                  <button
                    key={img.id || i}
                    onClick={() => setSelectedImage(i)}
                    className={`flex-shrink-0 w-20 h-20 rounded-xl overflow-hidden border-2 transition-colors relative ${i === selectedImage ? "border-green-500 ring-1 ring-green-300" : "border-gray-100 hover:border-green-400"}`}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || `${product.name} ${i + 1}`}
                      fill
                      sizes="80px"
                      className="object-cover"
                      placeholder="blur"
                      blurDataURL={BLUR_PLACEHOLDER}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Specs */}
          {specs.length > 0 && (
            <div className="mt-8">
              <h2 className="text-lg font-extrabold text-gray-900 mb-3">Especificaciones</h2>
              <Card className="border-gray-200">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <tbody>{specs.map((spec: any, i: number) => (
                        <tr key={i} className={i % 2 === 0 ? "bg-gray-50/50" : ""}>
                          <td className="px-5 py-3 font-semibold text-gray-500 w-2/5">{spec.label}</td>
                          <td className="px-5 py-3 text-gray-900">{spec.value}</td>
                        </tr>
                      ))}</tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Sidebar - Product info + Calculator */}
        <div className="lg:sticky lg:top-[77px] lg:h-fit">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{product.collection?.name || product.category?.name} | SKU: {product.slug}</p>
          <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight mt-1">{product.name}</h1>

          <div className="mt-4 flex items-baseline gap-1.5">
            <span className="text-2xl md:text-3xl font-extrabold text-gray-900">${price.toFixed(2)}</span>
            <span className="text-sm text-gray-400">/m lineal</span>
          </div>

          <div className="mt-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-medium ${product.stock === 0 ? "bg-red-50 text-red-700" : product.stock <= 5 ? "bg-amber-50 text-amber-700" : "bg-green-50 text-green-700"}`}>
              {product.stock === 0 ? "Agotado" : product.stock <= 5 ? `Solo ${product.stock} disponibles` : "Disponible"}
            </span>
          </div>

          <p className="mt-3 text-sm text-gray-600 leading-relaxed line-clamp-4">{product.description}</p>

          {/* Calculator */}
          <div className="mt-6 rounded-xl border-2 border-green-100 bg-green-50/30 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="h-5 w-5 text-green-700" />
              <h3 className="text-sm font-extrabold text-green-800">Calculadora</h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-gray-500 uppercase">Metros lineales</label>
                <div className="mt-1 flex items-center rounded-lg border bg-white">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-3 py-2 text-gray-400 hover:bg-gray-50"><Minus className="h-4 w-4" /></button>
                  <input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(Math.max(1, Math.min(product.stock, parseInt(e.target.value) || 1)))}
                    className="w-full text-center font-bold text-base bg-transparent border-0 outline-none"
                  />
                  <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))} className="px-3 py-2 text-gray-400 hover:bg-gray-50"><Plus className="h-4 w-4" /></button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={includeInstallation}
                  onChange={(e) => setIncludeInstallation(e.target.checked)}
                  className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Incluir instalación (+30%)</span>
              </label>

              <div className="border-t pt-3 space-y-1.5 text-sm">
                <div className="flex justify-between text-gray-500">
                  <span>{quantity}m × ${price.toFixed(2)}</span>
                  <span className="font-medium text-gray-900">${subtotal.toFixed(2)}</span>
                </div>
                {includeInstallation && (
                  <div className="flex justify-between text-gray-500">
                    <span>Instalación</span>
                    <span className="font-medium">${installationCost.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-500">
                  <span>ITBMS (7%)</span>
                  <span className="font-medium">${tax.toFixed(2)}</span>
                </div>
                <div className="flex justify-between border-t pt-1.5 text-base font-extrabold text-gray-900">
                  <span>Total</span>
                  <span>${total.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Add to cart */}
          {product.stock > 0 && (
            <div className="mt-4 space-y-2">
              <Button size="lg" className="w-full bg-green-700 hover:bg-green-800 font-bold text-sm h-11" onClick={handleAdd}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                {added ? "¡Agregado!" : `Agregar al carrito`}
              </Button>
              <Button size="lg" variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 h-11 text-sm" asChild>
                <Link href={`https://wa.me/50762874042?text=Hola,%20quiero%20cotizar%20${encodeURIComponent(product.name)}%20-%20${quantity}m`} target="_blank">
                  Cotizar por WhatsApp
                </Link>
              </Button>
            </div>
          )}

          {/* Payment */}
          <div className="mt-4 rounded-lg border p-3">
            <p className="text-[10px] font-semibold text-gray-400 uppercase mb-1.5">Pago seguro</p>
            <div className="flex gap-1.5">{["Visa","Mastercard","Yappy","Clave"].map(m => <span key={m} className="rounded border px-2 py-0.5 text-[10px] text-gray-400">{m}</span>)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
