import type { Metadata } from "next"
import Link from "next/link"
import { ArrowRight, ChevronRight, Phone } from "lucide-react"

import { FenceCalculator } from "@/components/calculator/fence-calculator"
import { parseLand, serializeSides } from "@/components/calculator/land-shapes"
import { parseMeters } from "@/components/calculator/quote-models"
import { CONTACT, WA_MESSAGE } from "@/components/layout/nav-data"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"

import { getCategories } from "../_data/catalog"
import { loadChosenModel, loadQuoteCatalog } from "./catalog-query"
import { CatalogPicker } from "./catalog-search"

/* Precotizador — sistema «Perímetro».
 *
 * La página no calcula nada: lee la URL, pide los modelos que coinciden y monta
 * el armazón. Todo lo de esta pantalla que no cambia al recalcular —cabecera,
 * buscador, facetas, notas del estimado, contacto, salida al catálogo— es HTML
 * de servidor y no viaja como JavaScript. La única isla de cliente es el
 * precotizador en sí, porque escribir metros y ver el total cambiar es
 * literalmente lo que se pide.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POR QUÉ HAY UN BUSCADOR DONDE ANTES HABÍA UN CARRUSEL ENTERO
 *
 * La página pedía `listProducts({}, 100)` y serializaba el catálogo completo
 * dentro de la isla. Tres problemas a la vez:
 *
 *   1. NO ESCALA. Quince modelos son 234 kB de HTML; cincuenta, ~780 kB; cien,
 *      ~1.5 MB. Cada modelo viaja dos veces —tarjeta pintada y datos de
 *      hidratación— y nada de eso se mira.
 *   2. TOPE CALLADO. El `100` no era una decisión, era un límite. El modelo 101
 *      simplemente no existía en el precotizador, sin error y sin aviso.
 *   3. NO GUÍA. Un carrusel de cincuenta cercas es inservible por rápido que
 *      cargue: nadie desliza cincuenta fichas para elegir una.
 *
 * Ahora se filtra en el servidor por la URL, igual que el listado del catálogo,
 * y la isla recibe sólo los modelos que coinciden. El peso del HTML deja de
 * depender del tamaño del catálogo, y cuando hay más coincidencias de las que
 * se pintan se dice en pantalla en vez de recortar en silencio.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * CONTRATO DE LA URL
 *
 * `?producto=<slug>` y `?metros=<n>`, tal como los escribe `buildCalculatorHref`
 * en la ficha de producto. Se resuelven aquí, en el servidor, para que el
 * primer HTML ya traiga el modelo elegido: si se resolvieran al hidratar, quien
 * llega desde una ficha vería el paso 1 en blanco y luego un salto. Los dos
 * viajan además en cada enlace de faceta (ver `quoteHref`), para que tocar un
 * filtro no borre el modelo ni los metros con los que se llegó.
 *
 * `?forma=<rectangulo|frente-abierto|ele|frente>` y `?lados=<20x30>` son la
 * forma del terreno con la que se calculó el perímetro. También se resuelven
 * aquí: quien comparte la URL comparte el lote dibujado, no sólo la cifra, y el
 * asesor que la abre ve la misma operación que vio el cliente. Son todo o nada
 * —media forma se descarta entera— y, cuando vienen, mandan sobre `?metros=`,
 * porque son el dato del que ese número sale.
 *
 * A eso se suman las facetas del catálogo —`search`, `category`, `height`—, que
 * son literalmente las del listado: mismo nombre de parámetro, mismas franjas
 * de altura, mismas categorías. Un sitio no puede llamar «1.8 – 2.1 m» a una
 * franja en el catálogo y otra cosa en el precotizador.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LO QUE ESTA PÁGINA YA NO DICE
 *
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
  const raw = await searchParams

  /* Next entrega `?height=a&height=b` como array. Dos alturas a la vez no son
     una franja, son un error de copiar y pegar: se toma la primera. Las cadenas
     vacías se descartan para que `search` sea `undefined` y no `""`, y así
     `?search=` no cuente como filtro puesto. Es la misma normalización que hace
     el listado. */
  const params: Record<string, string | undefined> = {}
  for (const [key, value] of Object.entries(raw)) {
    const first = Array.isArray(value) ? value[0] : value
    if (first) params[key] = first
  }

  /* La forma del terreno, si viene. `parseLand` es lista blanca y todo o nada:
     `?forma=ele` sin las cuatro medidas, o con una negativa, devuelve `null` y
     la pantalla se comporta como si nunca hubiera venido. */
  const land = parseLand(params.forma, params.lados)

  /* Cuando hay forma válida, los metros SON su perímetro y `?metros=` no pinta
     nada: la forma es el dato del que sale el número, y dejar que un `metros`
     pegado a mano contradijera a la cuenta que se está pintando debajo sería
     enseñar dos cifras distintas para lo mismo. Sin forma, manda `?metros=`,
     que es el contrato de siempre con la ficha de producto. */
  const meters = land ? land.meters : parseMeters(params.metros, 10)

  /* Se reescriben ya normalizados: los enlaces de faceta arrastran los tres, y
     arrastrar `?metros=-5`, `?metros=1e9` o media forma sería propagar basura
     por toda la navegación en lugar de cortarla en la puerta. */
  params.metros = String(meters)
  params.forma = land?.selection.shapeId
  params.lados = land ? serializeSides(land.selection.sides) : undefined

  /* Sin `catch` que devuelva `[]`: un fallo de la API tiene que romper y
     reintentarse, no publicar un precotizador sin catálogo con el que no se
     puede cotizar nada. Es la misma regla que la portada y el listado.

     Las dos consultas van en paralelo porque no dependen la una de la otra: el
     modelo de `?producto=` se pide por su slug, no se busca entre los
     resultados. Las categorías vienen cacheadas una hora. */
  const [{ models, total, truncated }, chosen, categories] = await Promise.all([
    loadQuoteCatalog({
      search: params.search,
      category: params.category,
      height: params.height,
    }),
    loadChosenModel(params.producto),
    getCategories(),
  ])

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
            ¿No sabes cuántos metros son? Dinos la forma de tu terreno y sus medidas, y los
            calculamos contigo delante. Son los precios del catálogo, los mismos que ves en cada
            ficha. Sin dejar el correo y sin esperar a nadie.
          </p>
        </div>
      </div>

      <div className="shell pt-8 sm:pt-10">
        <FenceCalculator
          models={models}
          initialModel={chosen}
          initialMeters={meters}
          initialLand={land?.selection ?? null}
          filters={
            <CatalogPicker
              params={params}
              categories={categories}
              shown={models.length}
              total={total}
              truncated={truncated}
            />
          }
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
                {/* Si algún modelo llega a traer `gatePrice`, sus puertas SÍ entran en el
                    estimado y esta nota dejaría de ser cierta. Se lee del catálogo en vez
                    de quedarse escrita. Se mira también el modelo elegido, que puede haber
                    llegado por `?producto=` sin estar entre los resultados a la vista. */}
                {[...models, ...(chosen ? [chosen] : [])].some((m) => m.gatePrice != null)
                  ? "No incluye instalación, transporte ni accesorios. Se cotizan aparte, con la medida tomada."
                  : "No incluye instalación, transporte, puertas ni accesorios. Se cotizan aparte, con la medida tomada."}
              </li>
              <li>Pedido mínimo 10 m lineales, el mismo de cada ficha de producto.</li>
              <li>
                {/* La plantilla de terreno no adivina nada: suma los lados que escribe el
                    visitante y enseña la operación entera para que pueda comprobarla. */}
                Si usas una forma de terreno, el perímetro sale de tus propias medidas y la
                operación se enseña completa: «2 × (20 + 30) = 100 m».
              </li>
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
