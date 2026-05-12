import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { ArrowRight, Shield, Truck, Star, Calculator, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductCard } from "@/components/products/product-card";

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/products?limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch { return []; }
}

const banners = [
  { title: "Cercas PVC", price: "$18.50/m", href: "/productos?category=residencial", gradient: "from-green-600 to-emerald-700", icon: "🏡", large: true },
  { title: "Mallas Electrosoldadas", price: "$8.50/m", href: "/productos?category=industrial", gradient: "from-slate-700 to-slate-800", icon: "🏭" },
  { title: "Calcula tu proyecto", price: "Al instante", href: "/calculadora", gradient: "from-amber-500 to-orange-600", icon: "🧮" },
  { title: "Zonas Costeras", price: "$38.00/m", href: "/productos?category=zonas-costeras", gradient: "from-cyan-600 to-blue-700", icon: "🌊" },
  { title: "Contáctanos", price: "Cotizar YA", href: "https://wa.me/50762874042", gradient: "from-violet-600 to-purple-700", icon: "💬" },
];

const categories = [
  { name: "Residencial", slug: "residencial", icon: "🏠", color: "bg-green-100 text-green-700 border-green-200" },
  { name: "Industrial", slug: "industrial", icon: "🏭", color: "bg-slate-100 text-slate-700 border-slate-200" },
  { name: "Gubernamental", slug: "gubernamental", icon: "🏛️", color: "bg-blue-100 text-blue-700 border-blue-200" },
  { name: "Agropecuario", slug: "agropecuario", icon: "🌾", color: "bg-amber-100 text-amber-700 border-amber-200" },
  { name: "Z. Costeras", slug: "zonas-costeras", icon: "🌊", color: "bg-cyan-100 text-cyan-700 border-cyan-200" },
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <section className="relative bg-gradient-to-br from-green-700 via-green-800 to-emerald-900 overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white rounded-full blur-[120px] translate-x-1/3 -translate-y-1/3" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white rounded-full blur-[100px] -translate-x-1/4 translate-y-1/3" />
          </div>
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 py-10 sm:py-14 lg:py-16">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur px-4 py-1.5 text-xs sm:text-sm text-green-200 mb-4">
                <Star className="h-3.5 w-3.5 fill-green-300 text-green-300" />
                4.8 estrellas en Google · 15+ años de experiencia
              </div>
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-[1.1]">
                Cercas de PVC y Mallas Electrosoldadas
              </h1>
              <p className="mt-3 sm:mt-4 text-sm sm:text-base text-green-100 max-w-lg leading-relaxed">
                Protección, durabilidad y estilo para tu hogar, negocio o industria. Instalación profesional en todo Panamá.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3">
                <Button size="lg" className="bg-white text-green-800 hover:bg-green-50 font-bold h-12 sm:h-14 px-8 rounded-full text-sm sm:text-base shadow-xl shadow-black/20" asChild>
                  <Link href="/productos">Ver productos <ArrowRight className="ml-1.5 h-4 w-4" /></Link>
                </Button>
                <Button size="lg" variant="outline" className="border-2 border-green-400 text-green-200 hover:bg-green-500/10 font-semibold h-12 sm:h-14 px-8 rounded-full text-sm sm:text-base" asChild>
                  <Link href="/calculadora"><Calculator className="mr-1.5 h-4 w-4" />Calcular precio</Link>
                </Button>
              </div>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-xs sm:text-sm text-green-200/80">
                <span className="flex items-center gap-1.5"><Shield className="h-4 w-4" />Garantía 10-15 años</span>
                <span className="flex items-center gap-1.5"><Truck className="h-4 w-4" />Envíos nacionales</span>
                <span className="flex items-center gap-1.5"><Wrench className="h-4 w-4" />Instalación profesional</span>
              </div>
            </div>
          </div>
        </section>

        {/* Banner Grid */}
        <section className="bg-gray-50 py-3 sm:py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {banners.map((b, i) => (
                <Link key={i} href={b.href} target={b.href.startsWith("http") ? "_blank" : undefined}
                  className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${b.gradient} ${b.large && i === 0 ? "sm:col-span-2 sm:row-span-2" : ""} hover:shadow-xl hover:scale-[1.02] transition-all duration-300`}>
                  <div className={`absolute -right-3 -bottom-3 text-5xl sm:text-7xl opacity-20 select-none group-hover:scale-125 transition-transform duration-500 ${b.large ? "text-8xl sm:text-9xl" : ""}`}>{b.icon}</div>
                  <div className={`relative z-10 flex h-full flex-col justify-end p-3 sm:p-4 ${b.large ? "min-h-[120px] sm:min-h-[260px]" : "min-h-[100px] sm:min-h-[120px]"}`}>
                    <p className="text-white font-extrabold text-sm sm:text-lg leading-tight">{b.title}</p>
                    <p className="text-white/70 text-[11px] sm:text-sm mt-0.5">{b.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white py-4 sm:py-5 border-b border-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              {categories.map((cat) => (
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

        {/* Products */}
        <section className="bg-white py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Nuestros productos</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{products.length} productos disponibles para entrega inmediata</p>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700">
                Ver catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.slice(0, 12).map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Link href="/productos" className="inline-flex items-center gap-1.5 rounded-full border-2 border-green-300 px-6 py-3 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors">
                Ver todo el catálogo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
