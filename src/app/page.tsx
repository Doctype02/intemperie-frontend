import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Calculator, Star, Truck, Wrench, Check, ChevronRight } from "lucide-react";
import { HeroCarousel } from "@/components/home/hero-carousel";
import { ProductCarousel } from "@/components/home/product-carousel";

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/products?limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch {
    return [];
  }
}

function isNew(createdAt?: string) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 90 * 24 * 60 * 60 * 1000;
}

/* ─── TRUST STRIP ─────────────────────────────────────────────────────────── */
function TrustStrip() {
  const items = [
    { icon: Shield, text: "Garantía 15 años", sub: "En todos los productos PVC" },
    { icon: Truck, text: "Envío a todo Panamá", sub: "Gratis en pedidos +$50" },
    { icon: Wrench, text: "Instalación profesional", sub: "Equipo certificado" },
    { icon: Star, text: "+15,000 proyectos", sub: "100% satisfacción" },
  ];
  return (
    <div className="bg-white border-b border-gray-100">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-gray-100">
          {items.map((item) => (
            <div key={item.text} className="flex items-center gap-3 px-4 py-4 sm:py-5">
              <item.icon className="h-7 w-7 shrink-0 text-green-600" />
              <div className="min-w-0">
                <p className="text-xs sm:text-sm font-extrabold text-gray-900 truncate">{item.text}</p>
                <p className="text-[10px] sm:text-xs text-gray-500 truncate">{item.sub}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── CATEGORY GRID ────────────────────────────────────────────────────────── */
const categories = [
  { name: "Residencial", slug: "residencial", image: "/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg" },
  { name: "Industrial", slug: "industrial", image: "/products/cerca-pvc-atenea-303/6.jpg" },
  { name: "Zonas Costeras", slug: "zonas-costeras", image: "/products/cerca-pvc-poseidon-502/2.jpg" },
  { name: "Gubernamental", slug: "gubernamental", image: "/products/cerca-pvc-atenea-305/4.jpg" },
  { name: "Agropecuario", slug: "agropecuario", image: "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg" },
];

function CategoryGrid() {
  return (
    <section className="bg-gray-50 py-8 sm:py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base sm:text-lg font-extrabold text-gray-900">Explorar por uso</h2>
          <Link href="/productos" className="flex items-center gap-1 text-xs font-bold text-green-600 hover:text-green-700">
            Ver todo <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        <div className="grid grid-cols-5 gap-2 sm:gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.slug}
              href={`/productos?category=${cat.slug}`}
              className="group relative overflow-hidden rounded-xl sm:rounded-2xl aspect-[3/4] shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <Image
                src={cat.image}
                alt={cat.name}
                fill
                sizes="20vw"
                className="object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 inset-x-0 p-2 sm:p-3">
                <p className="text-white font-extrabold text-[10px] sm:text-xs leading-tight text-center">
                  {cat.name}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── PROMO BANNER ─────────────────────────────────────────────────────────── */
function PromoBanner({
  bg,
  eyebrow,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
  imgSrc,
  imgAlt,
  reverse = false,
}: {
  bg: string;
  eyebrow: string;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  imgSrc: string;
  imgAlt: string;
  reverse?: boolean;
}) {
  return (
    <div className={`${bg} overflow-hidden`}>
      <div className={`mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10 flex flex-col sm:flex-row items-center gap-6 ${reverse ? "sm:flex-row-reverse" : ""}`}>
        <div className="flex-1 text-white">
          <span className="text-xs font-bold uppercase tracking-widest opacity-75">{eyebrow}</span>
          <h3 className="text-2xl sm:text-3xl font-extrabold mt-1 leading-tight">{title}</h3>
          <p className="text-sm opacity-80 mt-2 max-w-sm">{subtitle}</p>
          <Link
            href={ctaHref}
            className="mt-4 inline-flex items-center gap-2 bg-white text-gray-900 rounded-xl px-5 py-2.5 text-sm font-extrabold hover:bg-gray-100 transition-colors shadow"
          >
            {ctaLabel} <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="relative h-44 w-full sm:w-72 sm:h-52 rounded-2xl overflow-hidden shrink-0 shadow-2xl">
          <Image src={imgSrc} alt={imgAlt} fill sizes="300px" className="object-cover" />
        </div>
      </div>
    </div>
  );
}

/* ─── COLLECTIONS GRID ─────────────────────────────────────────────────────── */
function CollectionsGrid() {
  const cols = [
    {
      img: "/products/cerca-pvc-atenea-303/1-.jpg",
      label: "CERCA PVC",
      name: "Atenea 303",
      href: "/productos/cerca-pvc-atenea-303",
      tall: true,
    },
    {
      img: "/products/cerca-pvc-poseidon-502/1-pagina-principal.jpg",
      label: "ANTI-SALITRE",
      name: "Poseidón 502",
      href: "/productos/cerca-pvc-poseidon-502",
      tall: false,
    },
    {
      img: "/products/cerca-pvc-afrodita-401/3.jpg",
      label: "RESIDENCIAL",
      name: "Afrodita 401",
      href: "/productos/cerca-pvc-afrodita-401",
      tall: false,
    },
    {
      img: "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg",
      label: "PREMIUM",
      name: "Vesta 601",
      href: "/productos/cerca-pvc-vesta-601",
      tall: true,
    },
  ];

  return (
    <section className="bg-white py-10 sm:py-14">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Colecciones destacadas</h2>
            <p className="text-sm text-gray-500 mt-0.5">Diseños que combinan resistencia y elegancia</p>
          </div>
          <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700">
            Ver catálogo <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4" style={{ gridAutoRows: "200px" }}>
          {cols.map((c) => (
            <Link
              key={c.name}
              href={c.href}
              className={`group relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300 ${c.tall ? "sm:row-span-2" : ""}`}
            >
              <Image
                src={c.img}
                alt={c.name}
                fill
                sizes="25vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 text-white">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-green-400">{c.label}</span>
                <p className="text-base sm:text-xl font-extrabold mt-0.5 leading-tight">{c.name}</p>
                <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white/80 group-hover:text-white group-hover:gap-2 transition-all">
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

/* ─── BENEFITS ─────────────────────────────────────────────────────────────── */
function Benefits() {
  const items = [
    { icon: Shield, title: "15 años de garantía", desc: "Cercas PVC diseñadas para décadas sin mantenimiento, sin decoloración." },
    { icon: Truck, title: "Envíos a todo Panamá", desc: "Área metropolitana, Panamá Oeste, Colón y provincias. Gratis desde $50." },
    { icon: Wrench, title: "Instalación profesional", desc: "Equipo técnico certificado. Instalación rápida y garantizada." },
    { icon: Star, title: "Miles de clientes satisfechos", desc: "+15,000 proyectos en 10+ países con 100% de satisfacción." },
  ];
  return (
    <section className="bg-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 text-center mb-9">¿Por qué elegir Intemperie?</h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {items.map((b) => (
            <div key={b.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:shadow-lg transition-shadow">
              <b.icon className="h-8 w-8 text-green-600 mb-3" />
              <h3 className="text-sm font-extrabold text-gray-900 mb-1.5">{b.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── NEWSLETTER ───────────────────────────────────────────────────────────── */
function Newsletter() {
  return (
    <section className="bg-gray-900 py-12 sm:py-14">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-green-500 mb-2">Mantente informado</p>
        <h2 className="text-xl sm:text-2xl font-extrabold text-white mb-2">
          Recibe ofertas y novedades
        </h2>
        <p className="text-sm text-gray-400 mb-6">
          Suscríbete y recibe las últimas colecciones, precios especiales y proyectos inspiradores.
        </p>
        <div className="flex gap-2 max-w-md mx-auto">
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

/* ─── PAGE ─────────────────────────────────────────────────────────────────── */
export default async function HomePage() {
  const rawProducts = await getProducts();

  const products = rawProducts.map((p: any) => ({
    ...p,
    isNew: isNew(p.createdAt),
  }));

  const pvcProducts = products.filter((p: any) =>
    (p.name || "").toLowerCase().includes("pvc") || (p.category?.name || "").toLowerCase().includes("resid") || (p.category?.name || "").toLowerCase().includes("costera")
  );

  const mallasProducts = products.filter((p: any) =>
    (p.name || "").toLowerCase().includes("malla") || (p.category?.name || "").toLowerCase().includes("industr")
  );

  return (
    <>
      <Header />

      <main>
        {/* 1 — Hero Carousel */}
        <HeroCarousel />

        {/* 2 — Trust strip */}
        <TrustStrip />

        {/* 3 — All products carousel */}
        {products.length > 0 && (
          <section className="bg-white py-10 sm:py-12 border-b border-gray-100">
            <ProductCarousel
              title="Todos los productos"
              subtitle="Cercas PVC y mallas electrosoldadas con entrega inmediata"
              products={products}
              viewAllHref="/productos"
            />
          </section>
        )}

        {/* 4 — Category grid */}
        <CategoryGrid />

        {/* 5 — Cercas PVC carousel */}
        {pvcProducts.length > 0 && (
          <section className="bg-white border-b border-gray-100">
            <ProductCarousel
              title="Cercas PVC"
              subtitle="Seguridad y elegancia con garantía de 15 años"
              products={pvcProducts}
              viewAllHref="/productos?category=residencial"
            />
          </section>
        )}

        {/* 6 — Promo banner: Calculadora */}
        <PromoBanner
          bg="bg-gradient-to-r from-green-700 to-emerald-600"
          eyebrow="Herramienta exclusiva"
          title="Calcula tu proyecto al instante"
          subtitle="Ingresa metros lineales, elige el modelo y obtén el precio en segundos. Sin compromiso."
          ctaLabel="Abrir calculadora"
          ctaHref="/calculadora"
          imgSrc="/products/cerca-pvc-atenea-305/2.jpg"
          imgAlt="Calculadora de cercas"
        />

        {/* 7 — Mallas carousel */}
        {mallasProducts.length > 0 && (
          <section className="bg-gray-50 border-b border-gray-100">
            <ProductCarousel
              title="Mallas Electrosoldadas"
              subtitle="Alta resistencia para aplicaciones industriales y agropecuarias"
              products={mallasProducts}
              viewAllHref="/productos?category=industrial"
            />
          </section>
        )}

        {/* 8 — Novedades carousel (most recent) */}
        {products.length > 3 && (
          <section className="bg-white border-b border-gray-100">
            <ProductCarousel
              title="Novedades"
              subtitle="Los últimos modelos incorporados al catálogo"
              products={[...products].reverse().slice(0, 10)}
              viewAllHref="/productos"
            />
          </section>
        )}

        {/* 9 — Collections grid */}
        <CollectionsGrid />

        {/* 10 — Promo banner: WhatsApp */}
        <PromoBanner
          bg="bg-gradient-to-r from-gray-900 to-gray-800"
          eyebrow="Atención personalizada"
          title="Cotiza tu proyecto por WhatsApp"
          subtitle="Un asesor responde en minutos. Medidas, modelos, precios e instalación incluidos."
          ctaLabel="Chatear ahora"
          ctaHref="https://wa.me/50762874042?text=Hola,%20quiero%20cotizar%20una%20cerca%20PVC"
          imgSrc="/products/cerca-pvc-afrodita-401/7.jpg"
          imgAlt="Asesoría WhatsApp"
          reverse
        />

        {/* 11 — Benefits */}
        <Benefits />

        {/* 12 — Newsletter */}
        <Newsletter />
      </main>

      <Footer />
    </>
  );
}
