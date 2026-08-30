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
import { HeightGuide } from "@/components/home/height-guide"
import { Hero } from "@/components/home/hero"
import { MeshSection } from "@/components/home/mesh-section"
import { NewArrivals } from "@/components/home/new-arrivals"
import { PriceList } from "@/components/home/price-list"
import { QuoteBand } from "@/components/home/quote-band"
import { SegmentGrid } from "@/components/home/segment-grid"
import { SegmentSections } from "@/components/home/segment-sections"
import { ValueStrip } from "@/components/home/value-strip"

/* Portada — sistema «Perímetro».
 *
 * Este fichero tenía 596 líneas: dos maquetaciones de sección declaradas dos
 * veces, tres listas de productos filtradas con nombres escritos a mano
 * («afrodita», «poseid», «vesta»…), tres testimonios inventados con cinco
 * estrellas cada uno y un carrusel de cliente con cuatro fotos a pantalla
 * completa.
 *
 * Ahora es lo que debe ser una portada de servidor: una petición al catálogo y
 * el reparto de esa lista entre secciones que ya saben pintarse. Toda decisión
 * de agrupación vive en `catalog-data.ts`, así que un modelo nuevo entra en su
 * segmento, en su franja de altura y en la lista de precios el día que se dé
 * de alta, sin tocar este fichero.
 *
 * Ninguna sección es de cliente. La portada entera —hero, ocho bloques de
 * catálogo y cierre— se sirve como HTML y no hidrata nada. El JavaScript que
 * queda en la página es el de la cabecera (menú móvil, sesión, favoritos,
 * carrito) y el botón flotante de WhatsApp.
 *
 * Orden de las secciones = orden de las preguntas del comprador:
 *   1. ¿Cuánto cuesta cercar lo mío?      → Hero, con buscador y precio de entrada
 *   2. ¿Es gente seria?                    → banda de cuatro datos comprobables
 *   3. ¿Tienen lo que necesito?            → por uso, luego una parrilla por uso
 *   4. ¿Qué altura me hace falta?          → por altura, con enlace a cada modelo
 *   5. ¿Y si no quiero PVC?                → malla, comparada por calibre
 *   6. Enséñemelo todo con el precio       → lista de precios completa
 *   7. Quiero hablar con alguien           → calculadora, WhatsApp y teléfono
 */
export const revalidate = 3600

export default async function HomePage() {
  const catalog = await getCatalog()

  return (
    /* El enlace «Saltar al contenido» de la cabecera apunta aquí. Es un `div`
       y no un `main` porque el `main` lo pone la maquetación de la tienda, y
       dos `main` anidados no son HTML válido. `tabIndex={-1}` para que el foco
       aterrice de verdad al saltar. */
    <div id="main-content" tabIndex={-1}>
      <Hero
        priceFrom={priceFrom(catalog)}
        modelCount={catalog.length}
        warrantyYears={maxWarrantyYears(catalog)}
      />

      <ValueStrip
        modelCount={catalog.length}
        priceFrom={priceFrom(catalog)}
        warrantyYears={maxWarrantyYears(catalog)}
      />

      <SegmentGrid segments={segmentCards(catalog)} />

      <SegmentSections sections={segmentSections(catalog)} />

      <HeightGuide bands={heightBands(catalog)} />

      <MeshSection products={meshes(catalog)} />

      {/* Vacía mientras todo el catálogo comparta fecha de alta. */}
      <NewArrivals products={newArrivals(catalog, 7)} />

      <PriceList products={cheapest(catalog, catalog.length)} />

      <QuoteBand />
    </div>
  )
}
