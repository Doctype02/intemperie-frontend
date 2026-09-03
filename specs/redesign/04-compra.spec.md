# Spec: Compra — carrito con resumen sticky, checkout sin `<main>` anidado, calculadora más fácil

## Metadata

- developer_type: agent
- estimated_complexity: media-alta
- languages: TypeScript (TSX)
- depends_on: 01-foundation (fusionada; no usa componentes nuevos de 01 salvo convención — todo lo que necesita ya existe en el repo)
- files_shared_with_others: ninguno (dueño único de `src/app/(store)/carrito/`, `checkout/**`, `calculadora/**`, `src/components/calculator/*`, `src/components/cart/*`)

## Objective

Tres trabajos: (1) el **carrito** adopta el patrón e-commerce estándar de dos columnas en escritorio con **resumen sticky y CTA persistente** (hoy el resumen es un pie de la caja de lista y el botón de pagar queda al fondo); (2) el **checkout** corrige tres `<main>` anidados (el layout de `(store)` ya pone `<main>`) sin tocar ni un byte de su lógica de pago (Tilopay, polling, focus management — todo probado y delicado); (3) la **calculadora** se hace «más fácil e intuitiva» (petición del dueño) con una **barra de total fija en móvil** — hoy el total vive en la columna de resumen, que en móvil queda debajo de todo: se escriben los metros y no se ve el precio cambiar. La escalabilidad más allá de ~15 modelos ya está resuelta en el servidor (filtrado por URL en `catalog-query.ts`); lo que falta es el feedback inmediato.

## Context

- **Carrito** `src/app/(store)/carrito/page.tsx` (259 líneas, `"use client"`, ya Perímetro). Estructura actual: `<div className="mx-auto max-w-4xl px-4 py-8">` → cabecera → `FreeShippingProgress` → una sola caja `rounded-xl border` con `<ul>` de líneas y un pie `border-t bg-surface-sunk p-4` que contiene `OrderTotals` + botón «Ir a pagar» alineado a la derecha (`sm:w-72`). Usa `useCartQuote(items)` (impuesto/envío/total del API — **no** se recalcula localmente), `OrderTotals` (`src/components/cart/order-totals.tsx`) con `aria-live`, y objetivos táctiles de 44 px ya resueltos.
- **Checkout** `src/app/(store)/checkout/page.tsx` (1080 líneas, `"use client"`, ya Perímetro). Tres retornos con `<main>` propio:
  - L378: `<main className="flex-1">` (esqueleto de carga)
  - L397: `<main className="flex flex-1 items-center justify-center py-section">` (carrito vacío)
  - L607: `<main className="flex-1" inert={tilopayFrame ? true : undefined}>` (flujo principal)
  El layout `(store)` (`src/app/(store)/layout.tsx`) ya envuelve con `<main className="flex-1">{children}</main>` → HTML inválido. El resto (pasos, diálogo Tilopay con foco atrapado, polling `POLL_INTERVAL_MS`, `inert`, mensajes de «no vuelvas a pagar») **no se toca**.
- **Success** `checkout/success/page.tsx` y **return** `checkout/tilopay-return/page.tsx`: ya Perímetro (shell, tokens, foco al h1). Sin cambios.
- **Calculadora** `src/app/(store)/calculadora/page.tsx` (servidor, ya Perímetro: cabecera navy + picket-rule, letra pequeña, salidas) y `src/components/calculator/fence-calculator.tsx` (731 líneas, única isla). Hechos verificados:
  - Grid `lg:grid-cols-[minmax(0,1fr)_20rem]`; el `<aside>` de resumen **ya es** `lg:sticky lg:top-20 lg:self-start`.
  - El total vive en el aside (L677–687): `role="status" aria-live="polite"` + `money(total)` en `text-2xl font-bold text-primary`.
  - CTA principal: `Button variant="whatsapp" size="block"` con `whatsappHref(messageLines.join("\n"))`.
  - En móvil (`<lg`) el aside cae **debajo** de Paso 1 + Paso 2: al teclear metros no se ve el total.
  - Paso 1 es un carrusel de fichas `w-60 sm:w-64` con `snap-x`; los filtros (`CatalogPicker`, servidor) llegan por la prop `filters`.
  - Estado relevante ya existente: `model`, `meters`, `total`, `belowMinimum`, `overStock`, `messageLines`.
  - PDP ya tiene el patrón de barra móvil fija (`product-detail-client.tsx`, bloque `fixed inset-x-0 bottom-0 z-40 … lg:hidden` con `paddingBottom: max(0.75rem, env(safe-area-inset-bottom))`) — copiar esa mecánica.

## Implementation Contract

### A. Carrito `src/app/(store)/carrito/page.tsx`

1. **Contenedor**: `<div className="mx-auto max-w-4xl px-4 py-8">` → `<div className="shell max-w-5xl py-8">` (canalón del sistema; sube a `5xl` porque ahora hay dos columnas).
2. **Dos columnas desde `lg`** (rama con artículos únicamente):

