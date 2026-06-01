"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/api/products";
import { deleteProduct } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search, Package, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState("");
  const [view,     setView]     = useState<"grid" | "table">("grid");

  const load = async () => {
    setLoading(true);
    try {
      const r = await getProducts({ limit: 200 });
      setProducts((r as any).data ?? (r as any) ?? []);
    } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await deleteProduct(id);
    setProducts(p => p.filter(x => x.id !== id));
    toast.success("Producto eliminado");
  };

  const filtered = products.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
          <p className="text-sm text-gray-500 mt-0.5">{products.length} producto{products.length !== 1 ? "s" : ""} en el catálogo</p>
        </div>
        <Link href="/admin/productos/nuevo">
          <Button className="bg-green-700 hover:bg-green-800">
            <Plus className="mr-2 h-4 w-4" /> Nuevo producto
          </Button>
        </Link>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input className="pl-9" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="flex rounded-lg border border-gray-200 overflow-hidden">
          {(["grid","table"] as const).map(v => (
            <button key={v} onClick={() => setView(v)}
              className={`px-3 py-1.5 text-xs font-medium transition-colors ${view === v ? "bg-gray-900 text-white" : "bg-white text-gray-500 hover:text-gray-700"}`}>
              {v === "grid" ? "Cuadrícula" : "Lista"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className={view === "grid" ? "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" : "space-y-2"}>
          {Array.from({length: 8}).map((_,i) => (
            <div key={i} className={`bg-gray-100 animate-pulse rounded-xl ${view === "grid" ? "h-64" : "h-14"}`} />
          ))}
        </div>
      ) : view === "grid" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map(p => (
            <div key={p.id} className="group relative rounded-xl border border-gray-200 bg-white overflow-hidden hover:shadow-md transition-all">
              <div className="relative h-40 bg-gray-50">
                {p.images?.[0]?.url ? (
                  <Image src={p.images[0].url} alt={p.name} fill sizes="280px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Package className="h-12 w-12 text-gray-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Link href={`/admin/productos/${p.id}`}>
                    <button className="bg-white rounded-lg p-1.5 shadow-sm hover:bg-gray-50">
                      <Pencil className="h-3.5 w-3.5 text-gray-600" />
                    </button>
                  </Link>
                  <button onClick={() => handleDelete(p.id, p.name)} className="bg-white rounded-lg p-1.5 shadow-sm hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5 text-red-500" />
                  </button>
                </div>
                <span className={`absolute top-2 left-2 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${p.isActive ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                  {p.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-900 truncate">{p.name}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{p.category?.name}</p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-gray-900">${Number(p.basePrice).toFixed(2)}<span className="text-xs text-gray-400 font-normal">/{p.unit === "METRO" ? "m" : p.unit === "PANEL" ? "panel" : "u"}</span></span>
                  <span className="text-xs text-gray-400">Stock: {p.stock}</span>
                </div>
              </div>
            </div>
          ))}
          <Link href="/admin/productos/nuevo" className="rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-2 h-64 hover:border-green-400 hover:bg-green-50 transition-colors group">
            <div className="h-10 w-10 rounded-full bg-gray-100 group-hover:bg-green-100 flex items-center justify-center transition-colors">
              <Plus className="h-5 w-5 text-gray-400 group-hover:text-green-600" />
            </div>
            <span className="text-sm font-medium text-gray-400 group-hover:text-green-600 transition-colors">Nuevo producto</span>
          </Link>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 bg-white overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Producto</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Precio</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Stock</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Categoría</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">Estado</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-lg bg-gray-100 overflow-hidden shrink-0 relative">
                        {p.images?.[0]?.url ? (
                          <Image src={p.images[0].url} alt={p.name} fill sizes="40px" className="object-cover" />
                        ) : (
                          <div className="flex h-full items-center justify-center">
                            <Package className="h-4 w-4 text-gray-300" />
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-400">{p.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-700">${Number(p.basePrice).toFixed(2)}/{p.unit === "METRO" ? "m" : p.unit === "PANEL" ? "panel" : "u"}</td>
                  <td className="px-4 py-3 text-gray-700">{p.stock}</td>
                  <td className="px-4 py-3 text-gray-500">{p.category?.name || "—"}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${p.isActive ? "bg-green-50 text-green-700" : "bg-gray-100 text-gray-500"}`}>
                      {p.isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                      {p.isActive ? "Activo" : "Inactivo"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Link href={`/admin/productos/${p.id}`}>
                        <Button size="icon" variant="ghost" className="h-8 w-8"><Pencil className="h-3.5 w-3.5" /></Button>
                      </Link>
                      <Button size="icon" variant="ghost" className="h-8 w-8 text-red-400 hover:text-red-600" onClick={() => handleDelete(p.id, p.name)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400">No se encontraron productos</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
