import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
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

const categoryCircles = [
  { name: "Residencial", slug: "residencial", img: "22c55e/ffffff?text=Cercas+PVC" },
  { name: "Industrial", slug: "industrial", img: "475569/ffffff?text=Mallas" },
  { name: "Gubernamental", slug: "gubernamental", img: "2563EB/ffffff?text=Gobierno" },
  { name: "Agropecuario", slug: "agropecuario", img: "d97706/ffffff?text=Agro" },
  { name: "Zonas Costeras", slug: "zonas-costeras", img: "0891B2/ffffff?text=Costero" },
];

const banners = [
  { title: "Cercas PVC", price: "Desde $18.50/m", href: "/productos?category=residencial", img: "22c55e/ffffff?text=CERCAS+PVC", size: "sm:col-span-2 sm:row-span-2" },
  { title: "Malla Electrosoldada", price: "Desde $8.50/m", href: "/productos?category=industrial", img: "475569/ffffff?text=MALLAS", size: "" },
  { title: "Calcula tu proyecto", price: "Presupuesto al instante", href: "/calculadora", img: "ea580c/ffffff?text=CALCULADORA", size: "" },
  { title: "Zonas Costeras", price: "Desde $38/m", href: "/productos?category=zonas-costeras", img: "0891B2/ffffff?text=COSTERO", size: "" },
  { title: "Envíos a todo Panamá", price: "Contáctanos", href: "https://wa.me/50762874042", img: "7C3AED/ffffff?text=ENVIOS", size: "" },
];

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1 bg-white">
        {/* Pinboard Banner Grid */}
        <section className="bg-gray-50 py-4 sm:py-6">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
              {banners.map((banner, i) => (
                <Link
                  key={i}
                  href={banner.href}
                  target={banner.href.startsWith("http") ? "_blank" : undefined}
                  className={`group relative overflow-hidden rounded-lg sm:rounded-xl ${banner.size}`}
                >
                  <img
                    src={`https://placehold.co/600x400/${banner.img}`}
                    alt={banner.title}
                    className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4">
                    <p className="text-white font-bold text-xs sm:text-sm">{banner.title}</p>
                    <p className="text-white/80 text-[10px] sm:text-xs mt-0.5">{banner.price}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Category Circles */}
        <section className="py-6 sm:py-8">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <h2 className="text-base sm:text-lg font-extrabold text-gray-900 mb-5 text-center">Encuentra todo lo que necesitas aquí</h2>
            <div className="flex items-center justify-center gap-4 sm:gap-8 flex-wrap">
              {categoryCircles.map((cat) => (
                <Link key={cat.slug} href={`/productos?category=${cat.slug}`} className="group flex flex-col items-center gap-2">
                  <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full overflow-hidden border-2 border-gray-100 group-hover:border-green-400 transition-colors">
                    <img src={`https://placehold.co/200x200/${cat.img}`} alt={cat.name} className="h-full w-full object-cover" />
                  </div>
                  <span className="text-[11px] sm:text-xs font-medium text-gray-600 group-hover:text-green-700">{cat.name}</span>
                </Link>
              ))}
              <Link href="/productos" className="group flex flex-col items-center gap-2">
                <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-green-600 flex items-center justify-center group-hover:bg-green-700 transition-colors">
                  <span className="text-white text-xs sm:text-sm font-bold">Ver todo</span>
                </div>
                <span className="text-[11px] sm:text-xs font-medium text-green-700">Catálogo</span>
              </Link>
            </div>
          </div>
        </section>

        {/* Productos */}
        <section className="bg-gray-50 py-8 sm:py-10">
          <div className="mx-auto max-w-7xl px-4 sm:px-6">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">Nuestros productos</h2>
                <p className="text-xs sm:text-sm text-gray-500 mt-0.5">{products.length} productos disponibles</p>
              </div>
              <Link href="/productos" className="hidden sm:flex items-center gap-1 text-sm font-bold text-green-600 hover:text-green-700">
                Ver catálogo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              {products.slice(0, 12).map((p: any) => (
                <ProductCard key={p.id} {...p} />
              ))}
            </div>
            <div className="mt-5 text-center sm:hidden">
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
