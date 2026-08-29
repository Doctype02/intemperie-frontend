import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { ScrollToTop } from "@/components/shared/scroll-to-top";
import { ImageLoadProvider } from "@/lib/image-load-context";
import { PageLoadingOverlay } from "@/components/shared/page-loading-overlay";

/* Tipografía — una sola voz, un solo archivo.
 *
 * Archivo es un grotesco de señalización industrial (Omnibus-Type): formas
 * cuadradas, terminaciones rectas, ojo grande. Es la letra de un rótulo de
 * obra o de una placa de fabricante, no la de una startup — que es justo lo
 * que el cliente rechazaba de Plus Jakarta Sans.
 *
 * Se carga como fuente variable: UN archivo con todo el eje de peso. La
 * jerarquía no se compra con familias extra, se construye con peso, cuerpo,
 * interletraje y versalitas (ver .eyebrow y font-heading en globals.css).
 * Se probó emparejarla con Source Sans 3 para el texto corrido: dos familias
 * variables costaban 63.7 kB precargados. Descartado. Con una sola familia
 * son 34.9 kB frente a los 27.3 kB de Plus Jakarta Sans: +7.6 kB y la misma
 * cantidad de peticiones. Es el precio medido de dejar de parecer una
 * startup, y se paga una vez porque la fuente se auto-hospeda y cachea.
 *
 * display:"swap" — con red irregular el texto se ve desde el primer frame.
 * adjustFontFallback (por defecto) sintetiza métricas de respaldo y evita CLS.
 */
const brand = Archivo({
  variable: "--font-brand",
  subsets: ["latin"],
  display: "swap",
  fallback: ["Segoe UI", "Roboto", "Helvetica Neue", "Arial", "sans-serif"],
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
    <html lang="es" className={`${brand.variable} h-full antialiased`}>
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
