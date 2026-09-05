import type { SegmentSection } from "./catalog-data"
import { ProductTile, ViewAllTile } from "./product-tile"
import { SectionHeader } from "./section"

/* Secciones por segmento — sistema «Perímetro».
 *
 * Tres fichas por segmento más la casilla de salida: una fila completa de
 * cuatro en escritorio, dos de dos en móvil. Antes eran siete más la salida, y
 * sumadas a la parrilla de usos, la guía de alturas y la lista de precios el
 * mismo producto se imprimía hasta cuatro veces y la portada móvil pasaba de
 * los 8.000 px. Ahora cada producto aparece con ficha una vez y en tabla una
 * vez: quien quiera el segmento entero tiene la casilla de salida con el
 * recuento real, y quien quiera comparar los quince tiene la pizarra de
 * precios unas pantallas más arriba.
 *
 * `products` ya llega ordenado por precio ascendente desde `catalog-data`, así
 * que las tres fichas son los tres precios de entrada del segmento.
 *
 * El separador entre segmentos es `.picket-rule`: el separador ES un tramo de
 * cerca, no otra línea gris.
 */
const PER_SECTION = 3

export function SegmentSections({ sections }: { sections: SegmentSection[] }) {
  if (!sections.length) return null

  return (
    <>
      {sections.map((seg, i) => (
        <section
          key={seg.slug}
          id={`uso-${seg.slug}`}
          className={`defer-paint border-b border-border ${i % 2 === 0 ? "bg-background" : "bg-surface-sunk"}`}
        >
          {i > 0 && <div className="picket-rule" aria-hidden="true" />}
          <div className="shell py-8 sm:py-10 lg:py-12">
            <SectionHeader
              eyebrow={seg.promise}
              title={`Cercado ${seg.name.toLowerCase()}`}
              sub={`${seg.who}. ${
                seg.from != null
                  ? `Precio de entrada $${seg.from.toFixed(2)} por metro lineal.`
                  : ""
              }`}
              href={`/productos?category=${seg.slug}`}
              count={seg.total}
            />

            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
              {seg.products.slice(0, PER_SECTION).map((p) => (
                <ProductTile key={p.id} p={p} />
              ))}
              <ViewAllTile
                href={`/productos?category=${seg.slug}`}
                label={`Ver ${seg.name.toLowerCase()}`}
                hint={`${seg.total} ${seg.total === 1 ? "modelo" : "modelos"} con precio y altura`}
              />
            </div>
          </div>
        </section>
      ))}
    </>
  )
}
