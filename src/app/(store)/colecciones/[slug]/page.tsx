import { Metadata } from "next";
import Link from "next/link";
import {
  getAllCollectionSlugs,
  getCollectionBySlug,
  listProducts,
} from "../../_data/catalog";
import { ProductGrid } from "@/components/products/product-grid";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/shared/empty-state";
import { PageHeader } from "@/components/shared/page-header";

interface Props {
  params: Promise<{ slug: string }>;
}

/**
 * Colección: estática con revalidación. Antes cada visita disparaba dos `fetch`
 * con `cache: "no-store"` contra la API, que comparte 2 vCPU con Postgres.
 */
// Debe ser un literal: Next analiza la config de segmento estáticamente.
// Mantener sincronizado con CATALOG_TTL de _data/catalog.ts.
export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllCollectionSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  return {
    title: collection?.name || "Colección",
    description: collection?.description || `Colección de productos: ${slug}`,
  };
}

export default async function CollectionPage({ params }: Props) {
  const { slug } = await params;
  const [collection, { products }] = await Promise.all([
    getCollectionBySlug(slug),
    listProducts({ collection: slug }, 100),
  ]);

  if (!collection) {
    return (
      <div className="shell py-section">
        <EmptyState
          diagram="mesh"
          title="Colección no encontrada"
          body="La colección que buscas no existe."
        >
          <Button asChild variant="outline">
            <Link href="/productos">Ver todos los productos</Link>
          </Button>
        </EmptyState>
      </div>
    );
  }

  return (
    <div className="pb-section-sm">
      <PageHeader
        crumbs={[
          { label: "Inicio", href: "/" },
          { label: "Catálogo", href: "/productos" },
          { label: collection.name },
        ]}
        eyebrow="Línea de producto"
        title={collection.name}
        sub={
          <>
            <span className="tabular">{products.length}</span>{" "}
            {products.length === 1 ? "modelo" : "modelos"} · precio de material
            por metro; la instalación se cotiza aparte
          </>
        }
      >
        {collection.description && (
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            {collection.description}
          </p>
        )}
      </PageHeader>
      <div className="shell pt-5 sm:pt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
