import Link from "next/link";
import { ArrowRight, Shield, Star, Truck, BadgePercent, Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="relative bg-brand-navy-deep overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-brand-navy-deep/40 via-gray-900 to-brand-navy-deep" />
      <div className="absolute top-1/4 right-0 w-[500px] h-[500px] bg-brand-green-soft0/5 rounded-full blur-[150px]" />
      
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-14 sm:py-20 lg:py-28">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-xs sm:text-sm text-on-dark-soft backdrop-blur mb-5">
            <Star className="h-3.5 w-3.5 fill-green-400 text-brand-green" />
            <span className="font-medium">4.8 estrellas en Google · 15+ años de experiencia</span>
          </div>

          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-black text-white tracking-tight leading-[1.05]">
            Cercas que{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-green to-emerald-300">
              transforman
            </span>
            <br />tus espacios
          </h1>

          <p className="mt-4 sm:mt-6 text-sm sm:text-base md:text-lg text-muted-foreground max-w-lg leading-relaxed">
            PVC reforzado y malla electrosoldada de grado industrial. Resistentes a sol, 
            humedad y salitre. Instalación profesional en todo Panamá.
          </p>

          <div className="mt-6 sm:mt-8 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="bg-brand-green-soft0 hover:bg-brand-green text-foreground font-bold h-12 sm:h-14 px-8 rounded-full text-sm sm:text-base" asChild>
              <Link href="/productos">Ver productos <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-2 border-brand-green text-brand-green hover:bg-brand-green-soft0/10 font-medium h-12 sm:h-14 px-8 rounded-full text-sm sm:text-base" asChild>
              <Link href="/calculadora"><Calculator className="mr-1.5 h-4 w-4" />Calcular precio</Link>
            </Button>
          </div>

          <div className="mt-8 sm:mt-10 flex flex-wrap items-center gap-4 sm:gap-6">
            {[
              { icon: Shield, label: "Garantía 10-15 años" },
              { icon: Truck, label: "Envíos nacionales" },
              { icon: BadgePercent, label: "Mejor precio garantizado" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                <item.icon className="h-4 w-4 text-brand-green shrink-0" />
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
