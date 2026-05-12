import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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
  {
    title: "Cercas PVC",
    subtitle: "Desde $18.50/m",
    href: "/productos?category=residencial",
    gradient: "from-green-600 to-emerald-700",
    icon: "🏡",
    large: true,
  },
  {
    title: "Mallas",
    subtitle: "Desde $8.50/m",
    href: "/productos?category=industrial",
    gradient: "from-gray-700 to-gray-800",
    icon: "🏭",
  },
  {
    title: "Calculadora",
    subtitle: "Presupuesto al instante",
    href: "/calculadora",
    gradient: "from-amber-500 to-orange-600",
    icon: "🧮",
  },
  {
    title: "Zona Costera",
    subtitle: "Desde $38/m",
    href: "/productos?category=zonas-costeras",
    gradient: "from-cyan-600 to-blue-700",
    icon: "🌊",
  },
  {
    title: "Contáctanos",
    subtitle: "Cotiza por WhatsApp",
    href: "https://wa.me/50762874042",
    gradient: "from-violet-600 to-purple-700",
    icon: "💬",
  },
];

const categories = [
  { name: "Residencial", slug: "residencial", bg: "bg-green-50 text-green-700 group-hover:bg-green-100" },
  { name: "Industrial", slug: "industrial", bg: "bg-gray-50 text-gray-700 group-hover:bg-gray-100" },
  { name: "Gubernamental", slug: "gubernamental", bg: "bg-blue-50 text-blue-700 group-hover:bg-blue-100" },
  { name: "Agropecuario", slug: "agropecuario", bg: "bg-amber-50 text-amber-700 group-hover:bg-amber-100" },
  { name: "Z. Costeras", slug: "zonas-costeras", bg: "bg-cyan-50 text-cyan-700 group-hover:bg-cyan-100" },
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        {/* Pinboard Banner Grid */}
        <section className="bg-gray-50 py-3 sm:py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {banners.map((banner, i) => (
                <Link
                  key={i}
                  href={banner.href}
                  target={banner.href.startsWith("http") ? "_blank" : undefined}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${banner.gradient} ${
                    banner.large && i === 0 ? "sm:col-span-2 sm:row-span-2" : ""
                  } hover:shadow-lg hover:scale-[1.02] transition-all duration-300`}
                >
                  <div className={`absolute -right-3 -bottom-3 text-5xl sm:text-7xl opacity-20 select-none group-hover:scale-125 transition-transform duration-500 ${banner.large ? "text-8xl sm:text-9xl" : ""}`}>
                    {banner.icon}
                  </div>
                  <div className={`relative z-10 flex h-full flex-col justify-end p-3 sm:p-5 ${banner.large ? "min-h-[120px] sm:min-h-[260px]" : "min-h-[100px] sm:min-h-[120px]"}`}>
                    <p className="text-white font-extrabold text-sm sm:text-lg leading-tight">{banner.title}</p>
                    <p className="text-white/70 text-[11px] sm:text-sm mt-0.5">{banner.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        <section className="bg-white py-5 sm:py-6 border-b border-gray-50">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-center gap-2 sm:gap-3 flex-wrap">
              <Link href="/productos" className="rounded-full bg-gray-900 text-white px-4 py-2 text-xs sm:text-sm font-bold hover:bg-gray-800 transition-colors">
                Todos los productos
              </Link>
              {categories.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/productos?category=${cat.slug}`}
                  className={`rounded-full px-4 py-2 text-xs sm:text-sm font-semibold transition-all ${cat.bg}`}
                >
                  {cat.name}
                </Link>
              ))}
              <Link href="/calculadora" className="rounded-full bg-green-50 text-green-700 px-4 py-2 text-xs sm:text-sm font-semibold hover:bg-green-100 transition-all">
                Calculadora
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
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{products.length} productos disponibles</p>
              </div>
              <Link
                href="/productos"
                className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700 transition-colors"
              >
                Ver catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.slice(0, 12).map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>

            <div className="mt-6 text-center sm:hidden">
              <Link
                href="/productos"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-green-200 px-6 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors"
              >
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
