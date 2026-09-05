/* Banda cotizadora — sistema «Perímetro».
 *
 * La demostración de la calculadora en una línea, en mitad de la zona de
 * catálogo: el patrón de banda promocional de e-commerce, pero con promesa
 * real en vez de descuento inventado. Una pregunta —«¿cuántos metros tiene
 * su terreno?»—, un campo y un botón.
 *
 * Es la única banda verde de la página: verde = acción en este sistema, y si
 * la acción está en todas partes no está en ninguna.
 *
 * Cero JavaScript: un `<form method="get">` contra /calculadora, que ya honra
 * `?metros=` (es el mismo contrato con el que llegan las fichas de producto,
 * ver `QUOTE_KEYS` en calculadora/catalog-query.ts). El botón va en navy
 * profundo, no en verde: sobre fondo verde, otro botón verde desaparece.
 *
 * `min={10}` y `step={5}` no son decoración: 10 m es el pedido mínimo real y
 * la nota lo dice con todas las letras, temprano y legible, no en letra
 * pequeña al fondo de la página.
 */
export function MetrosBand() {
  return (
    <section className="defer-paint border-b border-border bg-primary text-primary-foreground">
      <div className="shell flex flex-col gap-4 py-8 lg:flex-row lg:items-start lg:justify-center lg:gap-10">
        <p className="text-lg font-bold tracking-tight lg:mt-2.5">
          ¿Cuántos metros tiene su terreno?
        </p>

        <div className="min-w-0">
          <form action="/calculadora" method="get" className="flex gap-2">
            <label htmlFor="metros-band" className="sr-only">
              Metros lineales de su terreno
            </label>
            <input
              id="metros-band"
              type="number"
              name="metros"
              min={10}
              step={5}
              placeholder="80"
              inputMode="numeric"
              className="tabular h-12 w-28 rounded-lg border border-transparent bg-surface px-3 text-base text-foreground transition-colors placeholder:text-muted-foreground focus:border-brand-navy-deep"
            />
            <button
              type="submit"
              className="h-12 shrink-0 rounded-lg bg-brand-navy-deep px-5 font-heading font-semibold text-on-dark transition-colors hover:bg-brand-navy"
            >
              Calcular mi cerca
            </button>
          </form>

          <p className="mt-2 text-sm text-primary-foreground/85">
            Precio de material al instante, con ITBMS. Pedido mínimo 10 m.
          </p>
        </div>
      </div>
    </section>
  )
}
