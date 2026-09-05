import type { SegmentSection } from "./catalog-data"
import { ProductTile, ViewAllTile } from "./product-tile"
import { SectionHeader } from "./section"

/* Secciones por segmento — sistema «Perímetro».
 *
 * Una sección por uso, con su parrilla de producto. Es la densidad comercial
 * de la referencia: mucha oferta a la vista, sin carrusel que obligue a
 * arrastrar para descubrir que había un modelo más, y sin scroll infinito que
 * nunca deje llegar al pie.
 *
 * Siete fichas más la casilla de salida = ocho, dos filas completas de cuatro
 * en escritorio y cuatro de dos en móvil. Con siete productos ya se ve más
 * catálogo del que cabía en el carrusel anterior y el hilo principal no
 * ejecuta nada: son enlaces.
 *
 * La casilla de salida se pinta siempre, tenga el segmento dos modelos o
 * quince. Con dos evita el hueco que hace parecer rota la fila; con quince es
 * la puerta al listado. En los dos casos lleva el recuento real.
 *
 * Las superficies alternan (papel / hundida) para que tres parrillas seguidas
 * no se lean como una sola mancha de tarjetas.
 */
const PER_SECTION = 7

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

            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
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
