import type { Metadata } from "next";
import { Suspense } from "react";

import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { Alia2ApplicationSection } from "@/components/alia2/application-section";
import { Alia2Benefits } from "@/components/alia2/benefits-grid";
import { Alia2Hero } from "@/components/alia2/hero";
import { Alia2Tiers } from "@/components/alia2/tiers";
import { Alia2TrustBand } from "@/components/alia2/trust-band";
import {
  ALIA2_ANCHOR,
  BENEFITS,
  FORM_COPY,
  INTRO,
  TIERS,
} from "@/components/alia2/content";
import { ALIA2_THEME } from "@/components/alia2/theme";
import { cn } from "@/lib/utils";

const BASE_URL = "https://intemperie.com.pa";
const PAGE_PATH = "/alia2";
const PAGE_URL = `${BASE_URL}${PAGE_PATH}`;

/**
 * Imagen para compartir. Se reutiliza una foto real del catálogo en vez de
 * `/og-default.jpg`, que hoy no existe en `public/`: una previsualización rota
 * en WhatsApp le cuesta clientes a una página cuyo canal principal es ese.
 */
const OG_IMAGE = `${BASE_URL}/products/cerca-pvc-vesta-601/vesta-1.jpg`;

const TITLE = "ALIA2 — Programa para empresas y contratistas de cercas en Panamá";
const DESCRIPTION =
  "ALIA2 de Intemperie es el programa B2B para empresas, contratistas e instaladores de cercas en Panamá: descuentos escalonados, cotización prioritaria, capacitaciones y beneficios en acarreo y mano de obra. Solicita tu ingreso en línea.";

/**
 * Metadatos de la landing B2B. Se usa `generateMetadata` (no el objeto
 * estático) para dejar el hueco a datos de campaña o variantes por país sin
 * cambiar la forma del archivo; la función no introduce nada dinámico, así que
 * la página se sigue prerenderizando y los metadatos van en el HTML inicial.
 */
export async function generateMetadata(): Promise<Metadata> {
  return {
    title: TITLE,
    description: DESCRIPTION,
    keywords: [
      "programa para empresas de cercas Panamá",
      "programa para contratistas Panamá",
      "ALIA2 Intemperie",
      "descuentos para constructoras Panamá",
      "proveedor de cercas para instaladores",
      "cercas PVC al por mayor Panamá",
    ],
    alternates: { canonical: PAGE_PATH },
    openGraph: {
      type: "website",
      locale: "es_PA",
      siteName: "Intemperie",
      url: PAGE_URL,
      title: TITLE,
      description: DESCRIPTION,
      images: [
        {
          url: OG_IMAGE,
          width: 1200,
          height: 630,
          alt: "ALIA2 de Intemperie, programa para empresas y contratistas en Panamá",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: TITLE,
      description: DESCRIPTION,
      images: [OG_IMAGE],
    },
    robots: { index: true, follow: true },
  };
}

/**
 * Datos estructurados: el programa como servicio B2B, con sus tres niveles en
 * un catálogo de ofertas, más el desglose de la página para el buscador.
 */
const jsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "WebPage",
      "@id": `${PAGE_URL}#webpage`,
      url: PAGE_URL,
      name: TITLE,
      description: DESCRIPTION,
      inLanguage: "es-PA",
      isPartOf: { "@type": "WebSite", url: BASE_URL, name: "Intemperie" },
      primaryImageOfPage: OG_IMAGE,
    },
    {
      "@type": "Service",
      "@id": `${PAGE_URL}#programa`,
      name: "ALIA2 de Intemperie",
      serviceType: "Programa de aliados comerciales para empresas y contratistas",
      description: INTRO.body,
      url: PAGE_URL,
      areaServed: { "@type": "Country", name: "Panamá" },
      audience: {
        "@type": "BusinessAudience",
        name: "Empresas, contratistas e instaladores del sector construcción",
      },
      provider: {
        "@type": "Organization",
        name: "Intemperie Panamá",
        url: BASE_URL,
        telephone: "+50762874042",
        email: "ventas@intemperie.com",
      },
      hasOfferCatalog: {
        "@type": "OfferCatalog",
        name: "Niveles del programa ALIA2",
        itemListElement: TIERS.map((tier) => ({
          "@type": "Offer",
          name: tier.name,
          description: `${tier.tagline}. ${tier.bullets.join(". ")}.`,
          category: tier.level,
          availability: "https://schema.org/InStock",
          url: `${PAGE_URL}?nivel=${tier.level.toLowerCase()}#${ALIA2_ANCHOR}`,
        })),
      },
      potentialAction: {
        "@type": "ApplyAction",
        name: FORM_COPY.submit,
        target: `${PAGE_URL}#${ALIA2_ANCHOR}`,
      },
      additionalProperty: BENEFITS.map((benefit) => ({
        "@type": "PropertyValue",
        name: "Beneficio",
        value: benefit.title,
      })),
    },
    {
      "@type": "FAQPage",
      "@id": `${PAGE_URL}#faq`,
      mainEntity: [
        {
          "@type": "Question",
          name: "¿Quién puede solicitar el ingreso a ALIA2?",
          acceptedAnswer: { "@type": "Answer", text: INTRO.body },
        },
        {
          "@type": "Question",
          name: "¿La solicitud es aprobada automáticamente?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "No. Cada solicitud queda sujeta a validación y aprobación de Intemperie: nuestro equipo evalúa la información de la empresa antes de confirmar el nivel y los beneficios.",
          },
        },
        {
          "@type": "Question",
          name: "¿Qué documento debo adjuntar?",
          acceptedAnswer: {
            "@type": "Answer",
            text: "El aviso de operación o un documento legal de la empresa, en PDF o JPG, de máximo 10 MB.",
          },
        },
      ],
    },
  ],
};

export default function Alia2Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <Header />

      <main id="main-content" className={cn("flex-1 bg-gray-50", ALIA2_THEME)}>
        <Alia2Hero />

        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,28rem)] lg:items-start lg:gap-10">
            <div className="space-y-8">
              <Alia2Tiers />
              <Alia2Benefits />
              <Alia2TrustBand />
            </div>

            {/* El formulario acompaña al contenido en pantallas grandes y queda
                al final en móvil, adonde llevan todos los CTA. */}
            <div className="lg:sticky lg:top-24">
              <Suspense fallback={<FormSkeleton />}>
                <Alia2ApplicationSection />
              </Suspense>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  );
}

/**
 * Reserva el sitio del formulario mientras se hidrata (lee `?nivel=` en el
 * cliente). Altura fija para no provocar saltos de diseño (CLS).
 */
function FormSkeleton() {
  return (
    <div
      id={ALIA2_ANCHOR}
      role="status"
      aria-label="Cargando el formulario de registro para empresas"
      className="scroll-mt-20 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div aria-hidden="true" className="animate-pulse space-y-4">
        <div className="h-6 w-2/3 rounded bg-gray-200" />
        <div className="h-4 w-1/2 rounded bg-gray-100" />
        <div className="grid gap-4 pt-2 sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-16 rounded-lg bg-gray-100" />
          ))}
        </div>
        <div className="h-28 rounded-lg bg-gray-100" />
        <div className="h-12 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
