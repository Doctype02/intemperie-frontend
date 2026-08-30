import Link from "next/link"
import { ChevronRight } from "lucide-react"

/* Cabecera de sección de portada — sistema «Perímetro».
 *
 * La referencia (carbonestore.com) apila diez o doce secciones con nombre
 * propio en una sola portada. Puede hacerlo porque su cabecera de sección es
 * *pequeña*: un título de cuerpo normal a la izquierda y un «Ver más» a la
 * derecha. Ocupa una línea. Aquí el título ocupaba cuatro (antetítulo, un
 * `text-4xl font-black`, un subrayado y aire), y con ese coste vertical solo
 * caben tres secciones antes de que el visitante se canse de bajar.
 *
 * Este componente reduce el título a `text-xl/2xl` y sube el «Ver todo» a la
 * misma línea. La jerarquía no se pierde: la aporta el antetítulo en
 * versalitas (.eyebrow) y el listón de cerca, que son la firma de la marca.
 *
 * El «Ver todo» se ve en móvil. En la versión anterior estaba oculto por
 * debajo de `sm` y se repetía como botón al final del carrusel: el visitante
 * de móvil tenía que arrastrar toda la fila para descubrir que había más.
 * Es un componente de servidor: cero JavaScript en el cliente.
 */
export function SectionHeader({
  title,
  eyebrow,
  href,
  hrefLabel = "Ver todo",
  as: Tag = "h2",
}: {
  title: string
  eyebrow?: string
  href?: string
  hrefLabel?: string
  as?: "h2" | "h3"
}) {
  return (
    <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
      <div className="min-w-0">
        {eyebrow && (
          <p className="eyebrow mb-1 text-brand-green-deep">{eyebrow}</p>
        )}
        <Tag className="text-xl leading-tight font-bold tracking-tight text-foreground sm:text-2xl">
          {title}
        </Tag>
        {/* El listón de la cerca: la firma de la marca, sin descargar nada. */}
        <div className="picket-rule mt-2 w-16 rounded-full" aria-hidden="true" />
      </div>

      {href && (
        <Link
          href={href}
          className="-mr-2 flex shrink-0 items-center gap-0.5 rounded-md px-2 py-2 text-sm font-semibold text-brand-green-deep transition-colors hover:bg-brand-green-soft"
        >
          {hrefLabel}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      )}
    </div>
  )
}
