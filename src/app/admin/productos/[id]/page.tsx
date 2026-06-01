"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { getCategories, getCollections } from "@/lib/api/products";
import {
  createProduct, updateProduct,
  getProductById, addProductImage, deleteProductImage, reorderProductImages,
} from "@/lib/api/admin";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ArrowLeft, Save, Plus, Trash2, MoveUp, MoveDown,
  ImageIcon, ChevronRight, Eye, EyeOff, Loader2, Package,
} from "lucide-react";

interface Spec { label: string; value: string; }
interface PImage { id: string; url: string; alt?: string | null; order: number; }
interface Category { id: string; name: string; slug: string; }
interface Collection { id: string; name: string; slug: string; }

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

  const [images,        setImages]       = useState<PImage[]>([]);
  const [imgUrl,        setImgUrl]       = useState("");
  const [imgAlt,        setImgAlt]       = useState("");
  const [imgPreviewOk,  setImgPreviewOk] = useState(false);
  const [addingImg,     setAddingImg]    = useState(false);

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
    setLoading(true);
    (getProductById(params.id) as Promise<any>).then((p: any) => {
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
      const sorted = ((p.images || []) as PImage[]).slice().sort((a, b) => a.order - b.order);
      setImages(sorted);
      if (Array.isArray(p.specifications) && p.specifications.length > 0) {
        setSpecs(p.specifications as Spec[]);
      } else if (p.specifications && typeof p.specifications === "object") {
        setSpecs(Object.entries(p.specifications as Record<string,unknown>).map(([label, value]) => ({ label, value: String(value) })));
      }
    }).finally(() => setLoading(false));
  }, [isNew, params.id]);

  useEffect(() => {
    if (!slugEdited) setSlug(slugify(name));
  }, [name, slugEdited]);

  useEffect(() => {
    setImgPreviewOk(false);
    if (!imgUrl) return;
    const img = new window.Image();
    img.onload  = () => setImgPreviewOk(true);
    img.onerror = () => setImgPreviewOk(false);
    img.src = imgUrl;
  }, [imgUrl]);

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
        const created = await createProduct(data) as any;
        setProductId(created.id);
        toast.success("Producto creado");
        router.replace(`/admin/productos/${created.id}`);
      } else {
        await updateProduct(productId!, data);
        toast.success("Producto actualizado");
      }
    } catch (e: any) {
      toast.error(e?.message || "Error al guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async () => {
    if (!imgUrl.trim()) { toast.error("Ingresa una URL de imagen"); return; }
    if (!productId) { toast.error("Guarda el producto primero"); return; }
    setAddingImg(true);
    try {
      const p = await addProductImage(productId, { url: imgUrl.trim(), alt: imgAlt.trim() || undefined }) as any;
      setImages(((p.images || []) as PImage[]).slice().sort((a, b) => a.order - b.order));
      setImgUrl(""); setImgAlt(""); setImgPreviewOk(false);
      toast.success("Imagen agregada");
    } catch (e: any) {
      toast.error(e?.message || "Error al agregar imagen");
    } finally { setAddingImg(false); }
  };

  const handleDeleteImg = async (imageId: string) => {
    if (!confirm("¿Eliminar esta imagen?")) return;
    try {
      const p = await deleteProductImage(productId!, imageId) as any;
      setImages(((p.images || []) as PImage[]).slice().sort((a, b) => a.order - b.order));
      toast.success("Imagen eliminada");
    } catch { toast.error("Error al eliminar imagen"); }
  };

  const moveImage = async (index: number, dir: -1 | 1) => {
    const arr = [...images];
    const target = index + dir;
    if (target < 0 || target >= arr.length) return;
    [arr[index], arr[target]] = [arr[target], arr[index]];
    const newImages = arr.map((img, i) => ({ ...img, order: i }));
    setImages(newImages);
    try {
      await reorderProductImages(productId!, newImages.map((img, i) => ({ id: img.id, order: i })));
    } catch { toast.error("Error al reordenar"); }
  };

  const addSpec    = () => setSpecs(s => [...s, { label: "", value: "" }]);
  const removeSpec = (i: number) => setSpecs(s => s.filter((_, idx) => idx !== i));
  const setSpec    = (i: number, field: keyof Spec, val: string) =>
    setSpecs(s => s.map((sp, idx) => idx === i ? { ...sp, [field]: val } : sp));

  if (loading) return (
    <div className="flex items-center justify-center h-64 gap-2 text-gray-500">
      <Loader2 className="h-5 w-5 animate-spin" /> Cargando producto…
    </div>
  );

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <Link href="/admin/productos">
            <button className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors">
              <ArrowLeft className="h-4 w-4" /> Productos
            </button>
          </Link>
          <ChevronRight className="h-4 w-4 text-gray-300" />
          <span className="text-sm font-medium text-gray-700 truncate max-w-xs">
            {isNew ? "Nuevo producto" : (name || "Sin nombre")}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsActive(v => !v)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
              isActive
                ? "bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                : "bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200"
            }`}>
            {isActive ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
            {isActive ? "Publicado" : "Borrador"}
          </button>
          <Button onClick={handleSave} disabled={saving} className="bg-green-700 hover:bg-green-800">
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Guardando…" : "Guardar"}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: info + desc + specs */}
        <div className="lg:col-span-3 space-y-5">

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Información básica</h2>
            <div className="space-y-4">
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Nombre *</Label>
                <Input value={name} onChange={e => setName(e.target.value)} placeholder="Ej: Cerca PVC Afrodita 401" className="font-medium" />
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Slug (URL) *</Label>
                <div className="flex gap-2">
                  <Input value={slug} onChange={e => { setSlug(e.target.value); setSlugEdited(true); }} placeholder="cerca-pvc-afrodita-401" className="font-mono text-xs" />
                  <Button variant="outline" size="sm" onClick={() => { setSlug(slugify(name)); setSlugEdited(false); }} className="shrink-0 text-xs">Auto</Button>
                </div>
                <p className="text-[11px] text-gray-400 mt-1">/productos/<span className="text-gray-600">{slug || "slug-del-producto"}</span></p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Precio base (USD) *</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">$</span>
                    <Input type="number" step="0.01" min="0" value={basePrice} onChange={e => setBasePrice(e.target.value)} className="pl-7" placeholder="0.00" />
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Unidad</Label>
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
                  <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Categoría *</Label>
                  <Select value={categoryId} onValueChange={v => setCategoryId(v || "")}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                    <SelectContent>{categories.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Colección *</Label>
                  <Select value={collectionId} onValueChange={v => setCollectionId(v || "")}>
                    <SelectTrigger><SelectValue placeholder="Seleccionar…" /></SelectTrigger>
                    <SelectContent>{collections.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-500 uppercase tracking-wide mb-1 block">Stock</Label>
                <Input type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} className="w-32" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Descripción</h2>
            <Textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="Describe las características, materiales, aplicaciones…" rows={5} className="resize-none" />
            <p className="text-[11px] text-gray-400 mt-1.5">{description.length} caracteres</p>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-gray-700">Especificaciones técnicas</h2>
              <button onClick={addSpec} className="flex items-center gap-1 text-xs text-green-700 font-semibold hover:text-green-800 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Agregar fila
              </button>
            </div>
            <div className="space-y-2">
              {specs.map((sp, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <Input value={sp.label} onChange={e => setSpec(i, "label", e.target.value)} placeholder="Ej: Altura" className="text-sm" />
                  <Input value={sp.value} onChange={e => setSpec(i, "value", e.target.value)} placeholder="Ej: 1.80m" className="text-sm" />
                  <button onClick={() => removeSpec(i)} className="shrink-0 p-1.5 text-gray-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {specs.length === 0 && (
                <button onClick={addSpec} className="w-full py-6 border-2 border-dashed border-gray-200 rounded-lg text-sm text-gray-400 hover:border-green-300 hover:text-green-600 transition-colors">
                  + Agregar primera especificación
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right: images + preview */}
        <div className="lg:col-span-2 space-y-5">
          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-4">Imágenes del producto</h2>

            {!productId && (
              <div className="text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 mb-4">
                Guarda el producto primero para poder añadir imágenes.
              </div>
            )}

            <div className="space-y-2 mb-4">
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">URL de imagen</Label>
                <Input value={imgUrl} onChange={e => setImgUrl(e.target.value)} placeholder="/products/slug/imagen.jpg  o  https://…" className="text-xs font-mono" onKeyDown={e => { if (e.key === "Enter") handleAddImage(); }} />
              </div>
              <div>
                <Label className="text-xs text-gray-500 mb-1 block">Texto alternativo (alt)</Label>
                <Input value={imgAlt} onChange={e => setImgAlt(e.target.value)} placeholder="Descripción de la imagen" className="text-sm" />
              </div>
              {imgUrl && (
                <div className={`relative h-28 rounded-lg overflow-hidden border-2 transition-colors ${imgPreviewOk ? "border-green-300" : "border-gray-200"} bg-gray-50`}>
                  {imgPreviewOk ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={imgUrl} alt="preview" className="absolute inset-0 w-full h-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center gap-2 text-gray-400">
                      <ImageIcon className="h-6 w-6" />
                      <span className="text-xs">Cargando vista previa…</span>
                    </div>
                  )}
                </div>
              )}
              <Button onClick={handleAddImage} disabled={!imgUrl || addingImg || !productId} className="w-full bg-green-700 hover:bg-green-800" size="sm">
                {addingImg ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Plus className="mr-2 h-3.5 w-3.5" />}
                Agregar imagen
              </Button>
            </div>

            {images.length > 0 ? (
              <div className="space-y-2">
                {images.map((img, i) => (
                  <div key={img.id} className={`flex gap-2 items-center rounded-lg border p-2 ${i === 0 ? "border-green-200 bg-green-50" : "border-gray-100 bg-white"}`}>
                    <div className="relative h-14 w-14 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                      <Image src={img.url} alt={img.alt || ""} fill sizes="56px" className="object-cover" />
                      {i === 0 && (
                        <div className="absolute bottom-0 inset-x-0 bg-green-600 text-white text-[8px] text-center font-bold py-0.5">PORTADA</div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[10px] font-mono text-gray-500 truncate">{img.url}</p>
                      <p className="text-[11px] text-gray-400 truncate">{img.alt || "Sin alt"}</p>
                    </div>
                    <div className="flex flex-col gap-0.5 shrink-0">
                      <button onClick={() => moveImage(i, -1)} disabled={i === 0} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"><MoveUp className="h-3.5 w-3.5" /></button>
                      <button onClick={() => moveImage(i, 1)} disabled={i === images.length - 1} className="p-1 rounded text-gray-400 hover:text-gray-700 disabled:opacity-20 transition-colors"><MoveDown className="h-3.5 w-3.5" /></button>
                    </div>
                    <button onClick={() => handleDeleteImg(img.id)} className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors shrink-0"><Trash2 className="h-3.5 w-3.5" /></button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-8 border-2 border-dashed border-gray-100 rounded-xl">
                <Package className="h-8 w-8 text-gray-200" />
                <p className="text-xs text-gray-400">Sin imágenes aún</p>
              </div>
            )}
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-semibold text-gray-700 mb-3">Vista previa</h2>
            <div className="rounded-xl border border-gray-100 overflow-hidden">
              <div className="relative h-40 bg-gray-50">
                {images[0]?.url ? (
                  <Image src={images[0].url} alt={name} fill sizes="280px" className="object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center"><Package className="h-12 w-12 text-gray-200" /></div>
                )}
                {!isActive && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-gray-800 text-white text-xs px-2 py-1 rounded font-semibold">Borrador</span>
                  </div>
                )}
              </div>
              <div className="p-3">
                <p className="font-semibold text-sm text-gray-900 truncate">{name || "Nombre del producto"}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{categories.find(c => c.id === categoryId)?.name || "Categoría"}</p>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-base font-extrabold text-gray-900">${basePrice ? Number(basePrice).toFixed(2) : "0.00"}</span>
                  <span className="text-xs text-gray-400">/{unit === "METRO" ? "m lineal" : unit === "PANEL" ? "panel" : "unidad"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
