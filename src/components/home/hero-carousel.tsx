"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";

const slides = [
  {
    image:     "/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg",
    badge:     "Más popular",
    title:     "Cerca PVC Afrodita 401",
    subtitle:  "Elegancia y seguridad para residencias y urbanizaciones",
    price:     "Desde $18.50/m",
    guarantee: "Garantía 15 años",
    href:      "/productos/cerca-pvc-afrodita-401",
  },
  {
    image:     "/products/cerca-pvc-atenea-303/1-.jpg",
    badge:     "Alta resistencia",
    title:     "Cerca PVC Atenea 303",
    subtitle:  "3 rieles de PVC — robustez industrial con acabado premium",
    price:     "Desde $22.00/m",
    guarantee: "Entrega inmediata",
    href:      "/productos/cerca-pvc-atenea-303",
  },
  {
    image:     "/products/cerca-pvc-poseidon-502/1-pagina-principal.jpg",
    badge:     "Anti-salitre",
    title:     "Cerca PVC Poseidón 502",
    subtitle:  "Diseñada para zonas costeras y ambientes de alta humedad",
    price:     "Desde $20.00/m",
    guarantee: "100% libre de óxido",
    href:      "/productos/cerca-pvc-poseidon-502",
  },
  {
    image:     "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg",
    badge:     "Línea premium",
    title:     "Cerca PVC Vesta 601",
    subtitle:  "El tope de gama para proyectos residenciales exclusivos",
    price:     "Desde $28.00/m",
    guarantee: "Diseño exclusivo",
    href:      "/productos/cerca-pvc-vesta-601",
  },
];

/**
 * Estado del carrusel. `mounted` decide qué diapositivas tienen <img> en el DOM.
 *
 * Las 4 diapositivas son `absolute inset-0`: aunque 3 estén a `opacity-0`,
 * ocupan el viewport completo, así que el lazy-loading nativo las considera
 * visibles y el navegador las descargaba las 4 de golpe (~404 KB de los 457 KB
 * del primer viewport a 1440px, medido en producción).
 */
interface SlideState {
  cur:     number;
  /** Índices ya montados. Una diapositiva nunca se desmonta: el fundido de
   *  salida dura 700 ms y necesita que la imagen saliente siga ahí. */
  mounted: number[];
}

/** Muestra la diapositiva `i` y deja precargada la siguiente. */
function show(s: SlideState, i: number): SlideState {
  const want   = [i, (i + 1) % slides.length];
  const mounted = want.every((x) => s.mounted.includes(x))
    ? s.mounted
    : [...new Set([...s.mounted, ...want])];
  return s.cur === i && mounted === s.mounted ? s : { cur: i, mounted };
}

