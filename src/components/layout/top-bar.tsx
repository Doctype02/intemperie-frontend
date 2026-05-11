"use client";

import { Truck } from "lucide-react";

export function TopBar() {
  return (
    <div className="bg-green-800 text-white text-[10px] md:text-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 md:gap-4 px-3 md:px-4 py-1.5">
        <span className="flex items-center gap-1.5 truncate">
          <Truck className="h-3 w-3 md:h-3.5 md:w-3.5 shrink-0" />
          <span className="truncate">Envíos a todo Panamá · +507 6287-4042</span>
        </span>
      </div>
    </div>
  );
}
