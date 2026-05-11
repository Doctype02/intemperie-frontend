import { HeroSection } from "@/components/home/hero-section";
import { CategoriesGrid } from "@/components/home/categories-grid";
import { CollectionsGrid } from "@/components/home/collections-grid";
import { BenefitsSection } from "@/components/home/benefits-section";
import { Testimonials } from "@/components/home/testimonials";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      <HeroSection />
      <CategoriesGrid />
      <CollectionsGrid />
      <BenefitsSection />
      <Testimonials />
    </div>
  );
}
