import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { BannerGrid } from "@/components/home/banner-grid";
import { CategoryCircles } from "@/components/home/category-circles";
import { ProductGridClient } from "@/components/products/product-grid-client";

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/products?limit=50`, { next: { revalidate: 60 } });
    if (!res.ok) return [];
    const data = await res.json();
    return data.data || data || [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const products = await getProducts();

  return (
    <>
      <Header />
      <main className="flex-1">
        <BannerGrid />
        <CategoryCircles />
        <section className="bg-white pb-16">
          <div className="mx-auto max-w-7xl px-4">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Todos los productos</h2>
                <p className="text-sm text-gray-500">{products.length} productos disponibles</p>
              </div>
            </div>
            <ProductGridClient products={products} />
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
