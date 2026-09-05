import Link from "next/link"
import { Layers, ShieldCheck, Tag, Truck } from "lucide-react"

/* Banda de confianza — sistema «Perímetro».
 *
 * La versión anterior alineaba seis afirmaciones: «+15,000 proyectos»,
 * «10+ países», «100% Satisfacción», «Instalación incluida»… Ninguna sale de
 * ningún sitio verificable y «100% satisfacción» no significa nada. Una
 * afirmación que el cliente no puede comprobar no genera confianza: la gasta.
 *
 * Quedan cuatro, y las cuatro se pueden auditar:
 *   · el número de modelos y el precio de entrada se cuentan del catálogo en
 *     el momento de renderizar;
 *   · la garantía máxima se lee de `attributes.warranty` del producto tope;
 *   · el envío enlaza a /envios, que es donde está la política publicada con
 *     sus condiciones y sus importes. Si mañana cambia, cambia el enlace.
 *
 * Sin fotografías y sin peticiones: cuatro iconos del paquete que la cabecera
 * ya carga.
 */
export function ValueStrip({
  modelCount,
  warrantyYears,
}: {
  modelCount: number
  warrantyYears: number | null
}) {
  const items = [
    modelCount > 0 && {
      Icon: Layers,
      title: `${modelCount} modelos en catálogo`,
      sub: "Cerca de PVC y malla electrosoldada",
      href: "/productos",
    },
    /* El «desde $X el metro» ya es la etiqueta gigante del hero, a cuatro
       líneas de aquí: repetirlo gastaría la celda en un eco. Lo que esta
       celda añade es la política que lo hace posible. */
    {
      Icon: Tag,
      title: "Precio publicado",
      sub: "Sin llamar ni esperar: mire, calcule y pida",
      href: "/productos",
    },
    warrantyYears != null && {
      Icon: ShieldCheck,
      title: `Garantía hasta ${warrantyYears} años`,
      sub: "Según modelo, en la ficha de cada uno",
      href: "/productos",
    },
    {
      Icon: Truck,
      title: "Envío gratis desde $50",
      sub: "Cobertura en las 10 provincias · ver condiciones",
      href: "/envios",
    },
  ].filter(Boolean) as Array<{
    Icon: typeof Layers
    title: string
    sub: string
    href: string
  }>

  return (
    <section className="border-b border-border bg-surface">
      <div className="shell">
        <ul className="grid grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <li
              key={item.title}
              className={`border-border ${i % 2 === 0 ? "sm:border-r" : ""} ${
                i < 2 ? "border-b lg:border-b-0" : ""
              } lg:border-r lg:last:border-r-0`}
            >
              <Link
                href={item.href}
                className="flex h-full items-start gap-2.5 px-1 py-4 transition-colors hover:bg-surface-2 sm:px-4"
              >
                <item.Icon
                  className="mt-0.5 size-5 shrink-0 text-brand-green"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm leading-tight font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="mt-0.5 text-xs leading-snug text-muted-foreground">
                    {item.sub}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
