import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Calculator, ChevronRight } from "lucide-react";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCarousel } from "@/components/home/product-carousel";

/* ── Data fetching ─────────────────────────────────────────────────────── */
async function getProducts() {
  try {
    const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
    const res  = await fetch(`${base}/products?limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data ?? data ?? [];
  } catch { return []; }
}

function markNew(p: any) {
  const isNew = p.createdAt
    ? Date.now() - new Date(p.createdAt).getTime() < 90 * 24 * 60 * 60 * 1000
    : false;
  return { ...p, isNew };
}

/* ── Sub-components ────────────────────────────────────────────────────── */

/** Carbonestore-style section divider with title + "Ver todo" link */
function SectionHead({ title, sub, href }: { title: string; sub?: string; href?: string }) {
  return (
    <div className="flex items-end justify-between mb-4 sm:mb-5">
      <div>
        <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 leading-tight">{title}</h2>
        {sub && <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700 shrink-0">
          Ver todo <ChevronRight className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
}

/** 5-column visual category cards (like "Departamentos" in carbonestore) */
function CategoryCards() {
  const cats = [
    { name: "Residencial",    slug: "residencial",    img: "/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg" },
    { name: "Industrial",     slug: "industrial",     img: "/products/cerca-pvc-atenea-303/6.jpg" },
    { name: "Zonas Costeras", slug: "zonas-costeras", img: "/products/cerca-pvc-poseidon-502/2.jpg" },
    { name: "Gubernamental",  slug: "gubernamental",  img: "/products/cerca-pvc-atenea-305/4.jpg" },
    { name: "Agropecuario",   slug: "agropecuario",   img: "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg" },
  ];
  return (
    <section className="bg-white py-6 sm:py-8 border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <SectionHead title="Explorar por uso" href="/productos" />
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {cats.map((c) => (
            <Link
              key={c.slug}
              href={`/productos?category=${c.slug}`}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[2/3] sm:aspect-[3/4] shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <Image src={c.img} alt={c.name} fill sizes="20vw"
                className="object-cover object-center transition-transform duration-500 group-hover:scale-110" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3 text-center">
                <p className="text-white font-extrabold text-[9px] sm:text-xs leading-tight">{c.name}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Colorful promo banner (like carbonestore brand/product banners) */
function PromoBanner({
  gradient, eyebrow, title, subtitle, ctaLabel, ctaHref, imgSrc, imgAlt, reverse = false,
}: {
  gradient: string; eyebrow: string; title: string; subtitle: string;
  ctaLabel: string; ctaHref: string; imgSrc: string; imgAlt: string; reverse?: boolean;
}) {
  return (
    <div className={`${gradient} overflow-hidden`}>
      <div className={`mx-auto max-w-7xl px-6 sm:px-8 py-8 sm:py-10 flex flex-col sm:flex-row items-center gap-6 sm:gap-10 ${reverse ? "sm:flex-row-reverse" : ""}`}>
        <div className="flex-1 text-white min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-widest opacity-70 mb-1">{eyebrow}</p>
          <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">{title}</h3>
          <p className="text-sm text-white/75 mt-2 leading-relaxed max-w-sm">{subtitle}</p>
          <Link href={ctaHref}
            className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white text-gray-900 px-5 py-2.5 text-sm font-extrabold hover:bg-gray-50 transition-colors shadow">
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative w-full sm:w-64 lg:w-80 h-44 sm:h-52 rounded-2xl overflow-hidden shrink-0 shadow-2xl">
          <Image src={imgSrc} alt={imgAlt} fill sizes="320px" className="object-cover" />
        </div>
      </div>
    </div>
  );
}

/** Carbonestore-style featured collections grid */
function FeaturedCollections() {
  const items = [
    {
      img:   "/products/cerca-pvc-atenea-303/1-.jpg",
      label: "Cerca PVC",
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
      label: "Residencial",
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
        <SectionHead title="Colecciones destacadas" sub="Diseños que combinan resistencia y elegancia" href="/productos" />
        {/* 2-col on mobile, 4-col masonry on desktop */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" style={{ gridTemplateRows: "200px 200px" }}>
          {items.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className={`group relative overflow-hidden rounded-2xl shadow hover:shadow-xl transition-all duration-300 ${c.big ? "sm:row-span-2" : ""}`}
            >
              <Image src={c.img} alt={c.name} fill sizes="25vw"
                className="object-cover object-center transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-3 sm:bottom-4 left-3 sm:left-4 right-3 sm:right-4 text-white">
                <p className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-green-400">{c.label}</p>
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

/** Certifications / trust logos strip */
function TrustLogos() {
  const items = [
    { label: "PVC Garantizado",        icon: "🛡️" },
    { label: "15 Años de experiencia", icon: "🏆" },
    { label: "+15,000 proyectos",      icon: "✅" },
    { label: "Envío a todo Panamá",    icon: "🚚" },
    { label: "10+ países",             icon: "🌎" },
    { label: "Instalación incluida",   icon: "🔧" },
  ];
  return (
    <section className="bg-gray-50 border-y border-gray-200 py-5">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 overflow-x-auto scrollbar-hide">
        <div className="flex items-center gap-6 sm:gap-8 min-w-max mx-auto sm:justify-center">
          {items.map((item) => (
            <div key={item.label} className="flex items-center gap-2 shrink-0">
              <span className="text-xl">{item.icon}</span>
              <span className="text-xs sm:text-sm font-semibold text-gray-600 whitespace-nowrap">{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Newsletter (standalone section) */
function NewsletterSection() {
  return (
    <section className="bg-gray-900 py-10 sm:py-12">
      <div className="mx-auto max-w-lg px-4 sm:px-6 text-center">
        <p className="text-[11px] font-bold uppercase tracking-widest text-green-500 mb-1.5">Mantente informado</p>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-1.5">
          ¡No te pierdas ninguna novedad!
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Nuevos modelos, precios especiales y proyectos inspiradores directo a tu correo.
        </p>
        <div className="flex gap-2">
          <input
            type="email"
            placeholder="tu@email.com"
            className="flex-1 h-11 rounded-xl border border-gray-700 bg-gray-800 px-4 text-sm text-white placeholder-gray-500 focus:border-green-500 focus:outline-none transition-colors"
          />
          <button className="h-11 px-5 rounded-xl bg-green-600 text-sm font-bold text-white hover:bg-green-500 transition-colors whitespace-nowrap">
            Suscribirse
          </button>
        </div>
        <p className="mt-3 text-[11px] text-gray-600">Sin spam. Cancela cuando quieras.</p>
      </div>
    </section>
  );
}

/* ── PAGE ──────────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const raw      = await getProducts();
  const products = raw.map(markNew);

  /* Split by type */
  const allProds     = products;
  const pvcProds     = products.filter((p: any) =>
    (p.name ?? "").toLowerCase().includes("pvc") ||
    ["Residencial", "Zonas Costeras", "Gubernamental"].includes(p.category?.name ?? "")
  );
  const mallasProds  = products.filter((p: any) =>
    (p.name ?? "").toLowerCase().includes("malla") ||
    ["Industrial", "Agropecuario"].includes(p.category?.name ?? "")
  );
  const newestProds  = [...products].reverse().slice(0, 12);

  return (
    <>
      <Header />

      <main>
        {/* ① Hero carousel */}
        <HeroCarousel />

        {/* ② Quick categories */}
        <CategoryCards />

        {/* ③ "Intemperie Picks" — all products */}
        {allProds.length > 0 && (
          <div className="border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-10">
              <SectionHead title="Productos Intemperie" sub="Cercas PVC y mallas con entrega inmediata" href="/productos" />
            </div>
            <ProductCarousel products={allProds} title="" viewAllHref="/productos" bg="bg-white" />
          </div>
        )}

        {/* ④ Trust logos strip */}
        <TrustLogos />

        {/* ⑤ Cercas PVC section */}
        {pvcProds.length > 0 && (
          <div className="bg-white border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-10">
              <SectionHead title="Cercas PVC" sub="Garantía 15 años — seguridad y elegancia sin mantenimiento" href="/productos?category=residencial" />
            </div>
            <ProductCarousel products={pvcProds} title="" viewAllHref="/productos?category=residencial" bg="bg-white" />
          </div>
        )}

        {/* ⑥ Promo banner: Calculadora */}
        <PromoBanner
          gradient="bg-gradient-to-r from-green-700 via-green-600 to-emerald-500"
          eyebrow="Herramienta exclusiva"
          title="Calcula el costo de tu proyecto"
          subtitle="Elige el modelo, ingresa los metros lineales y obtén tu presupuesto en segundos. Sin compromiso."
          ctaLabel="Abrir calculadora"
          ctaHref="/calculadora"
          imgSrc="/products/cerca-pvc-atenea-305/2.jpg"
          imgAlt="Calculadora de cercas"
        />

        {/* ⑦ Mallas section */}
        {mallasProds.length > 0 && (
          <div className="bg-gray-50 border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-10">
              <SectionHead title="Mallas Electrosoldadas" sub="Alta resistencia para usos industriales y agropecuarios" href="/productos?category=industrial" />
            </div>
            <ProductCarousel products={mallasProds} title="" viewAllHref="/productos?category=industrial" bg="bg-gray-50" />
          </div>
        )}

        {/* ⑧ Novedades */}
        {newestProds.length > 0 && (
          <div className="bg-white border-b border-gray-100">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 pt-8 sm:pt-10">
              <SectionHead title="Novedades" sub="Los últimos modelos incorporados al catálogo" href="/productos" />
            </div>
            <ProductCarousel products={newestProds} title="" viewAllHref="/productos" bg="bg-white" />
          </div>
        )}

        {/* ⑨ Featured collections grid */}
        <FeaturedCollections />

        {/* ⑩ Promo banner: WhatsApp */}
        <PromoBanner
          gradient="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900"
          eyebrow="Atención personalizada"
          title="Cotiza tu proyecto por WhatsApp"
          subtitle="Un asesor responde en minutos. Medidas, modelos, precios e instalación sin compromiso."
          ctaLabel="Chatear ahora"
          ctaHref="https://wa.me/50762874042?text=Hola,%20quiero%20cotizar%20una%20cerca%20PVC"
          imgSrc="/products/cerca-pvc-afrodita-401/7.jpg"
          imgAlt="Asesoría WhatsApp"
          reverse
        />

        {/* ⑪ Newsletter */}
        <NewsletterSection />
      </main>

      <Footer />
    </>
  );
}
