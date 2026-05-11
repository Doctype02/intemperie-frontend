"use client";

import Link from "next/link";
import { ArrowRight, Shield, Truck, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";

export function HeroSection() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section ref={ref} className="relative overflow-hidden bg-gradient-to-br from-green-950 via-green-900 to-emerald-900">
      {/* Animated background */}
      <div className="absolute inset-0 gradient-shift opacity-30" style={{ backgroundImage: 'radial-gradient(circle at 30% 50%, rgba(34,197,94,0.3) 0%, transparent 50%), radial-gradient(circle at 70% 20%, rgba(16,185,129,0.2) 0%, transparent 50%)' }} />
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PHBhdGggZD0iTTIwIDhjLTYtLjYyNy0xMiA1LjM3My0xMiAxMnM2IDEyIDEyIDEyIDEyLTUuMzczIDEyLTEyUzI2IDguNjI3IDIwIDh6Ii8+PC9nPjwvZz48L3N2Zz4=')]" />

      <div className="relative mx-auto max-w-7xl px-4 py-16 md:py-28">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Text */}
          <div className={`space-y-6 transition-all duration-1000 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 backdrop-blur px-4 py-1.5 text-sm text-green-200">
              <Star className="h-3.5 w-3.5 fill-green-400 text-green-400" />
              <span className="tracking-wide">Líderes en Panamá desde 2010</span>
            </div>

            <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
              Cercas que{' '}
              <span className="gradient-text from-green-300 to-emerald-200">transforman</span>
              {' '}espacios
            </h1>

            <p className="max-w-lg text-base md:text-lg leading-relaxed text-green-100/80">
              PVC reforzado y malla electrosoldada de grado industrial. Resistentes al sol, 
              salitre y humedad. Instalación profesional en todo Panamá.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" className="bg-white text-green-900 hover:bg-green-50 font-bold shadow-lg shadow-white/10 btn-press" asChild>
                <Link href="/productos">
                  Ver catálogo
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="border-white/20 text-white hover:bg-white/5 backdrop-blur btn-press" asChild>
                <Link href="/calculadora">Calcular precio</Link>
              </Button>
            </div>

            {/* Trust bar */}
            <div className="flex flex-wrap gap-x-8 gap-y-2 pt-4 text-sm text-green-200/70">
              <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" />Envíos nacionales</span>
              <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" />Garantía 10–15 años</span>
              <span className="flex items-center gap-1.5"><Star className="h-4 w-4 fill-current" />4.8 en Google</span>
            </div>
          </div>

          {/* Visual */}
          <div className={`hidden lg:flex justify-center transition-all duration-1000 delay-300 ${visible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0"}`}>
            <div className="relative">
              <div className="absolute -inset-1 rounded-3xl bg-gradient-to-r from-green-400/20 to-emerald-400/20 blur-2xl" />
              <div className="relative grid grid-cols-2 gap-4">
                {[
                  { label: "PVC", price: "$18.50/m", color: "from-green-400 to-emerald-500", icon: "🏡" },
                  { label: "Malla", price: "$8.50/m", color: "from-gray-400 to-gray-500", icon: "🏭" },
                  { label: "Costero", price: "$38/m", color: "from-cyan-400 to-blue-500", icon: "🌊" },
                  { label: "Max Seguridad", price: "$25/m", color: "from-amber-400 to-orange-500", icon: "🏛️" },
                ].map((item, i) => (
                  <div key={item.label} className={`animate-fade-in stagger-${i + 1}`}>
                    <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur p-5 hover:bg-white/10 transition-colors">
                      <span className="text-2xl">{item.icon}</span>
                      <p className="mt-2 text-sm font-semibold text-white">{item.label}</p>
                      <p className="text-xs text-green-300">{item.price}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
