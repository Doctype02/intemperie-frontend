import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Check } from "lucide-react"

import { WA_MESSAGE } from "@/components/layout/nav-data"
import { whatsappHref } from "@/components/ui/icon-whatsapp"

import { unitSuffix, type HomeProduct } from "./catalog-data"

/* Hero «panel + collage» — dirección B, la que el dueño eligió sobre maqueta.
 *
 * Se rechazaron dos portadas antes que ésta: una por «técnica» y otra por «la
 * misma de siempre». La que quedó es la de mercado: un panel verde redondeado
 * con la promesa y el precio en una etiqueta blanca gigante, y al lado un
 * collage de fotos reales con el precio encima de cada una. El panel es el
 * color —la sección va sobre bg-background—, así el verde se lee como un
 * objeto comercial y no como «otra franja más».
 *
 * Tres decisiones que no son estilo:
 *
 * 1. La etiqueta de precio es EL elemento. Caja blanca, cifra a text-5xl, el
 *    contraste máximo de la página. El precio publicado es lo que la
 *    competencia esconde; aquí es el primer golpe de vista.
 * 2. El campo del hero pregunta lo único que el comprador sabe de memoria:
 *    cuántos metros tiene su terreno. Es un `<form method="get">` contra
 *    /calculadora (que honra `?metros=`, ver QUOTE_KEYS): cero JavaScript.
 *    El buscador vive en la cabecera global; aquí no se repite.
 * 3. El collage no es decoración: son los tres productos CON fotografía real
 *    —foto primero, existencias de mayor a menor, la misma selección auditable
 *    de «Los más pedidos»— y cada foto lleva su precio y enlaza a su ficha.
 *    En móvil el collage colapsa a una sola foto grande bajo el panel: misma
 *    imagen, mismo `sizes`, así el `preload` (el `priority` de Next 16) sirve
 *    al LCP de ambos anchos con una única petición.
 */
