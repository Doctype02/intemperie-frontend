"use client";

import { Phone, Truck } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-green-800 text-white text-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-1.5">
            <Truck className="h-4 w-4" />
            Envíos a todo Panamá y Latinoamérica
          </span>
          <span className="hidden md:flex items-center gap-1.5">
            <Phone className="h-4 w-4" />
            +507 6287-4042
          </span>
        </div>
        <div className="flex items-center gap-4">
          <a href="/productos" className="hover:underline">Productos</a>
          <a href="/calculadora" className="hover:underline">Calculadora</a>
          <a href="/contacto" className="hover:underline">Contacto</a>
        </div>
      </div>
    </div>
  );
}
