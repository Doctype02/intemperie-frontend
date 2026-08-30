"use client";

/**
 * Panel de imágenes del editor de producto.
 *
 * Reúne los tres caminos que necesita el administrador y los mantiene todos
 * vivos:
 *   1. Subir archivos reales (arrastrar y soltar, disco, cámara) → uploader.
 *   2. Pegar una URL externa a mano: sigue siendo la única vía para imágenes
 *      alojadas fuera (catálogo del fabricante, CDN del proveedor), así que no
 *      se elimina; sólo pasa a ser el camino secundario.
 *   3. Reordenar y borrar lo ya publicado.
 *
 * La lista siempre se reemplaza con lo que responde el servidor: el backend
 * devuelve el producto entero en cada operación, así que no hay estado local
 * que pueda desincronizarse con la realidad.
 */

import { useEffect, useId, useState } from "react";
import Image from "next/image";
import { toast } from "sonner";
import { ImageIcon, Link2, Loader2, MoveDown, MoveUp, Package, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { addProductImage, deleteProductImage, reorderProductImages } from "@/lib/api/admin";
import { ProductImageUploader } from "@/components/admin/product-image-uploader";
import {
  sortProductImages,
  type ProductImage,
  type ProductWithImages,
} from "@/lib/api/product-images";

export interface ProductImagesPanelProps {
  /** `null` mientras el producto no se ha guardado todavía. */
  productId: string | null;
  /** Nombre del producto: se usa como texto alternativo por defecto. */
  productName: string;
  images: ProductImage[];
  onImagesChange: (images: ProductImage[]) => void;
}

function errorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}

