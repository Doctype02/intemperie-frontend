"use client";

import { Truck, BadgePercent, Sparkles } from "lucide-react";
import Link from "next/link";

const promos = [
  { icon: Truck, text: "Envío gratis en pedidos web mayores a $500", href: "/productos" },
  { icon: BadgePercent, text: "Hasta 15% OFF en pedidos +100m lineales", href: "/calculadora" },
  { icon: Sparkles, text: "Nuevas colecciones de cercas PVC", href: "/productos" },
];

export function TopBar() {
  return (
    <div className="bg-gray-100 border-b border-gray-200">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-center sm:justify-between gap-4 sm:gap-6 py-2 overflow-x-auto text-xs sm:text-sm text-gray-600">
          {promos.map((promo, i) => (
            <Link key={i} href={promo.href} className="flex items-center gap-1.5 shrink-0 hover:text-green-700 transition-colors">
              <promo.icon className="h-4 w-4 text-green-600" />
              <span className="whitespace-nowrap">{promo.text}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
