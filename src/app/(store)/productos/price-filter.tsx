"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function PriceFilter() {
  const searchParams = useSearchParams();
  const router       = useRouter();

  const [min, setMin] = useState(searchParams.get("minPrice") ?? "");
  const [max, setMax] = useState(searchParams.get("maxPrice") ?? "");

  useEffect(() => {
    setMin(searchParams.get("minPrice") ?? "");
    setMax(searchParams.get("maxPrice") ?? "");
  }, [searchParams]);

  const apply = () => {
    const sp = new URLSearchParams(searchParams.toString());
    if (min) sp.set("minPrice", min); else sp.delete("minPrice");
    if (max) sp.set("maxPrice", max); else sp.delete("maxPrice");
    router.push(`/productos?${sp.toString()}`);
  };

  const clear = () => {
    setMin(""); setMax("");
    const sp = new URLSearchParams(searchParams.toString());
    sp.delete("minPrice"); sp.delete("maxPrice");
    router.push(`/productos?${sp.toString()}`);
  };

  const hasFilter = !!searchParams.get("minPrice") || !!searchParams.get("maxPrice");

  return (
    <div className="px-4 py-3 border-t border-gray-100">
      <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-3">Precio por metro</h3>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min $"
          min={0}
          value={min}
          onChange={(e) => setMin(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          className="w-full h-8 text-sm border border-gray-200 rounded-lg px-2 focus:ring-1 focus:ring-green-500 focus:outline-none"
        />
        <span className="text-gray-400 text-sm shrink-0">—</span>
        <input
          type="number"
          placeholder="Max $"
          min={0}
          value={max}
          onChange={(e) => setMax(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && apply()}
          className="w-full h-8 text-sm border border-gray-200 rounded-lg px-2 focus:ring-1 focus:ring-green-500 focus:outline-none"
        />
      </div>
      <div className="mt-2 flex gap-2">
        <button
          onClick={apply}
          className="flex-1 h-7 rounded-lg bg-green-600 text-white text-xs font-bold hover:bg-green-700 transition-colors"
        >
          Aplicar
        </button>
        {hasFilter && (
          <button
            onClick={clear}
            className="h-7 px-3 rounded-lg border border-gray-200 text-xs font-medium text-gray-500 hover:bg-gray-50 transition-colors"
          >
            Limpiar
          </button>
        )}
      </div>
    </div>
  );
}
