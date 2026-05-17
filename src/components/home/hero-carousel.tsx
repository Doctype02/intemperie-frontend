"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    image: "/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg",
    badge: "Más popular",
    title: "Cerca PVC\nAfrodita 401",
    subtitle: "Elegancia y seguridad para residencias y urbanizaciones",
    cta: "Ver producto",
    href: "/productos/cerca-pvc-afrodita-401",
    overlay: "from-black/75 via-black/40 to-transparent",
  },
  {
    image: "/products/cerca-pvc-atenea-303/1-.jpg",
    badge: "3 rieles — Alta resistencia",
    title: "Cerca PVC\nAtenea 303",
    subtitle: "Robustez industrial con acabado estético premium",
    cta: "Ver producto",
    href: "/productos/cerca-pvc-atenea-303",
    overlay: "from-black/70 via-black/35 to-transparent",
  },
  {
    image: "/products/cerca-pvc-poseidon-502/1-pagina-principal.jpg",
    badge: "Anti-salitre",
    title: "Cerca PVC\nPoseidón 502",
    subtitle: "Diseñada para zonas costeras y ambientes de alta humedad",
    cta: "Ver producto",
    href: "/productos/cerca-pvc-poseidon-502",
    overlay: "from-black/70 via-black/35 to-transparent",
  },
  {
    image: "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg",
    badge: "Línea premium",
    title: "Cerca PVC\nVesta 601",
    subtitle: "El tope de gama para proyectos residenciales de alto nivel",
    cta: "Ver producto",
    href: "/productos/cerca-pvc-vesta-601",
    overlay: "from-black/70 via-black/35 to-transparent",
  },
];

export function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const next = useCallback(() => setCurrent((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [autoplay, next]);

  const go = (i: number) => { setAutoplay(false); setCurrent(i); };

  return (
    <section className="relative overflow-hidden bg-gray-900 h-[360px] sm:h-[440px] lg:h-[520px]">
      {slides.map((s, i) => (
        <div
          key={i}
          className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <Image
            src={s.image}
            alt={s.title.replace("\n", " ")}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover"
          />
          <div className={`absolute inset-0 bg-gradient-to-r ${s.overlay}`} />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-7xl px-6 sm:px-8 h-full flex items-center">
        <div className="max-w-xl text-white">
          <span className="inline-block rounded-full bg-green-500/90 px-3 py-1 text-xs font-bold uppercase tracking-widest mb-4">
            {slides[current].badge}
          </span>
          <h1 className="text-3xl sm:text-4xl lg:text-[3.25rem] font-extrabold leading-[1.1] mb-3 whitespace-pre-line">
            {slides[current].title}
          </h1>
          <p className="text-sm sm:text-base text-white/80 mb-7 leading-relaxed">
            {slides[current].subtitle}
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href={slides[current].href}
              className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-extrabold text-gray-900 hover:bg-gray-100 transition-colors shadow-lg"
            >
              {slides[current].cta} <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-6 py-3 text-sm font-bold text-white hover:bg-white/10 transition-colors"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>

      {/* Prev / Next */}
      <button
        onClick={() => { setAutoplay(false); prev(); }}
        aria-label="Anterior"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => { setAutoplay(false); next(); }}
        aria-label="Siguiente"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 flex h-10 w-10 items-center justify-center rounded-full bg-black/30 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === current ? "bg-white w-6 h-2" : "bg-white/50 w-2 h-2 hover:bg-white/80"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
