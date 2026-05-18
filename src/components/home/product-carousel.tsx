"use client";

import { useRef } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { ProductCard } from "@/components/products/product-card";
import type { ProductImage } from "@/types";

export interface CarouselProduct {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice?: number;
  unit: string;
  stock: number;
  isNew?: boolean;
  reviewCount?: number;
  rating?: number;
  sku?: string;
  category?: { name: string };
  collection?: { name: string };
  images?: ProductImage[];
}

interface Props {
  title?:       string;
  subtitle?:    string;
  products:     CarouselProduct[];
  viewAllHref?: string;
  bg?:          string;
}

export function ProductCarousel({ title, subtitle, products, viewAllHref = "/productos", bg = "bg-white" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const w = ref.current.offsetWidth;
    ref.current.scrollBy({ left: dir === "left" ? -(w * 0.8) : w * 0.8, behavior: "smooth" });
  };

  if (!products || products.length === 0) return null;

  const hasHeader = Boolean(title);

  return (
    <section className={`${bg} ${hasHeader ? "py-8 sm:py-10" : "pb-8 sm:pb-10"}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6">

        {/* Header — only rendered when a title is provided */}
        {hasHeader && (
          <div className="mb-5 flex items-end justify-between">
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">{title}</h2>
              {subtitle && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{subtitle}</p>}
            </div>
            <Link
              href={viewAllHref}
              className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700 transition-colors shrink-0"
            >
              Ver todos <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        )}

        {/* Track */}
        <div className="relative">
          <button
            onClick={() => scroll("left")}
            aria-label="Anterior"
            className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow hover:shadow-md transition-shadow"
          >
            <ChevronLeft className="h-4 w-4 text-gray-600" />
          </button>

          <div
            ref={ref}
            className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide snap-x snap-mandatory"
          >
            {products.map((p) => (
              <div key={p.id} className="snap-start flex-none w-[calc(50%-6px)] sm:w-[calc(33.333%-8px)] lg:w-[calc(25%-9px)] flex flex-col">
                <ProductCard {...p} />
              </div>
            ))}
          </div>

          <button
            onClick={() => scroll("right")}
            aria-label="Siguiente"
            className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 hidden md:flex h-9 w-9 items-center justify-center rounded-full bg-white border border-gray-200 shadow hover:shadow-md transition-shadow"
          >
            <ChevronRight className="h-4 w-4 text-gray-600" />
          </button>
        </div>

        {/* Mobile "Ver todos" — only when title is present */}
        {hasHeader && (
          <div className="mt-4 text-center sm:hidden">
            <Link
              href={viewAllHref}
              className="inline-flex items-center gap-1.5 rounded-full border border-green-300 px-5 py-2 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors"
            >
              Ver todos <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