```tsx
<div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
  {/* Columna 1: progreso de envío + lista */}
  <div className="min-w-0">
    <FreeShippingProgress ... className="mb-4 rounded-xl border border-border bg-surface px-4 py-3.5" />
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <ul>…líneas actuales sin cambios…</ul>
    </div>
  </div>

  {/* Columna 2: resumen sticky con CTA persistente */}
  <aside aria-label="Resumen del pedido" className="lg:sticky lg:top-20">
    <div className="rounded-xl border border-border bg-surface p-4">
      <OrderTotals
        subtotal={cartSubtotal} quote={quote} isUpdating={isUpdating}
        error={error} onRetry={retry}
        subtotalLabel={`Subtotal (${count} ${count === 1 ? "producto" : "productos"})`}
      />
      <Button size="block" className="mt-4" asChild>
        <Link href="/checkout">Ir a pagar</Link>
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">
        Impuesto y envío calculados por el servidor. El precio se confirma al pagar.
      </p>
    </div>
  </aside>
</div>
```

   La `<li>` de cada línea, el grupo de cantidad (`stepButton`), el botón eliminar y el esqueleto de carga **no cambian**. El pie `border-t bg-surface-sunk` de la caja de lista desaparece (su contenido se muda al aside). En móvil el orden natural del grid deja el resumen debajo de la lista — igual que hoy, sin pérdida.
3. **Estados carga/vacío**: solo cambia el contenedor de la rama de carga a `shell max-w-5xl` para que no salte el ancho al hidratar. La rama vacía queda como está.

### B. Checkout `src/app/(store)/checkout/page.tsx` — solo el arreglo de `<main>`

En los tres retornos: `<main …>` → `<div id="main-content" tabIndex={-1} …>` conservando **todas** las demás clases y el atributo `inert` del principal:

- L378: `<div id="main-content" tabIndex={-1} className="flex-1 outline-none">`
- L397: `<div id="main-content" tabIndex={-1} className="flex flex-1 items-center justify-center py-section outline-none">`
- L607: `<div id="main-content" tabIndex={-1} className="flex-1 outline-none" inert={tilopayFrame ? true : undefined}>`

Cierres `</main>` → `</div>`. **Ningún otro cambio en este archivo.** `success/page.tsx` y `tilopay-return/page.tsx`: cero cambios.

### C. Calculadora — `src/components/calculator/fence-calculator.tsx`

1. **Barra de total fija en móvil** (nuevo bloque, último hijo del `<div>` raíz que devuelve el componente, hermano del aside):

```tsx
{/* Móvil: el total siempre a la vista mientras se elige y se teclea.
    En lg desaparece: ahí el resumen ya es sticky en la columna derecha. */}
<div
  className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-3 border-t border-hairline bg-surface px-4 pt-3 shadow-lg lg:hidden"
  style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}
>
  <div className="min-w-0 flex-1">
    <p className="text-2xs font-bold text-muted-foreground uppercase">Total estimado</p>
    <p className="tabular truncate font-heading text-xl leading-none font-bold text-primary">
      {money(total)}
    </p>
  </div>
  <Button asChild variant="whatsapp" className="h-12 shrink-0">
    <a href={whatsappHref(messageLines.join("\n"))} target="_blank" rel="noopener noreferrer">
      <IconWhatsApp />
      Enviar
    </a>
  </Button>
</div>
```

   Notas duras: usa el estado ya existente (`total`, `messageLines`, `money`, `whatsappHref`) — **no** duplicar cálculo; el `aria-live` sigue viviendo solo en el aside (dos regiones vivas anunciando el mismo total sería doble anuncio); la barra no se muestra condicionalmente por `model` (con `model === null` el total es `$0.00` y la barra educa sobre qué falta — el mensaje de WhatsApp ya contempla «sin elegir» via `messageLines`).
2. **Compensación del alto de la barra**: el `<div>` raíz del componente añade `pb-24 lg:pb-0` para que la barra no tape el final del resumen en móvil.
3. **Nada más se toca en la isla**: Paso 1 (carrusel, flechas, `aria-pressed`), Paso 2 (input decimal, `LandPlanner`, puertas condicionadas a `gatePrice`), aside completo, quedan idénticos.

### D. Calculadora — `src/app/(store)/calculadora/page.tsx`

Cero cambios (la página servidor ya cumple: cabecera navy, migas, letra pequeña, salidas). Si la spec 01 introdujo `PageHeader tone="navy"` copiado de esta misma página, **no** se migra aquí para no crear churn: esta página es la fuente del patrón.

## Files to Create / Modify

Modificar:
- `/home/nothing/deploy/intemperie-frontend/src/app/(store)/carrito/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/(store)/checkout/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/components/calculator/fence-calculator.tsx`

Sin crear archivos. Prohibido tocar: `checkout/success/page.tsx`, `checkout/tilopay-return/page.tsx`, `src/app/(store)/calculadora/page.tsx`, `catalog-query.ts`, `catalog-search.tsx`, `land-planner.tsx`, `land-shapes.ts`, `quote-models.ts`, `src/components/cart/*`, `src/hooks/use-cart-quote.ts`, `globals.css`.

