import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function HeroSection() {
  return (
    <section className="bg-gradient-to-r from-green-800 to-green-700 text-white">
      <div className="mx-auto max-w-7xl px-4 py-8 md:py-14">
        <div className="max-w-2xl">
          <h1 className="text-2xl md:text-4xl lg:text-5xl font-extrabold tracking-tight">
            Cercas de PVC y Mallas Electrosoldadas
          </h1>
          <p className="mt-3 text-sm md:text-lg text-green-100 max-w-lg">
            Seguridad, durabilidad y elegancia. Instalación profesional en todo Panamá con garantía de hasta 15 años.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row gap-3">
            <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 font-bold" asChild>
              <Link href="/productos">Ver productos <ArrowRight className="ml-2 h-5 w-5" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10" asChild>
              <Link href="/calculadora">Calcular precio</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
