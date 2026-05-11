import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import Link from "next/link";
import { ArrowRight, Home, Building2, Landmark, Sprout, Waves, Calculator, Truck, Percent } from "lucide-react";
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

const promos = [
  { title: "Envío gratis", desc: "En pedidos mayores a $500 en Ciudad de Panamá", icon: Truck, color: "bg-blue-50 border-blue-200" },
  { title: "Hasta 15% OFF", desc: "En pedidos de más de 100 metros lineales", icon: Percent, color: "bg-amber-50 border-amber-200" },
  { title: "Calcula y ahorra", desc: "Presupuesto estimado al instante sin compromiso", icon: Calculator, color: "bg-green-50 border-green-200" },
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
          <div className="mx-auto max-w-7xl px-4 sm:px-6 py-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-0.5">
              <Link href="/productos" className="shrink-0 rounded-full bg-gray-900 text-white px-4 py-2 text-xs sm:text-sm font-bold hover:bg-gray-800 transition-colors">
                Todos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/productos?category=${cat.slug}`}
                  className="shrink-0 flex items-center gap-1.5 rounded-full border border-gray-200 px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all"
                >
                  <cat.icon className="h-3.5 w-3.5" />
                  {cat.name}
                </Link>
              ))}
              <Link href="/calculadora" className="shrink-0 flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-4 py-2 text-xs sm:text-sm font-medium text-green-700 hover:bg-green-100 transition-all">
                <Calculator className="h-3.5 w-3.5" />Calculadora
              </Link>
            </div>
          </div>
        </section>

        {/* Promos */}
        <section className="bg-white py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {promos.map((promo) => (
                <div key={promo.title} className={`flex items-start gap-3 rounded-xl border p-4 sm:p-5 ${promo.color}`}>
                  <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${promo.color.replace('border-', 'bg-').replace('50', '100').replace('200', '300')}`}>
                    <promo.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{promo.title}</p>
                    <p className="mt-0.5 text-xs text-gray-600">{promo.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Bestsellers */}
        <section className="bg-gray-50 py-10 sm:py-12">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-6 sm:mb-8 flex items-end justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Productos más vendidos</h2>
                <p className="mt-0.5 text-xs sm:text-sm text-gray-500">Las cercas que más eligen nuestros clientes</p>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700">
                Ver catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
              {products.slice(0, 8).map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50 font-bold" asChild>
                <Link href="/productos">Ver todos los productos <ArrowRight className="ml-2 h-4 w-4" /></Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
