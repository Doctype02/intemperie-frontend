"use client";

import { Truck, Phone, Wrench } from "lucide-react";
import Link from "next/link";

const promos = [
  { icon: Truck, text: "Envíos a todo Panamá", href: "/productos" },
  { icon: Wrench, text: "Instalación profesional", href: "/calculadora" },
  { icon: Phone, text: "Cotiza al +507 6287-4042", href: "https://wa.me/50762874042" },
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
