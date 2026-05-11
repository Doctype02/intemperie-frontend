import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight } from "lucide-react";

const collections = [
  {
    name: "Línea Residencial Premium",
    slug: "residencial",
    description: "Cercas de PVC con diseño moderno. Ideales para hogares que buscan elegancia y privacidad.",
    image: null,
    color: "from-blue-600 to-blue-800",
    items: 24,
  },
  {
    name: "Línea Industrial Pesada",
    slug: "industrial",
    description: "Malla electrosoldada de alta resistencia para seguridad perimetral de empresas e industrias.",
    image: null,
    color: "from-gray-700 to-gray-900",
    items: 18,
  },
  {
    name: "Línea Agropecuaria",
    slug: "agropecuario",
    description: "Cercas diseñadas para fincas, corrales y protección de cultivos con materiales duraderos.",
    image: null,
    color: "from-green-700 to-green-900",
    items: 15,
  },
  {
    name: "Línea Costera Anti-corrosión",
    slug: "zonas-costeras",
    description: "Tratamiento especial contra la salinidad. Perfectas para propiedades cerca del mar.",
    image: null,
    color: "from-cyan-600 to-cyan-800",
    items: 12,
  },
];

export function CollectionsGrid() {
  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Nuestras Colecciones
            </h2>
            <p className="text-gray-600">
              Soluciones especializadas para cada entorno
            </p>
          </div>
          <Link
            href="/productos"
            className="hidden sm:flex items-center gap-1 text-green-700 hover:text-green-800 font-medium text-sm"
          >
            Ver todas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {collections.map((col) => (
            <Link key={col.slug} href={`/colecciones/${col.slug}`}>
              <Card className="group h-full overflow-hidden hover:shadow-lg transition-shadow">
                <div className={`h-32 bg-gradient-to-br ${col.color} flex items-center justify-center`}>
                  <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/30" />
                  </div>
                </div>
                <CardContent className="p-5">
                  <Badge variant="secondary" className="mb-2">
                    {col.items} productos
                  </Badge>
                  <h3 className="font-semibold text-lg text-gray-900 mb-1 group-hover:text-green-700 transition-colors">
                    {col.name}
                  </h3>
                  <p className="text-sm text-gray-500 leading-relaxed">
                    {col.description}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
