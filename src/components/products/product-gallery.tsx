"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const onLoad = useImageOnLoad();

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

  const prev = () => setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  const next = () => setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));

  return (
    <div className="space-y-3">
      <div className="relative rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 h-56 sm:h-72 lg:h-96">
        <Image
          src={images[activeIndex].url}
          alt={images[activeIndex].alt || productName}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
          placeholder="blur"
          blurDataURL={BLUR_PLACEHOLDER}
          onLoad={onLoad}
        />
        {images.length > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white shadow-md border-gray-200 rounded-xl h-10 w-10"
              onClick={prev}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              size="icon"
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
                className={`w-2 h-2 rounded-full transition-all ${
                  i === activeIndex ? "bg-white scale-110" : "bg-white/50 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 snap-x">
          {images.map((img, i) => (
            <button
              key={img.id || i}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 shrink-0 snap-start transition-all relative ${
                i === activeIndex ? "border-green-500 ring-2 ring-green-200" : "border-gray-100 hover:border-green-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
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
  );
}
