import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BannerGrid } from "@/components/home/banner-grid";
import { CategoryCircles } from "@/components/home/category-circles";
import { HeroSection } from "@/components/home/hero-section";
import { ProductGrid } from "@/components/products/product-grid";

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/products?limit=50`, { next: { revalidate: 60 } });
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
        <HeroSection />
        <BannerGrid />
        <CategoryCircles />
        <section className="bg-white pb-12 px-4">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Nuestros productos</h2>
                <p className="text-sm text-gray-500">{products.length} productos disponibles</p>
              </div>
            </div>
            <ProductGrid products={products} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
