import type { Metadata } from "next";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Alia2Benefits } from "@/components/alia2/benefits-grid";
import { Alia2Hero } from "@/components/alia2/hero";
import { Alia2Tiers } from "@/components/alia2/tiers";
import { Alia2TrustBand } from "@/components/alia2/trust-band";
import { ALIA2_THEME } from "@/components/alia2/theme";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "ALIA2 — Programa para empresas y contratistas",
  description:
    "Programa B2B de Intemperie para empresas, contratistas e instaladores de cercas en Panamá.",
};

export default function Alia2Page() {
  return (
    <>
      <Header />
      <main className={cn("flex-1 bg-gray-50", ALIA2_THEME)}>
        <Alia2Hero />

        <div className="mx-auto max-w-7xl space-y-8 px-4 py-12 sm:px-6 lg:py-16">
          <Alia2Tiers />
          <Alia2Benefits />
          <Alia2TrustBand />
        </div>
      </main>
      <Footer />
    </>
  );
}
