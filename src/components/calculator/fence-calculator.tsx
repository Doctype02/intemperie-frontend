"use client";

import { useState } from "react";
import { Calculator, Info, Minus, Plus, Phone, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WHATSAPP_NUMBER } from "@/lib/utils";

interface Product {
  id: string; name: string; slug: string; basePrice: number;
  unit: string; stock: number; description?: string;
  collection?: { name: string }; category?: { name: string };
}

interface FenceCalculatorProps { products: Product[]; }

export function FenceCalculator({ products }: FenceCalculatorProps) {
  const [productId, setProductId] = useState("");
  const [linearMeters, setLinearMeters] = useState(25);
  const [includeInstallation, setIncludeInstallation] = useState(true);

  const selectedProduct = products.find((p) => p.id === productId);
  const price = selectedProduct ? Number(selectedProduct.basePrice) : 0;
  const materialCost = price * linearMeters;
  const installationCost = includeInstallation ? materialCost * 0.3 : 0;
  const subtotal = materialCost + installationCost;
  const tax = subtotal * 0.07;
  const total = subtotal + tax;

  const format = (n: number) => `$${n.toFixed(2)}`;

  const whatsappMsg = selectedProduct
    ? `Hola Intemperie! Quiero cotizar:%0A%0A*Producto:* ${selectedProduct.name}%0A*Metros:* ${linearMeters}m%0A*Instalación:* ${includeInstallation ? "Sí" : "No"}%0A*Total estimado:* ${format(total)}`
    : "";

  return (
    <Card className="border-2 border-green-100 shadow-lg shadow-green-50">
      <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white rounded-t-xl -mx-0 -mt-0">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20">
            <Calculator className="h-5 w-5 text-white" />
          </div>
          Calculadora de Cercas
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-5 pt-5">
        {/* Product selector */}
        <div className="space-y-2">
          <Label className="text-sm font-semibold text-gray-700">1. Elige tu producto</Label>
          <Select value={productId} onValueChange={(v) => setProductId(v || "")}>
            <SelectTrigger className="h-12 border-gray-200 focus:ring-2 focus:ring-green-400">
              <SelectValue placeholder="Selecciona un producto..." />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  <span className="font-medium">{product.name}</span>
                  <span className="ml-2 text-green-600 text-sm">— {format(Number(product.basePrice))}/m</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Selected product card */}
        {selectedProduct && (
          <div className="rounded-xl border border-green-100 bg-green-50/50 p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-green-100 text-green-700 font-extrabold text-lg">
                {selectedProduct.collection?.name ? selectedProduct.collection.name.match(/\d+/)?.[0] || "IP" : "IP"}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-gray-900 truncate">{selectedProduct.name}</p>
                <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{selectedProduct.description}</p>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-extrabold text-green-700">{format(price)}</span>
                  <span className="text-sm text-gray-400">/ metro lineal</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quantitiy + Options */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-sm font-semibold text-gray-700">2. Metros lineales</Label>
            <div className="flex items-center rounded-xl border-2 border-gray-200 focus-within:border-green-400 transition-colors overflow-hidden">
              <button
                onClick={() => setLinearMeters(Math.max(1, linearMeters - 1))}
                className="px-4 py-3 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              >
                <Minus className="h-5 w-5" />
              </button>
              <input
                type="number"
                min={1}
                value={linearMeters}
                onChange={(e) => setLinearMeters(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full text-center font-extrabold text-xl bg-transparent border-0 outline-none text-gray-900"
              />
              <button
                onClick={() => setLinearMeters(linearMeters + 1)}
                className="px-4 py-3 text-gray-400 hover:text-green-600 hover:bg-green-50 transition-colors"
              >
                <Plus className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="flex items-end pb-1">
            <label className="flex items-center gap-3 cursor-pointer rounded-xl border-2 border-gray-200 px-4 py-3 w-full hover:border-green-200 transition-colors">
              <Checkbox
                id="inst"
                checked={includeInstallation}
                onCheckedChange={(c) => setIncludeInstallation(c as boolean)}
                className="scale-125"
              />
              <div>
                <span className="text-sm font-semibold text-gray-700">Incluir instalación</span>
                <span className="block text-xs text-gray-400">+30% del material</span>
              </div>
            </label>
          </div>
        </div>

        {/* Result */}
        <div className="rounded-2xl bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 p-5">
          <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-3">Presupuesto Estimado</h4>
          <div className="space-y-2.5">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">
                {linearMeters}m × {format(price)}/m
              </span>
              <span className="font-semibold text-gray-900">{format(materialCost)}</span>
            </div>
            {includeInstallation && (
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Instalación (30%)</span>
                <span className="font-semibold text-gray-900">{format(installationCost)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">ITBMS (7%)</span>
              <span className="font-semibold text-gray-900">{format(tax)}</span>
            </div>
            <div className="flex justify-between border-t-2 border-green-200 pt-3">
              <span className="text-lg font-extrabold text-gray-900">Total</span>
              <span className="text-2xl font-extrabold text-green-700">{format(total)}</span>
            </div>
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-lg bg-white/60 p-3 text-xs text-gray-500">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0 text-green-500" />
            <span>Presupuesto estimado. Contáctanos para uno exacto con visita técnica gratuita.</span>
          </div>

          <div className="mt-3 flex gap-2">
            <Button asChild variant="outline" className="flex-1 border-green-200 text-green-700 hover:bg-green-50">
              <a href={`https://wa.me/${WHATSAPP_NUMBER}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="mr-2 h-4 w-4" />
                Cotizar por WhatsApp
              </a>
            </Button>
            <Button asChild className="flex-1 bg-green-700 hover:bg-green-800">
              <a href={`tel:+${WHATSAPP_NUMBER}`}>
                <Phone className="mr-2 h-4 w-4" />
                Llamar
              </a>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
