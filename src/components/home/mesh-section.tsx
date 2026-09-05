import Link from "next/link"

import {
  heightRange,
  unitSuffix,
  warrantyYears,
  type HomeProduct,
} from "./catalog-data"
import { SectionHeader } from "./section"

/* Malla electrosoldada — sistema «Perímetro».
 *
 * Cuatro modelos, ninguno con fotografía, y son los que abren el catálogo por
 * precio: la Mini Titán a $8.50 el metro es la puerta de entrada de toda la
 * tienda. Esconderlos detrás de una tarjeta con una foto que no existe sería
 * esconder el producto más barato.
 *
 * Por eso van en tabla y no en parrilla. Una malla se compara por calibre,
 * paso de cuadrícula y altura —tres números— y una tabla compara números mejor
 * que cuatro tarjetas en fila. Esos tres datos están en `attributes`
 * (`wireGauge`, `meshSize`, `heightOptions`) y nunca se habían mostrado.
 *
 * En móvil la tabla no se convierte en scroll horizontal: se apila por filas
 * con las etiquetas delante. Un dato que hay que arrastrar para leer es un
 * dato que no se lee.
 */
export function MeshSection({ products }: { products: HomeProduct[] }) {
  if (products.length < 2) return null

  const antiClimb = products.some((p) => p.attributes?.antiClimbing)

  return (
    <section id="malla" className="defer-paint border-b border-border bg-surface">
      {/* La firma del producto en la cabecera: una franja fina con la trama de
          la propia malla (.mesh-rule), no toda la sección tramada. */}
      <div className="mesh-rule h-8 border-b border-hairline" aria-hidden="true" />
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          eyebrow="Acero galvanizado"
          title="Malla electrosoldada"
          sub={`Perímetro de obra, nave, finca e instalación pública. Se compara por calibre, paso de cuadrícula y altura${
            antiClimb ? ", y hay versión anti-escalable" : ""
          }.`}
          href="/productos?category=industrial"
          count={products.length}
        />

        <ul className="divide-y divide-border border-y border-border">
          {products.map((p) => {
            const years = warrantyYears(p)
            const specs = [
              p.attributes?.wireGauge && `Calibre ${p.attributes.wireGauge}`,
              p.attributes?.meshSize && `Cuadro ${p.attributes.meshSize}`,
              years != null && `${years} años de garantía`,
            ].filter(Boolean) as string[]

            return (
              <li key={p.id}>
                <Link
                  href={`/productos/${p.slug}`}
                  className="group flex flex-wrap items-center gap-x-4 gap-y-1 py-3.5 transition-colors hover:bg-surface-2 sm:flex-nowrap"
                >
                  {/* Alzado en miniatura: la propia trama de la malla. */}
                  <span
                    className="hidden size-12 shrink-0 rounded-sm diagram diagram-mesh sm:block"
                    aria-hidden="true"
                  />

                  <span className="min-w-0 flex-1 basis-full sm:basis-auto">
                    <span className="block text-sm font-semibold text-foreground group-hover:text-brand-green-deep">
                      {p.name}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground">
                      {specs.join(" · ")}
                    </span>
                  </span>

                  <span className="shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
                    {heightRange(p)}
                  </span>

                  <span className="shrink-0 text-xs text-muted-foreground tabular-nums">
                    {p.stock > 0 ? `${p.stock} m` : "Agotado"}
                  </span>

                  <span className="ml-auto shrink-0 text-right">
                    <span className="text-lg leading-none font-bold text-foreground tabular-nums">
                      ${p.basePrice.toFixed(2)}
                    </span>
                    <span className="text-xs font-medium text-muted-foreground">
                      {unitSuffix(p.unit)}
                    </span>
                  </span>
                </Link>
              </li>
            )
          })}
        </ul>

        {antiClimb && (
          <p className="mt-3 text-xs text-muted-foreground">
            La versión anti-escalable llega a 3.0 m de altura y es la que se
            instala en entidades públicas y escuelas.
          </p>
        )}
      </div>
    </section>
  )
}
