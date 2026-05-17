import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCarousel } from "@/components/home/product-carousel";
import type { CarouselProduct } from "@/components/home/product-carousel";

/* ── Types ───────────────────────────────────────────────────────────────── */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ApiProduct = Record<string, any>;

/* ── Data fetching ────────────────────────────────────────────────────────── */
async function getProducts(): Promise<ApiProduct[]> {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res  = await fetch(`${base}/products?limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.data ?? data ?? []) as ApiProduct[];
  } catch {
    return [];
  }
}

function normalizeProduct(p: ApiProduct): CarouselProduct {
  const isNew = p.createdAt
    ? Date.now() - new Date(p.createdAt).getTime() < 90 * 24 * 60 * 60 * 1000
    : false;
  return {
    id:           String(p.id ?? ""),
    name:         String(p.name ?? ""),
    slug:         String(p.slug ?? ""),
    basePrice:    Number(p.pricePerMeter ?? p.basePrice ?? 0),
    comparePrice: p.comparePrice ? Number(p.comparePrice) : undefined,
    unit:         String(p.unit ?? "METRO"),
    stock:        Number(p.stock ?? 0),
    isNew,
    reviewCount:  p.reviewCount ? Number(p.reviewCount) : undefined,
    rating:       p.rating      ? Number(p.rating)      : undefined,
    sku:          p.sku         ? String(p.sku)          : undefined,
    category:     p.category    ? { name: String(p.category.name ?? "") } : undefined,
    collection:   p.collection  ? { name: String(p.collection.name ?? "") } : undefined,
    images:       Array.isArray(p.images) ? p.images : [],
  };
}

/* ── Utility sub-components ──────────────────────────────────────────────── */
function SectionHead({
  title, sub, href,
}: {
  title: string;
  sub?: string;
  href?: string;
}) {
  return (
    <div className="flex items-end justify-between mb-5">
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
          {title}
        </h2>
        {sub && (
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{sub}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700 transition-colors shrink-0"
        >
          Ver todo <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/* ── Section 3: Category Visual Cards ───────────────────────────────────── */
function CategoryCards() {
  const cats = [
    {
      name: "Residencial",
      slug: "residencial",
      img:  "/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg",
    },
    {
      name: "Industrial",
      slug: "industrial",
      img:  "/products/cerca-pvc-atenea-303/6.jpg",
    },
    {
      name: "Zonas Costeras",
      slug: "zonas-costeras",
      img:  "/products/cerca-pvc-poseidon-502/2.jpg",
    },
    {
      name: "Gubernamental",
      slug: "gubernamental",
      img:  "/products/cerca-pvc-atenea-305/4.jpg",
    },
    {
      name: "Agropecuario",
      slug: "agropecuario",
      img:  "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg",
    },
  ];

  return (
    <section className="bg-white py-6 sm:py-8 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead title="Explorar por uso" href="/productos" />
        {/* 5 cols desktop, horizontal scroll mobile */}
        <div className="flex gap-2 sm:gap-3 overflow-x-auto scrollbar-hide snap-x snap-mandatory sm:grid sm:grid-cols-5">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/productos?category=${c.slug}`}
              className="group relative flex-none w-[140px] sm:w-auto overflow-hidden rounded-2xl aspect-[2/3] shadow-sm hover:shadow-lg transition-all duration-300 snap-start"
            >
              <Image
                src={c.img}
                alt={c.name}
                fill
                sizes="(max-width: 640px) 140px, 20vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 text-center">
                <p className="text-white font-extrabold text-[10px] sm:text-xs leading-tight">
                  {c.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 5: Trust Logos Strip ────────────────────────────────────────── */
function TrustLogosStrip() {
  const items = [
    { icon: "🛡️", label: "Garantía 15 años" },
    { icon: "🏆", label: "+15,000 proyectos" },
    { icon: "🚚", label: "Envío a todo Panamá" },
    { icon: "🌎", label: "10+ países" },
    { icon: "🔧", label: "Instalación incluida" },
    { icon: "✅", label: "100% Satisfacción" },
  ];

  return (
    <section className="bg-gray-50 border-y border-gray-200 py-4 sm:py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-5 sm:gap-8 min-w-max mx-auto sm:justify-center">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-2 shrink-0">
              {i > 0 && (
                <span className="hidden sm:block text-gray-300 text-lg select-none" aria-hidden="true">|</span>
              )}
              <span className="text-lg sm:text-xl" aria-hidden="true">{item.icon}</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 7: Promo Banner — Calculadora ───────────────────────────────── */
function CalculadoraBanner() {
  return (
    <div className="bg-gradient-to-r from-green-800 via-green-700 to-emerald-600 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
        <div className="flex-1 text-white min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-green-200 mb-2">
            Herramienta exclusiva
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
            Calcula el costo de tu proyecto
          </h2>
          <p className="mt-3 text-sm sm:text-base text-green-100/80 leading-relaxed max-w-sm">
            Elige el modelo, ingresa los metros lineales y obtén tu presupuesto
            en segundos. Sin compromiso.
          </p>
          <Link
            href="/calculadora"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-white text-gray-900 px-6 py-3 text-sm font-extrabold hover:bg-gray-50 transition-colors shadow-lg"
          >
            Abrir calculadora <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative w-full sm:w-72 lg:w-96 h-48 sm:h-56 lg:h-64 rounded-2xl overflow-hidden shrink-0 shadow-2xl">
          <Image
            src="/products/cerca-pvc-atenea-305/2.jpg"
            alt="Calculadora de cercas PVC"
            fill
            sizes="(max-width: 640px) 100vw, 384px"
            className="object-cover"
          />
        </div>
      </div>
    </div>
  );
}

/* ── Section 10: Featured Collections Grid ───────────────────────────────── */
function FeaturedCollectionsGrid() {
  const items = [
    {
      img:   "/products/cerca-pvc-atenea-303/1-.jpg",
      label: "Cerca PVC Industrial",
      name:  "Atenea 303 — 3 rieles",
      href:  "/productos/cerca-pvc-atenea-303",
      big:   true,
    },
    {
      img:   "/products/cerca-pvc-poseidon-502/1-pagina-principal.jpg",
      label: "Anti-salitre",
      name:  "Poseidón 502",
      href:  "/productos/cerca-pvc-poseidon-502",
      big:   false,
    },
    {
      img:   "/products/cerca-pvc-afrodita-401/3.jpg",
      label: "Línea Residencial",
      name:  "Afrodita 401",
      href:  "/productos/cerca-pvc-afrodita-401",
      big:   false,
    },
    {
      img:   "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg",
      label: "Línea Premium",
      name:  "Vesta 601",
      href:  "/productos/cerca-pvc-vesta-601",
      big:   true,
    },
  ];

  return (
    <section className="bg-white py-8 sm:py-12 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead
          title="Colecciones destacadas"
          sub="Diseños que combinan resistencia y elegancia"
          href="/productos"
        />
        {/*
          On desktop: 4-col grid with row-span-2 for big items → masonry effect.
          On mobile: simple 2-col grid.
        */}
        <div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4"
          style={{ gridTemplateRows: "200px 200px" }}
        >
          {items.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className={`group relative overflow-hidden rounded-2xl shadow hover:shadow-xl transition-all duration-300 ${
                c.big ? "sm:row-span-2" : ""
              }`}
            >
              <Image
                src={c.img}
                alt={c.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-green-400">
                  {c.label}
                </p>
                <p className="text-sm sm:text-base font-extrabold mt-0.5 leading-tight">{c.name}</p>
                <span className="mt-1.5 inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-white/80 group-hover:gap-2 transition-all">
                  Ver producto <ArrowRight className="h-3 w-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 11: Collections Band ───────────────────────────────────────── */
function CollectionsBand() {
  const chips = [
    { label: "Cercas Residenciales",   href: "/productos?category=residencial" },
    { label: "Cercas Industriales",    href: "/productos?category=industrial" },
    { label: "Zonas Costeras",         href: "/productos?category=zonas-costeras" },
    { label: "Mallas Electrosoldadas", href: "/productos?category=industrial" },
    { label: "Uso Gubernamental",      href: "/productos?category=gubernamental" },
    { label: "Uso Agropecuario",       href: "/productos?category=agropecuario" },
    { label: "Anti-salitre",           href: "/productos?category=zonas-costeras" },
    { label: "Portones PVC",           href: "/productos" },
  ];

  return (
    <section className="bg-gray-50 border-b border-gray-100 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-4">
          Colecciones Destacadas
        </h2>
        <div className="flex gap-2.5 sm:gap-3 overflow-x-auto scrollbar-hide pb-1">
          {chips.map((chip) => (
            <Link
              key={chip.label}
              href={chip.href}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:border-green-400 hover:bg-green-50 hover:text-green-700 transition-all duration-200 shadow-sm"
            >
              {chip.label}
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" aria-hidden="true" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 12: Blog Section ────────────────────────────────────────────── */
interface BlogPost {
  title:    string;
  img:      string;
  cat:      string;
  date:     string;
  excerpt:  string;
  href:     string;
}

const blogPosts: BlogPost[] = [
  {
    title:   "5 razones para elegir PVC sobre madera",
    img:     "/products/cerca-pvc-afrodita-401/6.jpg",
    cat:     "Guías",
    date:    "15 May 2026",
    excerpt: "Descubre por qué el PVC supera a la madera en durabilidad, mantenimiento y costo a largo plazo.",
    href:    "#",
  },
  {
    title:   "Cómo instalar tu cerca en zona costera",
    img:     "/products/cerca-pvc-poseidon-502/5.jpg",
    cat:     "Instalación",
    date:    "2 Abr 2026",
    excerpt: "Guía paso a paso para instalar cercas resistentes al salitre y la humedad en ambientes costeros.",
    href:    "#",
  },
  {
    title:   "Malla electrosoldada vs cerca PVC: ¿cuál elegir?",
    img:     "/products/cerca-pvc-atenea-303/7.jpg",
    cat:     "Comparativas",
    date:    "18 Mar 2026",
    excerpt: "Analizamos las diferencias clave entre malla electrosoldada y cerca PVC para que tomes la mejor decisión.",
    href:    "#",
  },
];

function BlogSection() {
  return (
    <section className="bg-white py-10 sm:py-14 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-7">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-widest text-green-600 mb-1">
              Artículos
            </p>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 leading-tight">
              Blog Intemperie
            </h2>
          </div>
          <Link
            href="#"
            className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700 transition-colors shrink-0"
          >
            Ver todos <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {/* 3-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {blogPosts.map((post) => (
            <article key={post.title} className="group flex flex-col">
              {/* Image — 3:2 ratio */}
              <Link href={post.href} className="block relative w-full overflow-hidden rounded-2xl bg-gray-100">
                <div className="relative" style={{ paddingBottom: "66.666%" }}>
                  <Image
                    src={post.img}
                    alt={post.title}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
              </Link>

              {/* Content */}
              <div className="flex flex-col flex-1 pt-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-[11px] font-bold text-green-700">
                    {post.cat}
                  </span>
                  <span className="text-xs text-gray-400">{post.date}</span>
                </div>
                <Link href={post.href}>
                  <h3 className="text-base font-extrabold text-gray-900 leading-snug hover:text-green-700 transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                </Link>
                <p className="mt-1.5 text-sm text-gray-500 leading-relaxed line-clamp-2 flex-1">
                  {post.excerpt}
                </p>
                <div className="mt-3 flex items-center gap-2">
                  <div className="h-6 w-6 rounded-full bg-green-600 flex items-center justify-center text-white font-black text-[10px] select-none">
                    I
                  </div>
                  <span className="text-xs font-semibold text-gray-600">Intemperie</span>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Mobile "Ver todos" */}
        <div className="mt-6 text-center sm:hidden">
          <Link
            href="#"
            className="inline-flex items-center gap-1.5 rounded-full border border-green-300 px-5 py-2 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors"
          >
            Ver todos los artículos <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </section>
  );
}

/* ── Section 13: WhatsApp Promo Banner ───────────────────────────────────── */
function WhatsAppBanner() {
  return (
    <div className="bg-gradient-to-r from-gray-950 via-gray-900 to-gray-800 overflow-hidden">
      <div className="mx-auto max-w-7xl px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row-reverse items-center gap-8 sm:gap-12">
        <div className="relative w-full sm:w-72 lg:w-96 h-48 sm:h-56 lg:h-64 rounded-2xl overflow-hidden shrink-0 shadow-2xl">
          <Image
            src="/products/cerca-pvc-afrodita-401/7.jpg"
            alt="Asesoría personalizada por WhatsApp"
            fill
            sizes="(max-width: 640px) 100vw, 384px"
            className="object-cover"
          />
        </div>
        <div className="flex-1 text-white min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
            Atención personalizada
          </p>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold leading-tight">
            Cotiza tu proyecto por WhatsApp
          </h2>
          <p className="mt-3 text-sm sm:text-base text-gray-300 leading-relaxed max-w-sm">
            Un asesor responde en minutos. Medidas, modelos, precios e instalación
            sin compromiso.
          </p>
          <a
            href="https://wa.me/50762874042?text=Hola%2C%20quiero%20cotizar%20una%20cerca%20PVC"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-green-500 text-white px-6 py-3 text-sm font-extrabold hover:bg-green-400 transition-colors shadow-lg"
          >
            Chatear ahora <ArrowRight className="h-4 w-4" />
          </a>
        </div>
      </div>
    </div>
  );
}

/* ── Section 14: Newsletter ──────────────────────────────────────────────── */
function NewsletterSection() {
  return (
    <section className="bg-gray-900 py-12 sm:py-16">
      <div className="mx-auto max-w-lg px-4 sm:px-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-2">
          Mantente informado
        </p>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">
          ¡No te pierdas ninguna novedad!
        </h2>
        <p className="text-sm text-gray-400 mb-7 leading-relaxed">
          Nuevos modelos, precios especiales y proyectos inspiradores directo a tu correo.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="tu@email.com"
            aria-label="Correo electrónico"
            className="flex-1 h-11 rounded-xl border border-gray-700 bg-gray-800 px-4 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
          />
          <button
            type="button"
            className="h-11 px-6 rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-500 transition-colors whitespace-nowrap"
          >
            Suscribirse
          </button>
        </div>
        <p className="mt-3 text-[11px] text-gray-600">Sin spam. Cancela cuando quieras.</p>
      </div>
    </section>
  );
}

/* ── PAGE (Server Component) ─────────────────────────────────────────────── */
export default async function HomePage() {
  const raw      = await getProducts();
  const products = raw.map(normalizeProduct);

  /* Filter by product type */
  const allProds = products;

  const pvcProds = products.filter((p) => {
    const nameLower = p.name.toLowerCase();
    const catName   = p.category?.name ?? "";
    return (
      nameLower.includes("cerca") ||
      nameLower.includes("pvc") ||
      nameLower.includes("afrodita") ||
      nameLower.includes("atenea") ||
      nameLower.includes("pandora") ||
      nameLower.includes("oceanides") ||
      nameLower.includes("poseid") ||
      nameLower.includes("vesta") ||
      nameLower.includes("selene") ||
      nameLower.includes("atlas") ||
      ["Residencial", "Zonas Costeras", "Gubernamental"].includes(catName)
    );
  });

  const mallasProds = products.filter((p) => {
    const nameLower = p.name.toLowerCase();
    const catName   = p.category?.name ?? "";
    return (
      nameLower.includes("malla") ||
      nameLower.includes("titan") ||
      nameLower.includes("maximus") ||
      ["Industrial", "Agropecuario"].includes(catName)
    );
  });

  const newestProds = [...products].reverse().slice(0, 12);

  return (
    <>
      <Header />

      <main>
        {/* 2 — Hero Carousel */}
        <HeroCarousel />

        {/* 3 — Category Visual Cards */}
        <CategoryCards />

        {/* 4 — "Intemperie Picks" — all products */}
        {allProds.length > 0 && (
          <section className="bg-white border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-10">
              <SectionHead
                title="Intemperie Picks"
                sub="Cercas PVC y mallas con entrega inmediata en Panamá"
                href="/productos"
              />
            </div>
            <ProductCarousel
              title=""
              products={allProds}
              viewAllHref="/productos"
              bg="bg-white"
            />
          </section>
        )}

        {/* 5 — Trust Logos Strip */}
        <TrustLogosStrip />

        {/* 6 — Cercas PVC section */}
        {pvcProds.length > 0 && (
          <section className="bg-white border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-10">
              <SectionHead
                title="Cercas PVC"
                sub="Garantía 15 años — seguridad y elegancia sin mantenimiento"
                href="/productos?category=residencial"
              />
            </div>
            <ProductCarousel
              title=""
              products={pvcProds}
              viewAllHref="/productos?category=residencial"
              bg="bg-white"
            />
          </section>
        )}

        {/* 7 — Promo Banner: Calculadora */}
        <CalculadoraBanner />

        {/* 8 — Mallas Electrosoldadas */}
        {mallasProds.length > 0 && (
          <section className="bg-gray-50 border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-10">
              <SectionHead
                title="Mallas Electrosoldadas"
                sub="Alta resistencia para usos industriales y agropecuarios"
                href="/productos?category=industrial"
              />
            </div>
            <ProductCarousel
              title=""
              products={mallasProds}
              viewAllHref="/productos?category=industrial"
              bg="bg-gray-50"
            />
          </section>
        )}

        {/* 9 — Novedades */}
        {newestProds.length > 0 && (
          <section className="bg-white border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-10">
              <SectionHead
                title="Novedades"
                sub="Los últimos modelos incorporados al catálogo"
                href="/productos"
              />
            </div>
            <ProductCarousel
              title=""
              products={newestProds}
              viewAllHref="/productos"
              bg="bg-white"
            />
          </section>
        )}

        {/* 10 — Featured Collections Grid */}
        <FeaturedCollectionsGrid />

        {/* 11 — Collections Band */}
        <CollectionsBand />

        {/* 12 — Blog Section */}
        <BlogSection />

        {/* 13 — WhatsApp Promo Banner */}
        <WhatsAppBanner />

        {/* 14 — Newsletter */}
        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}
