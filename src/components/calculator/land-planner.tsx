import { useId, useState } from "react"

import {
  LAND_PRESETS,
  LAND_SHAPES,
  describeLand,
  findLandShape,
  meterLabel,
  solveLand,
  type LandResult,
  type LandSelection,
  type LandShape,
  type LandShapeId,
} from "./land-shapes"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

/* Plantillas de terreno — sistema «Perímetro».
 *
 * ─────────────────────────────────────────────────────────────────────────
 * ESTO NO ES UNA SEGUNDA ISLA
 *
 * No lleva `"use client"` a propósito. Es una pieza de la única isla que hay
 * (`fence-calculator.tsx`), que es quien la importa; sin directiva no puede
 * convertirse en un punto de entrada nuevo, y si alguien la colgara de un
 * componente de servidor reventaría en el acto en vez de duplicar el paquete
 * del navegador en silencio. El buscador y las facetas siguen siendo HTML de
 * servidor.
 *
 * Vive en su propio archivo por tamaño, no por frontera: la isla ya andaba por
 * las setecientas líneas.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * POR QUÉ ES UNA AYUDA Y NO UN PEAJE
 *
 * El camino por defecto sigue siendo escribir los metros a mano, arriba, en su
 * campo de siempre: quien ya los sabe no tiene que pasar por aquí ni cerrar
 * nada. Esto es un `<details>` plegado, debajo, para quien no los sabe. Se
 * abre solo en un caso: cuando la URL trae una forma, porque entonces es lo que
 * el visitante estaba mirando.
 *
 * Mientras faltan medidas no se toca el campo de metros. En cuanto la forma
 * cuadra, se escribe el perímetro allí arriba y se dice que se ha escrito. Si
 * después se corrige el número a mano, ESTE bloque no lo pisa: se avisa de que
 * ya no coinciden y se ofrece un botón para volver al perímetro. Corregir bajo
 * los dedos de quien teclea es hostil, y aquí el que manda es el que mide.
 *
 * ─────────────────────────────────────────────────────────────────────────
 * LOS DIAGRAMAS
 *
 * SVG en línea, cero peticiones de red, en la gramática de `.diagram` de
 * globals.css: trazo de `currentColor`, así que heredan el color del estado
 * (elegido o no) y funcionan igual en claro y en oscuro sin un solo literal.
 * Son `aria-hidden`: todo lo que dicen —qué lado es cuál y cuál no se cerca—
 * está además en las etiquetas de los campos y en la nota del resultado.
 */

/* ── Diagramas ───────────────────────────────────────────────────────────── */

/** Coordenadas en un lienzo de 64 × 48 para las cuatro formas. */
function ShapeDiagram({
  id,
  labels = false,
  className = "",
}: {
  id: LandShapeId
  /** Las letras de los lados, las mismas que llevan las etiquetas. */
  labels?: boolean
  className?: string
}) {
  return (
    <svg
      viewBox="0 0 64 48"
      aria-hidden="true"
      focusable="false"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={3}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {id === "rectangulo" && <rect x={6} y={6} width={52} height={36} rx={2} />}

      {id === "frente-abierto" && (
        <>
          {/* Tres lados cerrados y el frente a trazos: el lado de la calle. */}
          <path d="M6 42 V6 H58 V42" />
          <path d="M6 42 H58" strokeDasharray="5 5" strokeOpacity={0.5} />
        </>
      )}

      {id === "ele" && <path d="M6 42 H58 V24 H34 V6 H6 Z" />}

      {id === "frente" && (
        <>
          <path d="M6 30 H58" />
          {/* Los dos remates del tramo, para que se lea como una cerca y no
              como un subrayado. */}
          <path d="M6 23 V37" />
          <path d="M58 23 V37" />
        </>
      )}

      {labels && (
        <g fill="currentColor" stroke="none" fontSize={9} fontWeight={700} textAnchor="middle">
          {id === "rectangulo" && (
            <>
              <text x={32} y={37}>a</text>
              <text x={49} y={27}>b</text>
            </>
          )}
          {id === "frente-abierto" && (
            <>
              <text x={32} y={37}>a</text>
              <text x={49} y={27}>b</text>
            </>
          )}
          {id === "ele" && (
            <>
              <text x={19} y={38}>a</text>
              <text x={14} y={27}>b</text>
              <text x={47} y={35}>c</text>
              <text x={27} y={18}>d</text>
            </>
          )}
          {id === "frente" && <text x={32} y={22}>a</text>}
        </g>
      )}
    </svg>
  )
}

