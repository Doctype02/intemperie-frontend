"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { ProductImage } from "@/types";

interface CarouselProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  unit: string;
  stock: number;
  isNew?: boolean;
  category?: { name: string };
  collection?: { name: string };
  images?: ProductImage[];
}

interface ProductCarouselProps {
  title: string;
  subtitle?: string;
  products: CarouselProduct[];
  viewAllHref?: string;
  accentColor?: string;
}

export function ProductCarousel({
  title,
  subtitle,
  products,
  viewAllHref = "/productos",
  accentColor = "text-green-600",
}: ProductCarouselProps) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth;
    ref.current.scrollBy({ left: dir === "left" ? -w * 0.75 : w * 0.75, behavior: "smooth" });
  };

  if (products.length === 0) return null;

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
          <Link
            href={viewAllHref}
            className={`hidden sm:flex items-center gap-1 text-sm font-bold ${accentColor} hover:opacity-80 transition-opacity`}
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="relative">
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="absolute -left-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>

          <div
            ref={ref}
            className="flex gap-3 sm:gap-4 overflow-x-auto pb-1 scrollbar-hide"
            style={{ scrollSnapType: "x mandatory" }}
          >
            {products.map((p) => (
              <div
                key={p.id}
                className="flex-none w-[200px] sm:w-[230px] lg:w-[255px]"
                style={{ scrollSnapAlign: "start" }}
              >
                <ProductCard {...p} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            aria-label="Siguiente"
            className="absolute -right-3 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        <div className="mt-5 text-center sm:hidden">
          <Link
            href={viewAllHref}
            className="inline-flex items-center gap-1.5 rounded-full border-2 border-green-200 px-5 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
