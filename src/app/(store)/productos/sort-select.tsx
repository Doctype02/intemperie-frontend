"use client";

import { useSearchParams, useRouter } from "next/navigation";

export default function SortSelect() {
  const searchParams = useSearchParams();
  const router       = useRouter();
  const current      = searchParams.get("sort") || "";

  const onChange = (value: string) => {
    const sp = new URLSearchParams(searchParams.toString());
    if (value) sp.set("sort", value); else sp.delete("sort");
    router.push(`/productos?${sp.toString()}`);
  };

  return (
    <select
      value={current}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-lg border border-gray-200 bg-white px-3 text-sm text-gray-700 font-medium focus:ring-2 focus:ring-green-500 focus:outline-none cursor-pointer"
      aria-label="Ordenar por"
    >
      <option value="">Destacados</option>
      <option value="price_asc">Precio: menor a mayor</option>
      <option value="price_desc">Precio: mayor a menor</option>
      <option value="name_asc">Nombre A–Z</option>
      <option value="newest">Más recientes</option>
    </select>
  );
}
