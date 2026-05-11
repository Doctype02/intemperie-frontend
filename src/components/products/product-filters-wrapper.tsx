"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ProductFilters } from "./product-filters";
import { SlidersHorizontal } from "lucide-react";

interface ProductFiltersWrapperProps {
  categories: Array<{ id: string; slug: string; name: string }>;
  collections: Array<{ id: string; slug: string; name: string }>;
}

export function ProductFiltersWrapper({ categories, collections }: ProductFiltersWrapperProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Mobile filter toggle */}
      <div className="md:hidden mb-4">
        <button
          onClick={() => setOpen(true)}
          className="w-full flex items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filtros
        </button>
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetContent side="left" className="w-full max-w-xs p-0">
            <SheetHeader className="border-b px-4 py-4">
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto p-4">
              <ProductFilters categories={categories} collections={collections} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop sidebar */}
      <div className="hidden md:block w-56 shrink-0">
        <ProductFilters categories={categories} collections={collections} />
      </div>
    </>
  );
}
