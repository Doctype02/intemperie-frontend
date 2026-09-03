# Spec: Fundación compartida del rediseño (tokens, componentes reutilizables, huérfanos y páginas de error)

## Metadata

- developer_type: agent
- estimated_complexity: media
- languages: TypeScript (TSX), CSS (solo lectura de globals.css)
- depends_on: — (esta spec va primero; 02–08 dependen de ella)
- blocks: 02, 03, 04, 05, 06, 07, 08

## Objective

Crear la capa compartida que el resto de specs importa —migas, cabecera de página, estado vacío, plantilla de página legal, badge de estado de pedido— y migrar al sistema «Perímetro» los componentes globales y páginas de error que hoy llevan colores literales (`whatsapp-button`, `scroll-to-top`, `search-bar`, `recently-viewed-section`, `not-found`, `global-error`). **No se crea ningún token nuevo en `globals.css`**: todo lo necesario ya existe. Header y footer (`src/components/layout/*`) **no se tocan**.

## Context

- Design system: `src/app/globals.css`. Tokens disponibles (verificados): `bg-background`, `bg-surface`, `bg-surface-2`, `bg-surface-sunk`, `text-foreground`, `text-muted-foreground`, `border-border`, `border-hairline`, `border-border-strong`, `bg-brand-navy`, `bg-brand-navy-deep`, `text-on-dark`, `text-on-dark-soft`, `bg-primary`, `text-primary-foreground`, `bg-brand-green-soft`, `text-brand-green-deep`, `text-brand-green`, `bg-brand-amber-soft`, `text-accent-foreground`, `bg-whatsapp`, `hover:bg-whatsapp-deep`, `bg-destructive`, `bg-secondary`, `text-secondary-foreground`. Utilidades: `.shell`, `.eyebrow`, `.tabular`, `.mesh-rule`, `.picket-rule`, `.diagram`, `.diagram-picket`, `.diagram-mesh`, `.defer-paint`, `.scrollbar-hide`. Espaciado: `py-section`, `py-section-sm`, `min-h-tap`, `size-tap`.
- `Button` (`src/components/ui/button.tsx`): variantes `default | navy | accent | whatsapp | outline | secondary | ghost | onDark | destructive | link`; tamaños `xs | sm | default | lg | block | icon | icon-xs | icon-sm | icon-lg`.
- `Badge` (`src/components/ui/badge.tsx`): variantes `default | secondary | spec | navy | accent | destructive | outline | ghost | onDark | link`.
- Patrón canónico de migas (existe en `src/app/(store)/productos/page.tsx`, líneas 291–321):

```tsx
<nav aria-label="Ruta" className="mb-3">
  <ol className="flex items-center gap-1.5 text-xs text-muted-foreground">
    <li><Link href="/" className="transition-colors hover:text-brand-green-deep">Inicio</Link></li>
    <li aria-hidden="true"><ChevronRight className="size-3" /></li>
    <li className="truncate font-semibold text-foreground" aria-current="page">{title}</li>
  </ol>
</nav>
```

