import { Metadata } from "next";
import Link from "next/link";
import {
  getAllCategorySlugs,
  getCategoryBySlug,
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
 * Categoría: estática con revalidación. Antes cada visita disparaba dos `fetch`
 * con `cache: "no-store"` contra la API, que comparte 2 vCPU con Postgres.
 */
// Debe ser un literal: Next analiza la config de segmento estáticamente.
// Mantener sincronizado con CATALOG_TTL de _data/catalog.ts.
export const revalidate = 600;

export async function generateStaticParams() {
  const slugs = await getAllCategorySlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  return {
    title: category?.name || "Categoría",
    description: category?.description || `Productos en la categoría ${slug}`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const [category, { products }] = await Promise.all([
    getCategoryBySlug(slug),
    listProducts({ category: slug }, 100),
  ]);

  if (!category) {
    return (
      <div className="shell py-section">
        <EmptyState
          diagram="picket"
          title="Categoría no encontrada"
          body="La categoría que buscas no existe."
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
          { label: category.name },
        ]}
        eyebrow="Cercado por uso"
        title={category.name}
        sub={
          <>
            <span className="tabular">{products.length}</span>{" "}
            {products.length === 1 ? "modelo" : "modelos"} · precio de material
            por metro; la instalación se cotiza aparte
          </>
        }
      >
        {category.description && (
          <p className="mt-2 max-w-prose text-sm text-muted-foreground">
            {category.description}
          </p>
        )}
      </PageHeader>
      <div className="shell pt-5 sm:pt-6">
        <ProductGrid products={products} />
      </div>
    </div>
  );
}
