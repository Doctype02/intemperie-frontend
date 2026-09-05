"use client"

import { useState } from "react"
import Link from "next/link"

import { WA_MESSAGE } from "@/components/layout/nav-data"
import { Button } from "@/components/ui/button"
import { IconWhatsApp, whatsappHref } from "@/components/ui/icon-whatsapp"
import { centsToMoney, formatMoney, moneyToCents } from "@/lib/utils"
import type { ProductUnit } from "@/types"

/* El contador cotizado — única isla de cliente de la portada.
 *
 * Todo lo demás en la portada es HTML de servidor. Esta isla existe porque
 * mover una cinta métrica y ver el total cambiar es literalmente la promesa
 * del hero («sepa hoy cuánto cuesta»), y eso no se hace sin estado.
 *
 * Contrato sin JavaScript: este mismo árbol se sirve renderizado en servidor,
 * así que sin hidratar se ve la cifra del modelo más barato, el range nativo
 * sigue siendo arrastrable (es un input de verdad, no un div) y el CTA lleva
 * a `/calculadora?metros=10`. La isla solo REESCRIBE el href cuando hay
 * elección real: `?producto=<slug>&metros=<n>`.
 *
 * Dinero: `basePrice` viaja como cadena decimal y el total se multiplica en
 * céntimos enteros (moneyToCents × metros), nunca en punto flotante. Es UI de
 * estimación; el server-quote sigue mandando en el carrito.
 *
 * Estado: `metros` y `slugActivo`. Nada más. Sin fetch.
 */

export interface HeroModel {
  slug: string
  name: string
  /* Cadena decimal («8.50»): el dinero no pasa por Number para pintarse. */
  basePrice: string
  unit: ProductUnit
}

const MIN_METERS = 10
const MAX_METERS = 200

const suffix = (unit: ProductUnit) =>
  unit === "METRO" ? "/m" : unit === "PANEL" ? "/panel" : " c/u"

export function HeroCounter({ models }: { models: HeroModel[] }) {
  const [metros, setMetros] = useState(MIN_METERS)
  /* `null` = sin elección: el href server-rendered queda en /calculadora?metros=10
     y no hay desajuste de hidratación. Tocar un chip fija el producto. */
  const [slugActivo, setSlugActivo] = useState<string | null>(null)

  const active = models.find((m) => m.slug === slugActivo) ?? models[0]
  const total = centsToMoney(moneyToCents(active.basePrice) * metros)
  const calcHref = slugActivo
    ? `/calculadora?producto=${slugActivo}&metros=${metros}`
    : `/calculadora?metros=${metros}`

  return (
    <div className="min-w-0">
      {/* LA CIFRA: el precio real del catálogo como protagonista tipográfico.
          No anima: es candidata a LCP. La cota de debajo la «mide» y es el
          único ámbar de la página. */}
      <div className="w-fit max-w-full">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="tabular text-display font-bold text-on-dark">
            {formatMoney(active.basePrice)}
          </span>
          <span className="text-xl font-medium text-brand-green">
            {active.unit === "METRO" ? "/metro" : suffix(active.unit)}
          </span>
        </p>
        <div className="cota cota-accent mt-3" aria-hidden="true">
          <span className="tabular bg-brand-navy-deep px-2">
            1 m instalado en su terreno
          </span>
        </div>
        <p className="sr-only">
          Precio por metro lineal de {active.name}, instalado en su terreno.
        </p>
      </div>

      {/* La cinta métrica: el precio del catálogo convertido en SU precio. */}
      <div className="mt-7">
        <label htmlFor="hero-metros" className="block text-sm text-on-dark-soft">
          ¿Cuántos metros tiene su lote?
        </label>
        <input
          id="hero-metros"
          type="range"
          min={MIN_METERS}
          max={MAX_METERS}
          step={5}
          defaultValue={MIN_METERS}
          onChange={(e) => setMetros(Number(e.currentTarget.value) || MIN_METERS)}
          className="tape-rule mt-1.5"
          aria-describedby="hero-total"
        />
        <output
          id="hero-total"
          htmlFor="hero-metros"
          aria-live="polite"
          className="mt-1 block text-sm text-on-dark-soft"
        >
          <span className="tabular">{metros} m</span> de {active.name} ={" "}
          <span className="tabular font-bold text-on-dark">{formatMoney(total)}</span>{" "}
          de material
          <span className="tabular text-2xs text-on-dark-soft"> · pedido mínimo 10 m</span>
        </output>
      </div>

      {/* Los 15 modelos, cada uno con su precio: tocar uno cambia la cifra. */}
      <div
        role="group"
        aria-label="Elija el modelo para ver su precio por metro"
        className="scrollbar-hide -mx-gutter mt-5 flex gap-2 overflow-x-auto px-gutter"
      >
        {models.map((m) => {
          const isActive = m.slug === active.slug
          return (
            <button
              key={m.slug}
              type="button"
              onClick={() => setSlugActivo(m.slug)}
              aria-pressed={isActive}
              className={`flex h-9 shrink-0 items-center gap-1.5 rounded-md border px-3 text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? "border-brand-green bg-brand-green/15 text-on-dark"
                  : "border-hairline bg-surface/10 text-on-dark-soft hover:border-border-strong hover:text-on-dark"
              }`}
            >
              {m.name}
              <span aria-hidden="true" className="text-on-dark-soft">·</span>
              <span className="tabular font-bold text-on-dark">
                {formatMoney(m.basePrice)}
                <span className="font-medium text-on-dark-soft">{suffix(m.unit)}</span>
              </span>
            </button>
          )
        })}
      </div>

      {/* Dos salidas, jerarquía clara: un primario sólido y WhatsApp. */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Button asChild className="h-12 px-6">
          <Link href={calcHref}>Calcular mi cerca</Link>
        </Button>
        <Button asChild variant="whatsapp" className="h-12 px-5">
          <a
            href={whatsappHref(WA_MESSAGE.quote)}
            target="_blank"
            rel="noopener noreferrer"
          >
            <IconWhatsApp />
            Cotizar por WhatsApp
          </a>
        </Button>
      </div>
    </div>
  )
}