- `src/app/cuenta/order-status.tsx` existe, usa solo tokens y hoy es **huérfano** (`grep -rn "order-status" src --include=*.tsx | grep import` no devuelve nada). Exporta `statusInfo(status)` y `OrderStatusBadge({ status, className })` con el mapa `STATUS` completo (PENDING/CONFIRMED/PROCESSING/SHIPPED/DELIVERED/CANCELLED).
- Huérfanos con literales: `src/components/shared/recently-viewed-section.tsx` (10 literales, nadie lo importa), `src/components/shared/search-bar.tsx` (1 literal, nadie lo importa). **No se borran** (regla dura #3); se tokenizan para que las specs 02/03 puedan adoptarlos sin deuda.
- `src/components/shared/whatsapp-button.tsx` línea 20 (literal actual):

```tsx
className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:bg-[#20bd5a] transition-colors"
```

- `src/components/shared/scroll-to-top.tsx`: `bg-white border border-gray-200 … hover:bg-gray-50` y `text-gray-600`.
- `src/app/not-found.tsx`: importa Header/Footer (correcto: vive fuera de `(store)`), pero usa `bg-white`, `text-green-600/10`, `text-gray-900`, `bg-green-700`… y `rounded-xl` a mano en botones.
- `src/app/global-error.tsx`: `bg-white`, `text-red-500/20`, `text-gray-900`, `bg-green-600`.

## Implementation Contract

### A. `src/components/shared/breadcrumbs.tsx` — NUEVO (componente de servidor, sin `"use client"`)

**Input** (props):

```ts
export interface Crumb {
  label: string
  href?: string   // sin href = elemento actual (aria-current="page")
}
export function Breadcrumbs({
  items,
  tone = "light",     // "light" | "dark"  — dark para bandas navy
  className = "",
}: { items: Crumb[]; tone?: "light" | "dark"; className?: string })
```

**Output**: exactamente el patrón canónico de arriba. En `tone="dark"`: `text-on-dark-soft`, hover `hover:text-brand-green`, actual `text-on-dark`. Siempre `<nav aria-label="Ruta">`, separador `<ChevronRight className="size-3" />` (lucide) con `aria-hidden="true"`, último elemento con `aria-current="page"` y `truncate font-semibold`. Sin estado, sin hooks.

**Side effects**: ninguno.

### B. `src/components/shared/page-header.tsx` — NUEVO (componente de servidor)

Codifica el patrón de cabecera de página que ya usan `/productos` (banda `bg-surface`) y `/calculadora` (banda `bg-brand-navy-deep` + `.picket-rule`).

```ts
export function PageHeader({
  eyebrow,        // string | undefined — se pinta con .eyebrow
  title,          // string — h1
  sub,            // ReactNode | undefined — línea de contexto text-sm
  crumbs,         // Crumb[] | undefined — delega en <Breadcrumbs/>
  tone = "light", // "light" (bg-surface, border-b border-border) | "navy" (bg-brand-navy-deep text-on-dark + .picket-rule arriba)
  children,       // ReactNode | undefined — extras bajo el sub (buscador, chips)
}: {...})
```

**Output light** (estructura exacta):

```tsx
<div className="border-b border-border bg-surface">
  <div className="shell py-5 sm:py-6">
    {crumbs && <Breadcrumbs items={crumbs} className="mb-3" />}
    {eyebrow && <p className="eyebrow text-muted-foreground">{eyebrow}</p>}
    <h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">{title}</h1>
    {sub && <p className="mt-1 text-sm text-muted-foreground">{sub}</p>}
    {children}
  </div>
</div>
```

**Output navy**: envoltorio `<div className="bg-brand-navy-deep text-on-dark">` con `<div className="picket-rule" aria-hidden="true" />` como primer hijo, `shell py-8 sm:py-10`, `Breadcrumbs tone="dark"`, eyebrow `eyebrow text-brand-green`, h1 `mt-2 text-3xl font-bold tracking-tight sm:text-4xl`, sub `mt-3 max-w-prose text-sm text-on-dark-soft`. (Es el markup literal de la cabecera de `/calculadora`, líneas 137–166 de `src/app/(store)/calculadora/page.tsx` — copiar de ahí, no reinventar.)

### C. `src/components/shared/empty-state.tsx` — NUEVO (componente de servidor)

```ts
export function EmptyState({
  icon,          // ReactNode | undefined — p.ej. <Heart className="size-9 text-muted-foreground"/>
  diagram,       // "mesh" | "picket" | undefined — si viene, pinta el alzado CSS en vez de icon
  title,         // string
  body,          // ReactNode
  children,      // ReactNode — acciones (Buttons/Links)
}: {...})
```

**Output**:

```tsx
<div className="rounded-lg border border-dashed border-border-strong bg-surface px-4 py-8 text-center sm:px-8 sm:py-12">
  {diagram
    ? <div aria-hidden="true" className={`diagram diagram-${diagram} mx-auto h-16 w-28 rounded-md`} />
    : icon && <div className="mx-auto mb-1 flex size-16 items-center justify-center rounded-full bg-surface-2">{icon}</div>}
  <h2 className="mt-4 text-lg font-bold text-foreground">{title}</h2>
  <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">{body}</p>
  {children && <div className="mx-auto mt-5 flex max-w-sm flex-col gap-2">{children}</div>}
</div>
```

(Es el patrón del `EmptyState` local de `/productos` generalizado. El local de `/productos` **no** se migra en esta spec — es propiedad de la spec 03 decidir si lo adopta.)

### D. `src/components/shared/legal-page.tsx` — NUEVO (componente de servidor)

Plantilla para `/envios`, `/devoluciones`, `/privacidad`, `/terminos` (las consume la spec 06).

```ts
export interface LegalSection {
  id: string        // ancla, p.ej. "cobertura"
  title: string     // "1. Cobertura de envío" — se conserva el texto actual EXACTO
  children: ReactNode
}
export function LegalPage({
  eyebrow,          // "Información de envío", etc.
  title,            // h1
  updated,          // "Última actualización: mayo 2026"
  intro,            // ReactNode | undefined — bloque de datos clave (grid de 4 hechos)
  sections,         // LegalSection[]
  footer,           // ReactNode | undefined — CTAs de salida
}: {...})
```

**Output** (contrato de estructura):

1. Cabecera navy: `<div className="bg-brand-navy-deep text-on-dark"><div className="picket-rule" aria-hidden="true"/><div className="shell py-10 sm:py-12 text-center sm:text-left">` con eyebrow `eyebrow text-brand-green`, h1 `mt-2 text-3xl font-bold tracking-tight sm:text-4xl`, y `updated` en `mt-3 text-sm text-on-dark-soft`.
2. Cuerpo: `<div className="shell grid gap-10 py-10 sm:py-12 lg:grid-cols-[14rem_minmax(0,42rem)] lg:gap-16">`.
   - Columna 1 (solo `lg:`): índice sticky `«En esta página»` — `<nav aria-label="Secciones" className="hidden lg:block"><div className="sticky top-24"><p className="eyebrow text-muted-foreground">En esta página</p><ul className="mt-3 space-y-2">` con un `<a href={`#${s.id}`} className="block text-sm text-muted-foreground transition-colors hover:text-brand-green-deep">` por sección. **Este índice es la respuesta a la queja del dueño de espacio desaprovechado en escritorio**: la columna vacía pasa a ser navegación.
   - Columna 2: `intro` (si viene) y luego `sections.map` como `<section id={s.id} className="scroll-mt-24 border-t border-border pt-8 first:border-t-0 first:pt-0">` con `<h2 className="text-xl font-bold text-foreground">{s.title}</h2>` y el contenido en `mt-3 space-y-3 text-sm leading-relaxed text-muted-foreground` (los `<strong>` internos en `font-semibold text-foreground`; los `<a>` en `font-semibold text-brand-green-deep underline underline-offset-2`).
3. `footer` (si viene): `mt-12 border-t border-border pt-8 flex flex-col gap-3 sm:flex-row`.

### E. `src/components/shared/order-status.tsx` — TRASLADO

Mover el contenido íntegro de `src/app/cuenta/order-status.tsx` (interface `StatusStyle`, mapa `STATUS`, `statusInfo`, `OrderStatusBadge`) a `src/components/shared/order-status.tsx` **sin cambiar una sola clase**. Eliminar el archivo original (`git mv`; es huérfano — cero imports, verificado). Specs 05 y 07 importarán `{ OrderStatusBadge, statusInfo }` desde `@/components/shared/order-status`.

### F. `src/components/shared/whatsapp-button.tsx` — MODIFICAR

Hoy:
```tsx
className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] shadow-lg hover:bg-[#20bd5a] transition-colors"
```
Queda:
```tsx
className="fixed bottom-6 right-6 z-50 flex size-14 items-center justify-center rounded-full bg-whatsapp shadow-lg transition-colors hover:bg-whatsapp-deep"
```
El icono interior pasa de `text-white` a `text-on-dark`. Nada más cambia (ni el `aria-label`, ni el `href`, ni el mensaje).

### G. `src/components/shared/scroll-to-top.tsx` — MODIFICAR

`bg-white border border-gray-200 … hover:bg-gray-50` → `bg-surface border border-border hover:bg-surface-2`; `text-gray-600` → `text-foreground`; `h-10 w-10` → `size-11` (objetivo táctil 44 px); `transition-all duration-200` → `transition-colors`. Se elimina `hover:shadow-lg` (regla: solo transition-colors). Comportamiento (`window.scrollY > 500`, `scrollTo`) intacto.

### H. `src/components/shared/search-bar.tsx` — MODIFICAR

`text-gray-400` → `text-muted-foreground`. Nada más.

### I. `src/components/shared/recently-viewed-section.tsx` — MODIFICAR (tokenizar; sigue huérfano hasta que 02/03 lo adopten)

Mapa de sustitución exacto:
- `bg-white border-b border-gray-100` → `border-b border-border bg-surface`
- `mx-auto max-w-7xl px-4 sm:px-6` → `shell`
- `text-[11px] font-bold uppercase tracking-[0.18em] text-green-700 mb-1` → `eyebrow text-brand-green-deep` (mantener `mb-1`)
- `text-xl sm:text-2xl font-black text-gray-900 leading-tight tracking-tight` → `text-xl font-bold tracking-tight text-foreground sm:text-2xl`
- `bg-gray-100 border border-gray-100` (caja de imagen, x2) → `bg-surface-2 border border-border`
- `text-gray-300` (inicial sin foto) → sustituir el bloque de inicial por el alzado del sistema: `<span aria-hidden="true" className="diagram diagram-picket absolute inset-0" />`
- `text-xs font-bold text-gray-900 … group-hover:text-green-700` → `text-xs font-bold text-foreground … group-hover:text-brand-green-deep`
- `text-xs text-gray-500` → `tabular text-xs text-muted-foreground`

### J. `src/app/not-found.tsx` — REESCRIBIR con tokens

Mantener: Header, Footer, `id="main-content"`, el «404» gigante, título «Página no encontrada», texto y los dos enlaces (Inicio, Ver productos). Contrato:

```tsx
<main id="main-content" className="flex flex-1 flex-col items-center justify-center bg-background px-gutter py-24">
  <div className="max-w-md text-center">
    <p aria-hidden="true" className="text-[120px] leading-none font-bold text-brand-green-soft select-none">404</p>
    <h1 className="mt-2 text-2xl font-bold text-foreground">Página no encontrada</h1>
    <p className="mx-auto mt-2 max-w-xs text-sm text-muted-foreground">
      Lo sentimos, la página que buscas no existe o fue movida a otra dirección.
    </p>
    <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
      <Button asChild><Link href="/"><ArrowLeft aria-hidden="true" /> Volver al inicio</Link></Button>
      <Button asChild variant="outline"><Link href="/productos">Ver productos</Link></Button>
    </div>
  </div>
</main>
```

(`Button` de `@/components/ui/button`; si `asChild` no existe en la API del Button del repo, usar la prop `render` de Base UI tal como la usa el resto del código — comprobar `button.tsx` antes.)

### K. `src/app/global-error.tsx` — REESCRIBIR con tokens

Debe seguir renderizando `<html lang="es"><body>` e importando `./globals.css` (reemplaza al layout raíz). Sustituciones: `bg-white` → `bg-background`; `text-red-500/20` → `text-destructive/20`; `text-gray-900` → `text-foreground`; `text-gray-500` → `text-muted-foreground`; el botón pasa a las clases del botón primario del sistema: `inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-primary px-6 font-heading text-sm font-bold text-primary-foreground transition-colors hover:bg-brand-green-deep` (aquí no se importa el componente Button: en un error global cuanto menos árbol, mejor). Textos «500», «Algo salió mal», «Ocurrió un error inesperado. Intenta de nuevo.», «Reintentar» se conservan.

### L. `src/app/globals.css` — SIN CAMBIOS

Esta spec declara explícitamente: **cero tokens nuevos, cero utilidades nuevas**. Si durante la implementación pareciera faltar un token, la respuesta correcta es usar el rol semántico existente, no añadir uno. Los `--plan-*` no se tocan bajo ningún concepto.

## Files to Create / Modify

Crear:
- `/home/nothing/deploy/intemperie-frontend/src/components/shared/breadcrumbs.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/components/shared/page-header.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/components/shared/empty-state.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/components/shared/legal-page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/components/shared/order-status.tsx` (contenido trasladado)

Modificar:
- `/home/nothing/deploy/intemperie-frontend/src/components/shared/whatsapp-button.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/components/shared/scroll-to-top.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/components/shared/search-bar.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/components/shared/recently-viewed-section.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/not-found.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/global-error.tsx`

Eliminar (solo este, y solo porque su contenido se traslada íntegro y tiene cero importadores):
- `/home/nothing/deploy/intemperie-frontend/src/app/cuenta/order-status.tsx`

Prohibido tocar: `src/app/globals.css`, `src/components/layout/**`, `src/components/ui/**`, cualquier `page.tsx`.

## Required Tests

Sin runner de tests en el repo (no hay jest/vitest/playwright en `package.json`): los tests son comandos de shell autoverificables. Ejecutar desde `/home/nothing/deploy/intemperie-frontend`.

1. **Los nuevos componentes existen y exportan lo pactado**
   ```bash
   grep -l "export function Breadcrumbs" src/components/shared/breadcrumbs.tsx \
   && grep -l "export function PageHeader" src/components/shared/page-header.tsx \
   && grep -l "export function EmptyState" src/components/shared/empty-state.tsx \
   && grep -l "export function LegalPage" src/components/shared/legal-page.tsx \
   && grep -l "export function OrderStatusBadge" src/components/shared/order-status.tsx
   ```
   Esperado: imprime los 5 paths, exit 0.

2. **El traslado no dejó huérfano roto ni duplicado**
   ```bash
   test ! -f src/app/cuenta/order-status.tsx \
   && grep -c "PENDING\|CONFIRMED\|PROCESSING\|SHIPPED\|DELIVERED\|CANCELLED" src/components/shared/order-status.tsx | awk '$1>=6{exit 0}{exit 1}'
   ```
   Esperado: exit 0 (el mapa STATUS conserva los 6 estados).

3. **No queda ni un color literal en los archivos tocados**
   ```bash
   grep -rnE "(bg|text|border|ring)-(gray|green|red|blue|amber|yellow)-[0-9]{2,3}|#[0-9a-fA-F]{3,6}\b" \
     src/components/shared/whatsapp-button.tsx src/components/shared/scroll-to-top.tsx \
     src/components/shared/search-bar.tsx src/components/shared/recently-viewed-section.tsx \
     src/app/not-found.tsx src/app/global-error.tsx \
     src/components/shared/breadcrumbs.tsx src/components/shared/page-header.tsx \
     src/components/shared/empty-state.tsx src/components/shared/legal-page.tsx \
     src/components/shared/order-status.tsx
   ```
   Esperado: **sin salida**, exit 1.

4. **No se borró contenido de las páginas de error**
   ```bash
   grep -q "404" src/app/not-found.tsx && grep -q "Página no encontrada" src/app/not-found.tsx \
   && grep -q "Ver productos" src/app/not-found.tsx \
   && grep -q "Algo salió mal" src/app/global-error.tsx && grep -q "Reintentar" src/app/global-error.tsx
   ```
   Esperado: exit 0.

5. **globals.css y layout intactos**
   ```bash
   git diff --name-only | grep -E "globals\.css|components/layout/" ; echo "exit=$?"
   ```
   Esperado: `exit=1` (ninguno modificado).

## Acceptance Criteria

- [ ] Los 5 componentes nuevos compilan y no llevan `"use client"` (son de servidor; `scroll-to-top`, `whatsapp-button`, `search-bar`, `recently-viewed-section` conservan el suyo).
- [ ] `npx tsc --noEmit` limpio.
- [ ] `npm run lint` limpio.
- [ ] Tests 1–5 pasan.
- [ ] `git diff` no toca `globals.css`, `src/components/layout/`, `src/components/ui/`.

## Verification Commands

```bash
cd /home/nothing/deploy/intemperie-frontend
npx tsc --noEmit
npm run lint
grep -rn "#[0-9a-fA-F]\{3,6\}" src/components/shared --include=*.tsx   # debe salir vacío
```

> **ADVERTENCIA**: NO correr `npm run build` — necesita la API real y el symlink de `node_modules` rompe Turbopack. La verificación de tipos es `npx tsc --noEmit`.
