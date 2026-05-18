import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { ImageLoadProvider } from "@/lib/image-load-context";
import { PageLoadingOverlay } from "@/components/shared/page-loading-overlay";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://intemperie.com.pa"),
  title: {
    default: "Intemperie — Cercas de PVC y Malla Electrosoldada en Panamá",
    template: "%s | Intemperie",
  },
  description:
    "Líderes en Panamá en cercas de PVC y malla electrosoldada. Seguridad, durabilidad y elegancia para hogares, industrias y agro. Cotiza YA.",
  keywords: [
    "cercas PVC Panamá",
    "malla electrosoldada",
    "cercas residenciales",
    "cercas industriales",
    "Intemperie Panamá",
    "cercas La Chorrera",
  ],
  openGraph: {
    type: "website",
    locale: "es_PA",
    siteName: "Intemperie",
    title: "Intemperie — Cercas de PVC y Malla Electrosoldada",
    description:
      "Seguridad y elegancia al aire libre. Cercas de PVC y malla electrosoldada con cobertura en todo Panamá.",
  },
  alternates: {
    canonical: "/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_URL} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": ["Organization", "LocalBusiness"],
              "name": "Intemperie Panamá",
              "url": "https://intemperie.com.pa",
              "logo": "https://intemperie.com.pa/logo.png",
              "description": "Líderes en Panamá en cercas de PVC y malla electrosoldada. Seguridad, durabilidad y elegancia para hogares, industrias y agro.",
              "telephone": "+50762874042",
              "email": "ventas@intemperie.com",
              "address": {
                "@type": "PostalAddress",
                "addressLocality": "La Chorrera",
                "addressRegion": "Panamá Oeste",
                "addressCountry": "PA"
              },
              "areaServed": { "@type": "Country", "name": "PA" },
              "priceRange": "$$",
              "openingHours": "Mo-Fr 08:00-17:00",
              "sameAs": []
            })
          }}
        />
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ImageLoadProvider>
          {children}
          <PageLoadingOverlay />
        </ImageLoadProvider>
        <WhatsAppButton />
        <ScrollToTop />
        <Toaster position="bottom-center" richColors closeButton />
      </body>
    </html>
  );
}
