import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ChevronRight, Phone } from "lucide-react"

import { FenceCalculator } from "@/components/calculator/fence-calculator"
import { findBySlug, parseMeters, toQuoteModels } from "@/components/calculator/quote-models"
import { CONTACT, WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

import { listProducts } from "../_data/catalog"

/* Precotizador — sistema «Perímetro».
 *
 * La página no calcula nada: carga el catálogo, lo traduce a lo que el
 * precotizador necesita (`quote-models.ts`) y monta el armazón. Todo lo de
 * esta pantalla que no cambia al recalcular —cabecera, notas del estimado,
 * contacto, salida al catálogo— es HTML de servidor y no viaja como
 * JavaScript. La única isla de cliente es el precotizador en sí, porque
 * escribir metros y ver el total cambiar es literalmente lo que se pide.
 *
 * CONTRATO DE LA URL
 * `?producto=<slug>` y `?metros=<n>`, tal como los escribe `buildCalculatorHref`
 * en la ficha de producto. Se resuelven aquí, en el servidor, para que el
 * primer HTML ya traiga el modelo elegido: si se resolvieran al hidratar, quien
 * llega desde una ficha vería el paso 1 en blanco y luego un salto.
 *
 * LO QUE ESTA PÁGINA YA NO DICE
 * Se han retirado el «+30 % de instalación» que la calculadora sumaba al total
 * sin ningún campo detrás, y la nota de precios que lo acompañaba. Ni el
 * catálogo ni la API tienen tarifa de mano de obra: la instalación se cotiza
 * hablando con un asesor, y así se ofrece.
 */

export const metadata: Metadata = {
  title: "Precotizador de cercas",
  description:
    "Calcula el material de tu cerca al instante: elige el modelo, escribe los metros lineales y mira el total con ITBMS. Precios reales del catálogo.",
}

export default async function CalculadoraPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const params = await searchParams
  const first = (key: string) => {
    const value = params[key]
    return Array.isArray(value) ? value[0] : value
  }

  /* Sin `catch` que devuelva `[]`: un fallo de la API tiene que romper y
     reintentarse, no publicar un precotizador sin catálogo con el que no se
     puede cotizar nada. Es la misma regla que la portada y el listado. */
  const { products } = await listProducts({}, 100)
  const models = toQuoteModels(products)

  const preselected = findBySlug(models, first("producto"))
  const meters = parseMeters(first("metros"), 10)

  return (
    <div className="pb-section-sm">
      {/* Cabecera. El azul de obra es el color de estructura del sistema; el
          listón verde de arriba es la firma, dibujada en CSS. */}
      <div className="bg-brand-navy-deep text-on-dark">
        <div className="picket-rule" aria-hidden="true" />

        <div className="shell py-8 sm:py-10">
          <nav aria-label="Ruta" className="mb-3">
            <ol className="flex items-center gap-1.5 text-xs text-on-dark-soft">
              <li>
                <Link href="/" className="transition-colors hover:text-brand-green">
                  Inicio
                </Link>
              </li>
              <li aria-hidden="true">
                <ChevronRight className="size-3" />
              </li>
              <li className="font-semibold text-on-dark" aria-current="page">
                Precotizador
              </li>
            </ol>
          </nav>

          <p className="eyebrow text-brand-green">Precio de material en un minuto</p>
          <h1 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
            Calcula tu cerca metro a metro
          </h1>
          <p className="mt-3 max-w-prose text-sm text-on-dark-soft">
            Elige el modelo, escribe los metros lineales del perímetro y mira el total con ITBMS.
            Son los precios del catálogo, los mismos que ves en cada ficha. Sin dejar el correo y
            sin esperar a nadie.
          </p>
        </div>
      </div>

      <div className="shell pt-8 sm:pt-10">
        <FenceCalculator
          models={models}
          initialModelId={preselected?.id ?? null}
          initialMeters={meters}
        />

        {/* ── Letra pequeña y salidas ───────────────────────────────────────
            Todo esto es servidor: no recalcula nada, así que no tiene por qué
            costar un byte de JavaScript. */}
        <div className="mt-10 grid gap-4 border-t border-border pt-8 sm:mt-12 lg:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-base font-bold text-foreground">Qué incluye este estimado</h2>
            {/* Cuatro frases, cuatro hechos comprobables contra el catálogo.
                Ni envíos gratis, ni porcentajes de instalación, ni plazos. */}
            <ul className="mt-3 space-y-2 text-xs text-muted-foreground">
              <li>
                Material: los metros que escribas por el precio por metro lineal del modelo, más
                ITBMS del 7 %.
              </li>
              <li>
                No incluye instalación, transporte, puertas ni accesorios. Se cotizan aparte, con la
                medida tomada.
              </li>
              <li>Pedido mínimo 10 m lineales, el mismo de cada ficha de producto.</li>
              <li>
                Es un estimado, no una oferta en firme: el precio se confirma al pasar el pedido.
              </li>
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-base font-bold text-foreground">¿Prefieres que te midan?</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              Dinos qué quieres cercar y te decimos el modelo, la altura y el precio. {CONTACT.hours}
              . Fábrica en {CONTACT.city}.
            </p>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href={whatsappHref(WA_MESSAGE.quote)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-tap items-center justify-center gap-2 rounded-lg bg-whatsapp px-4 font-heading text-sm font-semibold text-on-dark transition-colors hover:bg-whatsapp-deep"
              >
                <IconWhatsApp />
                Escribir por WhatsApp
              </a>
              <a
                href={CONTACT.phoneHref}
                className="inline-flex min-h-tap items-center justify-center gap-2 rounded-lg border border-border-strong bg-surface px-4 font-heading text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-secondary hover:text-secondary-foreground"
              >
                <Phone className="size-4" aria-hidden="true" />
                {CONTACT.phoneDisplay}
              </a>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-surface p-5">
            <h2 className="text-base font-bold text-foreground">Ver los modelos con calma</h2>
            <p className="mt-2 text-xs text-muted-foreground">
              El catálogo completo, con altura, material, garantía y existencias de cada cerca.
            </p>
            <Link
              href="/productos"
              className="group mt-4 inline-flex min-h-tap items-center gap-2 rounded-lg border border-border-strong bg-surface px-4 font-heading text-sm font-semibold text-foreground transition-colors hover:border-primary hover:bg-secondary hover:text-secondary-foreground"
            >
              Ir al catálogo
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
