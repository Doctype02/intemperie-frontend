# Spec: Admin — panel utilitario: gestión al sistema, tablero más denso, estado unificado

## Metadata

- developer_type: agent
- estimated_complexity: alta
- languages: TypeScript (TSX)
- depends_on: 01-foundation (usa `OrderStatusBadge`/`statusInfo` de `@/components/shared/order-status`)
- files_shared_with_others: ninguno (dueño único de `src/app/admin/**` salvo `admin/inspecciones/`, y de `src/components/admin/*`)

## Objective

El armazón del panel ya es Perímetro (`admin/layout.tsx`, `sidebar.tsx` con navy + pleca activa, tablero `admin/page.tsx` con cola de trabajo). Lo que queda es **legado interno**: las siete pantallas de gestión usan la paleta por defecto de Tailwind (58 literales solo en `admin/productos/page.tsx`), duplican por tercera vez el mapa de colores de estado, y desperdician densidad — que en una herramienta interna es lo que importa. Esta spec: (1) tokeniza las siete pantallas con **estética alineada pero utilitaria** (menos aire que la tienda: `p-3/p-4`, texto `text-sm`, tablas antes que tarjetas); (2) unifica el estado de pedido en `OrderStatusBadge`; (3) respeta el **dinero como string** (`total: string` en la interfaz local de pedidos → `formatMoney`, nunca `parseFloat`); (4) densifica el tablero a dos columnas en `xl` y añade chips de estado accionables sobre la muestra real de la API — sin inventar métricas que `/admin/stats` no da.

## Context