## Required Tests

Desde `/home/nothing/deploy/intemperie-frontend`:

1. **Checkout: sin `<main>` anidado y lógica de pago intacta**
   ```bash
   ! grep -q "<main" "src/app/(store)/checkout/page.tsx" \
   && grep -c 'id="main-content"' "src/app/(store)/checkout/page.tsx" | awk '$1==3{exit 0}{exit 1}' \
   && grep -q "inert={tilopayFrame ? true : undefined}" "src/app/(store)/checkout/page.tsx" \
   && grep -q "POLL_INTERVAL_MS = 3000" "src/app/(store)/checkout/page.tsx" \
   && grep -q "CONFIRM_TIMEOUT_MS = 90_000" "src/app/(store)/checkout/page.tsx"
   ```
   Esperado: exit 0.

2. **Carrito: resumen sticky, CTA presente, sin pérdida de secciones**
   ```bash
   grep -q "lg:sticky lg:top-20" "src/app/(store)/carrito/page.tsx" \
   && grep -q "Ir a pagar" "src/app/(store)/carrito/page.tsx" \
   && grep -q "Seguir comprando" "src/app/(store)/carrito/page.tsx" \
   && grep -q "FreeShippingProgress" "src/app/(store)/carrito/page.tsx" \
   && grep -q "OrderTotals" "src/app/(store)/carrito/page.tsx" \
   && grep -q "Tu carrito está vacío" "src/app/(store)/carrito/page.tsx"
   ```
   Esperado: exit 0.

3. **Calculadora: barra móvil nueva, resumen intacto, sin doble aria-live**
   ```bash
   grep -q "fixed inset-x-0 bottom-0 z-40" src/components/calculator/fence-calculator.tsx \
   && grep -q "safe-area-inset-bottom" src/components/calculator/fence-calculator.tsx \
   && grep -q "Total estimado" src/components/calculator/fence-calculator.tsx \
   && grep -c 'aria-live' src/components/calculator/fence-calculator.tsx | awk '$1==1{exit 0}{exit 1}' \
   && grep -q "Paso 1 · Catálogo" src/components/calculator/fence-calculator.tsx \
   && grep -q "Paso 2 · Medidas" src/components/calculator/fence-calculator.tsx \
   && grep -q "Enviar por WhatsApp" src/components/calculator/fence-calculator.tsx
   ```
   Esperado: exit 0.

4. **Los archivos prohibidos no cambiaron**
   ```bash
   git diff --quiet -- "src/app/(store)/checkout/success" "src/app/(store)/checkout/tilopay-return" \
     "src/app/(store)/calculadora" src/components/cart src/hooks/use-cart-quote.ts \
     src/components/calculator/land-planner.tsx src/components/calculator/land-shapes.ts \
     src/components/calculator/quote-models.ts
   ```
   Esperado: exit 0.

5. **Dinero: ningún cálculo local nuevo de impuesto/envío en carrito/checkout**
   ```bash
   ! grep -nE "\* ?0\.07|0\.07 ?\*|5\.99" "src/app/(store)/carrito/page.tsx" "src/app/(store)/checkout/page.tsx"
   ```
   Esperado: exit 0 (el 7 % y la tarifa viven en el API via `useCartQuote`; la calculadora conserva su `ITBMS = 0.07` documentado — está fuera de este grep a propósito).

6. **Sin colores literales en lo tocado**
   ```bash
   grep -rnE "(bg|text|border)-(gray|green|red|blue|amber|yellow)-[0-9]{2,3}|#[0-9a-fA-F]{3,6}\b" \
     "src/app/(store)/carrito/page.tsx" "src/app/(store)/checkout/page.tsx" src/components/calculator/fence-calculator.tsx
   ```
   Esperado: sin salida.

## Acceptance Criteria

- [ ] Tests 1–6 pasan; `npx tsc --noEmit` y `npm run lint` limpios.
- [ ] En `lg`, el carrito muestra lista a la izquierda y resumen sticky a la derecha con «Ir a pagar» siempre visible al hacer scroll.
- [ ] En `<lg`, la calculadora muestra el total en una barra inferior fija que se actualiza al teclear metros, y el contenido no queda tapado (padding de compensación).
- [ ] El flujo de pago de checkout es byte-a-byte idéntico salvo el reemplazo `<main>` → `<div id="main-content">`.

## Verification Commands

```bash
cd /home/nothing/deploy/intemperie-frontend
npx tsc --noEmit
npm run lint
grep -rn "#[0-9a-fA-F]\{3,6\}" "src/app/(store)/carrito" "src/app/(store)/checkout" src/components/calculator --include=*.tsx   # vacío
```

> **ADVERTENCIA**: NO correr `npm run build` (necesita la API real; el symlink de node_modules rompe Turbopack). Tipos con `npx tsc --noEmit`.
