import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { WhatsAppButton } from "@/components/shared/whatsapp-button";
import { ImageLoadProvider } from "@/lib/image-load-context";
import { PageLoadingOverlay } from "@/components/shared/page-loading-overlay";

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

export const metadata: Metadata = {
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
      </head>
      <body className="min-h-full flex flex-col font-sans">
        <ImageLoadProvider>
          {children}
          <PageLoadingOverlay />
        </ImageLoadProvider>
        <WhatsAppButton />
      </body>
    </html>
  );
}
