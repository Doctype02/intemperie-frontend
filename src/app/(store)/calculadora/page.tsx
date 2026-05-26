import { Metadata } from "next";
import { API_BASE } from "@/lib/api";
import { FenceCalculator } from "@/components/calculator/fence-calculator";
import Link from "next/link";
import { Phone, ArrowRight, Calculator, MessageCircleMore } from "lucide-react";

export const metadata: Metadata = {
  title: "Calculadora de Cercas",
  description: "Calcula el costo de tu cerca de PVC o malla electrosoldada. Presupuesto estimado al instante.",
};

async function getProducts() {
  try {
    const res = await fetch(`${API_BASE}/products?limit=50`, { next: { revalidate: 3600, tags: ["products"] } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

export default async function CalculatorPage() {
  const products = await getProducts();

  return (
    <div className="flex-1 bg-gray-50 min-h-screen">
      {/* Page header */}
      <div className="bg-gray-950 py-12 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-xl bg-green-600/20 mb-4">
            <Calculator className="h-6 w-6 text-green-400" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">Calculadora de Cercas</h1>
          <p className="mt-3 text-gray-400 text-sm max-w-lg mx-auto">
            Obtén un presupuesto estimado al instante. Selecciona el modelo, ingresa los metros y te calculamos el costo total con ITBMS incluido.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 sm:py-14">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-start">
          {/* Calculator */}
          <div className="lg:col-span-3">
            <FenceCalculator products={products} />
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-2 space-y-4">
            {/* Help card */}
            <div className="bg-white rounded-2xl border border-gray-200 p-6">
              <h3 className="font-black text-gray-900 text-base mb-1">¿Necesitas una cotización exacta?</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-5">
                Nuestro equipo puede visitarte sin costo para tomar medidas y darte un precio personalizado.
              </p>
              <div className="space-y-2.5">
                <a
                  href="https://wa.me/50762874042?text=Hola%2C%20quiero%20cotizar%20mi%20cerca"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl bg-green-700 hover:bg-green-800 text-white text-sm font-bold transition-colors"
                >
                  <MessageCircleMore className="h-4 w-4" />
                  Cotizar por WhatsApp
                </a>
                <a
                  href="tel:+50762874042"
                  className="flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-gray-200 text-gray-700 hover:bg-gray-50 text-sm font-bold transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  +507 6287-4042
                </a>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-amber-50 border border-amber-100 rounded-xl p-4">
              <p className="text-xs font-bold text-amber-700 mb-2">Notas importantes</p>
              <ul className="text-xs text-amber-600 space-y-1.5">
                <li>· Los precios son estimados y pueden variar.</li>
                <li>· La instalación se cotiza por separado.</li>
                <li>· Pedido mínimo: 10 metros lineales.</li>
                <li>· Precios sujetos a cambios sin previo aviso.</li>
              </ul>
            </div>

            {/* Products link */}
            <Link
              href="/productos"
              className="flex items-center justify-between px-5 py-4 bg-white rounded-xl border border-gray-200 hover:border-green-200 hover:bg-green-50 transition-colors group"
            >
              <div>
                <p className="text-sm font-bold text-gray-900">Ver todos los modelos</p>
                <p className="text-xs text-gray-400 mt-0.5">Cercas PVC y mallas electrosoldadas</p>
              </div>
              <ArrowRight className="h-4 w-4 text-gray-400 group-hover:text-green-600 transition-colors" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
