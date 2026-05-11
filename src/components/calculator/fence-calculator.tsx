"use client";

import { useState } from "react";
import { Calculator, Info } from "lucide-react";
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
import { formatCurrency, getWhatsAppLink } from "@/lib/utils";
import type { Product } from "@/types";

interface FenceCalculatorProps {
  products: Product[];
}

export function FenceCalculator({ products }: FenceCalculatorProps) {
  const [productId, setProductId] = useState("");
  const [linearMeters, setLinearMeters] = useState("");
  const [includeInstallation, setIncludeInstallation] = useState(false);
  const [result, setResult] = useState<{
    materialCost: number;
    installationCost: number;
    total: number;
  } | null>(null);

  const selectedProduct = products.find((p) => p.id === productId);

  const calculate = () => {
    if (!selectedProduct || !linearMeters) return;

    const meters = parseFloat(linearMeters);
    if (isNaN(meters) || meters <= 0) return;

    const materialCost = meters * selectedProduct.pricePerMeter;
    const installationCost = includeInstallation ? meters * 8.5 : 0;
    const total = materialCost + installationCost;

    setResult({ materialCost, installationCost, total });
  };

  const whatsappMessage = result
    ? `¡Hola Intemperie! Me interesa cotizar:\n` +
      `Producto: ${selectedProduct?.name}\n` +
      `Metros lineales: ${linearMeters}\n` +
      `Incluir instalación: ${includeInstallation ? "Sí" : "No"}\n` +
      `Presupuesto estimado: ${formatCurrency(result.total)}`
    : "";

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5 text-green-700" />
          Calculadora de Cercas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Producto</Label>
          <Select value={productId} onValueChange={(value) => setProductId(value ?? "")}>
            <SelectTrigger>
              <SelectValue placeholder="Selecciona un producto" />
            </SelectTrigger>
            <SelectContent>
              {products.map((product) => (
                <SelectItem key={product.id} value={product.id}>
                  {product.name} — {formatCurrency(product.pricePerMeter)}/m
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedProduct && (
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <p className="font-medium text-gray-900">{selectedProduct.name}</p>
            <p className="text-gray-600 mt-1 line-clamp-2">{selectedProduct.description}</p>
            <p className="text-green-700 font-semibold mt-1">
              {formatCurrency(selectedProduct.pricePerMeter)} / metro lineal
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="meters">Metros lineales</Label>
          <Input
            id="meters"
            type="number"
            min="1"
            max="10000"
            placeholder="Ej. 25"
            value={linearMeters}
            onChange={(e) => setLinearMeters(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Checkbox
            id="installation"
            checked={includeInstallation}
            onCheckedChange={(c) => setIncludeInstallation(c as boolean)}
          />
          <Label htmlFor="installation" className="text-sm cursor-pointer">
            Incluir instalación ($8.50/m)
          </Label>
        </div>

        <Button
          className="w-full bg-green-700 hover:bg-green-800"
          onClick={calculate}
          disabled={!productId || !linearMeters}
        >
          Calcular Presupuesto
        </Button>

        {result && (
          <div className="bg-green-50 rounded-lg p-4 space-y-3">
            <h4 className="font-semibold text-green-900">Presupuesto Estimado</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Material</span>
                <span>{formatCurrency(result.materialCost)}</span>
              </div>
              {includeInstallation && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Instalación</span>
                  <span>{formatCurrency(result.installationCost)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-base border-t border-green-200 pt-2 mt-2">
                <span>Total estimado</span>
                <span className="text-green-700">{formatCurrency(result.total)}</span>
              </div>
            </div>

            <div className="flex items-start gap-2 text-xs text-gray-500">
              <Info className="h-3 w-3 mt-0.5 shrink-0" />
              <span>
                Este es un presupuesto estimado. Contáctanos para un presupuesto exacto
                con visita técnica gratuita.
              </span>
            </div>

            <Button asChild variant="outline" className="w-full border-green-300 text-green-700 hover:bg-green-50">
              <a href={getWhatsAppLink(whatsappMessage)} target="_blank" rel="noopener noreferrer">
                Cotizar por WhatsApp
              </a>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
