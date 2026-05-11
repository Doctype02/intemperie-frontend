"use client";

import Link from "next/link";
import { Calculator, Phone, FileBarChart, BadgePercent } from "lucide-react";

const banners = [
  {
    title: "Cercas PVC", subtitle: "Desde $18.50/m",
    href: "/categorias/residencial",
    gradient: "from-emerald-600 to-green-700",
    icon: "🏡",
  },
  {
    title: "Malla Electrosoldada", subtitle: "Desde $8.50/m",
    href: "/categorias/industrial",
    gradient: "from-gray-700 to-gray-800",
    icon: "🏭",
  },
  {
    title: "Calcula tu proyecto", subtitle: "Precio al instante",
    href: "/calculadora",
    gradient: "from-amber-500 to-orange-600",
    icon: "🧮",
  },
  {
    title: "Cotiza por WhatsApp", subtitle: "Respuesta inmediata",
    href: "https://wa.me/50762874042",
    gradient: "from-blue-600 to-blue-700",
    icon: "💬",
  },
];

export function BannerGrid() {
  return (
    <section className="py-6">
      <div className="mx-auto max-w-7xl px-4">
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {banners.map((banner, i) => (
            <Link
              key={banner.title}
              href={banner.href}
              target={banner.href.startsWith("http") ? "_blank" : undefined}
              className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${banner.gradient} p-4 md:p-5 card-hover animate-fade-in stagger-${i + 1}`}
            >
              <div className="absolute -right-4 -top-4 text-6xl opacity-20 group-hover:scale-125 transition-transform duration-500 select-none">{banner.icon}</div>
              <div className="relative z-10">
                <h3 className="font-bold text-sm md:text-base text-white">{banner.title}</h3>
                <p className="mt-1 text-xs md:text-sm text-white/70">{banner.subtitle}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
