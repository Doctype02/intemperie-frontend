import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, PackageCheck, ShieldCheck, Truck } from "lucide-react";
import { getAllProductSlugs, getProductBySlug } from "../../_data/catalog";
import { ProductGallery } from "@/components/products/product-gallery";
import { ProductPurchasePanel } from "./product-detail-client";
import { ProductFaq, buildFaq } from "./product-faq";
import { ProductHighlights, ProductSpecSheet } from "./product-spec-sheet";
import { toProductView, type ProductView } from "./product-view";

/**
 * Ficha de producto: estática con revalidación.
 *
 * Los 15 slugs del catálogo se prerenderizan en el build; los que aparezcan
 * después se generan bajo demanda en la primera visita y quedan cacheados
 * (`dynamicParams` por defecto). El TTL es la red de seguridad: el camino
 * rápido es `POST /api/revalidate?tag=product:<slug>` cuando el admin guarda.
 *
 * Todo lo de esta página se pinta en el servidor salvo el panel de compra.
 */
// Debe ser un literal: Next analiza la config de segmento estáticamente.
// Mantener sincronizado con CATALOG_TTL de _data/catalog.ts.
export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

const BASE_URL = "https://intemperie.com.pa";

/** Absolutiza las rutas de imagen que la API devuelve relativas. */
function absolute(url: string | undefined): string | undefined {
  if (!url) return undefined;
  return url.startsWith("http") ? url : `${BASE_URL}${url}`;
}

/**
 * Descripción para buscadores y redes. Si el producto no trae texto, se compone
 * con sus datos reales (altura, material, garantía) en vez de con una frase de
 * relleno igual para los quince productos.
 */
