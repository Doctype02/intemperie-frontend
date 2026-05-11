"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle, Shield, Sun, Droplets, Wrench } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative">
      {/* Main hero */}
      <div className="relative bg-gradient-to-br from-green-900 via-green-800 to-green-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE4YzAtNC40MTgtMy41ODItOC04LThzLTggMy41ODItOCA4IDMuNTgyIDggOCA4IDgtMy41ODIgOC04eiIvPjwvZz48L2c+PC9zdmc+')] opacity-50" />
        <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="text-white">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm">
                <CheckCircle className="h-4 w-4 text-green-300" />
                Más de 15 años de experiencia
              </div>
              <h1 className="mb-4 text-4xl font-bold leading-tight md:text-5xl lg:text-6xl">
                Seguridad y Elegancia
                <span className="block text-green-300">Al Aire Libre</span>
              </h1>
              <p className="mb-8 max-w-lg text-lg text-green-100">
                Cercas de PVC y Mallas Electrosoldadas de la más alta calidad. 
                Resistentes al sol, salitre y humedad. Instalación profesional en todo Panamá.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 font-bold" asChild>
                  <Link href="/productos">
                    Ver productos
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
                  <Link href="/calculadora">
                    Calcular precio
                  </Link>
                </Button>
              </div>
              <div className="mt-8 flex gap-6 text-sm text-green-200">
                <div className="flex items-center gap-1.5">
                  <Truck className="h-4 w-4" />
                  Envíos nacionales
                </div>
                <div className="flex items-center gap-1.5">
                  <Shield className="h-4 w-4" />
                  Garantía 10-15 años
                </div>
                <div className="flex items-center gap-1.5">
                  <Wrench className="h-4 w-4" />
                  Instalación profesional
                </div>
              </div>
            </div>

            {/* Right side - product preview */}
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="flex gap-4">
                  <div className="space-y-4 pt-4">
                    <div className="rounded-xl bg-white/10 backdrop-blur p-4 w-48">
                      <div className="h-24 rounded-lg bg-green-600/50 mb-3 flex items-center justify-center">
                        <Sun className="h-10 w-10 text-white/60" />
                      </div>
                      <p className="text-white text-sm font-medium">PVC Residencial</p>
                      <p className="text-green-200 text-xs">Desde $18.50/m</p>
                    </div>
                    <div className="rounded-xl bg-white/10 backdrop-blur p-4 w-48">
                      <div className="h-24 rounded-lg bg-green-600/50 mb-3 flex items-center justify-center">
                        <Shield className="h-10 w-10 text-white/60" />
                      </div>
                      <p className="text-white text-sm font-medium">Malla Industrial</p>
                      <p className="text-green-200 text-xs">Desde $12.00/m</p>
                    </div>
                  </div>
                  <div className="space-y-4 pt-12">
                    <div className="rounded-xl bg-white/10 backdrop-blur p-4 w-48">
                      <div className="h-24 rounded-lg bg-green-600/50 mb-3 flex items-center justify-center">
                        <Droplets className="h-10 w-10 text-white/60" />
                      </div>
                      <p className="text-white text-sm font-medium">Zonas Costeras</p>
                      <p className="text-green-200 text-xs">Desde $38.00/m</p>
                    </div>
                    <div className="rounded-xl bg-white/10 backdrop-blur p-4 w-48">
                      <div className="h-24 rounded-lg bg-green-600/50 mb-3 flex items-center justify-center flex-col">
                        <span className="text-white/60 text-2xl font-bold">+15</span>
                        <span className="text-white/40 text-xs">colecciones</span>
                      </div>
                      <p className="text-white text-sm font-medium">Catálogo completo</p>
                      <p className="text-green-200 text-xs">Ver todos los modelos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Truck({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
      <path d="M15 18H9" />
      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
      <circle cx="17" cy="18" r="2" />
      <circle cx="7" cy="18" r="2" />
    </svg>
  );
}
