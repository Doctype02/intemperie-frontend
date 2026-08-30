import Link from "next/link"
import { ChevronRight } from "lucide-react"

/* Cabecera de sección — sistema «Perímetro».
 *
 * La portada tiene ocho secciones de catálogo. Si cada una inventa su propio
 * titular, la página deja de leerse como una tienda y pasa a leerse como ocho
 * páginas pegadas. Aquí se fija el contrato: antetítulo, titular, una línea de
 * contexto y el enlace «Ver todo».
 *
 * El «Ver todo» está en todos los anchos. En la versión anterior era
 * `hidden sm:flex`: en móvil —donde está la mayor parte del tráfico— no había
 * forma de salir de la sección hacia el listado completo salvo bajando hasta
 * el pie. Aquí se apoya en la propia cabecera y, cuando el ancho no da, cae
 * debajo del titular sin desaparecer.
 *
 * `count` no es decoración: decir «los 7 modelos» en vez de «Ver todo» le dice
 * al comprador cuánto le falta por ver, que es información de inventario real.
 */
export function SectionHeader({
  eyebrow,
  title,
  sub,
  href,
  linkLabel = "Ver todo",
  count,
  tone = "light",
}: {
  eyebrow?: string
  title: string
  sub?: string
  href?: string
  linkLabel?: string
  count?: number
  tone?: "light" | "dark"
}) {
  const dark = tone === "dark"

  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 sm:mb-6">
      <div className="min-w-0">
        {eyebrow && (
          <p className={dark ? "eyebrow text-brand-green" : "eyebrow text-brand-green-deep"}>
            {eyebrow}
          </p>
        )}
        <h2
          className={`mt-1 text-2xl font-bold tracking-tight text-balance sm:text-3xl ${
            dark ? "text-on-dark" : "text-foreground"
          }`}
        >
          {title}
        </h2>
        {sub && (
          <p
            className={`mt-1.5 max-w-prose text-sm ${
              dark ? "text-on-dark-soft" : "text-muted-foreground"
            }`}
          >
            {sub}
          </p>
        )}
      </div>

      {href && (
        <Link
          href={href}
          className={`group inline-flex shrink-0 items-center gap-1 rounded-sm text-sm font-semibold transition-colors ${
            dark
              ? "text-on-dark hover:text-brand-green"
              : "text-brand-green-deep hover:text-brand-green"
          }`}
        >
          {count ? `Ver los ${count}` : linkLabel}
          <ChevronRight
            className="size-4 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      )}
    </div>
  )
}

/* Envoltorio de sección: alterna la superficie para que ocho bloques seguidos
   no se lean como una única mancha, sin recurrir a un borde en cada uno. */
export function Section({
  children,
  surface = "base",
  id,
  className = "",
}: {
  children: React.ReactNode
  surface?: "base" | "raised" | "sunk" | "navy"
  id?: string
  className?: string
}) {
  const bg = {
    base: "bg-background",
    raised: "bg-surface",
    sunk: "bg-surface-sunk",
    navy: "bg-brand-navy-deep text-on-dark",
  }[surface]

  return (
    <section id={id} className={`border-b border-border ${bg} ${className}`}>
      <div className="shell py-8 sm:py-10 lg:py-12">{children}</div>
    </section>
  )
}
