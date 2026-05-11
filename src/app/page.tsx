import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { ArrowRight, ChevronRight } from "lucide-react";
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

const pinboardBanners = [
  { title: "Cercas PVC Residenciales", subtitle: "Desde $18.50 el metro", href: "/productos?category=residencial", img: "22c55e/ffffff?text=CERCAS+PVC", wide: true, tall: true },
  { title: "Malla Electrosoldada", subtitle: "Desde $8.50 el metro", href: "/productos?category=industrial", img: "475569/ffffff?text=MALLAS", wide: false, tall: false },
  { title: "Calcula tu proyecto", subtitle: "Presupuesto al instante", href: "/calculadora", img: "ea580c/ffffff?text=CALCULADORA", wide: false, tall: false },
  { title: "Cercas para Zonas Costeras", subtitle: "Resistentes al salitre", href: "/productos?category=zonas-costeras", img: "0891B2/ffffff?text=COSTERO", wide: false, tall: false },
  { title: "Envíos a todo Panamá", subtitle: "Contáctanos por WhatsApp", href: "https://wa.me/50762874042", img: "7C3AED/ffffff?text=ENVIOS", wide: false, tall: false },
];

const categoryTabs = [
  { name: "Residencial", slug: "residencial", img: "22c55e/ffffff?text=CERCAS" },
  { name: "Industrial", slug: "industrial", img: "475569/ffffff?text=MALLAS" },
  { name: "Gubernamental", slug: "gubernamental", img: "2563EB/ffffff?text=GOBIERNO" },
  { name: "Zonas Costeras", slug: "zonas-costeras", img: "0891B2/ffffff?text=COSTERO" },
  { name: "Agropecuario", slug: "agropecuario", img: "d97706/ffffff?text=AGRO" },
];

export default async function HomePage() {
  const allProducts = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        {/* Pinboard Banner Grid */}
        <section className="bg-gray-50 py-3 sm:py-5">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {pinboardBanners.map((banner, i) => {
                const wide = banner.wide && i === 0 ? "sm:col-span-2" : "";
                const tall = banner.tall && i === 0 ? "sm:row-span-2" : "";
                return (
                  <Link
                    key={i}
                    href={banner.href}
                    target={banner.href.startsWith("http") ? "_blank" : undefined}
                    className={`group relative overflow-hidden rounded-lg sm:rounded-xl ${wide} ${tall}`}
                  >
                    <img
                      src={`https://placehold.co/600x400/${banner.img}`}
                      alt={banner.title}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading={i < 3 ? "eager" : "lazy"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-2.5 sm:p-4">
                      <p className="text-white font-bold text-[11px] sm:text-sm leading-tight">{banner.title}</p>
                      <p className="text-white/80 text-[10px] sm:text-xs mt-0.5">{banner.subtitle}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>

        {/* Product Tabs Section */}
        <section className="py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-4">
              <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Nuestros productos</h2>
            </div>

            {/* Category tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
              <Link
                href="/productos"
                className="shrink-0 rounded-full bg-gray-900 text-white px-4 py-2 text-xs sm:text-sm font-bold hover:bg-gray-800 transition-colors"
              >
                Todos
              </Link>
              {categoryTabs.map((tab) => (
                <Link
                  key={tab.slug}
                  href={`/productos?category=${tab.slug}`}
                  className="shrink-0 rounded-full border border-gray-200 px-4 py-2 text-xs sm:text-sm font-medium text-gray-600 hover:border-green-300 hover:text-green-700 hover:bg-green-50 transition-all"
                >
                  {tab.name}
                </Link>
              ))}
            </div>

            {/* Product grid */}
            {allProducts.length > 0 && (
              <div className="relative">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
                  {allProducts.slice(0, 12).map((p: any) => (
                    <ProductCard key={p.id} {...p} />
                  ))}
                </div>
              </div>
            )}

            <div className="mt-5 text-center">
              <Link
                href="/productos"
                className="inline-flex items-center gap-1.5 rounded-full border-2 border-green-200 px-6 py-2.5 text-sm font-bold text-green-700 hover:bg-green-50 transition-colors"
              >
                Ver catálogo completo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        {/* Category Circles */}
        <section className="bg-gray-50 py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-5 text-center">Encuentra lo que necesitas</h2>
            <div className="flex items-center justify-center gap-4 sm:gap-6 flex-wrap">
              {categoryTabs.map((cat) => (
                <Link key={cat.slug} href={`/productos?category=${cat.slug}`} className="group flex flex-col items-center gap-2">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-green-400 transition-colors">
                    <img src={`https://placehold.co/200x200/${cat.img}`} alt={cat.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-gray-600 group-hover:text-green-700">{cat.name}</span>
                </Link>
              ))}
              <Link href="/productos" className="group flex flex-col items-center gap-2">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-600 flex items-center justify-center group-hover:bg-green-700 transition-colors">
                  <span className="text-white text-[11px] sm:text-sm font-bold">Ver todo</span>
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-green-700">Catálogo</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Long Banner */}
        <section className="py-4 sm:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <Link href="/calculadora" className="group block overflow-hidden rounded-xl">
              <img
                src="https://placehold.co/1800x240/16a34a/ffffff?text=CALCULA+TU+PROYECTO+AHORA"
                alt="Calcula tu proyecto"
                className="w-full h-16 sm:h-24 object-cover group-hover:scale-[1.02] transition-transform duration-500"
              />
            </Link>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
