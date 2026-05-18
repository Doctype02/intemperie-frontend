import Image from "next/image";
import Link from "next/link";
import { ArrowRight, ChevronRight, Shield, Award, Truck, Globe, Wrench, CheckCircle2 } from "lucide-react";

function IconWhatsApp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}
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
    <div className="flex items-end justify-between mb-8">
      <div>
        {sub && (
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-2">
            {sub}
          </p>
        )}
        <h2 className="text-3xl sm:text-4xl font-black text-gray-900 leading-[1.05] tracking-tight">
          {title}
        </h2>
        <div className="mt-3 h-[3px] w-10 bg-green-600 rounded-full" aria-hidden="true" />
      </div>
      {href && (
        <Link
          href={href}
          className="hidden sm:flex items-center gap-1.5 text-sm font-bold text-gray-500 hover:text-green-700 transition-colors shrink-0 pb-1 border-b border-transparent hover:border-green-700"
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
              className="group relative flex-none w-[140px] sm:w-auto overflow-hidden rounded-xl aspect-[2/3] shadow-sm hover:shadow-xl transition-all duration-300 snap-start"
            >
              <Image
                src={c.img}
                alt={c.name}
                fill
                sizes="(max-width: 640px) 140px, 20vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 text-center">
                <p className="text-white font-extrabold text-xs sm:text-[13px] leading-tight drop-shadow-sm">
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
    { Icon: Shield,        label: "Garantía 15 años" },
    { Icon: Award,         label: "+15,000 proyectos" },
    { Icon: Truck,         label: "Envío a todo Panamá" },
    { Icon: Globe,         label: "10+ países" },
    { Icon: Wrench,        label: "Instalación incluida" },
    { Icon: CheckCircle2,  label: "100% Satisfacción" },
  ];

  return (
    <section className="bg-gray-950 border-y border-gray-900 py-5 sm:py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-5 sm:gap-8 min-w-max mx-auto sm:justify-center">
          {items.map((item, i) => (
            <div key={item.label} className="flex items-center gap-2 shrink-0">
              {i > 0 && (
                <span className="hidden sm:block text-gray-700 text-sm select-none" aria-hidden="true">|</span>
              )}
              <item.Icon className="h-4 w-4 text-green-400 shrink-0" aria-hidden="true" />
              <span className="text-xs sm:text-sm font-semibold text-gray-300 whitespace-nowrap">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Section 6b: Stats Section ───────────────────────────────────────────── */
function StatsSection() {
  const stats = [
    { value: "15+",   label: "Años de experiencia",        sub: "en el mercado panameño" },
    { value: "15K+",  label: "Proyectos completados",       sub: "residenciales e industriales" },
    { value: "6",     label: "Provincias con cobertura",    sub: "entrega y servicio en todo Panamá" },
    { value: "100%",  label: "Satisfacción garantizada",    sub: "respaldo total al cliente" },
  ];
  return (
    <section className="relative bg-gray-950 py-14 sm:py-20 overflow-hidden">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex items-center justify-center select-none overflow-hidden">
        <span className="text-[160px] sm:text-[240px] font-black text-white/[0.02] tracking-tighter leading-none uppercase whitespace-nowrap">
          INTEMPERIE
        </span>
      </div>
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-14">
          {stats.map((s) => (
            <div key={s.value} className="group text-left">
              <p className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-none tracking-tight">
                {s.value}
              </p>
              <div className="mt-2 h-[2px] w-7 bg-green-500 rounded-full" />
              <p className="mt-2.5 text-sm sm:text-base font-bold text-gray-200 leading-snug">
                {s.label}
              </p>
              <p className="mt-0.5 text-xs text-gray-500 leading-snug">{s.sub}</p>
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
    <div className="bg-green-900 overflow-hidden relative">
      <div className="absolute inset-0 opacity-[0.04]" style={{ backgroundImage: "repeating-linear-gradient(45deg,#fff 0,#fff 1px,transparent 0,transparent 50%)", backgroundSize: "12px 12px" }} aria-hidden="true" />
      <div className="relative mx-auto max-w-7xl px-6 sm:px-10 py-10 sm:py-12 flex flex-col sm:flex-row items-center gap-8 sm:gap-12">
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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {items.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className="group relative overflow-hidden rounded-xl aspect-[3/4] shadow-sm hover:shadow-xl transition-all duration-300"
            >
              <Image
                src={c.img}
                alt={c.name}
                fill
                sizes="(max-width: 640px) 50vw, 25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
              <div className="absolute bottom-3 sm:bottom-5 left-3 sm:left-4 right-3 sm:right-4 text-white">
                <p className="text-[11px] font-extrabold uppercase tracking-widest text-green-400 mb-1">
                  {c.label}
                </p>
                <p className="text-sm sm:text-base font-extrabold leading-tight">{c.name}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-[10px] sm:text-xs font-bold text-white/75 group-hover:gap-2 transition-all">
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

/* ── Section 12b: Testimonials ───────────────────────────────────────────── */
const testimonials = [
  {
    quote:    "Instalamos la cerca Atenea 303 en todo el perímetro de nuestra empresa. Llevamos 3 años sin un solo problema de mantenimiento.",
    name:     "Carlos Ruiz",
    role:     "Gerente de Instalaciones",
    location: "Zona Industrial, Colón",
  },
  {
    quote:    "Vivimos a 200 metros del mar y la Poseidón 502 sigue igual que el primer día. Sin óxido, sin decoloración. Totalmente lo vale.",
    name:     "Ana Torres",
    role:     "Propietaria residencial",
    location: "Playa Coronado",
  },
  {
    quote:    "El equipo llegó a medir, asesoró el modelo correcto para nuestro terreno y la instalación fue rápida y prolija. 10/10.",
    name:     "José Martínez",
    role:     "Administrador de finca",
    location: "Chiriquí",
  },
];

function TestimonialsSection() {
  return (
    <section className="bg-gray-50 py-10 sm:py-14 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead title="Lo que dicen nuestros clientes" sub="Reseñas verificadas" />
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="bg-white rounded-2xl p-6 sm:p-7 shadow-sm border border-gray-100 flex flex-col gap-4 hover:shadow-md transition-shadow duration-200">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 text-amber-400" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-sm text-gray-700 leading-relaxed flex-1">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <div className="flex items-center gap-3 pt-3 border-t border-gray-100">
                <div className="h-9 w-9 rounded-full bg-green-600 flex items-center justify-center text-white font-black text-sm select-none shrink-0">
                  {t.name.charAt(0)}
                </div>
                <div>
                  <p className="text-sm font-bold text-gray-900 leading-snug">{t.name}</p>
                  <p className="text-[11px] text-gray-500 mt-0.5">{t.role} · {t.location}</p>
                </div>
              </div>
            </div>
          ))}
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
            <IconWhatsApp className="h-5 w-5" />
            Chatear ahora
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

  return (
    <>
      <Header />

      <main id="main-content">
        {/* 2 — Hero Carousel */}
        <HeroCarousel />

        {/* 3 — Category Visual Cards */}
        <CategoryCards />

        {/* 4 — "Intemperie Picks" — all products */}
        {allProds.length > 0 && (
          <section className="bg-white border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14">
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

        {/* 6 — Stats Section */}
        <StatsSection />

        {/* 7 — Cercas PVC section */}
        {pvcProds.length > 0 && (
          <section className="bg-white border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14">
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

        {/* 8 — Promo Banner: Calculadora */}
        <CalculadoraBanner />

        {/* 9 — Mallas Electrosoldadas */}
        {mallasProds.length > 0 && (
          <section className="bg-white border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-10 sm:pt-14">
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
              bg="bg-white"
            />
          </section>
        )}

        {/* 10 — Featured Collections Grid */}
        <FeaturedCollectionsGrid />

        {/* 11 — Testimonials */}
        <TestimonialsSection />

        {/* 12 — WhatsApp Promo Banner */}
        <WhatsAppBanner />
      </main>

      <Footer />
    </>
  );
}
