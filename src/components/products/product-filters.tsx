"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface ProductFiltersProps {
  categories: Array<{ id: string; slug: string; name: string }>;
  collections: Array<{ id: string; slug: string; name: string }>;
}

export function ProductFilters({ categories, collections }: ProductFiltersProps) {
  const searchParams = useSearchParams();
  const activeCategory = searchParams.get("category");
  const activeCollection = searchParams.get("collection");

  const buildHref = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page");
    const qs = params.toString();
    return `/productos${qs ? `?${qs}` : ""}`;
  };

  const clearAll = () => {
    return "/productos";
  };

  const hasFilters = activeCategory || activeCollection;

  return (
    <aside className="w-56 shrink-0">
      {hasFilters && (
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700">Filtros activos</span>
          <Button variant="ghost" size="sm" className="h-auto p-0 text-xs text-red-500 hover:text-red-700" asChild>
            <Link href={clearAll()}>
              <X className="mr-1 h-3 w-3" />
              Limpiar
            </Link>
          </Button>
        </div>
      )}

      {/* Categories */}
      <div className="mb-6">
        <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">Categorías</h3>
        <div className="space-y-1">
          <Link
            href={buildHref("category", null)}
            className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
              !activeCategory
                ? "bg-green-50 text-green-700 font-medium"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Todas
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={buildHref("category", cat.slug)}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                activeCategory === cat.slug
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>
      </div>

      {/* Collections */}
      <div>
        <h3 className="mb-3 text-sm font-semibold text-gray-900 uppercase tracking-wider">Colecciones</h3>
        <div className="space-y-1 max-h-80 overflow-y-auto">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={buildHref("collection", col.slug)}
              className={`block rounded-lg px-3 py-2 text-sm transition-colors ${
                activeCollection === col.slug
                  ? "bg-green-50 text-green-700 font-medium"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              {col.name}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}