export function ProductImagesPanel({
  productId,
  productName,
  images,
  onImagesChange,
}: ProductImagesPanelProps) {
  const [url, setUrl] = useState("");
  const [alt, setAlt] = useState("");
  /* Resultado de la última URL comprobada. Guardar también la URL evita
     tener que resetear el estado dentro del efecto (cascada de renders) y
     hace que la vista previa nunca corresponda a una URL ya cambiada. */
  const [probed, setProbed] = useState<{ url: string; ok: boolean } | null>(null);
  const [adding, setAdding] = useState(false);
  const [reordering, setReordering] = useState(false);
  const [status, setStatus] = useState("");

  const urlId = useId();
  const altId = useId();

  useEffect(() => {
    if (!url) return;
    const probe = new window.Image();
    probe.onload = () => setProbed({ url, ok: true });
    probe.onerror = () => setProbed({ url, ok: false });
    probe.src = url;
    return () => {
      probe.onload = null;
      probe.onerror = null;
    };
  }, [url]);

  const previewOk = probed?.url === url && probed.ok;

  const applyProduct = (product: ProductWithImages) => {
    onImagesChange(sortProductImages(product.images));
  };

  const handleAddUrl = async () => {
    const value = url.trim();
    if (!productId) {
      toast.error("Guarda el producto antes de añadir imágenes.");
      return;
    }
    if (!value) {
      toast.error("Escribe una URL: puede ser /products/slug/foto.jpg o https://…");
      return;
    }
    if (!/^(https?:\/\/|\/)/i.test(value)) {
      toast.error(
        "La URL debe empezar por «https://» (imagen externa) o por «/» (archivo del propio sitio).",
      );
      return;
    }

    setAdding(true);
    try {
      const product = (await addProductImage(productId, {
        url: value,
        alt: alt.trim() || productName || undefined,
      })) as ProductWithImages;
      applyProduct(product);
      setUrl("");
      setAlt("");
      setProbed(null);
      setStatus("Imagen añadida por URL.");
      toast.success("Imagen añadida");
    } catch (error) {
      toast.error(
        errorMessage(
          error,
          "No se pudo añadir la imagen. Revisa que la URL sea accesible públicamente.",
        ),
      );
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (image: ProductImage, index: number) => {
    if (!productId) return;
    if (!confirm(`¿Eliminar la imagen ${index + 1} de ${images.length}?`)) return;

    try {
      const product = (await deleteProductImage(productId, image.id)) as ProductWithImages;
      applyProduct(product);
      setStatus(`Imagen ${index + 1} eliminada.`);
      toast.success("Imagen eliminada");
    } catch (error) {
      toast.error(
        errorMessage(error, "No se pudo eliminar la imagen. Vuelve a intentarlo en un momento."),
      );
    }
  };

  const move = async (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (!productId || target < 0 || target >= images.length) return;

    const previous = images;
    const next = [...images];
    const a = next[index];
    const b = next[target];
    if (!a || !b) return;
    next[index] = b;
    next[target] = a;
    const renumbered = next.map((image, position) => ({ ...image, order: position }));

    // Optimista: la lista se mueve al instante y se revierte si el servidor
    // dice que no. Reordenar debe sentirse inmediato.
    onImagesChange(renumbered);
    setStatus(`Imagen movida a la posición ${target + 1} de ${images.length}.`);
    setReordering(true);
    try {
      await reorderProductImages(
        productId,
        renumbered.map((image, position) => ({ id: image.id, order: position })),
      );
    } catch (error) {
      onImagesChange(previous);
      setStatus("No se pudo guardar el nuevo orden.");
      toast.error(errorMessage(error, "No se pudo guardar el nuevo orden de las imágenes."));
    } finally {
      setReordering(false);
    }
  };

  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <h2 className="mb-4 font-heading text-sm font-semibold text-foreground">
        Imágenes del producto
      </h2>

      {!productId && (
        <p className="mb-4 rounded-lg border border-warning/40 bg-accent px-3 py-2 text-xs text-accent-foreground">
          Guarda el producto primero: las imágenes se suben asociadas a él.
        </p>
      )}

      <ProductImageUploader
        productId={productId}
        defaultAlt={productName || undefined}
        onUploaded={applyProduct}
      />

      {/* Camino secundario, pero intacto: URLs de imágenes alojadas fuera. */}
      <details className="mt-4 rounded-lg border border-border bg-surface-2 px-3 py-2">
        <summary className="flex cursor-pointer list-none items-center gap-2 py-1 text-xs font-semibold text-foreground">
          <Link2 className="size-3.5 text-muted-foreground" aria-hidden="true" />
          Añadir por URL (imagen alojada fuera)
        </summary>

        <div className="mt-3 space-y-2">
          <div>
            <Label htmlFor={urlId} className="mb-1 block text-xs text-muted-foreground">
              URL de la imagen
            </Label>
            <Input
              id={urlId}
              value={url}
              onChange={(event) => setUrl(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleAddUrl();
                }
              }}
              inputMode="url"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              placeholder="/products/slug/imagen.jpg  o  https://…"
              className="text-xs"
            />
          </div>

          <div>
            <Label htmlFor={altId} className="mb-1 block text-xs text-muted-foreground">
              Texto alternativo (opcional)
            </Label>
            <Input
              id={altId}
              value={alt}
              onChange={(event) => setAlt(event.target.value)}
              placeholder={productName || "Descripción de la imagen"}
              className="text-sm"
            />
          </div>

          {url && (
            <div
              className={cn(
                "relative h-28 overflow-hidden rounded-lg border-2 bg-surface-sunk transition-colors",
                previewOk ? "border-primary" : "border-border",
              )}
            >
              {previewOk ? (
                // URL arbitraria y efímera: no pasa por el optimizador.
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={url}
                  alt=""
                  className="absolute inset-0 size-full object-cover"
                />
              ) : (
                <p className="flex h-full items-center justify-center gap-2 text-xs text-muted-foreground">
                  <ImageIcon className="size-5" aria-hidden="true" />
                  Comprobando que la URL cargue…
                </p>
              )}
            </div>
          )}

          <Button
            type="button"
            onClick={handleAddUrl}
            disabled={!url || adding || !productId}
            size="sm"
            className="w-full"
          >
            {adding ? (
              <Loader2 className="size-4 animate-spin" aria-hidden="true" />
            ) : (
              <Plus className="size-4" aria-hidden="true" />
            )}
            Añadir esta URL
          </Button>
        </div>
      </details>

      {/* Anuncia altas, bajas y reordenaciones a lectores de pantalla. */}
      <p aria-live="polite" role="status" className="sr-only">
        {status}
      </p>

      {images.length > 0 ? (
        <ul className="mt-4 space-y-2">
          {images.map((image, index) => (
            <li
              key={image.id}
              className={cn(
                "flex items-center gap-2 rounded-lg border p-2",
                index === 0 ? "border-primary/50 bg-brand-green-soft/50" : "border-border bg-surface",
              )}
            >
              <span className="relative size-14 shrink-0 overflow-hidden rounded-lg bg-surface-sunk">
                <Image src={image.url} alt="" fill sizes="56px" className="object-cover" />
                {index === 0 && (
                  <span className="absolute inset-x-0 bottom-0 bg-primary py-0.5 text-center text-[8px] font-bold text-primary-foreground">
                    PORTADA
                  </span>
                )}
              </span>

              <span className="min-w-0 flex-1">
                <span className="block truncate text-[11px] text-muted-foreground">{image.url}</span>
                <span className="block truncate text-[11px] text-muted-foreground">
                  {image.alt || "Sin texto alternativo"}
                </span>
              </span>

              <span className="flex shrink-0 flex-col">
                <button
                  type="button"
                  onClick={() => move(index, -1)}
                  disabled={index === 0 || reordering}
                  className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-25"
                >
                  <MoveUp className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Subir a la posición {index}</span>
                </button>
                <button
                  type="button"
                  onClick={() => move(index, 1)}
                  disabled={index === images.length - 1 || reordering}
                  className="flex size-7 items-center justify-center rounded text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-25"
                >
                  <MoveDown className="size-3.5" aria-hidden="true" />
                  <span className="sr-only">Bajar a la posición {index + 2}</span>
                </button>
              </span>

              <button
                type="button"
                onClick={() => handleDelete(image, index)}
                className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="size-4" aria-hidden="true" />
                <span className="sr-only">Eliminar la imagen {index + 1}</span>
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 flex flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border py-8 text-xs text-muted-foreground">
          <Package className="size-8 opacity-40" aria-hidden="true" />
          Sin imágenes todavía. La primera será la portada.
        </p>
      )}
    </div>
  );
}
