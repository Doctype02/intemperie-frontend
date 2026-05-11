import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Shield, Ruler, Award } from "lucide-react";

export function HeroSection() {
  return (
    <section className="relative bg-gradient-to-br from-green-700 via-green-600 to-green-800 text-white overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <div className="max-w-7xl mx-auto px-4 py-20 lg:py-32">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6 relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 text-sm">
              <Shield className="h-4 w-4" />
              <span>Calidad Garantizada</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight tracking-tight">
              Cercas que Protegen<br />
              <span className="text-amber-300">lo que Más Importa</span>
            </h1>
            <p className="text-lg text-white/80 max-w-lg">
              Somos líderes en Panamá en cercas de PVC y malla electrosoldada.
              Seguridad, durabilidad y elegancia para tu hogar o negocio.
            </p>
            <div className="flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-amber-500 hover:bg-amber-600 text-amber-950 font-semibold">
                <Link href="/calculadora">
                  Cotiza YA <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                <Link href="/productos">
                  Ver Productos
                </Link>
              </Button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4 relative z-10">
            <div className="space-y-4">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <Ruler className="h-8 w-8 text-amber-300 mb-2" />
                <h3 className="font-semibold">Medidas a la medida</h3>
                <p className="text-sm text-white/70">Nos adaptamos a tu espacio</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <Award className="h-8 w-8 text-amber-300 mb-2" />
                <h3 className="font-semibold">Garantía de 10 años</h3>
                <p className="text-sm text-white/70">En todos nuestros productos</p>
              </div>
            </div>
            <div className="space-y-4 mt-8">
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <Shield className="h-8 w-8 text-amber-300 mb-2" />
                <h3 className="font-semibold">Anti-corrosión</h3>
                <p className="text-sm text-white/70">Resistente al clima tropical</p>
              </div>
              <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                <svg className="h-8 w-8 text-amber-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <h3 className="font-semibold">Instalación profesional</h3>
                <p className="text-sm text-white/70">Equipo certificado</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
