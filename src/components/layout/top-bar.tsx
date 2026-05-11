"use client";

import { Truck } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-green-800 text-white text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-4 px-4 py-1.5">
        <span className="flex items-center gap-1.5">
          <Truck className="h-3.5 w-3.5" />
          Envíos a todo Panamá · +507 6287-4042
        </span>
      </div>
    </div>
  );
}
