import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Home, Building2, Landmark, Leaf, Waves } from "lucide-react";

const categories = [
  {
    name: "Residencial",
    slug: "residencial",
    description: "Cercas elegantes para tu hogar",
    icon: Home,
    color: "bg-blue-50 text-blue-700",
  },
  {
    name: "Industrial",
    slug: "industrial",
    description: "Soluciones robustas para empresas",
    icon: Building2,
    color: "bg-gray-100 text-gray-700",
  },
  {
    name: "Gubernamental",
    slug: "gubernamental",
    description: "Seguridad para instituciones públicas",
    icon: Landmark,
    color: "bg-amber-50 text-amber-700",
  },
  {
    name: "Agropecuario",
    slug: "agropecuario",
    description: "Protección para fincas y cultivos",
    icon: Leaf,
    color: "bg-green-50 text-green-700",
  },
  {
    name: "Zonas Costeras",
    slug: "zonas-costeras",
    description: "Resistentes a la salinidad y humedad",
    icon: Waves,
    color: "bg-cyan-50 text-cyan-700",
  },
];

export function CategoriesGrid() {
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3">
            Encuentra la Cerca Ideal
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Explora nuestras categorías diseñadas para cada necesidad, desde hogares hasta grandes industrias.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <Link key={cat.slug} href={`/categorias/${cat.slug}`}>
              <Card className="h-full hover:shadow-md transition-shadow border-2 hover:border-green-200 cursor-pointer">
                <CardContent className="p-4 flex flex-col items-center text-center gap-2">
                  <div className={`w-14 h-14 rounded-full ${cat.color} flex items-center justify-center`}>
                    <cat.icon className="h-7 w-7" />
                  </div>
                  <h3 className="font-semibold text-gray-900 text-sm">{cat.name}</h3>
                  <p className="text-xs text-gray-500 leading-tight">{cat.description}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
