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
  { title: "Cercas PVC", subtitle: "Desde $18.50/m", href: "/productos?category=residencial", bg: "from-green-700 to-emerald-800", icon: "🏡", wide: true, tall: true },
  { title: "Malla Electrosoldada", subtitle: "Desde $8.50/m", href: "/productos?category=industrial", bg: "from-gray-800 to-gray-900", icon: "🏭", wide: false, tall: false },
  { title: "Calcula tu proyecto", subtitle: "Presupuesto al instante", href: "/calculadora", bg: "from-amber-600 to-orange-700", icon: "🧮", wide: false, tall: false },
  { title: "Zonas Costeras", subtitle: "Desde $38/m", href: "/productos?category=zonas-costeras", bg: "from-cyan-700 to-blue-800", icon: "🌊", wide: false, tall: false },
  { title: "Contáctanos", subtitle: "Cotiza por WhatsApp", href: "https://wa.me/50762874042", bg: "from-violet-700 to-purple-800", icon: "💬", wide: false, tall: false },
];

const categoryCircles = [
  { name: "Residencial", slug: "residencial", color: "bg-green-500", ring: "ring-green-200" },
  { name: "Industrial", slug: "industrial", color: "bg-gray-600", ring: "ring-gray-200" },
  { name: "Gubernamental", slug: "gubernamental", color: "bg-blue-500", ring: "ring-blue-200" },
  { name: "Agropecuario", slug: "agropecuario", color: "bg-amber-500", ring: "ring-amber-200" },
  { name: "Z. Costeras", slug: "zonas-costeras", color: "bg-cyan-500", ring: "ring-cyan-200" },
];

export default async function HomePage() {
  const allProducts = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1 bg-gray-50">
        {/* Pinboard Banner Grid */}
        <section className="bg-white py-4 sm:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
              {banners.map((banner, i) => (
                <Link
                  key={i}
                  href={banner.href}
                  target={banner.href.startsWith("http") ? "_blank" : undefined}
                  className={`group relative overflow-hidden rounded-xl sm:rounded-2xl bg-gradient-to-br ${banner.bg} ${
                    banner.wide && i === 0 ? "sm:col-span-2" : ""
                  } ${banner.tall && i === 0 ? "sm:row-span-2" : ""} 
                  hover:shadow-xl transition-all duration-300 hover:scale-[1.02]`}
                >
                  <div className="absolute -right-4 -bottom-4 text-6xl sm:text-8xl opacity-20 select-none group-hover:scale-125 transition-transform duration-500">
                    {banner.icon}
                  </div>
                  <div className="relative z-10 flex h-full flex-col justify-end p-4 sm:p-5 min-h-[120px] sm:min-h-[140px]">
                    <p className="text-white font-extrabold text-sm sm:text-lg leading-tight">{banner.title}</p>
                    <p className="text-white/70 text-[11px] sm:text-sm mt-1">{banner.subtitle}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Category Circles */}
        <section className="py-6 sm:py-8 bg-white border-t border-gray-100">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="flex items-center justify-center gap-5 sm:gap-8 flex-wrap">
              {categoryCircles.map((cat) => (
                <Link key={cat.slug} href={`/productos?category=${cat.slug}`} className="group flex flex-col items-center gap-2.5">
                  <div className={`h-16 w-16 sm:h-18 sm:w-18 rounded-full ${cat.color} flex items-center justify-center ring-4 ring-transparent group-hover:${cat.ring} transition-all duration-300 group-hover:scale-110 shadow-md`}>
                    <span className="text-white font-bold text-xl sm:text-2xl">{cat.name.charAt(0)}</span>
                  </div>
                  <span className="text-[11px] sm:text-xs font-semibold text-gray-600 group-hover:text-gray-900 transition-colors">{cat.name}</span>
                </Link>
              ))}
              <Link href="/productos" className="group flex flex-col items-center gap-2.5">
                <div className="h-16 w-16 sm:h-18 sm:w-18 rounded-full bg-green-600 flex items-center justify-center ring-4 ring-transparent group-hover:ring-green-200 transition-all duration-300 group-hover:scale-110 shadow-md">
                  <span className="text-white text-[10px] sm:text-xs font-bold">Todos</span>
                </div>
                <span className="text-[11px] sm:text-xs font-semibold text-green-700">Ver todo</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Products */}
        <section className="py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900">Nuestros productos</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-1">{allProducts.length} productos disponibles</p>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700">
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* Category filter chips */}
            <div className="flex gap-2 overflow-x-auto pb-4 mb-2">
              <Link href="/productos" className="shrink-0 rounded-full bg-gray-900 text-white px-4 py-2 text-xs sm:text-sm font-bold hover:bg-gray-800 transition-colors">
                Todos
              </Link>
              {["Residencial","Industrial","Gubernamental","Agropecuario","Zonas Costeras"].map((cat) => (
                <Link
                  key={cat}
                  href={`/productos?category=${cat.toLowerCase().replace(" ","-")}`}
                  className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all"
                >
                  {cat}
                </Link>
              ))}
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {allProducts.slice(0, 12).map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>

            <div className="mt-8 text-center sm:hidden">
              <Link href="/productos" className="inline-flex items-center gap-1.5 rounded-full border-2 border-green-200 px-6 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors">
                Ver catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
