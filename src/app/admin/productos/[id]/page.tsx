"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getCategories, getCollections } from "@/lib/api/products";
import { createProduct, updateProduct, getProductById } from "@/lib/api/admin";
import { ProductImagesPanel } from "@/components/admin/product-images-panel";
import { sortProductImages, type ProductImage } from "@/lib/api/product-images";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Save, Plus, Trash2, ChevronRight, Eye, EyeOff, Loader2, Package,
} from "lucide-react";

interface Spec { label: string; value: string; }
interface Category { id: string; name: string; slug: string; }
interface Collection { id: string; name: string; slug: string; }

/** Lo que el editor consume del producto que devuelve la API. */
interface LoadedProduct {
  id: string;
  name?: string;
  slug?: string;
  description?: string;
  basePrice?: number | string;
  unit?: string;
  stock?: number | string;
  isActive?: boolean;
  category?: { id: string } | null;
  collection?: { id: string } | null;
  images?: ProductImage[];
  specifications?: Spec[] | Record<string, unknown> | null;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

function slugify(text: string) {
  return text.toLowerCase().trim()
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-").replace(/-+/g, "-");
}

export default function ProductEditor() {
  const params   = useParams<{ id: string }>();
  const router   = useRouter();
  const isNew    = params.id === "nuevo";

  const [loading,    setLoading]    = useState(!isNew);
  const [saving,     setSaving]     = useState(false);
  const [productId,  setProductId]  = useState<string | null>(isNew ? null : params.id);

  const [name,         setName]         = useState("");
  const [slug,         setSlug]         = useState("");
  const [slugEdited,   setSlugEdited]   = useState(false);
  const [description,  setDescription]  = useState("");
  const [basePrice,    setBasePrice]    = useState("");
  const [unit,         setUnit]         = useState("METRO");
  const [stock,        setStock]        = useState("0");
  const [isActive,     setIsActive]     = useState(true);
  const [categoryId,   setCategoryId]   = useState("");
  const [collectionId, setCollectionId] = useState("");
  const [specs,        setSpecs]        = useState<Spec[]>([]);

  const [images, setImages] = useState<ProductImage[]>([]);

  const [categories,  setCategories]  = useState<Category[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);

  useEffect(() => {
    Promise.all([getCategories(), getCollections()]).then(([cats, cols]) => {
      setCategories((cats as Category[]) || []);
      setCollections((cols as Collection[]) || []);
    });
  }, []);

  useEffect(() => {
    if (isNew) return;
    // `loading` ya arranca en true cuando no es un producto nuevo.
    (getProductById(params.id) as Promise<LoadedProduct>).then((p) => {
      setName(p.name || "");
      setSlug(p.slug || "");
      setSlugEdited(true);
      setDescription(p.description || "");
      setBasePrice(String(p.basePrice || ""));
      setUnit(p.unit || "METRO");
      setStock(String(p.stock || 0));
      setIsActive(p.isActive ?? true);
      setCategoryId(p.category?.id || "");
      setCollectionId(p.collection?.id || "");
      setImages(sortProductImages(p.images));
      if (Array.isArray(p.specifications) && p.specifications.length > 0) {
        setSpecs(p.specifications);
      } else if (p.specifications && typeof p.specifications === "object") {
        setSpecs(Object.entries(p.specifications).map(([label, value]) => ({ label, value: String(value) })));
      }
    }).finally(() => setLoading(false));
  }, [isNew, params.id]);

  /* El slug se deriva del nombre mientras no se haya tocado a mano. Se calcula
     aquí y no en un efecto: un efecto que llama a setState provoca un render
     en cascada por cada tecla. */
  const handleNameChange = (value: string) => {
    setName(value);
    if (!slugEdited) setSlug(slugify(value));
  };

  const handleSave = async () => {
    if (!name.trim())  { toast.error("El nombre es obligatorio"); return; }
    if (!slug.trim())  { toast.error("El slug es obligatorio"); return; }
    if (!basePrice)    { toast.error("El precio es obligatorio"); return; }
    if (!categoryId)   { toast.error("Selecciona una categoría"); return; }
    if (!collectionId) { toast.error("Selecciona una colección"); return; }

    setSaving(true);
    try {
      const validSpecs = specs.filter(s => s.label.trim() && s.value.trim());
      const data = {
        name: name.trim(), slug: slug.trim(), description: description.trim(),
        basePrice: Number(basePrice), unit, stock: Number(stock),
        isActive, categoryId, collectionId,
        specifications: validSpecs.length ? validSpecs : undefined,
      };
      if (isNew) {
        const created = await createProduct(data) as { id: string };
        setProductId(created.id);
        toast.success("Producto creado");
        router.replace(`/admin/productos/${created.id}`);
      } else {
        await updateProduct(productId!, data);
        toast.success("Producto actualizado");
      }
    } catch (error) {
      toast.error(errorMessage(error, "No se pudo guardar el producto. Revisa los campos e intenta de nuevo."));
    } finally {
      setSaving(false);
    }
  };

  const addSpec    = () => setSpecs(s => [...s, { label: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(s => s.filter((_, idx) => idx !== i));
  const setSpec    = (i: number, field: keyof Spec, val: string) =>
    setSpecs(s => s.map((sp, idx) => idx === i ? { ...sp, [field]: val } : sp));

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" /> Cargando producto…
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/productos">
            <button className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" /> Productos
            </button>
          </Link>
          <ChevronRight className="h-4 w-4 text-border-strong" />
          <span className="text-sm font-medium text-foreground truncate max-w-xs">
            {isNew ? "Nuevo producto" : (name || "Sin nombre")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActive(v => !v)}
            aria-pressed={isActive}
            className={`flex min-h-tap items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              isActive
                ? "border-brand-green/40 bg-brand-green-soft text-brand-green-deep"
                : "border-border bg-surface-2 text-muted-foreground"
            }`}>
            {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {isActive ? "Publicado" : "Borrador"}
          </button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: info + desc + specs */}
        <div className="lg:col-span-3 space-y-5">

          <div className="rounded-xl border border-hairline bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-4">Información básica</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Nombre *</Label>
                <Input value={name} onChange={e => handleNameChange(e.target.value)} placeholder="Ej: Cerca PVC Afrodita 401" className="font-medium" />
              </div>
              <div>
                <Label className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Slug (URL) *</Label>
                <div className="flex gap-2">
                  <Input value={slug} onChange={e => { setSlug(e.target.value); setSlugEdited(true); }} placeholder="cerca-pvc-afrodita-401" className="font-mono text-xs" />
                  <Button variant="outline" size="sm" onClick={() => { setSlug(slugify(name)); setSlugEdited(false); }} className="shrink-0 text-xs">Auto</Button>
                </div>
                <p className="text-2xs text-muted-foreground mt-1">/productos/<span className="text-foreground">{slug || "slug-del-producto"}</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Precio base (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                    <Input type="number" step="0.01" min="0" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="pl-7" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <Label className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Unidad</Label>
                  <Select value={unit} onValueChange={v => setUnit(v || "METRO")}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="METRO">Metro lineal</SelectItem>
                      <SelectItem value="PANEL">Panel</SelectItem>
                      <SelectItem value="UNIDAD">Unidad</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Categoría *</Label>
                  <Select value={categoryId} onValueChange={v => setCategoryId(v || "")}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Colección *</Label>
                  <Select value={collectionId} onValueChange={v => setCollectionId(v || "")}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                    <SelectContent>{collections.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-2xs font-semibold text-muted-foreground uppercase tracking-wide mb-1 block">Stock</Label>
                <Input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="w-32" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-hairline bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Descripción</h2>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe las características, materiales, aplicaciones…" rows={5} className="resize-none" />
            <p className="text-2xs text-muted-foreground mt-1.5"><span className="tabular">{description.length}</span> caracteres</p>
          </div>

          <div className="rounded-xl border border-hairline bg-card p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-foreground">Especificaciones técnicas</h2>
              <button onClick={addSpec} className="flex items-center gap-1 text-xs text-primary font-semibold hover:text-brand-green-deep transition-colors">
                <Plus className="h-3.5 w-3.5" /> Agregar fila
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((sp, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={sp.label} onChange={e => setSpec(i, "label", e.target.value)} placeholder="Ej: Altura" className="text-sm" />
                  <Input value={sp.value} onChange={e => setSpec(i, "value", e.target.value)} placeholder="Ej: 1.80m" className="text-sm" />
                  <button onClick={() => removeSpec(i)} className="shrink-0 p-1.5 text-muted-foreground hover:text-destructive transition-colors rounded-lg hover:bg-destructive/10">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {specs.length === 0 && (
                <button onClick={addSpec} className="w-full py-6 border-2 border-dashed border-border rounded-lg text-sm text-muted-foreground hover:border-brand-green hover:text-brand-green-deep transition-colors">
                  + Agregar primera especificación
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: images + preview */}
        <div className="lg:col-span-2 space-y-5">
          <ProductImagesPanel
            productId={productId}
            productName={name}
            images={images}
            onImagesChange={setImages}
          />

          <div className="rounded-xl border border-hairline bg-card p-5">
            <h2 className="text-sm font-semibold text-foreground mb-3">Vista previa</h2>
            <div className="rounded-xl border border-hairline overflow-hidden">
              <div className="relative h-40 bg-surface-2">
                {images[0]?.url ? (
                  <Image src={images[0].url} alt={name} fill sizes="280px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Package className="h-12 w-12 text-border-strong" /></div>
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-brand-navy-deep/50 flex items-center justify-center">
                    <span className="bg-brand-navy text-on-dark text-xs px-2 py-1 rounded font-semibold">Borrador</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-foreground truncate">{name || "Nombre del producto"}</p>
                <p className="text-xs text-muted-foreground truncate mt-0.5">{categories.find(c => c.id === categoryId)?.name || "Categoría"}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="tabular text-base font-extrabold text-foreground">${basePrice ? Number(basePrice).toFixed(2) : "0.00"}</span>
                  <span className="text-xs text-muted-foreground">/{unit === "METRO" ? "m lineal" : unit === "PANEL" ? "panel" : "unidad"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
