"use client";

/**
 * Zona de subida de imágenes de producto: arrastrar y soltar, selector de
 * archivo, cámara en móvil y pegado desde el portapapeles.
 *
 * Decisiones que no son cosméticas:
 *
 * · La zona es un <button> real, no un <div> con handlers. Así responde a
 *   Enter y Espacio, entra en el orden de tabulación y el lector de pantalla
 *   la anuncia como control, sin reimplementar nada de eso a mano.
 * · Las subidas van EN SERIE. El backend añade cada imagen al producto y
 *   devuelve el producto entero: en paralelo, dos respuestas concurrentes se
 *   pisarían el campo `order`. En serie, además, la barra de progreso de una
 *   subida en 4G significa algo.
 * · El progreso es real (bytes subidos vía XMLHttpRequest), no una animación
 *   que finge trabajo.
 */

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { Camera, CheckCircle2, ImageUp, Loader2, RotateCcw, Upload, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { prepareProductImage } from "@/components/admin/image-prepare";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_ACCEPTED_LABEL,
  PRODUCT_IMAGE_MAX_LABEL,
  describeRejection,
  formatBytes,
  isAbortError,
  uploadProductImage,
  type ProductWithImages,
} from "@/lib/api/product-images";

type ItemStatus = "queued" | "preparing" | "uploading" | "done" | "error" | "canceled";

interface QueueItem {
  id: string;
  name: string;
  previewUrl: string | null;
  originalBytes: number;
  bytes: number | null;
  optimized: boolean;
  status: ItemStatus;
  percent: number;
  error?: string;
}

export interface ProductImageUploaderProps {
  /** `null` mientras el producto no está guardado: no hay a dónde subir. */
  productId: string | null;
  /** Se usa como texto alternativo de cada imagen subida. */
  defaultAlt?: string;
  /** Recibe el producto actualizado que devuelve el servidor tras cada subida. */
  onUploaded: (product: ProductWithImages) => void;
}

const STATUS_LABEL: Record<ItemStatus, string> = {
  queued: "En cola",
  preparing: "Preparando",
  uploading: "Subiendo",
  done: "Subida",
  error: "Error",
  canceled: "Cancelada",
};

let seq = 0;
const nextId = () => `up-${Date.now().toString(36)}-${(seq += 1)}`;

