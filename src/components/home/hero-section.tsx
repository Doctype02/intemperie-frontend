import Link from "next/link";
import { ArrowRight, Shield, Star, Truck, Phone, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-gray-900 via-gray-900 to-green-950">
      {/* Subtle grid pattern */}
      <div className="absolute inset-0 opacity-[0.03]" style={{
        backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
        backgroundSize: '40px 40px'
      }} />
      
      {/* Gradients */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-green-500/10 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-emerald-500/10 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      <div className="relative mx-auto max-w-7xl px-4 py-12 md:py-16 lg:py-20">
        <div className="grid items-center gap-8 lg:grid-cols-2">
          {/* Left - Text */}
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-green-300 mb-5 backdrop-blur">
              <Star className="h-3.5 w-3.5 fill-green-400 text-green-400" />
              4.8 estrellas en Google · 15+ años de experiencia
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.05]">
              Cercas que{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-emerald-300">
                protegen
              </span>
              {' '}y embellecen
            </h1>

            <p className="mt-4 text-gray-400 text-sm sm:text-base md:text-lg max-w-md leading-relaxed">
              PVC reforzado y malla electrosoldada. Resistentes a sol, humedad y salitre. 
              Instalación profesional en todo Panamá.
            </p>

            <div className="mt-7 flex flex-col sm:flex-row gap-3">
              <Button size="lg" className="bg-green-500 hover:bg-green-400 text-gray-900 font-bold h-13 px-8 rounded-full text-[15px]" asChild>
                <Link href="/productos">
                  Ver productos <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 font-medium h-13 px-8 rounded-full text-[15px]" asChild>
                <Link href="/calculadora">
                  Calcular precio
                </Link>
              </Button>
            </div>

            <div className="mt-8 grid grid-cols-3 gap-4 max-w-md">
              {[
                { icon: Shield, text: "Garantía 10-15 años" },
                { icon: Truck, text: "Envíos nacionales" },
                { icon: CheckCircle, text: "Instalación profesional" },
              ].map((item) => (
                <div key={item.text} className="flex flex-col items-center gap-1.5 rounded-xl bg-white/5 border border-white/5 p-3 backdrop-blur">
                  <item.icon className="h-5 w-5 text-green-400" />
                  <span className="text-[10px] text-gray-300 text-center leading-tight font-medium">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Right - Visual */}
          <div className="hidden lg:flex justify-center">
            <div className="relative w-full max-w-md">
              {/* Product card preview */}
              <div className="rounded-2xl bg-gray-800/50 border border-white/10 backdrop-blur overflow-hidden shadow-2xl">
                <img
                  src="https://placehold.co/600x280/0f172a/22c55e?text=CERCAS+PVC"
                  alt="Cercas"
                  className="w-full"
                />
                <div className="p-4 space-y-3">
                  <div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider">Cerca PVC Profesional</p>
                    <p className="text-white font-bold text-lg">Oceanides 101</p>
                  </div>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-green-400">$18.50</span>
                    <span className="text-xs text-gray-500">/m lineal</span>
                  </div>
                  <div className="flex gap-2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-green-500/10 border border-green-500/20 px-2.5 py-1 text-[11px] text-green-400 font-medium">
                      <CheckCircle className="h-3 w-3" /> Disponible
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] text-gray-400 font-medium">
                      <Truck className="h-3 w-3" /> Envío nacional
                    </span>
                  </div>
                  <button className="w-full rounded-lg bg-green-500 py-2.5 text-sm font-bold text-gray-900 hover:bg-green-400 transition-colors">
                    Ver producto
                  </button>
                </div>
              </div>

              {/* Floating stats */}
              <div className="absolute -bottom-4 -left-4 rounded-xl bg-gray-800/90 backdrop-blur border border-white/10 p-3 shadow-xl">
                <p className="text-white font-black text-xl">500+</p>
                <p className="text-[10px] text-gray-400 uppercase tracking-wider">proyectos</p>
              </div>
              <div className="absolute -top-2 -right-2 rounded-full bg-green-500 text-gray-900 h-14 w-14 flex items-center justify-center font-black text-lg shadow-xl">
                4.8★
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
