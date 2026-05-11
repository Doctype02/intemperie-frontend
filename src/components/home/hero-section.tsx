"use client";

import Link from "next/link";
import { ArrowRight, Shield, Star, Truck, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-gray-900 overflow-hidden">
      {/* Abstract fence pattern background */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/40 via-gray-900 to-gray-900" />
        <div className="absolute inset-0" style={{
          backgroundImage: `repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)`
        }} />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-14 md:py-20 lg:py-24">
        <div className="grid items-center gap-10 lg:grid-cols-2">
          {/* Text content */}
          <div className="text-white">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-sm text-green-300 mb-6">
              <Star className="h-4 w-4 fill-green-400 text-green-400" />
              Líderes en cercas en Panamá · 4.8 ★ Google
            </div>

            <h1 className="text-3xl font-black tracking-tight md:text-5xl lg:text-5xl leading-[1.1]">
              Protege tu espacio
              <br />
              <span className="text-green-400">con estilo y seguridad</span>
            </h1>

            <p className="mt-5 text-base md:text-lg leading-relaxed text-gray-300 max-w-lg">
              Cercas de PVC y mallas electrosoldadas de grado profesional. 
              Resistentes al sol, humedad y salitre. Instalación en todo Panamá.
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-gray-900 font-bold text-base h-14 px-8 rounded-full shadow-xl shadow-green-500/25" asChild>
                <Link href="/productos">
                  Ver productos
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 font-bold h-14 px-8 rounded-full" asChild>
                <Link href="/calculadora">
                  Calcular precio
                </Link>
              </Button>
            </div>

            {/* Trust bar */}
            <div className="mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4 text-green-500" />Garantía 10-15 años</span>
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4 text-green-500" />Envíos nacionales</span>
              <span className="flex items-center gap-1.5"><Phone className="h-4 w-4 text-green-500" />+507 6287-4042</span>
            </div>
          </div>

          {/* Visual - Product showcase card */}
          <div className="hidden lg:block">
            <div className="relative">
              <div className="absolute -inset-0.5 rounded-2xl bg-gradient-to-r from-green-400 to-emerald-400 opacity-50 blur" />
              <div className="relative rounded-2xl bg-gray-800 border border-white/10 p-5">
                <img
                  src="https://placehold.co/600x350/1a2e1a/86efac?text=CERCAS+PVC+PROFESIONALES"
                  alt="Cercas PVC Intemperie"
                  className="rounded-xl w-full"
                />
                <div className="mt-4 grid grid-cols-3 gap-3">
                  {[
                    { label: "PVC", price: "18.50/m", color: "bg-green-500/20 text-green-300" },
                    { label: "Malla", price: "8.50/m", color: "bg-blue-500/20 text-blue-300" },
                    { label: "Costero", price: "38/m", color: "bg-cyan-500/20 text-cyan-300" },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-lg p-3 text-center ${item.color}`}>
                      <p className="text-lg font-extrabold">${item.price}</p>
                      <p className="text-xs font-medium mt-0.5">{item.label}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