export function Hero({
  products,
  priceFrom,
  warrantyYears,
}: {
  products: HomeProduct[]
  priceFrom: number | null
  warrantyYears: number | null
}) {
  /* Foto primero, existencias después: el dato real más cercano a «lo más
     pedido» que da la API. Tres fichas con foto para el collage. */
  const collage = [...products]
    .sort((a, b) => {
      const aPhoto = a.images?.length ? 1 : 0
      const bPhoto = b.images?.length ? 1 : 0
      if (aPhoto !== bPhoto) return bPhoto - aPhoto
      return b.stock - a.stock
    })
    .filter((p) => p.images?.length)
    .slice(0, 3)

  const [big, ...small] = collage

  const checks = [
    "Con ITBMS incluido",
    warrantyYears != null ? `Garantía hasta ${warrantyYears} años` : null,
    "Pedido mínimo 10 m",
  ].filter((c): c is string => c != null)

  const priceTag = (p: HomeProduct) =>
    `$${p.basePrice.toFixed(2)}${unitSuffix(p.unit)}`

  return (
    <section className="bg-background">
      <div className="shell grid gap-6 py-6 lg:grid-cols-[1.05fr_.95fr] sm:py-8">
        {/* ── Panel verde ─────────────────────────────────────────────── */}
        <div className="relative flex flex-col justify-center overflow-hidden rounded-3xl bg-linear-to-br from-brand-green-deep via-brand-green to-brand-green p-8 text-on-dark sm:p-11">
          {/* Círculo decorativo de la maqueta: luz en la esquina, sin imagen. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-on-dark/10"
          />

          <p className="eyebrow text-brand-green-soft">
            Fábrica propia · La Chorrera, Panamá
          </p>

          <h1 className="mt-3 text-3xl font-bold tracking-tight text-balance sm:text-4xl lg:text-[2.75rem]">
            La cerca de su casa, al precio que ve aquí
          </h1>

          {priceFrom != null && (
            <p className="mt-4 flex w-max items-baseline gap-2 rounded-2xl bg-surface px-6 py-3 shadow-lg">
              <span className="tabular text-4xl font-bold text-brand-green-deep sm:text-5xl">
                ${priceFrom.toFixed(2)}
              </span>
              <span className="text-base font-semibold text-muted-foreground">
                / metro · desde
              </span>
            </p>
          )}

          <p className="mt-4 max-w-md text-base text-on-dark/90">
            {products.length} modelos de PVC y malla electrosoldada con precio
            publicado. Escriba sus metros y mire su total al instante.
          </p>

          <form
            action="/calculadora"
            method="get"
            className="mt-5 flex max-w-md rounded-2xl bg-surface p-1.5"
          >
            <label htmlFor="hero-metros" className="sr-only">
              Metros lineales de su terreno
            </label>
            <input
              id="hero-metros"
              type="number"
              name="metros"
              min={10}
              step={5}
              inputMode="numeric"
              placeholder="¿Cuántos metros tiene su terreno? Ej.: 80"
              className="tabular h-12 min-w-0 flex-1 rounded-xl bg-transparent px-4 text-base text-foreground placeholder:text-muted-foreground"
            />
            <button
              type="submit"
              className="flex h-12 shrink-0 items-center gap-1.5 rounded-xl bg-brand-navy-deep px-5 font-heading font-bold text-on-dark transition-colors hover:bg-brand-navy"
            >
              Calcular mi cerca
              <ArrowRight className="size-4" aria-hidden="true" />
            </button>
          </form>

          <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 text-sm text-brand-green-soft">
            {checks.map((text) => (
              <li key={text} className="flex items-center gap-1.5">
                <Check className="size-4 shrink-0" aria-hidden="true" />
                {text}
              </li>
            ))}
          </ul>

          <a
            href={whatsappHref(WA_MESSAGE.quote)}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 w-max text-sm text-brand-green-soft underline underline-offset-2 transition-colors hover:text-on-dark"
          >
            o cotice por WhatsApp
          </a>
        </div>

        {/* ── Móvil: una sola foto grande bajo el panel ───────────────── */}
        {big && (
          <Link
            href={`/productos/${big.slug}`}
            className="relative block aspect-[4/3] overflow-hidden rounded-2xl bg-surface-2 lg:hidden"
          >
            <Image
              src={big.images![0].url}
              alt={big.name}
              fill
              preload
              sizes="(max-width: 1024px) 100vw, 45vw"
              className="object-cover object-center"
            />
            <span className="absolute bottom-3 left-3.5 rounded-xl bg-surface px-3 py-1.5 text-sm font-bold text-foreground shadow-md">
              {big.name} ·{" "}
              <span className="tabular text-brand-green-deep">{priceTag(big)}</span>
            </span>
          </Link>
        )}

        {/* ── Escritorio: collage 2×2, la primera foto a doble columna ── */}
        {big && (
          <div className="hidden grid-cols-2 grid-rows-[1.25fr_1fr] gap-3.5 lg:grid">
            <Link
              href={`/productos/${big.slug}`}
              className="relative col-span-2 overflow-hidden rounded-2xl bg-surface-2"
            >
              <Image
                src={big.images![0].url}
                alt={big.name}
                fill
                sizes="(max-width: 1024px) 100vw, 45vw"
                className="object-cover object-center"
              />
              <span className="absolute bottom-3 left-3.5 rounded-xl bg-surface px-3 py-1.5 text-sm font-bold text-foreground shadow-md">
                {big.name} ·{" "}
                <span className="tabular text-brand-green-deep">
                  {priceTag(big)}
                </span>
              </span>
            </Link>

            {small.map((p) => (
              <Link
                key={p.id}
                href={`/productos/${p.slug}`}
                className="relative overflow-hidden rounded-2xl bg-surface-2"
              >
                <Image
                  src={p.images![0].url}
                  alt={p.name}
                  fill
                  sizes="22vw"
                  className="object-cover object-center"
                />
                <span className="tabular absolute bottom-3 left-3.5 rounded-xl bg-surface px-3 py-1.5 text-sm font-bold text-brand-green-deep shadow-md">
                  {priceTag(p)}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