- `src/app/admin/layout.tsx`: cliente; portero por store + middleware; `bg-surface-sunk`, `lg:ml-64`. **No se toca.**
- `src/components/admin/sidebar.tsx`: navy, `aria-current`, pleca, `min-h-tap`. **No se toca.**
- `src/app/admin/page.tsx` (429 líneas, servidor + Suspense): `ColaDeTrabajo` (pedidos que esperan acción, con `PENDING_ACTION` escrito), `Totales` (4 celdas + barra de confirmados), `AccesosDirectos` (4 destinos). Contenedor `mx-auto max-w-5xl`. `_data/stats.ts` exporta `getAdminStats` (6 campos: totalOrders, totalRevenue, productsCount, usersCount, confirmedOrders, recentOrders), `formatMoney`, `formatAge`, `awaitsAction`, `STATUS_LABELS`, `PENDING_ACTION`.
- Legado (colores literales y patrones):
  - `admin/productos/page.tsx` (183 líneas, cliente): búsqueda local, alternador `grid|table`, tarjetas con `bg-gray-50`, acciones que solo aparecen con `group-hover:opacity-100` (inutilizables en táctil), badge activo `bg-green-100 text-green-700`, enlace «Nuevo producto» → `/admin/productos/nuevo` (lo maneja `[id]/page.tsx` con `params.id === "nuevo"` — conservar).
  - `admin/productos/[id]/page.tsx` (323 líneas, cliente): editor con migas manuales grises, toggle Publicado/Borrador `bg-green-50/bg-gray-100`, grid `lg:grid-cols-5`, `basePrice` **como string en el input** (correcto — conservar), `ProductImagesPanel`.
  - `admin/pedidos/page.tsx` (176 líneas, cliente): interfaz local `Order { total: string; subtotal: string; … }` (Decimal del backend — **string, regla dura #6**), mapas `statusLabels`/`statusColors` literales, `nextStatus` (transiciones válidas: PENDING→CONFIRMED|CANCELLED, …), filtro por `Select`, filas expandibles.
  - `admin/usuarios/page.tsx` (105), `admin/categorias/page.tsx` (112), `admin/colecciones/page.tsx` (109): listados `Card` con `text-gray-900` en h1 y celdas grises.
  - `admin/contenido/page.tsx` (161): editor CMS con literales.
- `admin/inspecciones/` — **prohibido** (spec 08).
- Tras 01: `@/components/shared/order-status` exporta `OrderStatusBadge` y `statusInfo` (tokens, 6 estados).

## Implementation Contract

### A. Tablero `src/app/admin/page.tsx` — densidad, no rediseño

1. **Dos columnas en `xl`**: `mx-auto max-w-5xl` → `mx-auto max-w-6xl`, y el cuerpo:
   ```tsx
   <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:items-start">
     <Suspense fallback={<TableroSkeleton />}><TableroDatos /></Suspense>   {/* col 1 */}
     <div className="xl:sticky xl:top-8"><AccesosDirectos /></div>          {/* col 2 */}
   </div>
   ```
   En `<xl` el orden apilado actual se mantiene (cola → totales → accesos). `AccesosDirectos` pasa su `ul` a `grid-cols-1` dentro de la columna (hoy `sm:grid-cols-2` — conservar esa clase para el estado apilado: `sm:grid-cols-2 xl:grid-cols-1`).
2. **Chips de estado sobre la muestra** (dentro de `TableroDatos`, entre cola y totales): contar `stats.recentOrders` por estado y pintar una fila de chips-enlace a `/admin/pedidos` — datos que la API ya da, honestamente etiquetados:
   ```tsx
   <ul className="flex flex-wrap gap-2" aria-label="Pedidos recientes por estado">
     {porEstado.map(([status, n]) => (
       <li key={status}>
         <Link href="/admin/pedidos" className="flex min-h-tap items-center gap-1.5 rounded-lg border border-hairline bg-card px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary">
           <OrderStatusBadge status={status} /> <span className="tabular">{n}</span>
         </Link>
       </li>
     ))}
   </ul>
   ```
   con la nota existente de «sobre los N más recientes» aplicando también a estos chips (no repetirla: colocarlos encima del pie que ya lo dice).
3. Nada más del tablero cambia (`ColaDeTrabajo`, `Totales`, `Aviso`, skeleton, `_data/stats.ts` intactos).

### B. `admin/pedidos/page.tsx`

1. Fuera `statusLabels`/`statusColors` → `OrderStatusBadge` + `statusInfo(status).label` donde haga falta texto plano.
2. **Dinero**: `formatMoney(order.total)` (importar de `./_data/stats` o de `@/lib/utils` — usar el de `@/lib/utils`, firma `formatMoney(amount: string)`). Prohibido `Number(order.total)`/`parseFloat`.
3. Reestructura utilitaria: tabla densa en `lg` (`<table>` con columnas #id corto `font-mono tabular`, cliente, fecha `formatAge`-style o fecha corta, estado = badge, total `.tabular text-right`, acción), tarjetas apiladas en `<lg`. La expansión de artículos (`expanded`) se conserva (fila expandible o `<details>`); el `Select` de filtro se conserva; los botones de transición usan `nextStatus` tal cual (mismas transiciones) como `Button size="xs" variant="outline"`, y CANCELLED con `variant="destructive"`-outline (borde `border-destructive/40 text-destructive`).
4. Tokens en todo: `h1` → `text-2xl font-bold text-foreground`; esqueletos `bg-surface-2`; contenedores `rounded-xl border border-hairline bg-card`.

### C. `admin/productos/page.tsx`

1. Tokenización completa (mapa: `text-gray-900`→`text-foreground`, `text-gray-500/400`→`text-muted-foreground`, `bg-gray-50/100`→`bg-surface-2`, `border-gray-200`→`border-border`, `bg-white`→`bg-surface`, `bg-green-100 text-green-700`→`Badge variant="secondary"`, `bg-gray-900 text-white` del toggle→`bg-brand-navy text-on-dark`, botón nuevo `bg-green-700 hover:bg-green-800`→`Button` default sin overrides).
2. **La vista por defecto pasa a `table`** (densidad de herramienta): columnas imagen mini (o alzado `.diagram` de 40 px si no hay foto), nombre + categoría, precio `.tabular` con sufijo de unidad, stock `.tabular`, estado (`Badge secondary` Activo / `ghost` Inactivo), acciones. El alternador `grid|table` se conserva con `grid` como segunda opción.
3. Acciones **siempre visibles** (no `opacity-0 group-hover`): botones de 44 px (`size-tap` de área táctil con icono de 16 px) con `aria-label` que incluye el nombre («Editar Cerca PVC Atlas»). El `confirm()` de borrado se conserva.
4. Búsqueda local y `load()` intactos; la tarjeta punteada «Nuevo producto» se conserva en la vista grid (`border-dashed border-border-strong hover:border-brand-green hover:bg-brand-green-soft`).

### D. `admin/productos/[id]/page.tsx`

Solo clases (la lógica de carga/guardado/slug/specs/imágenes no se toca):
- Migas manuales → tokens (`text-muted-foreground`, separador `text-border-strong`), o `Breadcrumbs` compartido si el markup encaja sin cambiar comportamiento.
- Toggle Publicado/Borrador → `aria-pressed` + activo `border-brand-green/40 bg-brand-green-soft text-brand-green-deep`, inactivo `border-border bg-surface-2 text-muted-foreground`.
- Botón Guardar → `Button` default sin override de color.
- Cajas `rounded-xl border border-gray-200 bg-white p-5` → `rounded-xl border border-hairline bg-card p-5`; labels `text-gray-500 uppercase` → `eyebrow text-muted-foreground` (o `text-2xs font-semibold uppercase text-muted-foreground` donde `.eyebrow` cambie el tamaño esperado).
- `basePrice` sigue siendo string en el estado del formulario (no convertir a number para «limpiar»).

### E. `admin/usuarios`, `admin/categorias`, `admin/colecciones`, `admin/contenido`

Tokenización con el mismo mapa de C; los `h1` a `text-2xl font-bold text-foreground`; `Card`/`CardTitle` pueden quedarse (son de ui) pero sin clases literales alrededor. Funcionalidad intacta (listados, contadores «N categorías», editor de contenido). Ningún cambio de estructura obligatorio en estas cuatro — es una pasada de pintura utilitaria.

### F. `src/components/admin/*`

`product-images-panel.tsx`, `product-image-uploader.tsx`: tokenizar cualquier literal que tengan (verificar con grep; el `#ffffff` de `image-prepare.ts` es el **fondo de lienzo al exportar JPEG** — parte del pipeline de imagen, NO interfaz: se deja con un comentario `/* fondo de exportación, no UI */` si no lo tiene).

## Files to Create / Modify

Modificar:
- `/home/nothing/deploy/intemperie-frontend/src/app/admin/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/admin/pedidos/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/admin/productos/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/admin/productos/[id]/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/admin/usuarios/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/admin/categorias/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/admin/colecciones/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/admin/contenido/page.tsx`
- (solo si tienen literales) `/home/nothing/deploy/intemperie-frontend/src/components/admin/product-images-panel.tsx`, `product-image-uploader.tsx`

Prohibido tocar: `src/app/admin/inspecciones/**` (spec 08), `admin/layout.tsx`, `src/components/admin/sidebar.tsx`, `admin/_data/stats.ts`, `globals.css`, `src/lib/**`.

## Required Tests

Desde `/home/nothing/deploy/intemperie-frontend`:

1. **Estado unificado y sin cuarto mapa duplicado**
   ```bash
   grep -q 'from "@/components/shared/order-status"' src/app/admin/pedidos/page.tsx \
   && ! grep -rn "bg-yellow-100\|bg-orange-100\|bg-purple-100" src/app/admin \
   && grep -q "nextStatus" src/app/admin/pedidos/page.tsx
   ```
   Esperado: exit 0.

2. **Dinero como string en pedidos admin**
   ```bash
   grep -q "total: string" src/app/admin/pedidos/page.tsx \
   && grep -q "formatMoney" src/app/admin/pedidos/page.tsx \
   && ! grep -nE "parseFloat\(.*total|Number\(.*total\)" src/app/admin/pedidos/page.tsx
   ```
   Esperado: exit 0.

3. **Tablero: densidad añadida sin perder secciones**
   ```bash
   grep -q "xl:grid-cols-\[minmax(0,1fr)_20rem\]" src/app/admin/page.tsx \
   && grep -q "Esperando acción" src/app/admin/page.tsx \
   && grep -q "AccesosDirectos" src/app/admin/page.tsx \
   && grep -q "Totales" src/app/admin/page.tsx \
   && git diff --quiet -- src/app/admin/_data/stats.ts
   ```
   Esperado: exit 0.

4. **Funcionalidad de gestión conservada**
   ```bash
   grep -q "deleteProduct" src/app/admin/productos/page.tsx \
   && grep -q '"grid"\|"table"' src/app/admin/productos/page.tsx \
   && grep -q '"nuevo"' "src/app/admin/productos/[id]/page.tsx" \
   && grep -q "updateOrderStatus" src/app/admin/pedidos/page.tsx \
   && grep -q "ProductImagesPanel\|product-images-panel" "src/app/admin/productos/[id]/page.tsx"
   ```
   Esperado: exit 0.

5. **Cero literales en el admin tocado (inspecciones excluido por pertenecer a 08)**
   ```bash
   grep -rnE "(bg|text|border)-(gray|slate|green|red|blue|amber|yellow|purple|orange|cyan)-[0-9]{2,3}" \
     src/app/admin --include=*.tsx | grep -v "admin/inspecciones"
   ```
   Esperado: sin salida.

6. **Inspecciones y armazón intactos**
   ```bash
   git diff --quiet -- src/app/admin/inspecciones src/app/admin/layout.tsx src/components/admin/sidebar.tsx
   ```
   Esperado: exit 0.

## Acceptance Criteria

- [ ] Tests 1–6 pasan; `npx tsc --noEmit` y `npm run lint` limpios.
- [ ] `/admin/productos` abre en vista tabla con acciones visibles y accesibles en táctil (44 px, `aria-label` con nombre).
- [ ] `/admin/pedidos` muestra el mismo badge de estado que `/cuenta/pedidos` y avanza estados con las mismas transiciones de siempre.
- [ ] El tablero en `xl` usa dos columnas con accesos sticky; en móvil no cambia el orden actual.
- [ ] Todo el panel funciona en modo oscuro (antes las pantallas de gestión quedaban blancas sobre el layout oscuro).

## Verification Commands

```bash
cd /home/nothing/deploy/intemperie-frontend
npx tsc --noEmit
npm run lint
grep -rn "#[0-9a-fA-F]\{3,6\}" src/app/admin --include=*.tsx | grep -v inspecciones   # vacío
```

> **ADVERTENCIA**: NO correr `npm run build` (necesita la API real; el symlink de node_modules rompe Turbopack). Tipos con `npx tsc --noEmit`.