export function ProductImageUploader({
  productId,
  defaultAlt,
  onUploaded,
}: ProductImageUploaderProps) {
  const [items, setItems] = useState<QueueItem[]>([]);
  const [dragging, setDragging] = useState(false);
  const [announcement, setAnnouncement] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  /** Archivos originales fuera del estado: no deben provocar renders. */
  const filesRef = useRef(new Map<string, File>());
  const queueRef = useRef<string[]>([]);
  const runningRef = useRef(false);
  const canceledRef = useRef(new Set<string>());
  /* Las URLs de objeto se liberan cuando el elemento sale de la lista o al
     desmontar; guardarlas aparte evita fugas si el componente muere a mitad. */
  const previewsRef = useRef(new Map<string, string>());
  const currentAbort = useRef<AbortController | null>(null);
  const unmounted = useRef(false);

  const hintId = useId();
  const listId = useId();

  const disabled = !productId;

  const patch = useCallback((id: string, changes: Partial<QueueItem>) => {
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...changes } : item)));
  }, []);

  useEffect(
    () => () => {
      unmounted.current = true;
      currentAbort.current?.abort();
      for (const url of previewsRef.current.values()) URL.revokeObjectURL(url);
      previewsRef.current.clear();
    },
    [],
  );

  const releasePreview = useCallback((id: string) => {
    const url = previewsRef.current.get(id);
    if (url) {
      URL.revokeObjectURL(url);
      previewsRef.current.delete(id);
    }
  }, []);

  /* ── Motor de la cola ──────────────────────────────────────────────────── */

  const pump = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;

    try {
      while (queueRef.current.length > 0) {
        const id = queueRef.current.shift();
        if (!id) continue;
        if (canceledRef.current.has(id)) continue;

        const file = filesRef.current.get(id);
        const target = productId;
        if (!file || !target) continue;

        const controller = new AbortController();
        currentAbort.current = controller;

        try {
          patch(id, { status: "preparing", percent: 0 });
          const prepared = await prepareProductImage(file, controller.signal);

          patch(id, {
            status: "uploading",
            bytes: prepared.bytes,
            optimized: prepared.optimized,
          });
          setAnnouncement(`Subiendo ${prepared.fileName}.`);

          const product = await uploadProductImage({
            productId: target,
            file: prepared.blob,
            fileName: prepared.fileName,
            alt: defaultAlt,
            signal: controller.signal,
            onProgress: ({ percent }) => {
              if (!unmounted.current) patch(id, { percent });
            },
          });

          if (unmounted.current) return;

          patch(id, { status: "done", percent: 100 });
          setAnnouncement(
            `${prepared.fileName} subida${
              prepared.optimized
                ? `, optimizada de ${formatBytes(prepared.originalBytes)} a ${formatBytes(prepared.bytes)}`
                : ""
            }.`,
          );
          onUploaded(product);
        } catch (error) {
          if (unmounted.current) return;

          if (isAbortError(error)) {
            patch(id, { status: "canceled" });
            setAnnouncement("Subida cancelada.");
          } else {
            const message =
              error instanceof Error ? error.message : "No se pudo subir la imagen.";
            patch(id, { status: "error", error: message });
            setAnnouncement(`Error al subir: ${message}`);
            toast.error(message);
          }
        } finally {
          currentAbort.current = null;
        }
      }
    } finally {
      runningRef.current = false;
    }
  }, [defaultAlt, onUploaded, patch, productId]);

  /* ── Entrada de archivos ───────────────────────────────────────────────── */

  const addFiles = useCallback(
    (fileList: FileList | File[] | null) => {
      const files = Array.from(fileList ?? []);
      if (files.length === 0) return;

      if (disabled) {
        toast.error("Guarda el producto antes de subir imágenes.");
        return;
      }

      const accepted: QueueItem[] = [];
      const rejected: string[] = [];

      for (const file of files) {
        const rejection = describeRejection(file);
        if (rejection) {
          rejected.push(rejection);
          continue;
        }

        const id = nextId();
        filesRef.current.set(id, file);
        const previewUrl = URL.createObjectURL(file);
        previewsRef.current.set(id, previewUrl);

        accepted.push({
          id,
          name: file.name || "foto",
          previewUrl,
          originalBytes: file.size,
          bytes: null,
          optimized: false,
          status: "queued",
          percent: 0,
        });
      }

      for (const message of rejected) toast.error(message);

      if (accepted.length === 0) {
        setAnnouncement(
          rejected[0] ?? `Ningún archivo válido. Se aceptan ${PRODUCT_IMAGE_ACCEPTED_LABEL}.`,
        );
        return;
      }

      // Se limpian las ya terminadas para que la cola no crezca sin fin: las
      // subidas correctas ya aparecen en la lista de imágenes del producto.
      setItems((prev) => {
        const kept = prev.filter((item) => {
          const finished = item.status === "done" || item.status === "canceled";
          if (finished) {
            releasePreview(item.id);
            filesRef.current.delete(item.id);
          }
          return !finished;
        });
        return [...kept, ...accepted];
      });

      queueRef.current.push(...accepted.map((item) => item.id));
      setAnnouncement(
        accepted.length === 1
          ? `1 imagen añadida a la cola de subida.`
          : `${accepted.length} imágenes añadidas a la cola de subida.`,
      );
      void pump();
    },
    [disabled, pump, releasePreview],
  );

  const cancelItem = useCallback(
    (id: string) => {
      canceledRef.current.add(id);
      const item = items.find((entry) => entry.id === id);
      if (item && (item.status === "uploading" || item.status === "preparing")) {
        currentAbort.current?.abort();
        return;
      }
      queueRef.current = queueRef.current.filter((entry) => entry !== id);
      releasePreview(id);
      filesRef.current.delete(id);
      setItems((prev) => prev.filter((entry) => entry.id !== id));
      setAnnouncement("Imagen retirada de la cola.");
    },
    [items, releasePreview],
  );

  const retryItem = useCallback(
    (id: string) => {
      canceledRef.current.delete(id);
      patch(id, { status: "queued", percent: 0, error: undefined });
      queueRef.current.push(id);
      void pump();
    },
    [patch, pump],
  );

  const clearFinished = useCallback(() => {
    setItems((prev) =>
      prev.filter((item) => {
        const finished =
          item.status === "done" || item.status === "canceled" || item.status === "error";
        if (finished) {
          releasePreview(item.id);
          filesRef.current.delete(item.id);
        }
        return !finished;
      }),
    );
  }, [releasePreview]);

  /* ── Arrastrar y soltar ────────────────────────────────────────────────── */

  const onDragEnter = (event: React.DragEvent) => {
    if (disabled) return;
    event.preventDefault();
    dragDepth.current += 1;
    if (!dragging) {
      setDragging(true);
      const count = event.dataTransfer?.items?.length ?? 0;
      setAnnouncement(
        count > 1 ? `Suelta para añadir ${count} archivos.` : "Suelta para añadir la imagen.",
      );
    }
  };

  const onDragOver = (event: React.DragEvent) => {
    if (disabled) return;
    event.preventDefault();
    if (event.dataTransfer) event.dataTransfer.dropEffect = "copy";
  };

  const onDragLeave = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepth.current = Math.max(0, dragDepth.current - 1);
    if (dragDepth.current === 0) setDragging(false);
  };

  const onDrop = (event: React.DragEvent) => {
    event.preventDefault();
    dragDepth.current = 0;
    setDragging(false);
    if (disabled) {
      toast.error("Guarda el producto antes de subir imágenes.");
      return;
    }
    addFiles(event.dataTransfer?.files ?? null);
  };

  const onPaste = (event: React.ClipboardEvent) => {
    const files = Array.from(event.clipboardData?.files ?? []);
    if (files.length === 0) return;
    event.preventDefault();
    addFiles(files);
  };

  const active = items.some((item) => item.status === "uploading" || item.status === "preparing");
  const finishedCount = items.filter(
    (item) => item.status === "done" || item.status === "canceled" || item.status === "error",
  ).length;

  return (
    <div onPaste={onPaste}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
        onDragEnter={onDragEnter}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        aria-describedby={hintId}
        aria-controls={items.length > 0 ? listId : undefined}
        className={cn(
          "flex w-full flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-7 text-center",
          "transition-colors duration-150 outline-none",
          "disabled:cursor-not-allowed disabled:opacity-50",
          dragging
            ? "border-primary bg-brand-green-soft"
            : "border-border-strong bg-surface-2 hover:border-primary hover:bg-brand-green-soft/50",
        )}
      >
        <span
          className={cn(
            "flex size-11 items-center justify-center rounded-full",
            dragging ? "bg-primary text-primary-foreground" : "bg-surface text-primary",
          )}
          aria-hidden="true"
        >
          {dragging ? <Upload className="size-5" /> : <ImageUp className="size-5" />}
        </span>
        <span className="font-heading text-sm font-semibold text-foreground">
          {dragging ? "Suelta las fotos aquí" : "Arrastra fotos o pulsa para elegir"}
        </span>
        <span className="text-xs text-muted-foreground">
          Varias a la vez · {PRODUCT_IMAGE_ACCEPTED_LABEL} · hasta {PRODUCT_IMAGE_MAX_LABEL} cada una
        </span>
      </button>

      <p id={hintId} className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
        Las fotos del móvil se ajustan solas antes de subirse: se convierten a JPG y se reducen si
        pasan del límite. También puedes pegarlas con Ctrl+V.
      </p>

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={PRODUCT_IMAGE_ACCEPT}
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={(event) => {
          addFiles(event.target.files);
          event.target.value = "";
        }}
      />

      {/* Atajo a la cámara: sólo aparece en dispositivos de puntero grueso. */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={disabled}
        onClick={() => cameraRef.current?.click()}
        className="mt-2 hidden w-full [@media(pointer:coarse)]:inline-flex"
      >
        <Camera className="size-4" /> Tomar foto ahora
      </Button>

      {/* Región viva: estado de arrastre, progreso y errores para lectores. */}
      <p aria-live="polite" role="status" className="sr-only">
        {announcement}
      </p>

      {items.length > 0 && (
        <ul id={listId} className="mt-3 space-y-2">
          {items.map((item) => {
            const busy = item.status === "uploading" || item.status === "preparing";
            return (
              <li
                key={item.id}
                className={cn(
                  "flex items-center gap-3 rounded-lg border p-2",
                  item.status === "error"
                    ? "border-destructive/45 bg-destructive/10"
                    : "border-border bg-surface",
                )}
              >
                <span className="relative size-12 shrink-0 overflow-hidden rounded-md bg-surface-sunk">
                  {/* Blob local: el optimizador de next/image no puede tocarlo,
                      y las medidas explícitas evitan que la fila salte. */}
                  {item.previewUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.previewUrl}
                      alt=""
                      width={48}
                      height={48}
                      className="size-12 object-cover"
                    />
                  )}
                  {item.status === "done" && (
                    <span className="absolute inset-0 flex items-center justify-center bg-primary/85 text-primary-foreground">
                      <CheckCircle2 className="size-5" aria-hidden="true" />
                    </span>
                  )}
                </span>

                <span className="min-w-0 flex-1">
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="truncate text-xs font-medium text-foreground">{item.name}</span>
                    <span className="shrink-0 text-[11px] tabular text-muted-foreground">
                      {busy ? `${item.percent}%` : STATUS_LABEL[item.status]}
                    </span>
                  </span>

                  <span
                    role="progressbar"
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuenow={item.status === "done" ? 100 : item.percent}
                    aria-label={`${STATUS_LABEL[item.status]}: ${item.name}`}
                    className="mt-1 block h-1.5 w-full overflow-hidden rounded-full bg-surface-sunk"
                  >
                    <span
                      className={cn(
                        "block h-full rounded-full transition-[width] duration-150",
                        item.status === "error" ? "bg-destructive" : "bg-primary",
                      )}
                      style={{ width: `${item.status === "done" ? 100 : item.percent}%` }}
                    />
                  </span>

                  <span className="mt-1 block text-[11px] leading-snug text-muted-foreground">
                    {item.status === "error" ? (
                      <span className="text-destructive">{item.error}</span>
                    ) : item.optimized && item.bytes !== null ? (
                      `Optimizada: ${formatBytes(item.originalBytes)} → ${formatBytes(item.bytes)}`
                    ) : (
                      formatBytes(item.bytes ?? item.originalBytes)
                    )}
                  </span>
                </span>

                {item.status === "error" ? (
                  <button
                    type="button"
                    onClick={() => retryItem(item.id)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  >
                    <RotateCcw className="size-4" aria-hidden="true" />
                    <span className="sr-only">Reintentar {item.name}</span>
                  </button>
                ) : item.status === "done" ? (
                  <span className="flex size-9 shrink-0 items-center justify-center text-primary">
                    <CheckCircle2 className="size-4" aria-hidden="true" />
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => cancelItem(item.id)}
                    className="flex size-9 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
                  >
                    {busy ? (
                      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    ) : (
                      <X className="size-4" aria-hidden="true" />
                    )}
                    <span className="sr-only">Cancelar {item.name}</span>
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {finishedCount > 0 && !active && (
        <button
          type="button"
          onClick={clearFinished}
          className="mt-2 text-xs font-semibold text-primary underline decoration-primary/35 underline-offset-4 transition-colors hover:decoration-primary"
        >
          Limpiar la lista de subidas
        </button>
      )}
    </div>
  );
}
