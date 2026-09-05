import Link from "next/link"

import {
  cheapest,
  getCatalog,
  heightBands,
  maxWarrantyYears,
  meshes,
  newArrivals,
  priceFrom,
  segmentCards,
  segmentSections,
} from "@/components/home/catalog-data"
import { FeaturedProducts } from "@/components/home/featured-products"
import { HeightGuide } from "@/components/home/height-guide"
import { Hero } from "@/components/home/hero"
import { MeshSection } from "@/components/home/mesh-section"
import { NewArrivals } from "@/components/home/new-arrivals"
import { PriceList } from "@/components/home/price-list"
import { QuoteBand } from "@/components/home/quote-band"
import { SegmentGrid } from "@/components/home/segment-grid"
import { SegmentSections } from "@/components/home/segment-sections"
import { ServicesBand } from "@/components/home/services-band"
import { ValueStrip } from "@/components/home/value-strip"
import { WorksStrip } from "@/components/home/works-strip"

/* Portada «Mercado» — la dirección B que el dueño eligió sobre maqueta.
 *
 * Sigue siendo lo que debe ser una portada de servidor: una petición al
 * catálogo y el reparto de esa lista entre secciones que ya saben pintarse.
 * Toda decisión de agrupación vive en `catalog-data.ts`. Ninguna sección es
 * de cliente: la portada entera se sirve como HTML y no hidrata nada.
 *
 * Orden de las secciones = orden de las preguntas del comprador:
 *   0. La promesa, antes que nada           → cinta ámbar: envío gratis, fábrica.
 *      Es EL único ámbar de la página: acento único por pantalla.
 *   1. ¿Cuánto cuesta cercar lo mío?        → Hero: panel verde con la etiqueta
 *      de precio gigante, el campo de metros y el collage de fotos con precio.
 *      La banda de metros que vivía a media página se eliminó: era el mismo
 *      campo dos veces, y dos campos idénticos en una página confunden.
 *   2. ¿Es gente seria?                     → banda de cuatro datos comprobables
 *   3. Enséñeme el producto                 → «Los más pedidos», con «Comprar»
 *   4. ¿Tienen lo que necesito?             → píldoras por uso, luego una
 *      parrilla por uso
 *   5. ¿Qué altura me hace falta?           → por altura, con enlace a cada modelo
 *   6. ¿Y si no quiero PVC?                 → malla, comparada por calibre
 *   7. Enséñemelo todo con el precio        → lista de precios completa
 *   8. Quiero hablar con alguien            → calculadora, WhatsApp y teléfono
 */
export const revalidate = 3600

export default async function HomePage() {
  const catalog = await getCatalog()
  const from = priceFrom(catalog)
  const warranty = maxWarrantyYears(catalog)

  return (
    /* El enlace «Saltar al contenido» de la cabecera apunta aquí. Es un `div`
       y no un `main` porque el `main` lo pone la maquetación de la tienda, y
       dos `main` anidados no son HTML válido. `tabIndex={-1}` para que el foco
       aterrice de verdad al saltar. */
    <div id="main-content" tabIndex={-1}>
      {/* Cinta ámbar de promesa: el único ámbar de la portada. El envío
          gratis es política publicada (con sus condiciones en /envios, que es
          adonde lleva el clic) y «Fabricado en Panamá» es la credencial. */}
      <Link
        href="/envios"
        className="block bg-brand-amber px-4 py-2 text-center text-sm font-bold text-brand-navy-deep"
      >
        Envío gratis en todo pedido (mínimo 10 m) · Fabricado en Panamá
      </Link>

      {/* El precio de entrada y la garantía llegan contados del catálogo; el
          collage del hero se elige dentro con la misma regla que «Los más
          pedidos»: foto real primero, existencias después. */}
      <Hero products={catalog} priceFrom={from} warrantyYears={warranty} />

      <ValueStrip modelCount={catalog.length} warrantyYears={warranty} />

      <FeaturedProducts products={catalog} />

      <SegmentGrid segments={segmentCards(catalog)} />

      <SegmentSections sections={segmentSections(catalog)} />

      <HeightGuide bands={heightBands(catalog)} />

      <MeshSection products={meshes(catalog)} />

      <ServicesBand />

      {/* Vacía mientras todo el catálogo comparta fecha de alta. */}
      <NewArrivals products={newArrivals(catalog, 7)} />

      {/* Vacía mientras no haya obras documentadas en `nosotros/content.ts`. */}
      <WorksStrip />

      <PriceList products={cheapest(catalog, catalog.length)} />

      <QuoteBand />
    </div>
  )
}
