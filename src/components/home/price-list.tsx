import Link from "next/link"

import {
  heightRange,
  unitLong,
  unitSuffix,
  warrantyYears,
  type HomeProduct,
} from "./catalog-data"
import { SectionHeader } from "./section"

/* Lista de precios — sistema «Perímetro».
 *
 * La sección que la competencia no tiene. En este mercado el precio se pide
 * por teléfono y llega en un PDF a los tres días; aquí está el catálogo entero
 * en una tabla, ordenado de menor a mayor, con la altura y la garantía al
 * lado. Es el argumento comercial de la casa —«le decimos cuánto cuesta antes
 * de la visita»— convertido en una tabla que se puede leer, comparar e
 * imprimir.
 *
 * Además resuelve el problema del catálogo real: diez de quince fichas no
 * tienen fotografía. Una tabla no necesita ninguna. Aquí los quince modelos
 * pesan lo mismo y compiten por dato, no por si alguien subió la foto.
 *
 * Es un `<table>` de verdad, no una parrilla de `div`: un lector de pantalla
 * anuncia «Precio, 25 dólares por metro, fila 3 de 15», y el navegador la
 * imprime con sus cabeceras. En móvil se ocultan las columnas secundarias en
 * vez de convertir la tabla en un carrusel horizontal.
 */
export function PriceList({ products }: { products: HomeProduct[] }) {
  if (products.length < 3) return null

  const hasMeters = products.some((p) => p.unit === "METRO")

  return (
    <section id="precios" className="defer-paint border-b border-border bg-surface-sunk">
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          eyebrow="Sin llamar, sin esperar"
          title="Lista de precios completa"
          sub={`Los ${products.length} modelos del catálogo, de menor a mayor precio, con su altura y su garantía. El precio es de material; la instalación se cotiza aparte.`}
          href="/calculadora"
          linkLabel="Calcular mi presupuesto"
        />

        <div className="overflow-hidden rounded-lg border border-border bg-surface">
          <table className="w-full text-left">
            <caption className="sr-only">
              Precio por unidad de venta de los {products.length} modelos del
              catálogo de Intemperie, ordenados de menor a mayor.
            </caption>
            <thead>
              <tr className="border-b border-border bg-surface-2">
                <th scope="col" className="px-3 py-2.5 text-2xs text-muted-foreground uppercase">
                  Modelo
                </th>
                <th scope="col" className="hidden px-3 py-2.5 text-2xs text-muted-foreground uppercase sm:table-cell">
                  Uso
                </th>
                <th scope="col" className="px-3 py-2.5 text-2xs text-muted-foreground uppercase">
                  Altura
                </th>
                <th scope="col" className="hidden px-3 py-2.5 text-2xs text-muted-foreground uppercase lg:table-cell">
                  Garantía
                </th>
                <th scope="col" className="hidden px-3 py-2.5 text-2xs text-muted-foreground uppercase lg:table-cell">
                  Existencias
                </th>
                <th scope="col" className="px-3 py-2.5 text-right text-2xs text-muted-foreground uppercase">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {products.map((p) => {
                const years = warrantyYears(p)
                return (
                  <tr key={p.id} className="transition-colors hover:bg-surface-2">
                    <th scope="row" className="px-3 py-2.5 font-normal">
                      <Link
                        href={`/productos/${p.slug}`}
                        className="text-sm font-semibold text-foreground hover:text-brand-green-deep hover:underline"
                      >
                        {p.name}
                      </Link>
                      <span className="mt-0.5 block text-2xs text-muted-foreground sm:hidden">
                        {p.category?.name}
                      </span>
                    </th>
                    <td className="hidden px-3 py-2.5 text-xs text-muted-foreground sm:table-cell">
                      {p.category?.name ?? "—"}
                    </td>
                    <td className="px-3 py-2.5 text-xs text-foreground tabular-nums">
                      {heightRange(p) ?? "—"}
                    </td>
                    <td className="hidden px-3 py-2.5 text-xs text-muted-foreground tabular-nums lg:table-cell">
                      {years != null ? `${years} años` : "—"}
                    </td>
                    <td className="hidden px-3 py-2.5 text-xs text-muted-foreground tabular-nums lg:table-cell">
                      {p.stock > 0
                        ? `${p.stock} ${p.unit === "METRO" ? "m" : "u"}`
                        : "Agotado"}
                    </td>
                    <td className="px-3 py-2.5 text-right whitespace-nowrap">
                      <span className="text-sm font-bold text-foreground tabular-nums">
                        ${p.basePrice.toFixed(2)}
                      </span>
                      <span className="text-2xs font-medium text-muted-foreground">
                        {unitSuffix(p.unit)}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-3 text-xs text-muted-foreground">
          Precios {unitLong(products[0].unit)} de material, en dólares.
          {hasMeters ? " Pedido mínimo de 10 metros lineales." : ""} La altura
          elegida y los accesorios (postes, portón, herrajes) se confirman en la
          ficha de cada modelo.
        </p>
      </div>
    </section>
  )
}
