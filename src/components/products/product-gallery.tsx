"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, X, ZoomIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BLUR_PLACEHOLDER } from "@/lib/image-utils";
import { useImageOnLoad } from "@/lib/image-load-context";
import type { ProductImage } from "@/types";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
}

export function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const onLoad = useImageOnLoad();

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (lightboxOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [lightboxOpen]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (!lightboxOpen) return;
      if (e.key === "ArrowLeft")  prev();
      if (e.key === "ArrowRight") next();
      if (e.key === "Escape")     setLightboxOpen(false);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, images.length]);

  if (images.length === 0) {
    return (
      <div className="rounded-2xl border border-gray-100 bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center h-56 sm:h-72 lg:h-96">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-white shadow-sm flex items-center justify-center">
            <span className="text-3xl font-bold text-green-600">{productName.charAt(0)}</span>
          </div>
          <span className="text-sm font-medium text-green-700">{productName}</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-3">
        {/* Main image */}
        <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 h-56 sm:h-72 lg:h-96 group cursor-zoom-in">
          <Image
            src={images[activeIndex].url}
            alt={images[activeIndex].alt || `${productName} — imagen ${activeIndex + 1}`}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 66vw"
            className="object-cover"
            placeholder="blur"
            blurDataURL={BLUR_PLACEHOLDER}
            onLoad={onLoad}
            onClick={() => setLightboxOpen(true)}
          />

          {/* Zoom hint */}
          <button
            onClick={() => setLightboxOpen(true)}
            aria-label="Ver imagen ampliada"
            className="absolute top-2.5 right-2.5 bg-white/80 hover:bg-white text-gray-700 rounded-lg p-1.5 opacity-0 group-hover:opacity-100 transition-opacity shadow-sm"
          >
            <ZoomIn className="h-4 w-4" />
          </button>

          {images.length > 1 && (
            <>
              <Button
                variant="outline"
                size="icon"
                aria-label="Imagen anterior"
                className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md border-gray-200 rounded-xl h-10 w-10"
                onClick={prev}
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                aria-label="Imagen siguiente"
                className="absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md border-gray-200 rounded-xl h-10 w-10"
                onClick={next}
              >
                <ChevronRight className="h-5 w-5" />
              </Button>
            </>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveIndex(i)}
                  aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                  aria-current={i === activeIndex ? "true" : undefined}
                  className={`w-2 h-2 rounded-full transition-all ${
                    i === activeIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-1 snap-x scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={img.id || i}
                onClick={() => setActiveIndex(i)}
                aria-label={`Ver imagen ${i + 1} de ${images.length}`}
                aria-current={i === activeIndex ? "true" : undefined}
                className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 snap-start transition-all relative ${
                  i === activeIndex ? "border-green-500 ring-2 ring-green-200" : "border-gray-100 hover:border-green-300"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.alt || `${productName} — miniatura ${i + 1}`}
                  fill
                  sizes="80px"
                  className="object-cover"
                  placeholder="blur"
                  blurDataURL={BLUR_PLACEHOLDER}
                  onLoad={onLoad}
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Lightbox dialog */}
      <dialog
        ref={dialogRef}
        onClick={(e) => { if (e.target === dialogRef.current) setLightboxOpen(false); }}
        className="fixed inset-0 z-[200] m-0 h-full w-full max-w-none max-h-none bg-transparent backdrop:bg-black/90 p-4 sm:p-8 flex items-center justify-center open:flex"
      >
        <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Close */}
          <button
            onClick={() => setLightboxOpen(false)}
            aria-label="Cerrar imagen"
            className="absolute -top-10 right-0 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-7 w-7" />
          </button>

          {/* Image */}
          <div className="relative flex-1 min-h-0 rounded-xl overflow-hidden bg-black" style={{ height: "80vh" }}>
            <Image
              src={images[activeIndex].url}
              alt={images[activeIndex].alt || `${productName} — imagen ${activeIndex + 1}`}
              fill
              sizes="100vw"
              className="object-contain"
            />
          </div>

          {/* Lightbox nav */}
          {images.length > 1 && (
            <div className="flex items-center justify-between mt-4">
              <button onClick={prev} aria-label="Imagen anterior" className="text-white/70 hover:text-white transition-colors">
                <ChevronLeft className="h-8 w-8" />
              </button>
              <p className="text-white/60 text-sm">{activeIndex + 1} / {images.length}</p>
              <button onClick={next} aria-label="Imagen siguiente" className="text-white/70 hover:text-white transition-colors">
                <ChevronRight className="h-8 w-8" />
              </button>
            </div>
          )}
        </div>
      </dialog>
    </>
  );
}
