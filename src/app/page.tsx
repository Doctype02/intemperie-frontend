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
  { name: "Residencial", slug: "residencial", icon: Home },
  { name: "Industrial", slug: "industrial", icon: Building2 },
  { name: "Gubernamental", slug: "gubernamental", icon: Landmark },
  { name: "Agropecuario", slug: "agropecuario", icon: Sprout },
  { name: "Zonas Costeras", slug: "zonas-costeras", icon: Waves },
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <HeroSection />

        {/* Category chips */}
        <section className="bg-white border-b border-gray-100">
          <div className="mx-auto max-w-7xl px-4 py-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <Link href="/productos" className="flex shrink-0 items-center gap-1.5 rounded-full bg-gray-900 text-white px-4 py-2 text-sm font-bold hover:bg-gray-800 transition-colors">
                Todos los productos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/productos?category=${cat.slug}`}
                  className="flex shrink-0 items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all"
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.name}
                </Link>
              ))}
              <Link
                href="/calculadora"
                className="flex shrink-0 items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-sm font-medium text-green-700 hover:bg-green-100 transition-all"
              >
                <Calculator className="h-3.5 w-3.5" />
                Calculadora
              </Link>
            </div>
          </div>
        </section>

        {/* Bestsellers */}
        <section className="bg-white py-10 md:py-12">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-7 flex items-end justify-between">
              <div>
                <h2 className="text-xl md:text-2xl font-extrabold text-gray-900">Productos más vendidos</h2>
                <p className="mt-0.5 text-sm text-gray-500">Las cercas que más eligen nuestros clientes</p>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700">
                Ver catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
              {products.slice(0, 8).map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Button variant="outline" className="border-green-200 text-green-700 hover:bg-green-50 font-bold" asChild>
                <Link href="/productos">Ver todos los productos <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Calculator */}
        <section className="bg-gradient-to-r from-green-600 via-green-600 to-emerald-600 py-12 md:py-14">
          <div className="mx-auto max-w-7xl px-4">
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="text-center md:text-left flex-1">
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">¿Cuánta cerca necesitas?</h2>
                <p className="mt-2 text-green-100 text-sm md:text-base max-w-lg">
                  Calcula el costo de tu proyecto en segundos. Selecciona el tipo de cerca, ingresa los metros y obtén un presupuesto al instante.
                </p>
              </div>
              <Link
                href="/calculadora"
                className="inline-flex shrink-0 items-center gap-2 rounded-full bg-white px-8 py-4 text-base font-extrabold text-green-700 shadow-xl hover:bg-green-50 transition-colors"
              >
                <Calculator className="h-5 w-5" />
                Calcular precio ahora
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
