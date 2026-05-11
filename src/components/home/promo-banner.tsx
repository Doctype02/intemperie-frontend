import Link from "next/link";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PromoBanner() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-green-700 to-green-600 p-8 md:p-12">
          <div className="absolute right-0 top-0 h-full w-1/3 opacity-10">
            <div className="flex h-full items-center justify-center text-[200px]">🏗️</div>
          </div>
          <div className="relative z-10 grid items-center gap-8 md:grid-cols-2">
            <div className="text-white">
              <h2 className="text-3xl font-bold md:text-4xl">¿Cuánta cerca necesitas?</h2>
              <p className="mt-4 text-lg text-green-100 max-w-md">
                Usa nuestra calculadora gratuita para estimar el costo de tu proyecto.
                Ingresa los metros lineales y el tipo de cerca que buscas.
              </p>
              <div className="mt-6 flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 font-bold" asChild>
                  <Link href="/calculadora">
                    <Calculator className="mr-2 h-5 w-5" />
                    Calcular ahora
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="https://wa.me/50762874042" target="_blank">
                    Cotizar por WhatsApp
                  </Link>
                </Button>
              </div>
            </div>
            <div className="hidden md:block">
              <div className="rounded-xl bg-white/10 backdrop-blur p-6">
                <p className="text-white/80 text-sm mb-4">Ejemplo rápido</p>
                <div className="space-y-3">
                  <div className="flex justify-between text-white">
                    <span>25m Cerca PVC Oceanides 101</span>
                    <span className="font-bold">$462.50</span>
                  </div>
                  <div className="flex justify-between text-green-200">
                    <span>Instalación profesional</span>
                    <span>$138.75</span>
                  </div>
                  <div className="border-t border-white/20 pt-3 flex justify-between text-white">
                    <span className="font-bold">Total estimado</span>
                    <span className="font-bold text-xl">$643.34</span>
                  </div>
                </div>
                <p className="mt-3 text-xs text-green-200">*Incluye ITBMS. Precios referenciales.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
