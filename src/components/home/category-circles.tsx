import Link from "next/link";
import { Home, Building2, Landmark, Sprout, Waves, Grid3X3 } from "lucide-react";

const categories = [
  { name: "Residencial", slug: "residencial", icon: Home },
  { name: "Industrial", slug: "industrial", icon: Building2 },
  { name: "Gubernamental", slug: "gubernamental", icon: Landmark },
  { name: "Agropecuario", slug: "agropecuario", icon: Sprout },
  { name: "Zonas Costeras", slug: "zonas-costeras", icon: Waves },
];

export function CategoryCircles() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-center gap-3 md:gap-8 flex-wrap">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/categorias/${cat.slug}`}
              className="group flex flex-col items-center gap-2"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 transition-colors group-hover:bg-green-100 md:h-20 md:w-20">
                <cat.icon className="h-6 w-6 text-gray-600 transition-colors group-hover:text-green-700 md:h-8 md:w-8" />
              </div>
              <span className="text-[11px] font-medium text-gray-600 group-hover:text-green-700 md:text-sm">
                {cat.name}
              </span>
            </Link>
          ))}
          <Link
            href="/productos"
            className="group flex flex-col items-center gap-2"
          >
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-green-600 transition-colors group-hover:bg-green-700 md:h-20 md:w-20">
              <Grid3X3 className="h-6 w-6 text-white md:h-8 md:w-8" />
            </div>
            <span className="text-[11px] font-medium text-green-700 md:text-sm">Ver todo</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
