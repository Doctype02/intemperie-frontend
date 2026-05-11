"use client";

import Link from "next/link";
import { Home, Building2, Landmark, Sprout, Waves, Grid3X3 } from "lucide-react";

const categories = [
  { name: "Residencial", slug: "residencial", icon: Home },
  { name: "Industrial", slug: "industrial", icon: Building2 },
  { name: "Gubernamental", slug: "gubernamental", icon: Landmark },
  { name: "Agropecuario", slug: "agropecuario", icon: Sprout },
  { name: "Z. Costeras", slug: "zonas-costeras", icon: Waves },
];

export function CategoryCircles() {
  return (
    <section className="bg-white py-8">
      <div className="mx-auto max-w-7xl px-4">
        <div className="flex items-center justify-center gap-3 md:gap-6 flex-wrap">
          {categories.map((cat, i) => (
            <Link
              key={cat.slug}
              href={`/categorias/${cat.slug}`}
              className={`group flex flex-col items-center gap-2 animate-fade-in stagger-${i + 1}`}
            >
              <div className="flex h-16 w-16 md:h-18 md:w-18 items-center justify-center rounded-2xl bg-gray-50 ring-1 ring-gray-100 transition-all duration-300 group-hover:ring-2 group-hover:ring-green-400 group-hover:shadow-lg group-hover:shadow-green-100 group-hover:scale-105">
                <cat.icon className="h-7 w-7 md:h-8 md:w-8 text-gray-500 transition-colors group-hover:text-green-600" />
              </div>
              <span className="text-[11px] md:text-xs font-medium text-gray-500 group-hover:text-green-700 transition-colors">
                {cat.name}
              </span>
            </Link>
          ))}
          <Link href="/productos" className="group flex flex-col items-center gap-2 animate-fade-in stagger-6">
            <div className="flex h-16 w-16 md:h-18 md:w-18 items-center justify-center rounded-2xl bg-green-600 transition-all duration-300 group-hover:bg-green-700 group-hover:scale-105">
              <Grid3X3 className="h-7 w-7 md:h-8 md:w-8 text-white" />
            </div>
            <span className="text-[11px] md:text-xs font-medium text-green-700">Ver todo</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
