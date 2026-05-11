import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { HeroSection } from "@/components/home/hero-section";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { CollectionsGrid } from "@/components/home/collections-grid";
import { PromoBanner } from "@/components/home/promo-banner";
import { BenefitsSection } from "@/components/home/benefits-section";
import { Testimonials } from "@/components/home/testimonials";

async function getProducts() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
    const res = await fetch(`${baseUrl}/products?limit=8`, { next: { revalidate: 60 } });
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
        <HeroSection />
        <CategoriesGrid />
        {products.length > 0 && <CollectionsGrid products={products} />}
        <PromoBanner />
        <BenefitsSection />
        <Testimonials />
      </main>
      <Footer />
    </>
  );
}
