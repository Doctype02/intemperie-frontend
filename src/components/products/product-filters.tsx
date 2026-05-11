"use client";

import { useState } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { Category, Collection } from "@/types";

interface ProductFiltersProps {
  categories: Category[];
  collections: Collection[];
  selectedCategories: string[];
  selectedCollections: string[];
  search: string;
  onCategoriesChange: (ids: string[]) => void;
  onCollectionsChange: (ids: string[]) => void;
  onSearchChange: (search: string) => void;
}

export function ProductFilters({
  categories,
  collections,
  selectedCategories,
  selectedCollections,
  search,
  onCategoriesChange,
  onCollectionsChange,
  onSearchChange,
}: ProductFiltersProps) {
  const [open, setOpen] = useState(false);

  const toggleCategory = (id: string) => {
    if (selectedCategories.includes(id)) {
      onCategoriesChange(selectedCategories.filter((c) => c !== id));
    } else {
      onCategoriesChange([...selectedCategories, id]);
    }
  };

  const toggleCollection = (id: string) => {
    if (selectedCollections.includes(id)) {
      onCollectionsChange(selectedCollections.filter((c) => c !== id));
    } else {
      onCollectionsChange([...selectedCollections, id]);
    }
  };

  const clearFilters = () => {
    onCategoriesChange([]);
    onCollectionsChange([]);
    onSearchChange("");
  };

  const hasFilters =
    selectedCategories.length > 0 ||
    selectedCollections.length > 0 ||
    search.length > 0;

  const FilterContent = () => (
    <div className="space-y-6">
      <div>
        <h3 className="font-semibold text-sm mb-3">Categoría</h3>
        <div className="space-y-2">
          {categories.map((cat) => (
            <div key={cat.id} className="flex items-center gap-2">
              <Checkbox
                id={`cat-${cat.id}`}
                checked={selectedCategories.includes(cat.id)}
                onCheckedChange={() => toggleCategory(cat.id)}
              />
              <Label htmlFor={`cat-${cat.id}`} className="text-sm cursor-pointer">
                {cat.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      {collections.length > 0 && (
        <div>
          <h3 className="font-semibold text-sm mb-3">Colección</h3>
          <div className="space-y-2">
            {collections.map((col) => (
              <div key={col.id} className="flex items-center gap-2">
                <Checkbox
                  id={`col-${col.id}`}
                  checked={selectedCollections.includes(col.id)}
                  onCheckedChange={() => toggleCollection(col.id)}
                />
                <Label htmlFor={`col-${col.id}`} className="text-sm cursor-pointer">
                  {col.name}
                </Label>
              </div>
            ))}
          </div>
        </div>
      )}

      {hasFilters && (
        <Button variant="outline" size="sm" className="w-full" onClick={clearFilters}>
          Limpiar filtros
        </Button>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="relative flex-1">
          <Input
            type="search"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="shrink-0">
              <SlidersHorizontal className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72">
            <SheetHeader>
              <SheetTitle>Filtros</SheetTitle>
            </SheetHeader>
            <div className="mt-6">
              <FilterContent />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop filters sidebar */}
      <div className="hidden lg:block">
        <FilterContent />
      </div>
    </div>
  );
}
