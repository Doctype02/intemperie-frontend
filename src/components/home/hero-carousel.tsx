"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    image:    "/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg",
    badge:    "Más popular",
    title:    "Cerca PVC Afrodita 401",
    subtitle: "Elegancia y seguridad para residencias y urbanizaciones",
    href:     "/productos/cerca-pvc-afrodita-401",
  },
  {
    image:    "/products/cerca-pvc-atenea-303/1-.jpg",
    badge:    "Alta resistencia",
    title:    "Cerca PVC Atenea 303",
    subtitle: "3 rieles de PVC — robustez industrial con acabado premium",
    href:     "/productos/cerca-pvc-atenea-303",
  },
  {
    image:    "/products/cerca-pvc-poseidon-502/1-pagina-principal.jpg",
    badge:    "Anti-salitre",
    title:    "Cerca PVC Poseidón 502",
    subtitle: "Diseñada para zonas costeras y ambientes de alta humedad",
    href:     "/productos/cerca-pvc-poseidon-502",
  },
  {
    image:    "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg",
    badge:    "Línea premium",
    title:    "Cerca PVC Vesta 601",
    subtitle: "El tope de gama para proyectos residenciales exclusivos",
    href:     "/productos/cerca-pvc-vesta-601",
  },
];

export function HeroCarousel() {
  const [cur,      setCur]      = useState(0);
  const [autoplay, setAutoplay] = useState(true);

  const next = useCallback(() => setCur((c) => (c + 1) % slides.length), []);
  const prev = useCallback(() => setCur((c) => (c - 1 + slides.length) % slides.length), []);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [autoplay, next]);

  const go = (i: number) => { setAutoplay(false); setCur(i); };

  return (
    <section className="relative overflow-hidden bg-gray-900 h-[280px] sm:h-[380px] lg:h-[480px] xl:h-[520px]">
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== cur}
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === cur ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <Image
            src={s.image}
            alt={s.title}
            fill
            priority={i === 0}
            sizes="100vw"
            className="object-cover object-center"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/30 to-transparent" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-7xl w-full px-6 sm:px-10">
          <div className="max-w-lg sm:max-w-xl">
            <span className="inline-block rounded-full bg-green-600 px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-white mb-3 sm:mb-4">
              {slides[cur].badge}
            </span>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold leading-[1.1] text-white">
              {slides[cur].title}
            </h1>
            <p className="mt-2 sm:mt-3 text-sm sm:text-base text-white/75 leading-relaxed">
              {slides[cur].subtitle}
            </p>
            <div className="mt-5 sm:mt-7 flex flex-wrap gap-3">
              <Link
                href={slides[cur].href}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-extrabold text-gray-900 hover:bg-gray-100 transition-colors shadow-lg"
              >
                Ver producto <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/40 px-5 sm:px-6 py-2.5 sm:py-3 text-sm font-semibold text-white hover:bg-white/10 transition-colors"
              >
                Ver catálogo
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Arrows */}
      <button
        onClick={() => { setAutoplay(false); prev(); }}
        aria-label="Anterior"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => { setAutoplay(false); next(); }}
        aria-label="Siguiente"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2 items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Ir a slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${
              i === cur ? "bg-white w-6 h-2" : "bg-white/45 w-2 h-2 hover:bg-white/75"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
