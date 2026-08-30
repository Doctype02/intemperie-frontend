import Link from "next/link"
import { ChevronDown, ChevronRight } from "lucide-react"

import {
  COLECCIONES, MALLAS, NAV_LINKS, PVC_COSTERAS, PVC_INDUSTRIAL,
  PVC_RESIDENCIAL, WA_MESSAGE, type NavProduct,
} from "./nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

/* Navegación de escritorio — sistema «Perímetro».
 *
 * Componente de servidor. Los desplegables se abren con CSS (`group-hover` y
 * `group-focus-within`), no con estado de React. La versión anterior gastaba
 * tres `useState`, un `useRef`, un temporizador de 150 ms y un listener de
 * `mousedown` en todo el documento para conseguir exactamente esto mismo, y
 * obligaba a marcar toda la cabecera como componente de cliente.
 *
 * El disparador es un enlace real, no un botón: quien pulsa «Cercas de PVC»
 * llega al catálogo filtrado aunque el desplegable nunca se abra. Al tabular,
 * `group-focus-within` despliega el panel, de modo que el teclado ve lo mismo
 * que el ratón sin trampa de foco que gestionar.
 */

function Column({ title, items }: { title: string; items: readonly NavProduct[] }) {
  return (
    <div>
      <p className="eyebrow mb-2 text-muted-foreground">{title}</p>
      <ul className="space-y-0.5">
        {items.map((p) => (
          <li key={p.slug}>
            <Link
              href={`/productos/${p.slug}`}
              className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-brand-green-soft hover:text-brand-green-deep"
            >
              <span className="font-medium">{p.name}</span>
              <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                {p.spec}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  )
}

/* Envoltura común de los desplegables. `invisible` + `opacity-0` en vez de
   `hidden`: el contenido ya está en el HTML para el buscador y para los
   lectores de pantalla, y no hay reflujo al abrir. */
function Dropdown({
  label, href, children, wide = false,
}: {
  label: string
  href: string
  children: React.ReactNode
  wide?: boolean
}) {
  return (
    <div className="group relative flex h-full items-center">
      <Link
        href={href}
        className="flex h-full items-center gap-1 px-3 text-sm font-semibold text-foreground transition-colors hover:text-brand-green-deep group-hover:bg-brand-green-soft group-focus-within:bg-brand-green-soft"
      >
        {label}
        <ChevronDown
          className="size-3.5 text-muted-foreground transition-transform duration-150 group-hover:rotate-180 group-focus-within:rotate-180"
          aria-hidden="true"
        />
      </Link>

      <div
        className={`invisible absolute top-full left-0 z-50 rounded-b-xl border border-t-0 border-border bg-popover p-4 opacity-0 shadow-lg transition-[opacity,visibility] duration-150 group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100 ${
          wide ? "w-[46rem]" : "w-72"
        }`}
      >
        {children}
      </div>
    </div>
  )
}

export function PrimaryNav() {
  return (
    <nav
      aria-label="Catálogo"
      className="hidden border-b border-border bg-surface lg:block"
    >
      <div className="shell flex h-11 items-center">
        <Dropdown label="Cercas de PVC" href="/productos?search=cerca" wide>
          <div className="grid grid-cols-3 gap-6">
            <Column title="Residencial" items={PVC_RESIDENCIAL} />
            <Column title="Industrial" items={PVC_INDUSTRIAL} />
            <div className="flex flex-col justify-between gap-4">
              <Column title="Zonas costeras" items={PVC_COSTERAS} />
              <Link
                href="/productos"
                className="flex items-center gap-1 text-sm font-semibold text-brand-green-deep"
              >
                Ver todo el catálogo
                <ChevronRight className="size-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </Dropdown>

        <Dropdown label="Malla electrosoldada" href="/productos?search=malla">
          <ul className="space-y-0.5">
            {MALLAS.map((p) => (
              <li key={p.slug}>
                <Link
                  href={`/productos/${p.slug}`}
                  className="flex items-center justify-between gap-4 rounded-md px-2 py-1.5 text-sm text-foreground transition-colors hover:bg-brand-green-soft hover:text-brand-green-deep"
                >
                  <span className="font-medium">{p.name}</span>
                  <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                    {p.spec}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </Dropdown>

        <Dropdown label="Por segmento" href="/productos">
          <ul className="space-y-0.5">
            {COLECCIONES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/productos?category=${c.slug}`}
                  className="flex flex-col rounded-md px-2 py-1.5 transition-colors hover:bg-brand-green-soft"
                >
                  <span className="text-sm font-medium text-foreground">{c.name}</span>
                  <span className="text-xs text-muted-foreground">{c.who}</span>
                </Link>
              </li>
            ))}
          </ul>
        </Dropdown>

        {NAV_LINKS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex h-full items-center px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            {item.label}
          </Link>
        ))}

        <a
          href={whatsappHref(WA_MESSAGE.quote)}
          target="_blank"
          rel="noopener noreferrer"
          className="ml-auto flex h-8 items-center gap-1.5 rounded-lg bg-whatsapp px-3 text-sm font-semibold text-on-dark transition-colors hover:bg-whatsapp-deep"
        >
          <IconWhatsApp />
          Cotizar por WhatsApp
        </a>
      </div>
    </nav>
  )
}
