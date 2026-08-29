import { Metadata } from "next";
import { notFound } from "next/navigation";
import {
  getAllProductSlugs,
  getProductBySlug,
} from "../../_data/catalog";
import { ProductDetailClient } from "./product-detail-client";

/**
 * Ficha de producto: estática con revalidación.
 *
 * Los 15 slugs del catálogo se prerenderizan en el build; los que aparezcan
 * después se generan bajo demanda en la primera visita y quedan cacheados
 * (`dynamicParams` por defecto). El TTL es la red de seguridad: el camino
 * rápido es `POST /api/revalidate?tag=product:<slug>` cuando el admin guarda.
 */
// Debe ser un literal: Next analiza la config de segmento estáticamente.
// Mantener sincronizado con CATALOG_TTL de _data/catalog.ts.
export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

const BASE_URL = "https://intemperie.com.pa";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Producto no encontrado" };

  const description = product.description?.slice(0, 160) ??
    `Cerca PVC ${product.name} — resistente, sin mantenimiento, garantía 15 años. Disponible en Panamá.`;

  const rawImageUrl: string | undefined = product.images?.[0]?.url;
  const imageUrl = rawImageUrl
    ? rawImageUrl.startsWith("http") ? rawImageUrl : `${BASE_URL}${rawImageUrl}`
    : `${BASE_URL}/og-default.jpg`;

  return {
    title: `${product.name} | Intemperie Panamá`,
    description,
    openGraph: {
      title: `${product.name} | Intemperie Panamá`,
      description,
      url: `${BASE_URL}/productos/${slug}`,
      siteName: "Intemperie Panamá",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
      type: "website",
      locale: "es_PA",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.name} | Intemperie Panamá`,
      description,
      images: [imageUrl],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const price = Number(product.basePrice ?? 0);
  const rawImg: string | undefined = product.images?.[0]?.url;
  const imageUrl = rawImg
    ? rawImg.startsWith("http") ? rawImg : `${BASE_URL}${rawImg}`
    : undefined;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    ...(product.description && { "description": product.description }),
    ...(imageUrl && { "image": imageUrl }),
    "brand": { "@type": "Brand", "name": "Intemperie" },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": price.toFixed(2),
      "availability": product.stock > 0
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      "url": `${BASE_URL}/productos/${slug}`,
      "seller": { "@type": "Organization", "name": "Intemperie Panamá" },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <main id="main-content" className="flex-1 bg-white">
        <ProductDetailClient product={product} />
      </main>
    </>
  );
}
