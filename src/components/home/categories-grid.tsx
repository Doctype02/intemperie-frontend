import Link from "next/link";
import { Home, Building2, Landmark, Sprout, Waves } from "lucide-react";

const categories = [
  { name: "Residencial", slug: "residencial", icon: Home, desc: "Hogares y urbanizaciones", count: "7 productos" },
  { name: "Industrial", slug: "industrial", icon: Building2, desc: "Bodegas y zonas de trabajo", count: "5 productos" },
  { name: "Gubernamental", slug: "gubernamental", icon: Landmark, desc: "Instituciones y espacios públicos", count: "1 producto" },
  { name: "Agropecuario", slug: "agropecuario", icon: Sprout, desc: "Fincas y producción animal", count: "1 producto" },
  { name: "Zonas Costeras", slug: "zonas-costeras", icon: Waves, desc: "Resistentes al salitre", count: "2 productos" },
];

export function CategoriesGrid() {
  return (
    <section className="py-16 bg-white">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-bold text-gray-900">Soluciones para cada necesidad</h2>
          <p className="mt-3 text-gray-500">Encuentra la cerca perfecta según tu tipo de proyecto</p>
        </div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categorias/${cat.slug}`}
              className="group flex flex-col items-center rounded-xl border border-gray-200 p-6 text-center transition-all hover:border-green-300 hover:shadow-lg hover:shadow-green-50"
            >
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50 text-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors">
                <cat.icon className="h-8 w-8" />
              </div>
              <h3 className="font-semibold text-gray-900">{cat.name}</h3>
              <p className="mt-1 text-sm text-gray-500">{cat.desc}</p>
              <p className="mt-2 text-xs text-green-600 font-medium">{cat.count}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
