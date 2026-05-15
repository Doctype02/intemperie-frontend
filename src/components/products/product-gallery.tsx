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
      <div className="aspect-square bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center">
        <div className="text-center text-green-700">
          <div className="w-20 h-20 mx-auto mb-3 rounded-full bg-green-200 flex items-center justify-center">
            <span className="text-3xl font-bold">{productName.charAt(0)}</span>
          </div>
          <span className="text-sm">{productName}</span>
        </div>
      </div>
    );
  }

  const prev = () => {
    setActiveIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const next = () => {
    setActiveIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  return (
    <div className="space-y-4">
      <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden">
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
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={prev}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white"
              onClick={next}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, i) => (
            <button
              key={img.id}
              onClick={() => setActiveIndex(i)}
              className={`w-16 h-16 rounded-md overflow-hidden border-2 shrink-0 transition-colors relative ${
                i === activeIndex ? "border-green-700" : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} ${i + 1}`}
                fill
                sizes="64px"
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
