"use client"

import { useId, useRef, useState } from "react"
import Image from "next/image"
import { Check, ChevronLeft, ChevronRight, Minus, Phone, Plus } from "lucide-react"

import type { ProductUnit } from "@/types"
import type { QuoteModel } from "./quote-models"
import type { LandSelection } from "./land-shapes"

import { LandPlanner } from "./land-planner"
/* `meterLabel` se importa y ya no se define aquí: la operación que pinta el
   planificador («2 × (20 + 30) = 100 m») y el texto que acaba en el campo de
   metros tienen que salir del mismo formateador, o el mismo número se leería de
   dos maneras («100» arriba, «100.00» abajo) en la misma pantalla. */
import { describeLand, meterLabel } from "./land-shapes"
import { CONTACT, WA_MESSAGE } from "@/components/layout/nav-data"
import { Button } from "@/components/ui/button"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/* Precotizador — sistema «Perímetro».
 *
 * Tres partes, en el orden en que decide quien va a cercar un terreno:
 * catálogo (qué cerca), medidas (cuánta) y resumen (cuánto cuesta y cómo se
 * pide). El resumen cierra en WhatsApp porque es el canal por el que esta
 * empresa cotiza de verdad.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * QUÉ CALCULA Y QUÉ SE NEGÓ A CALCULAR
 *
 *   metros × precio por metro = material,  + ITBMS 7 %,  = total.
 *
 * Y nada más. La versión anterior sumaba un 30 % de «instalación» que no
 * salía de ningún campo del catálogo: era un número inventado dentro de una
 * cotización, es decir, una promesa de precio que alguien tendría que
 * sostener por teléfono. Se ha retirado. La instalación sigue ofreciéndose,
 * pero como lo que es: una conversación con un asesor.
 *
 * Tampoco se cuentan paneles ni postes ni puertas, que es lo que pedía la
 * referencia de diseño: la base de datos no tiene ancho de panel, ni
 * separación entre postes, ni precio de puerta (comprobado contra producción,
 * los 15 modelos). Esas tres filas están escritas y probadas, pero sólo se
 * pintan si el modelo trae el dato — ver los `!= null` de más abajo y
 * `quote-models.ts`. El día que el admin cargue `panelWidth`, `postSpacing` o
 * `gatePrice` en una ficha, aparecen solas.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * DE DÓNDE SALEN LOS METROS
 *
 * El paso 2 pedía una cifra que mucha gente no tiene: el perímetro. Se sabe que
 * el lote es de 20 × 30, o que hay 15 metros de frente, no que hay que cercar
 * 100 m. Debajo del campo hay ahora un `<details>` plegado con cuatro formas de
 * parcela (`land-planner.tsx`): se eligen los lados, se ve la operación
 * —«2 × (20 + 30) = 100 m»— y el resultado se escribe en el campo.
 *
 * Escribir a mano sigue siendo el camino por defecto y sigue mandando: quien ya
 * sabe sus metros no abre nada, y quien corrige el número a mano después de usar
 * una plantilla no ve cómo se lo pisan. Sólo aritmética verificable sobre lo que
 * el propio visitante mide; ni un dato inventado de su terreno.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POR QUÉ ESTA ISLA ES TAN PEQUEÑA
 *
 * Sólo vive aquí lo que cambia al recalcular. La cabecera de la página, las
 * notas del estimado, la tarjeta de contacto y el enlace al catálogo son HTML
 * de servidor (`calculadora/page.tsx`), y la lectura de `attributes` —altura,
 * garantía, colores, los tres campos futuros— ocurre también en el servidor
 * (`quote-models.ts`), del que aquí sólo se importa el tipo, que se borra al
 * compilar. El navegador recibe el catálogo ya masticado y este archivo.
 *
 * El buscador y las facetas tampoco están aquí: llegan pintados desde el
 * servidor por la ranura `filters` y se cuelgan dentro del paso 1, que es donde
 * hay que leerlos. Filtrar en el cliente habría obligado a mandarle el catálogo
 * entero al navegador, que es el problema que veníamos a quitar.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * `models` YA NO ES EL CATÁLOGO
 *
 * Es la página de modelos que coinciden con la URL, resuelta en el servidor
 * (`calculadora/catalog-query.ts`). Su tamaño no depende del catálogo, así que
 * el peso de esta isla es el mismo con quince modelos que con quinientos. Antes
 * llegaban los cien primeros del catálogo, se pintaran o no.
 *
 * El modelo elegido se guarda como OBJETO y no como identificador: al cambiar
 * de faceta, `models` pasa a ser otro conjunto y el modelo que el visitante ya
 * había elegido puede no estar dentro. Con un identificador, buscarlo en la
 * lista nueva devolvería `null` y el resumen se vaciaría solo, borrando una
 * cotización a medio hacer por haber tocado un filtro. Con el objeto, la
 * elección sobrevive al filtro que la deja fuera de pantalla.
 */

