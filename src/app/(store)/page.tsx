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
import { ServicesBand } from "@/components/home/services-band"
import { ValueStrip } from "@/components/home/value-strip"
import { WorksStrip } from "@/components/home/works-strip"

/* Portada — «El plano cotizado», sistema «Perímetro».
 *
 * La portada se construye alrededor de la respuesta —«¿cuánto me cuesta?»—,
 * no de la búsqueda: el hero abre con el precio real más barato del catálogo
 * en cuerpo de cartel y una cinta métrica que lo convierte en el precio del
 * lote de quien mira. Una petición al catálogo y el reparto de esa lista
 * entre secciones que ya saben pintarse; toda decisión de agrupación vive en
 * `catalog-data.ts`.
 *
 * La única isla de cliente de la página es `<HeroCounter>` (dentro del hero):
 * dos useState y cero fetch. Todo lo demás es HTML de servidor, y sin
 * JavaScript la portada sigue mostrando la cifra, el range nativo y enlaces
 * válidos.
 *
 * Orden de las secciones = orden de las preguntas del comprador:
 *   1. ¿Cuánto cuesta cercar lo mío?   → Hero: la cifra, la cota y la cinta
 *   2. ¿Y si busco algo concreto?      → Cajetín: buscador + datos auditables
 *   3. Enséñemelo todo con el precio   → Pizarra: los 15 en tabla, con Calcular
 *   4. ¿Qué altura me hace falta?      → Alturas, dibujadas a escala
 *   5. ¿Tienen lo que necesito?        → Usos: parrilla, luego 3 fichas por uso
 *   6. ¿Y si no quiero PVC?            → Malla, comparada por calibre
 *   7. ¿Qué más hacen?                 → Servicios (calculadora, inspección…)
 *   8. Novedades y obras               → condicionales; hoy no pintan
 *   9. ¿Ya sé mis metros?              → Cierre con las dos únicas salidas
 */
export const revalidate = 3600

export default async function HomePage() {
  const catalog = await getCatalog()

  /* Los 15 del catálogo, de menor a mayor precio, con el dinero como cadena
     decimal: la isla del hero lo multiplica en céntimos, nunca en flotante. */
  const heroModels = cheapest(catalog, catalog.length).map((p) => ({
    slug: p.slug,
    name: p.name,
    basePrice: p.basePrice.toFixed(2),
    unit: p.unit,
  }))

  return (
    /* El enlace «Saltar al contenido» de la cabecera apunta aquí. Es un `div`
       y no un `main` porque el `main` lo pone la maquetación de la tienda, y
       dos `main` anidados no son HTML válido. `tabIndex={-1}` para que el foco
       aterrice de verdad al saltar. */
    <div id="main-content" tabIndex={-1}>
      <Hero
        models={heroModels}
        priceFrom={(priceFrom(catalog) ?? 0).toFixed(2)}
      />

      <ValueStrip
        modelCount={catalog.length}
        warrantyYears={maxWarrantyYears(catalog)}
      />

      <PriceList products={cheapest(catalog, catalog.length)} />

      <HeightGuide bands={heightBands(catalog)} />

      <SegmentGrid segments={segmentCards(catalog)} />

      <SegmentSections sections={segmentSections(catalog)} />

      <MeshSection products={meshes(catalog)} />

      <ServicesBand />

      {/* Vacía mientras todo el catálogo comparta fecha de alta. */}
      <NewArrivals products={newArrivals(catalog, 7)} />

      {/* Vacía mientras no haya obras documentadas en `nosotros/content.ts`. */}
      <WorksStrip />

      <QuoteBand />
    </div>
  )
}
