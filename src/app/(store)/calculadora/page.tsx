import { Metadata } from "next";
import { API_BASE } from "@/lib/api";
import type { Product } from "@/types";
import { FenceCalculator } from "@/components/calculator/fence-calculator";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

export const metadata: Metadata = {
  title: "Calculadora de Cercas",
  description: "Calcula el costo de tu cerca de PVC o malla electrosoldada. Presupuesto estimado al instante.",
};

async function getProducts(): Promise<Product[]> {
  const res = await fetch(`${API_BASE}/products?limit=50`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

export default async function CalculatorPage() {
  const products = await getProducts();

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
          Calculadora de Cercas
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Obtén un presupuesto estimado al instante. Solo selecciona el producto, ingresa los
          metros lineales y te mostramos el costo aproximado.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          <FenceCalculator products={products} />
        </div>

        <div className="lg:col-span-2">
          <div className="bg-gray-50 rounded-lg p-6 space-y-6">
            <h3 className="font-semibold text-lg">¿Necesitas ayuda?</h3>
            <p className="text-sm text-gray-600">
              Nuestro equipo puede visitarte sin costo para tomar medidas exactas y darte
              un presupuesto personalizado.
            </p>

            <div className="space-y-3">
              <Button asChild variant="outline" className="w-full border-green-300 text-green-700">
                <a href="tel:+50762874042">
                  <Phone className="h-4 w-4 mr-2" />
                  Llamar al +507 6287-4042
                </a>
              </Button>
              <Button asChild className="w-full bg-green-700 hover:bg-green-800">
                <Link href="/productos">Explorar Productos</Link>
              </Button>
            </div>

            <div className="text-xs text-gray-400">
              <p>* Los precios mostrados son estimados.</p>
              <p>* La instalación se cotiza por separado en caso necesario.</p>
              <p>* Precios sujetos a cambios sin previo aviso.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