/** El mismo que aplica el carrito y el checkout. Un solo impuesto, un valor. */
const ITBMS = 0.07

/**
 * Pedido mínimo, el que ya anuncia la ficha de producto («Pedido mínimo 10 m
 * lineales»). No se fuerza el valor mientras se escribe —corregir por debajo
 * de la mano de quien teclea es hostil—: se avisa y se calcula igual.
 */
const MIN_METERS = 10

/**
 * Formato de precio propio, y a propósito.
 *
 * `formatCurrency` usa `Intl` en `es-PA`, que para dólares escribe «USD
 * 1,234.50» —Panamá tiene su propia moneda— y depende de la versión de ICU
 * del entorno, así que el HTML del servidor y el del navegador pueden no
 * coincidir y saltar el aviso de hidratación. Aquí el resultado es el mismo
 * byte a byte en los dos lados, y es el «$1,234.50» que usan la ficha y la
 * portada.
 */
function money(n: number): string {
  const [whole, cents] = Math.max(0, n).toFixed(2).split(".")
  return `$${whole.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}.${cents}`
}

/**
 * Cómo se llama la cantidad según la unidad de venta. Hoy los 15 modelos se
 * venden por metro lineal, pero el enum de la base admite tres valores y una
 * ficha por panel pediría «Metros lineales totales» sin sentido.
 */
const UNIT_COPY: Record<
  ProductUnit,
  { field: string; short: string; suffix: string; per: string; abbr: string }
> = {
  METRO: {
    field: "Metros lineales totales a cercar",
    short: "Metros lineales",
    suffix: "ML",
    per: "Precio por metro lineal",
    abbr: "m",
  },
  PANEL: {
    field: "Paneles que necesitas",
    short: "Paneles",
    suffix: "uds",
    per: "Precio por panel",
    abbr: "paneles",
  },
  UNIDAD: {
    field: "Unidades que necesitas",
    short: "Unidades",
    suffix: "uds",
    per: "Precio por unidad",
    abbr: "u",
  },
}

/** Existencias reales, escritas como las lee un comprador de 80 m de cerca. */
function availability(m: QuoteModel) {
  const unit = UNIT_COPY[m.unit].abbr
  if (m.stock <= 0) return { label: "Agotado", className: "bg-brand-navy text-on-dark" }
  if (m.stock <= 20)
    return { label: `Últimas ${m.stock} ${unit}`, className: "bg-brand-amber-soft text-accent-foreground" }
  return { label: `${m.stock} ${unit} en stock`, className: "bg-secondary text-secondary-foreground" }
}

/* ── Piezas ──────────────────────────────────────────────────────────────── */

function SummaryRow({
  label,
  hint,
  value,
}: {
  label: string
  hint?: string
  value: string
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="min-w-0 text-muted-foreground">
        {label}
        {hint && <span className="mt-0.5 block text-2xs leading-snug">{hint}</span>}
      </dt>
      <dd className="tabular shrink-0 font-semibold text-foreground">{value}</dd>
    </div>
  )
}

/** Dato de ficha en el paso 2. Todos salen de la base; ninguno se rellena. */
function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-md border border-border bg-surface px-2.5 py-1.5">
      <dt className="text-2xs font-semibold uppercase text-muted-foreground">{label}</dt>
      <dd className="tabular mt-0.5 text-xs font-semibold text-foreground">{value}</dd>
    </div>
  )
}