/* ── Plantillas ──────────────────────────────────────────────────────────── */

/** Lo que el visitante escribe en un campo de medida, a número. */
const toNumber = (text: string) => {
  const n = parseFloat(text.replace(",", "."))
  return Number.isFinite(n) && n > 0 ? n : 0
}

export function LandPlanner({
  initial,
  metersText,
  fieldName,
  onMeasure,
}: {
  /** Forma y medidas resueltas en el servidor desde `?forma=&lados=`. */
  initial: LandSelection | null
  /** Lo que hay ahora mismo en el campo de metros, para detectar divergencias. */
  metersText: string
  /** Cómo se llama ese campo, para poder señalarlo por su nombre. */
  fieldName: string
  /**
   * Perímetro calculado, ya formateado como se escribe en el campo, y la
   * operación de la que sale para el mensaje de WhatsApp. Sólo se llama cuando
   * la cuenta cuadra: mientras faltan medidas, el campo no se toca.
   */
  onMeasure: (meters: string, summary: string) => void
}) {
  const uid = useId()

  /* Abierto sólo si se llegó con una forma en la URL: si no, el camino por
     defecto es el campo de metros de arriba y esto no debe estorbarlo. */
  const [open, setOpen] = useState(initial != null)
  const [shapeId, setShapeId] = useState<LandShapeId | null>(initial?.shapeId ?? null)
  /* Las medidas se guardan como texto por el mismo motivo que los metros:
     borrar un campo para escribir otra cifra no puede reponer un «0» solo. */
  const [sides, setSides] = useState<string[]>(initial ? initial.sides.map(meterLabel) : [])

  const shape = shapeId ? findLandShape(shapeId) : null
  const values = sides.map(toNumber)
  const result: LandResult | null = shape ? solveLand(shape, values) : null

  /** Escribe el perímetro arriba, si la forma ya cuadra. */
  const publish = (next: LandShape, nextSides: string[]) => {
    const described = describeLand({
      shapeId: next.id,
      sides: nextSides.map(toNumber),
    })
    if (described) onMeasure(meterLabel(described.meters), described.summary)
  }

  const chooseShape = (next: LandShape) => {
    /* Las medidas ya escritas se conservan por posición: el frente sigue siendo
       el frente al pasar de «rectangular» a «rectangular con frente abierto», y
       obligar a reescribirlo para comparar las dos cuentas sería absurdo. */
    const kept = Array.from({ length: next.sides.length }, (_, i) => sides[i] ?? "")
    setShapeId(next.id)
    setSides(kept)
    publish(next, kept)
  }

  const editSide = (index: number, raw: string) => {
    if (!shape) return
    const next = Array.from({ length: shape.sides.length }, (_, i) => sides[i] ?? "")
    next[index] = raw.replace(/[^\d.,]/g, "")
    setSides(next)
    publish(shape, next)
  }

  const applyPreset = (shapeIdOfPreset: LandShapeId, presetSides: number[]) => {
    const next = findLandShape(shapeIdOfPreset)
    if (!next) return
    const texts = presetSides.map(meterLabel)
    setShapeId(next.id)
    setSides(texts)
    publish(next, texts)
  }

  const resultId = `${uid}-result`
  const sideId = (key: string) => `${uid}-side-${key}`
  const hintId = (key: string) => `${uid}-hint-${key}`

  const invalidKeys = result?.kind === "invalid" ? result.keys : []
  /* ¿Los metros de arriba siguen siendo los de esta forma? Si se han corregido
     a mano, este bloque no los pisa: lo dice y ofrece volver. */
  const applied = result?.kind === "ok" && metersText === meterLabel(result.meters)

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="group mt-5 overflow-hidden rounded-lg border border-border bg-surface-2"
    >
      <summary className="flex min-h-tap cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 marker:content-none">
        <span className="min-w-0">
          <span className="font-heading block text-sm font-semibold text-foreground">
            ¿No sabes cuántos metros son?
          </span>
          <span className="mt-0.5 block text-xs text-muted-foreground">
            Dinos la forma del terreno y sus medidas: el perímetro se calcula solo.
          </span>
        </span>
        <span
          aria-hidden="true"
          className="shrink-0 text-primary transition-transform group-open:rotate-180"
        >
          ▾
        </span>
      </summary>

      <div className="space-y-5 border-t border-border px-4 py-4">
        {/* ── Configuraciones listas ─────────────────────────────────────── */}
        <div>
          <p id={`${uid}-presets`} className="eyebrow text-muted-foreground">
            Empezar con una medida redonda
          </p>
          {/* Punto de partida editable, y se dice con esas palabras: estos
              números no son una afirmación sobre el terreno de nadie. */}
          <p className="mt-1 max-w-prose text-xs text-muted-foreground">
            Punto de partida, ajústelo a su terreno. No son las medidas de su lote: sólo rellenan
            los campos para no arrancar en blanco.
          </p>

          <ul aria-labelledby={`${uid}-presets`} className="mt-2 flex flex-wrap gap-2">
            {LAND_PRESETS.map((preset) => {
              /* El resultado de cada configuración se calcula con la misma
                 fórmula que lo pintará después: no hay un número escrito a mano
                 que pueda quedarse desfasado. */
              const described = describeLand({ shapeId: preset.shapeId, sides: preset.sides })
              if (!described) return null

              return (
                <li key={preset.id}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => applyPreset(preset.shapeId, preset.sides)}
                  >
                    {preset.label}
                    <span className="tabular text-xs text-muted-foreground">
                      {meterLabel(described.meters)} m
                    </span>
                  </Button>
                </li>
              )
            })}
          </ul>
        </div>

        {/* ── Forma del terreno ──────────────────────────────────────────── */}
        <fieldset>
          <legend className="eyebrow text-muted-foreground">La forma de tu terreno</legend>

          {/* Radios de verdad, no botones: con cuatro opciones excluyentes el
              navegador ya da las flechas del teclado, el estado marcado y el
              nombre del grupo sin una línea de JavaScript. Van `sr-only` y el
              foco se pinta sobre la tarjeta con `peer-focus-visible`. */}
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-4">
            {LAND_SHAPES.map((s) => {
              const on = s.id === shapeId
              return (
                <div key={s.id} className="relative">
                  <input
                    type="radio"
                    id={`${uid}-shape-${s.id}`}
                    name={`${uid}-shape`}
                    value={s.id}
                    checked={on}
                    onChange={() => chooseShape(s)}
                    className="peer sr-only"
                  />
                  <label
                    htmlFor={`${uid}-shape-${s.id}`}
                    className={`flex min-h-tap cursor-pointer flex-col items-center gap-1.5 rounded-md border p-2.5 text-center transition-colors peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-ring ${
                      on
                        ? "border-primary bg-secondary text-secondary-foreground"
                        : "border-border bg-surface text-muted-foreground hover:border-primary"
                    }`}
                  >
                    <ShapeDiagram id={s.id} className="h-9 w-12 shrink-0" />
                    <span
                      className={`text-2xs leading-snug font-semibold ${
                        on ? "text-secondary-foreground" : "text-foreground"
                      }`}
                    >
                      {s.name}
                      {/* Quien no ve el diagrama necesita la diferencia entre
                          las cuatro formas aquí, no debajo y sólo la elegida. */}
                      <span className="sr-only"> — {s.summary}</span>
                    </span>
                  </label>
                </div>
              )
            })}
          </div>
        </fieldset>

        {/* ── Medidas y operación ────────────────────────────────────────── */}
        {shape ? (
          <div className="rounded-md border border-border bg-surface p-3">
            <div className="flex items-start gap-3">
              <ShapeDiagram id={shape.id} labels className="h-18 w-24 shrink-0 text-primary" />
              <div className="min-w-0">
                <p className="font-heading text-sm font-semibold text-foreground">{shape.name}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{shape.summary}</p>
              </div>
            </div>

            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              {shape.sides.map((side, i) => {
                const bad = invalidKeys.includes(side.key)
                return (
                  <div key={side.key}>
                    <Label htmlFor={sideId(side.key)}>
                      {side.label} ({side.letter})
                    </Label>
                    <div className="relative mt-1.5">
                      {/* Mismo campo que los metros de arriba: texto con teclado
                          decimal y 16 px de cuerpo. `type="number"` traería
                          flechas por debajo de los 24 px que exige la WCAG 2.2 y
                          la rueda del ratón cambiando la medida sin querer. */}
                      <Input
                        id={sideId(side.key)}
                        type="text"
                        inputMode="decimal"
                        autoComplete="off"
                        value={sides[i] ?? ""}
                        onChange={(e) => editSide(i, e.target.value)}
                        aria-describedby={`${hintId(side.key)}${bad ? ` ${resultId}` : ""}`}
                        aria-invalid={bad || undefined}
                        className="pr-9"
                      />
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-sm font-bold text-muted-foreground"
                      >
                        m
                      </span>
                    </div>
                    <p id={hintId(side.key)} className="mt-1 text-2xs leading-snug text-muted-foreground">
                      {side.hint}
                    </p>
                  </div>
                )
              })}
            </div>

            {/* La operación, no sólo el resultado: quien va a gastar miles de
                dólares quiere ver de dónde sale el número y poder rehacerlo en
                una servilleta. `<output>` es el elemento del resultado
                calculado y ya se anuncia solo al cambiar. */}
            <output
              id={resultId}
              htmlFor={shape.sides.map((side) => sideId(side.key)).join(" ")}
              className="mt-3 block border-t border-border pt-3"
            >
              {result?.kind === "ok" && (
                <>
                  <span className="eyebrow block text-muted-foreground">Perímetro a cercar</span>
                  <span className="tabular mt-1 block text-lg font-bold text-foreground">
                    {result.operation}
                  </span>
                  <span className="mt-1 block max-w-prose text-xs text-muted-foreground">
                    {result.note}
                  </span>
                </>
              )}

              {result?.kind === "invalid" && (
                <span className="block max-w-prose text-xs font-semibold text-destructive">
                  {result.message}
                </span>
              )}

              {result?.kind === "incomplete" && (
                <span className="block text-xs text-muted-foreground">
                  Escribe las medidas y aquí aparece la cuenta completa.
                </span>
              )}
            </output>

            {result?.kind === "ok" &&
              (applied ? (
                <p className="mt-2 text-xs text-muted-foreground">
                  Ya están escritos en «{fieldName}», arriba. Puedes cambiarlos a mano cuando
                  quieras.
                </p>
              ) : (
                /* Los metros de arriba se han tocado a mano después. No se
                   pisan: se ofrece volver, y decide quien mide. */
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <p className="text-xs text-muted-foreground">
                    Arriba hay <span className="tabular font-semibold text-foreground">
                      {metersText || "0"}
                    </span>{" "}
                    m escritos a mano.
                  </p>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => publish(shape, sides)}
                  >
                    Usar los <span className="tabular">{meterLabel(result.meters)}</span> m del
                    perímetro
                  </Button>
                </div>
              ))}
          </div>
        ) : (
          <p className="rounded-md border border-dashed border-border-strong bg-surface-sunk px-3 py-2.5 text-xs text-muted-foreground">
            Elige la forma que más se parezca a tu terreno y escribe las medidas de sus lados.
            Sólo se suman los lados que vas a cercar.
          </p>
        )}
      </div>
    </details>
  )
}