export function HeroCarousel() {
  /* En el render inicial (y en SSR) solo se monta la diapositiva 0: es la única
   * visible y la única que debe competir por ancho de banda con el LCP. */
  const [{ cur, mounted }, setSlide] = useState<SlideState>({ cur: 0, mounted: [0] });
  const [autoplay, setAutoplay] = useState(true);

  const next = useCallback(() => setSlide((s) => show(s, (s.cur + 1) % slides.length)), []);
  const prev = useCallback(() => setSlide((s) => show(s, (s.cur - 1 + slides.length) % slides.length)), []);

  useEffect(() => {
    if (!autoplay) return;
    const id = setInterval(next, 5500);
    return () => clearInterval(id);
  }, [autoplay, next]);

  /* Una vez cargada la página, se precarga la diapositiva 2 — la que el
   * autoplay necesita a los 5.5 s — fuera de la ruta crítica del LCP. */
  useEffect(() => {
    let timer = 0;
    const arm = () => {
      timer = window.setTimeout(() => setSlide((s) => show(s, s.cur)), 200);
    };
    if (document.readyState === "complete") arm();
    else window.addEventListener("load", arm, { once: true });
    return () => {
      window.removeEventListener("load", arm);
      window.clearTimeout(timer);
    };
  }, []);

  const go = (i: number) => { setAutoplay(false); setSlide((s) => show(s, i)); };

  return (
    <section
      className="relative overflow-hidden bg-brand-navy-deep h-[300px] sm:h-[420px] lg:h-[540px] xl:h-[600px]"
      aria-label="Productos destacados"
      aria-roledescription="carrusel"
      onMouseEnter={() => setAutoplay(false)}
      onMouseLeave={() => setAutoplay(true)}
      onFocusCapture={() => setAutoplay(false)}
      onBlurCapture={() => setAutoplay(true)}
    >
      {/* Slides */}
      {slides.map((s, i) => (
        <div
          key={i}
          aria-hidden={i !== cur}
          aria-roledescription="diapositiva"
          className={`absolute inset-0 transition-opacity duration-700 ${
            i === cur ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {mounted.includes(i) && (
            <Image
              src={s.image}
              alt={s.title}
              fill
              /* `priority` quedó obsoleto en Next 16 a favor de `preload`. */
              preload={i === 0}
              sizes="100vw"
              className="object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/75 via-black/40 to-black/10" />
        </div>
      ))}

      {/* Content */}
      <div className="relative z-10 h-full flex items-center">
        <div className="mx-auto max-w-7xl w-full px-6 sm:px-10">
          <div className="max-w-lg sm:max-w-xl">
            <span className="inline-block rounded-full bg-brand-green px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-white mb-3 sm:mb-4">
              {slides[cur].badge}
            </span>
            <h1 className="text-2xl sm:text-4xl lg:text-5xl xl:text-6xl font-black leading-[1.05] tracking-tight text-white">
              {slides[cur].title}
            </h1>
            <p className="mt-3 sm:mt-4 text-sm sm:text-lg text-white/75 leading-relaxed max-w-md">
              {slides[cur].subtitle}
            </p>
            {/* Price + guarantee pill */}
            <div className="mt-3 sm:mt-4 flex items-center gap-3 flex-wrap">
              <span className="text-xl sm:text-2xl font-black text-white">
                {slides[cur].price}
              </span>
              <span className="text-xs sm:text-sm font-semibold text-on-dark-soft border-l border-white/20 pl-3">
                {slides[cur].guarantee}
              </span>
            </div>
            <div className="mt-5 sm:mt-7 flex flex-wrap gap-3">
              <Link
                href={slides[cur].href}
                className="inline-flex items-center gap-2 rounded-xl bg-white px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-extrabold text-foreground hover:bg-surface-2 transition-colors shadow-xl"
              >
                Ver producto <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/productos"
                className="inline-flex items-center gap-2 rounded-xl border-2 border-white/50 bg-white/5 px-5 sm:px-7 py-3 sm:py-3.5 text-sm sm:text-base font-bold text-white hover:bg-white/15 transition-colors backdrop-blur-sm"
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
        aria-label="Diapositiva anterior"
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ChevronLeft className="h-5 w-5" />
      </button>
      <button
        onClick={() => { setAutoplay(false); next(); }}
        aria-label="Siguiente diapositiva"
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 z-20 flex h-9 w-9 sm:h-11 sm:w-11 items-center justify-center rounded-full bg-black/25 text-white hover:bg-black/50 transition-colors backdrop-blur-sm"
      >
        <ChevronRight className="h-5 w-5" />
      </button>

      {/* Dots — expanded tap target via padding wrapper */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => go(i)}
            aria-label={`Ir a diapositiva ${i + 1}`}
            aria-current={i === cur ? "true" : undefined}
            className="p-2"
          >
            <span
              className={`block rounded-full transition-all duration-300 ${
                i === cur ? "bg-white w-6 h-2" : "bg-white/45 w-2 h-2 hover:bg-white/75"
              }`}
            />
          </button>
        ))}
      </div>
    </section>
  );
}
