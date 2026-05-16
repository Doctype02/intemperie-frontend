import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Shield, Calculator, Star, Truck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/products?limit=12`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Header />

      <main className="flex-1">
        {/* Hero — product-focused */}
        <section className="relative bg-gradient-to-br from-green-700 via-green-800 to-emerald-900 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-10 left-10 w-72 h-72 bg-white rounded-full blur-3xl" />
            <div className="absolute bottom-10 right-10 w-96 h-96 bg-white rounded-full blur-3xl" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-16 md:py-24">
            <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
              <div className="text-white">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1]">
                  Cercas PVC &amp;<br />Mallas Electrosoldadas
                </h1>
                <p className="mt-4 text-base sm:text-lg text-green-100 max-w-lg leading-relaxed">
                  Seguridad, durabilidad y elegancia para tu hogar, negocio o industria. Cotiza tu proyecto en minutos.
                </p>
                <div className="mt-8 flex flex-col sm:flex-row gap-3">
                  <Button asChild size="lg" className="bg-white text-green-800 hover:bg-green-50 font-bold h-12 px-8 text-sm rounded-xl shadow-lg">
                    <Link href="/productos">Ver catálogo <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                  </Button>
                  <Button asChild variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10 font-bold h-12 px-8 text-sm rounded-xl">
                    <Link href="/calculadora">Calculadora de precio</Link>
                  </Button>
                </div>
                <div className="mt-10 grid grid-cols-3 gap-4 max-w-md">
                  {[
                    { value: "15+", label: "Años" },
                    { value: "15 mil+", label: "Proyectos" },
                    { value: "10+", label: "Países" },
                  ].map((s, i) => (
                    <div key={i}>
                      <p className="text-2xl sm:text-3xl font-extrabold">{s.value}</p>
                      <p className="text-xs sm:text-sm text-green-200">{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative hidden lg:block">
                <div className="relative h-80 lg:h-[450px] rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10">
                  <Image
                    src="/products/cerca-pvc-afrodita-401/1-imagen-principal.jpg"
                    alt="Cercas PVC Intemperie"
                    fill
                    priority
                    sizes="50vw"
                    className="object-cover"
                  />
                </div>
                <div className="absolute -bottom-4 -right-4 bg-white rounded-xl shadow-lg px-4 py-3">
                  <Shield className="h-5 w-5 text-green-600 mb-1" />
                  <p className="text-xs font-bold text-gray-900">Garantía oficial</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories pills */}
        <section className="bg-white py-4 sm:py-5 border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {[
                { name: "Residencial", slug: "residencial", icon: "🏠", color: "bg-green-100 text-green-700 border-green-200" },
                { name: "Industrial", slug: "industrial", icon: "🏭", color: "bg-slate-100 text-slate-700 border-slate-200" },
                { name: "Gubernamental", slug: "gubernamental", icon: "🏛️", color: "bg-blue-100 text-blue-700 border-blue-200" },
                { name: "Agropecuario", slug: "agropecuario", icon: "🌾", color: "bg-amber-100 text-amber-700 border-amber-200" },
                { name: "Zonas Costeras", slug: "zonas-costeras", icon: "🌊", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
              ].map((cat) => (
                <Link key={cat.slug} href={`/productos?category=${cat.slug}`}
                  className={`inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-xs sm:text-sm font-bold transition-all hover:scale-105 ${cat.color}`}>
                  <span>{cat.icon}</span> {cat.name}
                </Link>
              ))}
              <Link href="/calculadora" className="inline-flex items-center gap-1.5 rounded-full bg-green-600 text-white px-4 py-2 text-xs sm:text-sm font-bold hover:bg-green-700 transition-all">
                <Calculator className="h-3.5 w-3.5" /> Calculadora
              </Link>
            </div>
          </div>
        </section>

        {/* Featured products */}
        <section className="bg-white py-10 sm:py-14">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Productos destacados</h2>
                <p className="text-sm text-gray-500 mt-1">Cercas PVC y mallas con entrega inmediata</p>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700">
                Ver catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            {products.length === 0 ? (
              <div className="text-center py-12 text-gray-400">Cargando productos...</div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {products.slice(0, 12).map((p: any) => (
                  <ProductCard key={p.id} {...p} />
                ))}
              </div>
            )}
            <div className="mt-6 text-center sm:hidden">
              <Link href="/productos" className="inline-flex items-center gap-1.5 rounded-full border-2 border-green-300 px-6 py-3 text-sm font-bold text-green-700 hover:bg-green-50">
                Ver todo el catálogo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-gray-50 py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="text-center mb-10">
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">¿Por qué elegir Intemperie?</h2>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              {[
                { icon: Shield, title: "15 años de garantía", desc: "Nuestras cercas de PVC están diseñadas para durar décadas sin perder color ni resistencia." },
                { icon: Truck, title: "Envíos a todo Panamá", desc: "Entregamos en área metropolitana, Panamá Oeste, Colón y provincias." },
                { icon: Wrench, title: "Instalación profesional", desc: "Equipo técnico certificado. Instalación rápida, limpia y garantizada." },
                { icon: Star, title: "Miles de clientes", desc: "+15,000 proyectos exitosos. 100% de satisfacción garantizada." },
              ].map((b, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 hover:shadow-lg transition-shadow">
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
              <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Calcula el costo de tu proyecto</h2>
              <p className="mt-2 text-sm text-gray-500 max-w-md mx-auto">Selecciona el modelo, ingresa los metros lineales y obtén un presupuesto al instante.</p>
              <Button asChild size="lg" className="mt-6 bg-green-600 hover:bg-green-700 font-bold h-12 px-8 rounded-xl">
                <Link href="/calculadora">Ir a la calculadora <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Corporate link */}
        <section className="bg-gray-900 py-10">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 text-center">
            <p className="text-sm text-gray-400 mb-3">¿Quieres conocer más sobre nuestra empresa?</p>
            <Button asChild variant="outline" size="lg" className="border-gray-600 text-gray-300 hover:bg-gray-800 hover:text-white font-bold rounded-xl">
              <Link href="/nosotros">Visión, misión y proyectos <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
