"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, ImageIcon, X, ZoomIn } from "lucide-react";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";
import type { ProductImage } from "@/types";

/* Galería de producto.
 *
 * Diez de los quince productos del catálogo no tienen ninguna foto cargada.
 * Por eso el caso de 0 imágenes no es un borde: es el caso mayoritario, y se
 * resuelve con un panel que muestra la ficha técnica en lugar de un hueco.
 *
 * Con fotos, sólo se descarga la que se está viendo (más sus vecinas cuando el
 * visitante navega). La versión anterior montaba las ocho imágenes de Poseidón
 * con `loading="eager"`: ocho descargas a tamaño completo compitiendo con el
 * LCP para ver una.
 */

interface Highlight {
  label: string;
  value: string;
}

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  /** Datos reales que rellenan el panel cuando el producto aún no tiene foto. */
  highlights?: Highlight[];
}

/** Recuadro de proporción fija: reserva el hueco y evita saltos de diseño. */
const FRAME =
  "relative w-full overflow-hidden rounded-xl border border-hairline aspect-[4/3] sm:aspect-[3/2]";

const FOCUS =
  "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-green";

/* ── Sin fotografía ─────────────────────────────────────────────────────── */

function EmptyState({ productName, highlights = [] }: { productName: string; highlights?: Highlight[] }) {
  return (
    <div className={`${FRAME} bg-surface-2`}>
      {/* Trama de plano de obra: dos gradientes, sin imagen que descargar. */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.55]"
        style={{
          backgroundImage:
            "linear-gradient(to right, var(--hairline) 1px, transparent 1px), linear-gradient(to bottom, var(--hairline) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
        }}
      />
      <div className="relative flex h-full flex-col items-center justify-center gap-3 px-5 py-6 text-center">
        <span className="flex size-12 items-center justify-center rounded-full bg-surface shadow-xs">
          <ImageIcon className="size-5 text-brand-green" aria-hidden="true" />
        </span>
        <div>
          <p className="font-heading text-base font-semibold text-foreground">
            Fotografía en preparación
          </p>
          <p className="mt-0.5 text-sm text-muted-foreground">
            {productName} · pídenos fotos reales del modelo
          </p>
        </div>

        {highlights.length > 0 && (
          <dl className="mt-1 flex flex-wrap items-stretch justify-center gap-2">
            {highlights.map((h) => (
              <div
                key={h.label}
                className="min-w-[7.5rem] rounded-lg border border-hairline bg-surface px-3 py-2 text-left"
              >
                <dt className="text-2xs font-semibold uppercase text-muted-foreground">
                  {h.label}
                </dt>
                <dd className="mt-0.5 text-sm font-semibold text-foreground">{h.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>
    </div>
  );
}

/* ── Galería ────────────────────────────────────────────────────────────── */

export function ProductGallery({ images, productName, highlights }: ProductGalleryProps) {
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  // Sólo se monta lo que se ha pedido ver; empieza con la primera.
  const [mounted, setMounted] = useState<number[]>([0]);
  const openerRef = useRef<HTMLButtonElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const touchX = useRef<number | null>(null);

  const total = images.length;

  const goTo = useCallback(
    (next: number) => {
      if (total === 0) return;
      const target = ((next % total) + total) % total;
      setIndex(target);
      // La siguiente y la anterior se precargan: navegar no debe esperar a la red.
      setMounted((prev) => {
        const wanted = [target, (target + 1) % total, (target - 1 + total) % total];
        const missing = wanted.filter((i) => !prev.includes(i));
        return missing.length > 0 ? [...prev, ...missing] : prev;
      });
    },
    [total],
  );

  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  const next = useCallback(() => goTo(index + 1), [goTo, index]);

  // El foco vuelve al botón que abrió la ampliación al cerrarla.
  useEffect(() => {
    if (!lightbox) return;
    const opener = openerRef.current ?? (document.activeElement as HTMLElement | null);
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      opener?.focus?.();
    };
  }, [lightbox]);

  useEffect(() => {
    if (!lightbox) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightbox(false);
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, prev, next]);

  if (total === 0) {
    return <EmptyState productName={productName} highlights={highlights} />;
  }

  const current = images[index];
  const multiple = total > 1;

  return (
    <>
      <div className="space-y-2.5">
        <div
          className={`${FRAME} group bg-surface-2`}
          onTouchStart={(e) => {
            touchX.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            if (!multiple || touchX.current === null) return;
            const delta = (e.changedTouches[0]?.clientX ?? 0) - touchX.current;
            if (Math.abs(delta) > 45) (delta < 0 ? next : prev)();
            touchX.current = null;
          }}
        >
          {images.map((img, i) =>
            mounted.includes(i) ? (
              <Image
                key={img.id ?? img.url}
                src={img.url}
                alt={img.alt || `${productName} — imagen ${i + 1} de ${total}`}
                fill
                /* Next 16: `priority` esta obsoleto; `preload` inserta el
                   <link rel=preload> de la unica imagen que se ve al entrar. */
                preload={i === 0}
                loading={i === 0 ? undefined : "lazy"}
                sizes="(max-width: 1024px) 100vw, 640px"
                placeholder="blur"
                blurDataURL={BLUR_PLACEHOLDER}
                className={`object-cover transition-opacity duration-200 ${
                  i === index ? "opacity-100" : "opacity-0"
                }`}
                aria-hidden={i === index ? undefined : true}
              />
            ) : null,
          )}

          {/* La imagen entera amplía: objetivo táctil máximo, no un icono de 24px. */}
          <button
            ref={openerRef}
            type="button"
            onClick={() => setLightbox(true)}
            aria-label={`Ampliar ${productName}, imagen ${index + 1} de ${total}`}
            className={`absolute inset-0 z-10 cursor-zoom-in ${FOCUS}`}
          >
            <span className="absolute top-2.5 right-2.5 flex size-9 items-center justify-center rounded-lg bg-surface/85 text-foreground shadow-xs transition-opacity duration-150 sm:opacity-0 sm:group-hover:opacity-100">
              <ZoomIn className="size-4" aria-hidden="true" />
            </span>
          </button>

          {multiple && (
            <>
              <button
                type="button"
                onClick={prev}
                aria-label="Imagen anterior"
                className={`absolute top-1/2 left-2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg border border-hairline bg-surface/90 text-foreground shadow-sm hover:bg-surface ${FOCUS}`}
              >
                <ChevronLeft className="size-5" aria-hidden="true" />
              </button>
              <button
                type="button"
                onClick={next}
                aria-label="Imagen siguiente"
                className={`absolute top-1/2 right-2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-lg border border-hairline bg-surface/90 text-foreground shadow-sm hover:bg-surface ${FOCUS}`}
              >
                <ChevronRight className="size-5" aria-hidden="true" />
              </button>
              <p className="absolute right-2.5 bottom-2.5 z-20 rounded-md bg-brand-navy/85 px-2 py-0.5 text-2xs font-semibold text-on-dark tabular-nums">
                {index + 1} / {total}
              </p>
            </>
          )}
        </div>

        {multiple && (
          <ul className="flex gap-2 overflow-x-auto pb-1" aria-label="Miniaturas del producto">
            {images.map((img, i) => (
              <li key={img.id ?? img.url}>
                <button
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Ver imagen ${i + 1} de ${total}`}
                  aria-current={i === index ? "true" : undefined}
                  className={`relative block size-16 shrink-0 overflow-hidden rounded-lg border-2 transition-colors duration-150 sm:size-20 ${FOCUS} ${
                    i === index
                      ? "border-brand-green"
                      : "border-hairline hover:border-brand-green/60"
                  }`}
                >
                  <Image
                    src={img.url}
                    alt=""
                    fill
                    sizes="80px"
                    loading="lazy"
                    placeholder="blur"
                    blurDataURL={BLUR_PLACEHOLDER}
                    className="object-cover"
                  />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {lightbox && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`${productName} — imagen ampliada`}
          onClick={(e) => {
            if (e.target === e.currentTarget) setLightbox(false);
          }}
          className="fixed inset-0 z-200 flex flex-col items-center justify-center gap-3 bg-brand-navy-deep/95 p-4 sm:p-8"
        >
          <button
            ref={closeRef}
            type="button"
            onClick={() => setLightbox(false)}
            aria-label="Cerrar imagen ampliada"
            className={`absolute top-4 right-4 flex size-11 items-center justify-center rounded-lg text-on-dark hover:bg-on-dark/15 ${FOCUS}`}
          >
            <X className="size-6" aria-hidden="true" />
          </button>

          <div className="relative h-[70vh] w-full max-w-4xl">
            <Image
              src={current.url}
              alt={current.alt || `${productName} — imagen ${index + 1} de ${total}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {multiple && (
            <div className="flex w-full max-w-4xl items-center justify-between">
              <button
                type="button"
                onClick={prev}
                aria-label="Imagen anterior"
                className={`flex size-11 items-center justify-center rounded-lg text-on-dark hover:bg-on-dark/15 ${FOCUS}`}
              >
                <ChevronLeft className="size-6" aria-hidden="true" />
              </button>
              <p className="text-sm text-on-dark-soft tabular-nums">
                {index + 1} / {total}
              </p>
              <button
                type="button"
                onClick={next}
                aria-label="Imagen siguiente"
                className={`flex size-11 items-center justify-center rounded-lg text-on-dark hover:bg-on-dark/15 ${FOCUS}`}
              >
                <ChevronRight className="size-6" aria-hidden="true" />
              </button>
            </div>
          )}
        </div>
      )}
    </>
  );
}