/* ── Precotizador ────────────────────────────────────────────────────────── */

export function FenceCalculator({
  models,
  initialModel = null,
  initialMeters = MIN_METERS,
  initialLand = null,
  filters,
}: {
  /** Los modelos que coinciden con la URL, NO el catálogo. Ver cabecera. */
  models: QuoteModel[]
  /**
   * Modelo resuelto en el servidor desde `?producto=<slug>`, pidiéndolo por su
   * slug y no buscándolo en `models`: así el enlace profundo desde una ficha
   * funciona aunque ese modelo no caiga en la página que se está pintando.
   */
  initialModel?: QuoteModel | null
  /** Metros resueltos en el servidor desde `?metros=<n>`. */
  initialMeters?: number
  /**
   * Forma del terreno y medidas de sus lados, resueltas en el servidor desde
   * `?forma=&lados=`. Cuando viene, `initialMeters` ES su perímetro: la cuenta
   * ya está hecha en el primer HTML y esto sólo sirve para que el planificador
   * abra con la misma forma y las mismas medidas que se compartieron.
   */
  initialLand?: LandSelection | null
  /** Buscador y facetas, ya pintados en el servidor. */
  filters?: React.ReactNode
}) {
  const uid = useId()
  const railRef = useRef<HTMLUListElement | null>(null)

  const [model, setModel] = useState<QuoteModel | null>(initialModel)
  /* La cantidad se guarda como texto y no como número: si se guardara como
     número, borrar el campo para escribir otra cifra lo repondría a «0» de
     golpe bajo los dedos. */
  const [metersText, setMetersText] = useState(meterLabel(initialMeters))
  const [gates, setGates] = useState(0)
  /* De dónde salen esos metros, si salen de una forma de terreno: «Terreno
     rectangular · 2 × (20 + 30) = 100 m». Viaja al mensaje de WhatsApp para que
     el asesor pueda ver la cuenta y detectar un lado olvidado antes de cortar
     material. Se borra en cuanto se corrige el número a mano, porque entonces
     ya no es cierto que salga de esa forma. */
  const [landLine, setLandLine] = useState<string | null>(
    () => (initialLand ? (describeLand(initialLand)?.summary ?? null) : null),
  )

  const copy = UNIT_COPY[model?.unit ?? "METRO"]

  const meters = Math.max(0, parseFloat(metersText.replace(",", ".")) || 0)
  const price = model?.price ?? 0

  /* El resumen, línea a línea. Sólo aritmética sobre datos del catálogo. */
  const materialCost = meters * price
  const gatesCost = model?.gatePrice != null ? gates * model.gatePrice : 0
  const subtotal = materialCost + gatesCost
  const tax = subtotal * ITBMS
  const total = subtotal + tax

  /* Recuentos de obra: se calculan sólo si el modelo trae la medida. Hoy
     ninguno la trae y estas dos constantes son siempre `null`. */
  const panelRow =
    model?.panelWidth != null && meters > 0
      ? { width: model.panelWidth, count: Math.ceil(meters / model.panelWidth) }
      : null
  const postRow =
    model?.postSpacing != null && meters > 0
      ? { spacing: model.postSpacing, count: Math.ceil(meters / model.postSpacing) + 1 }
      : null

  const belowMinimum = (model?.unit ?? "METRO") === "METRO" && meters > 0 && meters < MIN_METERS
  const overStock = model != null && model.stock > 0 && meters > model.stock

  const metersId = `${uid}-meters`
  const metersHintId = `${uid}-meters-hint`
  const stockHintId = `${uid}-meters-stock`
  const railId = `${uid}-rail`

  /* Mensaje de WhatsApp.
     Se arma como lista de líneas y se codifica UNA vez, en `whatsappHref`.
     Antes se escribía a mano con «%0A» e interpolando los valores sin
     codificar: un nombre de modelo con «&» o «#» cortaba el mensaje por ahí y
     el asesor recibía media cotización. */
  const messageLines = model
    ? [
        "Hola Intemperie, quiero cotizar mi cerca:",
        `• Modelo: ${model.name}`,
        ...(model.height ? [`• Altura disponible: ${model.height}`] : []),
        `• ${copy.short}: ${meterLabel(meters)} ${copy.abbr}`,
        ...(landLine ? [`• Perímetro: ${landLine}`] : []),
        ...(model.gatePrice != null && gates > 0 ? [`• Puertas: ${gates}`] : []),
        `• Material: ${money(materialCost)}`,
        `• ITBMS (7%): ${money(tax)}`,
        `• Total estimado: ${money(total)}`,
        "Estimado del precotizador, sólo material. Quiero confirmar precio y hablar de instalación.",
      ]
    : [
        "Hola Intemperie, quiero cotizar mi cerca:",
        `• ${copy.short}: ${meterLabel(meters)} ${copy.abbr}`,
        ...(landLine ? [`• Perímetro: ${landLine}`] : []),
        "Todavía no sé qué modelo me conviene. ¿Me recomiendan uno?",
      ]

  const scrollRail = (direction: -1 | 1) => {
    const rail = railRef.current
    if (!rail) return
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    rail.scrollBy({
      left: direction * rail.clientWidth * 0.8,
      behavior: reduced ? "auto" : "smooth",
    })
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_20rem] lg:gap-10">
      <div className="min-w-0 space-y-8">
        {/* ── Paso 1 · Catálogo ─────────────────────────────────────────── */}
        <section aria-labelledby={`${uid}-eyebrow1 ${uid}-step1`}>
          {/* El antetítulo entra en el nombre accesible de la sección: quien
              navega por regiones oye «Paso 1 · Catálogo, Elige el modelo de tu
              cerca» y sabe por dónde va, no sólo qué hay. */}
          <p id={`${uid}-eyebrow1`} className="eyebrow text-muted-foreground">
            Paso 1 · Catálogo
          </p>

          <div className="mt-1 flex items-end justify-between gap-4">
            <h2 id={`${uid}-step1`} className="text-xl font-bold text-foreground sm:text-2xl">
              Elige el modelo de tu cerca
            </h2>

            {/* Flechas sólo para ratón: en móvil se arrastra y con teclado el
                navegador ya trae a la vista la ficha que recibe el foco. Con
                una sola ficha en pantalla no hay nada que desplazar y dos
                botones muertos son dos promesas incumplidas. */}
            {models.length > 1 && (
              <div className="hidden shrink-0 gap-2 sm:flex">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Ver los modelos anteriores"
                  aria-controls={railId}
                  onClick={() => scrollRail(-1)}
                >
                  <ChevronLeft aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Ver los modelos siguientes"
                  aria-controls={railId}
                  onClick={() => scrollRail(1)}
                >
                  <ChevronRight aria-hidden="true" />
                </Button>
              </div>
            )}
          </div>

          {/* Buscador, facetas, recuento y vacío: HTML de servidor, colgado
              aquí porque es donde se lee, no porque lo necesite esta isla. */}
          {filters}

          {/* Carrusel: un contenedor con desbordamiento y anclaje. El foco de
              teclado entra ficha por ficha y el navegador desplaza solo; no hay
              nada que atrape el tabulador. Sin coincidencias no se pinta: la
              salida la ofrece el vacío que llega por `filters`, con un enlace
              para quitar cada filtro por separado. */}
          <ul
            ref={railRef}
            id={railId}
            hidden={models.length === 0}
            className="-mx-1 mt-4 flex snap-x snap-mandatory gap-3 overflow-x-auto px-1 py-1"
          >
            {models.map((m) => {
              const selected = m.id === model?.id
              const stock = availability(m)

              return (
                <li key={m.id} className="w-60 shrink-0 snap-start sm:w-64">
                  <article
                    className={`flex h-full flex-col overflow-hidden rounded-lg border bg-surface transition-colors ${
                      selected ? "border-primary ring-1 ring-primary" : "border-border"
                    }`}
                  >
                    <div className="relative aspect-[4/3] overflow-hidden bg-surface-2">
                      {m.image ? (
                        /* La URL llega absoluta del Object Storage: se pasa tal
                           cual. `fill` dentro de una caja con proporción fija
                           reserva el hueco, así que no hay salto de maqueta.
                           Sin `preload`: el carrusel arranca a media página y
                           precargar 15 fotos competiría con el LCP. */
                        <Image
                          src={m.image}
                          alt={m.imageAlt}
                          fill
                          sizes="256px"
                          className="object-cover object-center"
                        />
                      ) : (
                        /* Diez de los quince modelos no tienen fotografía. Un
                           rectángulo vacío parece un error del sitio; el alzado
                           dibujado en CSS distingue una malla de un listón y no
                           cuesta una sola petición. */
                        <div
                          aria-hidden="true"
                          className={`size-full diagram ${m.mesh ? "diagram-mesh" : "diagram-picket"}`}
                        />
                      )}

                      <span
                        className={`absolute top-2 left-2 rounded-sm px-1.5 py-0.5 text-2xs font-bold ${stock.className}`}
                      >
                        {stock.label}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col p-3">
                      <h3 className="line-clamp-2 text-sm leading-snug font-semibold text-foreground">
                        {m.name}
                      </h3>

                      {m.description && (
                        <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                          {m.description}
                        </p>
                      )}

                      <dl className="mt-2.5 space-y-1 text-xs">
                        {m.height && (
                          <div className="flex items-baseline justify-between gap-2">
                            <dt className="text-muted-foreground">Altura</dt>
                            <dd className="tabular font-semibold text-foreground">{m.height}</dd>
                          </div>
                        )}
                        <div className="flex items-baseline justify-between gap-2">
                          <dt className="text-muted-foreground">{UNIT_COPY[m.unit].per}</dt>
                          <dd className="tabular text-base font-bold text-foreground">
                            {money(m.price)}
                          </dd>
                        </div>
                      </dl>

                      <Button
                        type="button"
                        variant={selected ? "default" : "outline"}
                        aria-pressed={selected}
                        onClick={() => setModel(selected ? null : m)}
                        className="mt-3 w-full"
                      >
                        {selected && <Check aria-hidden="true" />}
                        {selected ? "Seleccionado" : "Elegir modelo"}
                        {/* Quince botones llamados «Elegir modelo» son quince
                            botones idénticos en la lista del lector de
                            pantalla. El nombre del modelo los distingue. */}
                        <span className="sr-only"> — {m.name}</span>
                      </Button>
                    </div>
                  </article>
                </li>
              )
            })}
          </ul>
        </section>

        {/* ── Paso 2 · Medidas ──────────────────────────────────────────── */}
        <section aria-labelledby={`${uid}-eyebrow2 ${uid}-step2`}>
          <p id={`${uid}-eyebrow2`} className="eyebrow text-muted-foreground">
            Paso 2 · Medidas
          </p>
          <h2 id={`${uid}-step2`} className="mt-1 text-xl font-bold text-foreground sm:text-2xl">
            Dinos cuánto vas a cercar
          </h2>

          {model ? (
            <div className="mt-4 rounded-lg border border-border bg-surface-2 p-4">
              <h3 className="text-base font-bold text-foreground">{model.name}</h3>
              {model.description && (
                <p className="mt-1 max-w-prose text-sm text-muted-foreground">{model.description}</p>
              )}

              {/* Ficha técnica: sólo campos que la API trae de verdad. */}
              <dl className="mt-3 flex flex-wrap gap-2">
                {model.height && <Spec label="Altura" value={model.height} />}
                {model.material && <Spec label="Material" value={model.material} />}
                {model.warrantyYears != null && (
                  <Spec label="Garantía" value={`${model.warrantyYears} años`} />
                )}
                {model.colors.length > 0 && (
                  <Spec label="Colores" value={model.colors.join(", ")} />
                )}
              </dl>

              {/* El modelo elegido puede quedar fuera de los resultados: o se
                  llegó por `?producto=` desde una ficha, o se filtró después de
                  elegirlo. La elección se respeta —no se borra una cotización a
                  medias por tocar un filtro—, pero se dice, porque si no parece
                  que el buscador de arriba se ha equivocado. */}
              {!models.some((m) => m.id === model.id) && (
                <p className="mt-3 text-xs text-muted-foreground">
                  Este modelo no está entre los resultados de arriba, pero sigue elegido y es el
                  que se está cotizando. Quita un filtro para volver a verlo en la lista.
                </p>
              )}
            </div>
          ) : (
            <p className="mt-4 rounded-lg border border-dashed border-border-strong bg-surface-sunk px-4 py-3 text-sm text-muted-foreground">
              Elige un modelo arriba y el estimado se calcula solo. Los metros que escribas se
              mantienen al cambiar de modelo.
            </p>
          )}

          <div className="mt-5">
            <Label htmlFor={metersId}>{copy.field}</Label>

            <div className="relative mt-2 max-w-xs">
              {/* `type="text"` con teclado decimal, y no `type="number"`: los
                  botones de incremento del navegador miden menos de los 24 px
                  que exige la WCAG 2.2 y la rueda del ratón cambia la cifra sin
                  querer sobre un campo enfocado. El cuerpo va a 17 px porque
                  por debajo de 16 px Safari en iOS hace zoom al enfocar y
                  descoloca la página entera. */}
              <Input
                id={metersId}
                type="text"
                inputMode="decimal"
                autoComplete="off"
                value={metersText}
                onChange={(e) => {
                  setMetersText(e.target.value.replace(/[^\d.,]/g, ""))
                  /* Escribir a mano sigue siendo el camino por defecto y manda
                     sobre la plantilla: el número deja de venir de una forma de
                     terreno, así que deja de decirse que viene de ella. */
                  setLandLine(null)
                }}
                aria-describedby={`${metersHintId}${overStock ? ` ${stockHintId}` : ""}`}
                className="h-12 pr-16 text-lg font-semibold"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3.5 text-sm font-bold text-muted-foreground"
              >
                {copy.suffix}
              </span>
            </div>

            <p id={metersHintId} className="mt-2 max-w-prose text-xs text-muted-foreground">
              {model?.unit === "METRO" || !model
                ? "Suma los lados que vas a cercar. Pedido mínimo 10 m lineales."
                : "Cantidad de piezas que vas a pedir."}
              {belowMinimum && (
                <span className="mt-1 block font-semibold text-foreground">
                  Con menos de {MIN_METERS} m el pedido no llega al mínimo: te lo confirmamos por
                  WhatsApp.
                </span>
              )}
            </p>

            {overStock && model && (
              <p id={stockHintId} className="mt-2 max-w-prose text-xs font-semibold text-foreground">
                Hay <span className="tabular">{model.stock}</span> {copy.abbr} de este modelo en
                existencia. Para <span className="tabular">{meterLabel(meters)}</span> {copy.abbr} hay
                que confirmar el plazo de fabricación con un asesor.
              </p>
            )}

            {/* Plantillas de terreno: la ayuda para quien no sabe cuántos
                metros son. Va DEBAJO del campo y plegada, porque el camino por
                defecto es escribirlos, no pasar por aquí.

                Sólo con unidad de venta por metro: un perímetro no dice cuántos
                paneles ni cuántas unidades hay que pedir —eso necesitaría el
                ancho de panel, que ninguna ficha trae (ver `quote-models.ts`)—,
                y ofrecerlo sería fingir una cuenta que no se puede hacer. */}
            {(model?.unit ?? "METRO") === "METRO" && (
              <LandPlanner
                initial={initialLand}
                metersText={metersText}
                fieldName={copy.field}
                onMeasure={(value, summary) => {
                  setMetersText(value)
                  setLandLine(summary)
                }}
              />
            )}
          </div>

          {/* Puertas: sólo si el modelo trae precio de puerta. Hoy ninguno lo
              trae y este bloque no llega a pintarse; el día que se cargue
              `gatePrice` en la ficha, aparece con su precio real. Un contador
              de puertas sin precio de puerta no cotiza nada. */}
          {model?.gatePrice != null && (
            <div className="mt-5">
              <p className="font-heading text-sm font-semibold text-foreground" id={`${uid}-gates`}>
                Puertas de acceso
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                {money(model.gatePrice)} cada una, según el catálogo.
              </p>

              <div
                className="mt-2 inline-flex items-center gap-2"
                role="group"
                aria-labelledby={`${uid}-gates`}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Quitar una puerta"
                  onClick={() => setGates((n) => Math.max(0, n - 1))}
                >
                  <Minus aria-hidden="true" />
                </Button>
                <output className="tabular w-12 text-center text-lg font-bold text-foreground">
                  {gates}
                </output>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Añadir una puerta"
                  onClick={() => setGates((n) => n + 1)}
                >
                  <Plus aria-hidden="true" />
                </Button>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* ── Resumen ─────────────────────────────────────────────────────── */}
      <aside aria-labelledby={`${uid}-eyebrow3 ${uid}-summary`} className="min-w-0 lg:sticky lg:top-20 lg:self-start">
        <div className="rounded-xl border border-border bg-surface p-4 sm:p-5">
          <p id={`${uid}-eyebrow3`} className="eyebrow text-muted-foreground">
            Resumen
          </p>
          <h2 id={`${uid}-summary`} className="mt-1 text-lg font-bold text-foreground">
            Tu estimado
          </h2>

          <dl className="mt-4 space-y-3 border-t border-border pt-4 text-sm">
            <SummaryRow label="Modelo" value={model ? model.name : "Sin elegir"} />

            <SummaryRow
              label="Material"
              hint={
                model
                  ? `${meterLabel(meters)} ${copy.abbr} × ${money(price)}`
                  : "Elige un modelo para ver el precio"
              }
              value={money(materialCost)}
            />

            {/* Las tres filas de la referencia de diseño que la base todavía no
                puede sostener. Se pintan en cuanto el dato exista. */}
            {panelRow && (
              <SummaryRow
                label="Paneles necesarios"
                hint={`Paneles de ${meterLabel(panelRow.width)} m`}
                value={`${panelRow.count} uds`}
              />
            )}
            {postRow && (
              <SummaryRow
                label="Postes necesarios"
                hint={`Cada ${meterLabel(postRow.spacing)} m, más el de cierre`}
                value={`${postRow.count} uds`}
              />
            )}
            {model?.gatePrice != null && gates > 0 && (
              <SummaryRow
                label="Puertas"
                hint={`${gates} × ${money(model.gatePrice)}`}
                value={money(gatesCost)}
              />
            )}

            <SummaryRow label="ITBMS (7%)" value={money(tax)} />
          </dl>

          {/* El total se anuncia al recalcular: quien usa lector de pantalla
              escribe los metros en el paso 2 y el resultado está en otra
              columna, fuera de su foco. */}
          <div
            role="status"
            aria-live="polite"
            className="mt-4 flex items-baseline justify-between gap-3 border-t border-border-strong pt-4"
          >
            <span className="font-heading text-base font-bold text-foreground">Total estimado</span>
            <span className="tabular font-heading text-2xl font-bold text-primary">
              {money(total)}
            </span>
          </div>

          <p className="mt-3 text-xs text-muted-foreground">
            Sólo material, con ITBMS incluido. No incluye instalación ni transporte, y el precio se
            confirma al cotizar.
          </p>

          <Button asChild variant="whatsapp" size="block" className="mt-4">
            <a
              href={whatsappHref(messageLines.join("\n"))}
              target="_blank"
              rel="noopener noreferrer"
            >
              <IconWhatsApp />
              Enviar por WhatsApp
            </a>
          </Button>

          <Button asChild variant="outline" size="block" className="mt-2">
            <a href={CONTACT.phoneHref}>
              <Phone aria-hidden="true" />
              {CONTACT.phoneDisplay}
            </a>
          </Button>

          {/* La instalación no se calcula porque no hay con qué: no existe
              tarifa en el catálogo. En su lugar, la conversación en la que sí
              se puede dar un precio. */}
          <p className="mt-4 border-t border-border pt-4 text-xs text-muted-foreground">
            ¿Necesitas también la instalación?{" "}
            <a
              href={whatsappHref(WA_MESSAGE.install)}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-foreground underline decoration-primary/40 decoration-2 underline-offset-4 hover:decoration-primary"
            >
              Pídenos precio de mano de obra
            </a>
            . Se cotiza con la medida tomada, no con un porcentaje.
          </p>
        </div>
      </aside>
    </div>
  )
}