function seoDescription(product: ProductView): string {
  if (product.description) return product.description.slice(0, 160);
  const bits = [
    product.heights.length > 0 ? `Alturas ${product.heights.join(", ")}` : null,
    product.material,
    product.warranty ? `garantía ${product.warranty}` : null,
    `desde $${product.price.toFixed(2)}${product.unitCopy.price}`,
  ].filter(Boolean);
  return `${product.name}. ${bits.join(" · ")}. Envío a todo Panamá.`.slice(0, 160);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const raw = await getProductBySlug(slug);
  if (!raw) return { title: "Producto no encontrado" };

  const product = toProductView(raw);
  const title = `${product.name} | Intemperie Panamá`;
  const description = seoDescription(product);
  const imageUrl = absolute(product.images[0]?.url) ?? `${BASE_URL}/og-default.jpg`;
  const url = `${BASE_URL}/productos/${slug}`;

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: "Intemperie Panamá",
      images: [{ url: imageUrl, width: 1200, height: 630, alt: product.name }],
      type: "website",
      locale: "es_PA",
    },
    twitter: { card: "summary_large_image", title, description, images: [imageUrl] },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const raw = await getProductBySlug(slug);

  if (!raw) {
    notFound();
  }

  const product = toProductView(raw);
  const faq = buildFaq(product);
  const url = `${BASE_URL}/productos/${slug}`;

  /* Diez de los quince productos no tienen foto. El panel que ocupa su sitio
     muestra los datos que NO están ya en la tira de destacados, para que el
     hueco aporte información nueva en vez de repetir la de arriba. */
  const galleryFacts = product.specs
    .filter((spec) => !product.highlights.some((h) => h.key === spec.key))
    .slice(0, 4);

  /* Datos estructurados. Sólo se declara lo que la ficha muestra de verdad:
     no hay `aggregateRating` porque no hay ni una reseña en el catálogo, y
     marcar estrellas inexistentes es motivo de sanción manual en Google. */
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "Product",
      name: product.name,
      ...(product.description && { description: product.description }),
      ...(product.images.length > 0 && {
        image: product.images.map((img) => absolute(img.url)).filter(Boolean),
      }),
      ...(product.material && { material: product.material }),
      ...(product.colors.length > 0 && { color: product.colors.join(", ") }),
      ...(product.categoryName && { category: product.categoryName }),
      brand: { "@type": "Brand", name: "Intemperie" },
      ...(product.specs.length > 0 && {
        additionalProperty: product.specs.map((spec) => ({
          "@type": "PropertyValue",
          name: spec.label,
          value: spec.value,
        })),
      }),
      offers: {
        "@type": "Offer",
        priceCurrency: "USD",
        price: product.price.toFixed(2),
        availability:
          product.stock > 0
            ? "https://schema.org/InStock"
            : "https://schema.org/OutOfStock",
        url,
        seller: { "@type": "Organization", name: "Intemperie Panamá" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Inicio", item: BASE_URL },
        { "@type": "ListItem", position: 2, name: "Productos", item: `${BASE_URL}/productos` },
        { "@type": "ListItem", position: 3, name: product.name, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((item) => ({
        "@type": "Question",
        name: item.q,
        acceptedAnswer: { "@type": "Answer", text: item.a },
      })),
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* El layout de la tienda ya aporta el <main>; aquí sólo el destino del
          enlace «saltar al contenido». */}
      <div id="main-content" tabIndex={-1} className="bg-background outline-none">
        <div className="mx-auto max-w-7xl px-4 pt-4 pb-28 sm:px-6 lg:pt-6 lg:pb-14">
          <nav aria-label="Ruta de navegación" className="mb-4 hidden sm:block">
            <ol className="flex items-center gap-1 text-xs text-muted-foreground">
              <li>
                <Link href="/" className="hover:text-brand-green-deep">
                  Inicio
                </Link>
              </li>
              <ChevronRight className="size-3" aria-hidden="true" />
              <li>
                <Link href="/productos" className="hover:text-brand-green-deep">
                  Productos
                </Link>
              </li>
              <ChevronRight className="size-3" aria-hidden="true" />
              <li className="truncate text-foreground" aria-current="page">
                {product.name}
              </li>
            </ol>
          </nav>

          <header className="max-w-3xl">
            {(product.collectionName || product.categoryName) && (
              <p className="text-2xs font-semibold uppercase text-muted-foreground">
                {[product.collectionName, product.categoryName]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            )}
            <h1 className="mt-1 font-heading text-3xl font-bold tracking-tight text-foreground">
              {product.name}
            </h1>
            {product.description && (
              <p className="mt-2 text-base text-muted-foreground">{product.description}</p>
            )}
            <div className="mt-3">
              <ProductHighlights highlights={product.highlights} />
            </div>
          </header>

          {/* Tres celdas: en móvil caen en orden de compra (foto, panel, datos);
              en escritorio el panel ocupa la columna derecha y se queda fijo. */}
          <div className="mt-6 grid gap-6 lg:mt-8 lg:grid-cols-[minmax(0,1fr)_21rem] lg:gap-8 xl:grid-cols-[minmax(0,1fr)_23rem]">
            <div className="lg:col-start-1 lg:row-start-1">
              <ProductGallery
                images={product.images}
                productName={product.name}
                highlights={galleryFacts}
              />
            </div>

            <aside className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-[77px] lg:self-start">
              <PriceBlock product={product} />
              <div className="mt-4">
                <ProductPurchasePanel product={product} />
              </div>
              <TrustStrip />
            </aside>

            {/* Bajo el pliegue: el navegador se ahorra el pintado hasta que se
                acerca, y el hueco queda reservado para no mover nada. */}
            <div
              className="space-y-6 lg:col-start-1 lg:row-start-2"
              style={{ contentVisibility: "auto", containIntrinsicSize: "auto 700px" }}
            >
              <ProductSpecSheet product={product} />
              <ProductFaq items={faq} />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ── Precio y disponibilidad (servidor: no cambian con la interacción) ──── */

function PriceBlock({ product }: { product: ProductView }) {
  const { stock } = product;
  const availability =
    stock === 0
      ? { label: "Agotado — consúltanos plazo", className: "bg-surface-2 text-muted-foreground" }
      : stock <= 5
        ? { label: `Últimas ${stock} ${product.unitCopy.abbr}`, className: "bg-brand-amber-soft text-accent-foreground" }
        : { label: "En stock · listo para despachar", className: "bg-secondary text-secondary-foreground" };

  return (
    <div className="rounded-xl border border-hairline bg-surface p-4">
      <p className="flex items-baseline gap-1.5">
        <span className="font-heading text-4xl font-bold tabular-nums text-foreground">
          ${product.price.toFixed(2)}
        </span>
        <span className="text-sm text-muted-foreground">{product.unitCopy.price}</span>
      </p>
      <p className="mt-2">
        <span
          className={`inline-flex items-center rounded-md px-2 py-0.5 text-2xs font-semibold uppercase ${availability.className}`}
        >
          {availability.label}
        </span>
      </p>
      {product.unit === "METRO" && (
        <p className="mt-2 text-xs text-muted-foreground">
          Pedido mínimo 10 m lineales · precio antes de ITBMS
        </p>
      )}
    </div>
  );
}

function TrustStrip() {
  const items = [
    { Icon: Truck, text: "Envío gratis en pedidos sobre $50" },
    { Icon: ShieldCheck, text: "Garantía de fábrica en todos los modelos" },
    { Icon: PackageCheck, text: "Instaladores certificados en todo Panamá" },
  ];

  return (
    <ul className="mt-4 space-y-2 rounded-xl border border-hairline bg-surface p-4">
      {items.map(({ Icon, text }) => (
        <li key={text} className="flex items-start gap-2 text-xs text-muted-foreground">
          <Icon className="size-4 shrink-0 text-brand-green" aria-hidden="true" />
          {text}
        </li>
      ))}
    </ul>
  );
}
