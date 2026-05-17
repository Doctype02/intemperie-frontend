import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Calculator, Star, Truck, Wrench, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCarousel } from "@/components/home/product-carousel";
import { HeroCarousel } from "@/components/home/hero-carousel";

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/products?limit=20`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch {
    return [];
  }
}

const categoryCards = [
  {
    name: "Residencial",
    slug: "residencial",
    desc: "Hogares y urbanizaciones",
    image: "/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg",
    color: "from-green-900/70",
  },
  {
    name: "Industrial",
    slug: "industrial",
    desc: "Bodegas y zonas de trabajo",
    image: "/products/cerca-pvc-atenea-303/1-.jpg",
    color: "from-slate-900/70",
  },
  {
    name: "Zonas Costeras",
    slug: "zonas-costeras",
    desc: "Resistentes al salitre",
    image: "/products/cerca-pvc-poseidon-502/1-pagina-principal.jpg",
    color: "from-cyan-900/70",
  },
  {
    name: "Gubernamental",
    slug: "gubernamental",
    desc: "Instituciones y espacios públicos",
    image: "/products/cerca-pvc-atenea-305/2.jpg",
    color: "from-blue-900/70",
  },
  {
    name: "Agropecuario",
    slug: "agropecuario",
    desc: "Fincas y producción animal",
    image: "/products/cerca-pvc-vesta-601/1-foto-de-portada.jpg",
    color: "from-amber-900/70",
  },
];

function isNewProduct(createdAt?: string) {
  if (!createdAt) return false;
  return Date.now() - new Date(createdAt).getTime() < 60 * 24 * 60 * 60 * 1000;
}

export default async function HomePage() {
  const rawProducts = await getProducts();

  const products = rawProducts.map((p: any) => ({
    ...p,
    isNew: isNewProduct(p.createdAt),
  }));

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero Carousel */}
        <HeroCarousel />

        {/* Category Cards */}
        <section className="bg-gray-50 py-8 sm:py-10 border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-5">
              Explora por uso
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {categoryCards.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/productos?category=${cat.slug}`}
                  className="group relative overflow-hidden rounded-2xl aspect-[3/2] sm:aspect-[4/3] shadow-sm hover:shadow-xl transition-all duration-300"
                >
                  <Image
                    src={cat.image}
                    alt={cat.name}
                    fill
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${cat.color} to-transparent`} />
                  <div className="absolute inset-0 flex flex-col justify-end p-3 sm:p-4">
                    <p className="text-white font-extrabold text-sm sm:text-base leading-tight">
                      {cat.name}
                    </p>
                    <p className="text-white/70 text-[10px] sm:text-xs mt-0.5 hidden sm:block">
                      {cat.desc}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* All Products Carousel */}
        {products.length > 0 && (
          <>
            <div className="border-b border-gray-100">
              <ProductCarousel
                title="Productos destacados"
                subtitle="Cercas PVC y mallas con entrega inmediata"
                products={products.slice(0, 10)}
                viewAllHref="/productos"
              />
            </div>

            {products.length > 5 && (
              <div className="bg-gray-50 border-b border-gray-100">
                <ProductCarousel
                  title="Novedades"
                  subtitle="Los últimos modelos incorporados a nuestro catálogo"
                  products={[...products].reverse().slice(0, 8)}
                  viewAllHref="/productos"
                />
              </div>
            )}
          </>
        )}

        {/* Collections / Visual Banner */}
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 text-center">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Colecciones más solicitadas
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Diseños que combinan resistencia y estética
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              {/* Large card */}
              <Link
                href="/productos/cerca-pvc-atenea-303"
                className="group relative overflow-hidden rounded-3xl aspect-[4/3] shadow-md hover:shadow-2xl transition-all duration-300"
              >
                <Image
                  src="/products/cerca-pvc-atenea-303/6.jpg"
                  alt="Atenea 303"
                  fill
                  sizes="(max-width: 640px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="absolute bottom-5 left-5 right-5 text-white">
                  <span className="text-xs font-bold uppercase tracking-widest text-green-400">
                    Cerca PVC
                  </span>
                  <h3 className="text-xl sm:text-2xl font-extrabold mt-1">Atenea 303</h3>
                  <p className="text-sm text-white/80 mt-1">3 rieles — alta resistencia y elegancia</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-sm font-bold text-white group-hover:gap-3 transition-all">
                    Ver producto <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </Link>

              {/* Two small cards */}
              <div className="grid grid-rows-2 gap-4">
                <Link
                  href="/productos/cerca-pvc-poseidon-502"
                  className="group relative overflow-hidden rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300"
                >
                  <Image
                    src="/products/cerca-pvc-poseidon-502/2.jpg"
                    alt="Poseidón 502"
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-cyan-400">
                      Anti-salitre
                    </span>
                    <h3 className="text-lg font-extrabold mt-0.5">Poseidón 502</h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white group-hover:gap-2 transition-all">
                      Ver producto <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>

                <Link
                  href="/productos/cerca-pvc-afrodita-401"
                  className="group relative overflow-hidden rounded-3xl shadow-md hover:shadow-2xl transition-all duration-300"
                >
                  <Image
                    src="/products/cerca-pvc-afrodita-401/6.jpg"
                    alt="Afrodita 401"
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4 right-4 text-white">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-green-400">
                      Residencial
                    </span>
                    <h3 className="text-lg font-extrabold mt-0.5">Afrodita 401</h3>
                    <span className="mt-2 inline-flex items-center gap-1 text-xs font-bold text-white group-hover:gap-2 transition-all">
                      Ver producto <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                ¿Por qué elegir Intemperie?
              </h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                {
                  icon: Shield,
                  title: "15 años de garantía",
                  desc: "Nuestras cercas de PVC están diseñadas para durar décadas sin perder color ni resistencia.",
                  badge: "Garantía oficial",
                },
                {
                  icon: Truck,
                  title: "Envíos a todo Panamá",
                  desc: "Entregamos en área metropolitana, Panamá Oeste, Colón y provincias.",
                  badge: "Gratis desde $50",
                },
                {
                  icon: Wrench,
                  title: "Instalación profesional",
                  desc: "Equipo técnico certificado. Instalación rápida, limpia y garantizada.",
                  badge: "Certificados",
                },
                {
                  icon: Star,
                  title: "Miles de clientes",
                  desc: "+15,000 proyectos exitosos. 100% de satisfacción garantizada.",
                  badge: "+15,000 proyectos",
                },
              ].map((b, i) => (
                <div
                  key={i}
                  className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow relative overflow-hidden"
                >
                  <span className="absolute top-4 right-4 text-[10px] font-bold text-green-700 bg-green-50 rounded-full px-2 py-0.5">
                    {b.badge}
                  </span>
                  <b.icon className="h-8 w-8 text-green-600 mb-3" />
                  <h3 className="text-sm font-extrabold text-gray-900 mb-1.5">{b.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{b.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Calculator CTA */}
        <section className="bg-white py-12 sm:py-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 sm:p-12 border border-green-100">
              <Calculator className="h-10 w-10 text-green-600 mx-auto mb-4" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">
                Calcula el costo de tu proyecto
              </h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">
                Selecciona el modelo, ingresa los metros lineales y obtén un presupuesto al instante.
              </p>
              <Button
                asChild
                size="lg"
                className="mt-6 bg-green-600 hover:bg-green-700 font-bold h-12 px-8 rounded-xl"
              >
                <Link href="/calculadora">
                  Ir a la calculadora <ArrowRight className="ml-1.5 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* WhatsApp / Newsletter CTA */}
        <section className="bg-green-700 py-12 sm:py-14">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center text-white">
            <MessageCircle className="h-10 w-10 mx-auto mb-4 opacity-80" />
            <h2 className="text-xl sm:text-2xl font-extrabold mb-2">
              ¿Tienes dudas sobre tu proyecto?
            </h2>
            <p className="text-green-100 text-sm mb-7 max-w-md mx-auto">
              Escríbenos por WhatsApp y un asesor te responde en minutos. Cotizaciones sin compromiso.
            </p>
            <a
              href="https://wa.me/50762874042?text=Hola,%20me%20interesa%20cotizar%20una%20cerca%20PVC"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2.5 rounded-xl bg-white text-green-800 px-7 py-3.5 text-sm font-extrabold hover:bg-green-50 transition-colors shadow-lg"
            >
              <svg className="h-5 w-5 fill-current text-green-600" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Chatear por WhatsApp
            </a>
          </div>
        </section>

        {/* About link */}
        <section className="bg-gray-900 py-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <p className="text-sm text-gray-400 mb-3">¿Quieres conocer más sobre nuestra empresa?</p>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white font-bold rounded-xl"
            >
              <Link href="/nosotros">
                Visión, misión y proyectos <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
