import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import Link from "next/link";
import { ArrowRight, Home, Building2, Landmark, Sprout, Waves, Calculator } from "lucide-react";
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

const categories = [
  { name: "Residencial", slug: "residencial", icon: Home, desc: "Hogares y urbanizaciones", count: "7 productos" },
  { name: "Industrial", slug: "industrial", icon: Building2, desc: "Bodegas y zonas de trabajo", count: "5 productos" },
  { name: "Gubernamental", slug: "gubernamental", icon: Landmark, desc: "Instituciones públicas", count: "1 producto" },
  { name: "Agropecuario", slug: "agropecuario", icon: Sprout, desc: "Fincas y producción", count: "1 producto" },
  { name: "Zonas Costeras", slug: "zonas-costeras", icon: Waves, desc: "Resistentes al salitre", count: "2 productos" },
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Hero */}
        <HeroSection />

        {/* Categories - compact chips */}
        <section className="bg-white border-b">
          <div className="mx-auto max-w-7xl px-4 py-4">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
              <Link href="/productos" className="flex shrink-0 items-center gap-2 rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition-colors">
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/productos?category=${cat.slug}`}
                  className="flex shrink-0 items-center gap-2 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-green-300 hover:text-green-700 transition-colors"
                >
                  <cat.icon className="h-4 w-4" />
                  {cat.name}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Bestsellers section */}
        <section className="bg-white py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900">Productos más vendidos</h2>
                <p className="mt-1 text-sm text-gray-500">Las cercas que nuestros clientes más compran</p>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-700 hover:text-green-800">
                Ver todos <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.slice(0, 8).map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-gradient-to-r from-green-700 to-emerald-700 py-12 md:py-16">
          <div className="mx-auto max-w-7xl px-4 text-center">
            <div className="inline-flex items-center justify-center h-16 w-16 rounded-2xl bg-white/10 backdrop-blur mb-6">
              <Calculator className="h-8 w-8 text-green-300" />
            </div>
            <h2 className="text-2xl md:text-4xl font-black text-white">¿No sabes cuánta cerca necesitas?</h2>
            <p className="mt-3 text-green-100 text-sm md:text-base max-w-lg mx-auto">
              Usa nuestra calculadora gratuita. Ingresa los metros y el tipo de cerca para obtener un presupuesto al instante.
            </p>
            <Button size="lg" className="mt-6 bg-white text-green-800 hover:bg-green-50 font-bold h-14 px-10 rounded-full text-base shadow-xl" asChild>
              <Link href="/calculadora">
                Calcular precio ahora <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>

        {/* All products */}
        <section className="bg-gray-50 py-10 md:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-black text-gray-900">Catálogo completo</h2>
              <p className="mt-1 text-sm text-gray-500">{products.length} productos disponibles para entrega inmediata</p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
              {products.map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
