/* Constructores de JSON-LD para las paginas de catalogo.
 *
 * Regla dura: nunca se emite AggregateRating ni Review. El catalogo no tiene
 * ninguna resena real, y un dato estructurado inventado es una penalizacion de
 * Google, no una mejora. Los campos opcionales (imagen, descripcion) solo se
 * emiten si el dato existe: 10 de los 15 productos no tienen foto.
 */
import { SITE_URL, absoluteUrl } from "./site-url";

export interface BreadcrumbSegment { name: string; url: string }

export function breadcrumbJsonLd(segments: BreadcrumbSegment[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((s, i) => ({
      "@type": "ListItem", position: i + 1, name: s.name, item: s.url,
    })),
  };
}

export interface ListedProduct { slug: string; name: string; image?: string | null }

export function collectionPageJsonLd(input: {
  name: string; description?: string | null; url: string; products: ListedProduct[];
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: input.name,
    ...(input.description ? { description: input.description } : {}),
    url: input.url,
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: input.products.length,
      itemListElement: input.products.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.name,
        url: `${SITE_URL}/productos/${p.slug}`,
        ...(p.image ? { image: absoluteUrl(p.image) } : {}),
      })),
    },
  };
}
