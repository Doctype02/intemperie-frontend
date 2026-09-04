"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { getProducts } from "@/lib/api/products";
import { deleteProduct } from "@/lib/api/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import type { Product } from "@/types";

/* Productos — herramienta interna, sistema «Perímetro».
 *
 * La vista por defecto es la tabla: en una pantalla de gestión la densidad
 * manda sobre la foto grande. Las acciones van siempre visibles con objetivo
 * táctil de 44px — antes aparecían solo con `group-hover`, inutilizables en
 * una tableta de obra.
 */

function unitSuffix(unit: Product["unit"]): string {
  return unit === "METRO" ? "m" : unit === "PANEL" ? "panel" : "u";
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "table">("table");

  /* `loading` ya arranca en true: no hace falta volver a ponerlo dentro del
     efecto (setState síncrono en un efecto = render en cascada). */
  const load = async () => {
    try {
      const r = await getProducts({ limit: 200 });
      setProducts(r.data ?? []);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    void load();
  }, []);

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`¿Eliminar "${name}"?`)) return;
    await deleteProduct(id);
    setProducts((p) => p.filter((x) => x.id !== id));
    toast.success("Producto eliminado");
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.slug.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Productos</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            <span className="tabular">{products.length}</span> producto
            {products.length !== 1 ? "s" : ""} en el catálogo
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/productos/nuevo">
            <Plus className="mr-2 size-4" aria-hidden="true" /> Nuevo producto
          </Link>
        </Button>
      </div>

      <div className="mb-4 flex items-center gap-3">
        <div className="relative max-w-xs flex-1">
          <Search
            className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            className="pl-9"
            placeholder="Buscar producto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div
          className="flex overflow-hidden rounded-lg border border-border"
          role="group"
          aria-label="Cambiar vista"
        >
          {(["table", "grid"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              aria-pressed={view === v}
              className={`min-h-tap px-3 py-1.5 text-xs font-medium transition-colors ${
                view === v
                  ? "bg-brand-navy text-on-dark"
                  : "bg-surface text-muted-foreground hover:text-foreground"
              }`}
            >
              {v === "table" ? "Lista" : "Cuadrícula"}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div
          className={
            view === "grid"
              ? "grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4"
              : "space-y-2"
          }
        >
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`animate-pulse rounded-xl bg-surface-2 ${view === "grid" ? "h-64" : "h-14"}`}
            />
          ))}
        </div>
      ) : view === "table" ? (
        <div className="overflow-x-auto rounded-xl border border-hairline bg-card shadow-xs">
          <table className="w-full text-sm">
            <thead className="border-b border-hairline bg-surface-2">
              <tr>
                <th className="px-4 py-2.5 text-left text-2xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Producto
                </th>
                <th className="px-4 py-2.5 text-left text-2xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Precio
                </th>
                <th className="px-4 py-2.5 text-left text-2xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Stock
                </th>
                <th className="px-4 py-2.5 text-left text-2xs font-semibold tracking-wide text-muted-foreground uppercase">
                  Estado
                </th>
                <th className="px-4 py-2.5">
                  <span className="sr-only">Acciones</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-hairline">
              {filtered.map((p) => (
                <tr key={p.id} className="transition-colors hover:bg-surface-2">
                  <td className="px-4 py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="relative size-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                        {p.images?.[0]?.url ? (
                          <Image
                            src={p.images[0].url}
                            alt={p.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : (
                          /* Sin foto: el alzado dibujado del sistema, no un
                             icono gris genérico. */
                          <div
                            className="diagram diagram-picket size-full"
                            aria-hidden="true"
                          />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-foreground">{p.name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {p.category?.name ? `${p.category.name} · ` : ""}
                          {p.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="tabular px-4 py-2.5 whitespace-nowrap text-foreground">
                    ${Number(p.basePrice).toFixed(2)}
                    <span className="text-xs text-muted-foreground">
                      /{unitSuffix(p.unit)}
                    </span>
                  </td>
                  <td className="tabular px-4 py-2.5 text-foreground">{p.stock}</td>
                  <td className="px-4 py-2.5">
                    <Badge variant={p.isActive ? "secondary" : "ghost"} size="sm">
                      {p.isActive ? "Activo" : "Inactivo"}
                    </Badge>
                  </td>
                  <td className="px-4 py-2.5">
                    <ProductActions
                      id={p.id}
                      name={p.name}
                      onDelete={() => handleDelete(p.id, p.name)}
                    />
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground">
                    No se encontraron productos
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
          {filtered.map((p) => (
            <div
              key={p.id}
              className="overflow-hidden rounded-xl border border-hairline bg-card shadow-xs"
            >
              <div className="relative h-40 bg-surface-2">
                {p.images?.[0]?.url ? (
                  <Image
                    src={p.images[0].url}
                    alt={p.name}
                    fill
                    sizes="280px"
                    className="object-cover"
                  />
                ) : (
                  <div className="diagram diagram-picket size-full" aria-hidden="true" />
                )}
                <span className="absolute top-2 left-2">
                  <Badge variant={p.isActive ? "secondary" : "ghost"} size="sm">
                    {p.isActive ? "Activo" : "Inactivo"}
                  </Badge>
                </span>
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-foreground">{p.name}</p>
                <p className="mt-0.5 truncate text-xs text-muted-foreground">
                  {p.category?.name}
                </p>
                <div className="mt-2 flex items-center justify-between">
                  <span className="tabular text-sm font-bold text-foreground">
                    ${Number(p.basePrice).toFixed(2)}
                    <span className="text-xs font-normal text-muted-foreground">
                      /{unitSuffix(p.unit)}
                    </span>
                  </span>
                  <span className="tabular text-xs text-muted-foreground">
                    Stock: {p.stock}
                  </span>
                </div>
                {/* Acciones siempre visibles, también en táctil. */}
                <div className="mt-2 flex items-center justify-end gap-1 border-t border-hairline pt-2">
                  <ProductActions
                    id={p.id}
                    name={p.name}
                    onDelete={() => handleDelete(p.id, p.name)}
                  />
                </div>
              </div>
            </div>
          ))}
          <Link
            href="/admin/productos/nuevo"
            className="flex min-h-64 flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border-strong text-muted-foreground transition-colors hover:border-brand-green hover:bg-brand-green-soft hover:text-brand-green-deep"
          >
            <Plus className="size-5" aria-hidden="true" />
            <span className="text-sm font-medium">Nuevo producto</span>
          </Link>
        </div>
      )}
    </div>
  );
}

/** Par editar/eliminar: 44px de objetivo táctil, icono de 16px, nombre en el `aria-label`. */
function ProductActions({
  id,
  name,
  onDelete,
}: {
  id: string;
  name: string;
  onDelete: () => void;
}) {
  return (
    <div className="flex items-center justify-end gap-1">
      <Button size="icon" variant="ghost" aria-label={`Editar ${name}`} asChild>
        <Link href={`/admin/productos/${id}`}>
          <Pencil className="size-4" aria-hidden="true" />
        </Link>
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        aria-label={`Eliminar ${name}`}
        onClick={onDelete}
      >
        <Trash2 className="size-4" aria-hidden="true" />
      </Button>
    </div>
  );
}
