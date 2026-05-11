"use client";

import { useEffect, useState } from "react";
import { getProducts, getCategories, getCollections } from "@/lib/api/products";
import { createProduct, updateProduct, deleteProduct } from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Pencil, Trash2, Search } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  unit: string;
  stock: number;
  isActive: boolean;
  category?: { id: string; name: string };
  collection?: { id: string; name: string };
}

interface Category { id: string; name: string; slug: string; }
interface Collection { id: string; name: string; slug: string; }

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "",
    slug: "",
    description: "",
    basePrice: "",
    unit: "METRO",
    stock: "0",
    isActive: true,
    categoryId: "",
    collectionId: "",
    attributes: "{}",
    specifications: "[]",
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    Promise.all([
      getProducts({ limit: 100 }).then((r: any) => r),
      getCategories(),
      getCollections(),
    ]).then(([prods, cats, cols]) => {
      setProducts(prods.data || prods);
      setCategories(cats.data || cats || []);
      setCollections(cols.data || cols || []);
      setLoading(false);
    });
  }, []);

  const resetForm = () => {
    setForm({
      name: "", slug: "", description: "", basePrice: "", unit: "METRO",
      stock: "0", isActive: true, categoryId: "", collectionId: "",
      attributes: "{}", specifications: "[]",
    });
    setEditing(null);
  };

  const openEdit = (p: Product) => {
    setEditing(p);
    setForm({
      name: p.name, slug: p.slug, description: p.description,
      basePrice: String(p.basePrice), unit: p.unit, stock: String(p.stock),
      isActive: p.isActive,
      categoryId: p.category?.id || "",
      collectionId: p.collection?.id || "",
      attributes: "{}",
      specifications: "[]",
    });
    setDialogOpen(true);
  };

  const openCreate = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const data: any = {
        name: form.name,
        slug: form.slug,
        description: form.description,
        basePrice: Number(form.basePrice),
        unit: form.unit,
        stock: Number(form.stock),
        isActive: form.isActive,
        categoryId: form.categoryId || undefined,
        collectionId: form.collectionId || undefined,
      };
      if (editing) {
        await updateProduct(editing.id, data);
      } else {
        await createProduct(data);
      }
      setDialogOpen(false);
      resetForm();
      const prods = await getProducts({ limit: 100 });
      setProducts((prods as any).data || prods);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Eliminar este producto?")) return;
    await deleteProduct(id);
    setProducts((prev) => prev.filter((p) => p.id !== id));
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) resetForm(); }}>
          <DialogTrigger>
            <Button className="bg-green-600 hover:bg-green-700" onClick={openCreate}>
              <Plus className="mr-2 h-4 w-4" /> Nuevo producto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editing ? "Editar producto" : "Nuevo producto"}</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="col-span-2">
                <Label>Nombre</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Slug</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} />
              </div>
              <div className="col-span-2">
                <Label>Descripción</Label>
                <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} />
              </div>
              <div>
                <Label>Precio base</Label>
                <Input type="number" value={form.basePrice} onChange={(e) => setForm({ ...form, basePrice: e.target.value })} />
              </div>
              <div>
                <Label>Unidad</Label>
                <Select value={form.unit} onValueChange={(v) => setForm({ ...form, unit: v || "METRO" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="METRO">Metro</SelectItem>
                    <SelectItem value="PANEL">Panel</SelectItem>
                    <SelectItem value="UNIDAD">Unidad</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Stock</Label>
                <Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} />
              </div>
              <div>
                <Label>Categoría</Label>
                <Select value={form.categoryId} onValueChange={(v) => setForm({ ...form, categoryId: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Colección</Label>
                <Select value={form.collectionId} onValueChange={(v) => setForm({ ...form, collectionId: v || "" })}>
                  <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                  <SelectContent>
                    {collections.map((c) => (
                      <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancelar</Button>
              <Button className="bg-green-600 hover:bg-green-700" onClick={handleSave} disabled={saving}>
                {saving ? "Guardando..." : editing ? "Actualizar" : "Crear"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-lg">
            {filtered.length} producto{filtered.length !== 1 ? "s" : ""}
          </CardTitle>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <Input
              className="pl-9"
              placeholder="Buscar producto..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 animate-pulse rounded bg-gray-100" />
              ))}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-gray-500">
                    <th className="pb-3 font-medium">Producto</th>
                    <th className="pb-3 font-medium">Precio</th>
                    <th className="pb-3 font-medium">Stock</th>
                    <th className="pb-3 font-medium">Categoría</th>
                    <th className="pb-3 font-medium">Estado</th>
                    <th className="pb-3 text-right font-medium">Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((p) => (
                    <tr key={p.id} className="border-b last:border-0">
                      <td className="py-3">
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.slug}</p>
                      </td>
                      <td className="py-3">
                        ${Number(p.basePrice).toFixed(2)}/{p.unit === "METRO" ? "m" : ""}
                      </td>
                      <td className="py-3">{p.stock}</td>
                      <td className="py-3">{p.category?.name || "—"}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-2 py-0.5 text-xs ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {p.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex justify-end gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(p)}>
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-700" onClick={() => handleDelete(p.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {filtered.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-gray-500">
                        No se encontraron productos
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
