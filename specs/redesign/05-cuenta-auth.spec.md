# Spec: Cuenta y autenticación — interiores de /cuenta al sistema, auth se preserva

## Metadata

- developer_type: agent
- estimated_complexity: media
- languages: TypeScript (TSX)
- depends_on: 01-foundation (usa `OrderStatusBadge`/`statusInfo` desde `@/components/shared/order-status`)
- files_shared_with_others: ninguno (dueño único de `src/app/cuenta/**` y `src/app/(auth)/**`)

## Objective

El armazón de la cuenta (`AccountShell`, layout con Header/Footer, badge de estado) ya es Perímetro; las **cuatro pantallas interiores siguen en legado**: colores literales, doble contenedor (`max-w-4xl mx-auto px-4 py-8` dentro del `shell` que ya pone `AccountShell`), doble portero de sesión (redirigen con `isAuthenticated` en `useEffect`, el bug que `AccountShell` documenta y ya resuelve con `status`), y **dos copias del mapa de colores de estado** con clases `bg-yellow-100 text-yellow-800`… que duplican lo que `order-status` hace con tokens. Esta spec las reescribe dentro del shell, unifica el estado de pedido y no toca nada de auth (que ya está bien y protege la regla de `loginHref`/`?redirect=`).

## Context

- `src/app/cuenta/layout.tsx`: Header + `<main id="main-content" class="flex-1 bg-surface-sunk">` + `AccountShell` + Footer. `AccountShell` (`account-shell.tsx`) ya aporta: `shell py-section-sm`, cabecera con avatar/identidad/cerrar sesión, nav Resumen·Pedidos·Direcciones (fila desplazable en móvil, columna en `lg`), y el portero correcto: `status === "unauthenticated"` → tarjeta «Tu sesión se cerró» con `Link href={/login?redirect=…}`. **Las páginas interiores NO deben redirigir por su cuenta.**
- Tras 01: `@/components/shared/order-status` exporta `statusInfo(status)` → `{ label, hint, className }` y `OrderStatusBadge({ status, className })`, con los 6 estados en tokens (PENDING ámbar, CONFIRMED/PROCESSING/SHIPPED navy, DELIVERED verde, CANCELLED gris).
- Legado real, por archivo:
  - `src/app/cuenta/page.tsx` (85 líneas): `useEffect` que redirige con `isAuthenticated`; `max-w-4xl mx-auto px-4 py-8`; tres `Card` con círculos `bg-green-100`/`bg-amber-100`/`bg-blue-100`; «Accesos Rápidos» con 3 botones outline.
  - `src/app/cuenta/pedidos/page.tsx` (153 líneas): mismo portero duplicado; mapas locales `statusLabels` + `statusColors` (`bg-yellow-100 text-yellow-800`, …); `Table` de `@/components/ui/table` con columnas Pedido/Fecha/Estado/Total/acción Ver; `formatCurrency`, `formatDateShort`; toast de error.
  - `src/app/cuenta/pedidos/[id]/page.tsx` (187 líneas): mismo portero; mismos mapas duplicados; detalle con Card/Separator/Badge; CTA WhatsApp con `generateOrderWhatsAppMessage`.
  - `src/app/cuenta/direcciones/page.tsx` (230 líneas): mismo portero; `h1 text-3xl font-bold text-gray-900`; CRUD con `Dialog` + `AddressForm` (`@/components/checkout/address-form`) — el CRUD funciona y **no se toca su lógica**.
- Tipos: `Order.total`/`subtotal` son `number` en `src/types/index.ts` para el flujo de cliente; en admin llegan como string. Aquí no se cambia ningún tipo. `formatCurrency(number)` sigue siendo el formateador de estas pantallas.
- Auth ya Perímetro: `(auth)/layout.tsx` (marca + panel navy), `login/login-form.tsx` (safeRedirect, describeError), `registro/register-form.tsx`. **Cero cambios en `(auth)`** — solo verificación.

## Implementation Contract

### A. `src/app/cuenta/page.tsx` — Resumen

1. Eliminar `useEffect` + `router.push("/login")` y el early-return «Cargando...» con `text-gray-500`: el portero es `AccountShell`. Si `user` es null, renderizar el esqueleto mínimo `<div className="h-40 animate-pulse rounded-xl bg-surface-2" aria-hidden="true" />` con `<p role="status" className="sr-only">Cargando tu cuenta…</p>`.
2. Eliminar el contenedor `max-w-4xl mx-auto px-4 py-8` (el shell exterior ya existe). Raíz: `<div className="space-y-6">`.
3. El `h1` («Mi Cuenta») desaparece como `text-3xl text-gray-900` y queda `<h1 className="text-xl font-bold text-foreground sm:text-2xl">Mi cuenta</h1>` (la identidad grande ya la pinta la cabecera del shell; no se duplica).
4. Las tres tarjetas se mantienen (identidad, Mis Pedidos, Mis Direcciones) pero tokenizadas y sin círculos multicolor sin significado:

```tsx
<div className="grid gap-4 sm:grid-cols-3">
  {/* tarjeta identidad */}
  <div className="rounded-xl border border-border bg-surface p-5">
    <span className="flex size-11 items-center justify-center rounded-lg bg-secondary">
      <User className="size-5 text-secondary-foreground" aria-hidden="true" />
    </span>
    <p className="mt-3 font-semibold text-foreground">{user.name}</p>
    <p className="truncate text-sm text-muted-foreground">{user.email}</p>
  </div>
  {/* Pedidos y Direcciones: mismo esqueleto, como <Link> con hover:border-brand-green,
      iconos Package2 / MapPin en bg-secondary text-secondary-foreground,
      títulos «Mis pedidos» / «Mis direcciones», subtítulos actuales conservados */}
</div>
```

5. «Accesos Rápidos» se conserva con sus tres destinos (Ver productos, Calculadora de cercas, Mi carrito) como `<h2 className="eyebrow text-muted-foreground">Accesos rápidos</h2>` + botones `Button variant="outline"` sin cambios de destino.

### B. `src/app/cuenta/pedidos/page.tsx` — Mis pedidos

1. Fuera el portero duplicado (`isAuthenticated` + `router.push`): el `useEffect` queda solo con el fetch (`getOrders()`), y su dependencia deja de incluir `router`.
2. Fuera `statusLabels` y `statusColors` locales → `import { OrderStatusBadge } from "@/components/shared/order-status"`.
3. Contenedor: raíz `<div>` sin `max-w`/`px` propios. Cabecera: `<h1 className="text-xl font-bold text-foreground sm:text-2xl">Mis pedidos</h1>` + contador `text-sm text-muted-foreground tabular`.
4. La tabla se conserva (`Table` de ui) con las mismas columnas; celdas de importe con `.tabular` y `formatCurrency(order.total)`; estado = `<OrderStatusBadge status={order.status} />`; la acción «Ver» pasa a `Button asChild variant="outline" size="sm"` con `<Link href={/cuenta/pedidos/${order.id}}>`. En `<sm` la tabla ya scrollea dentro de su contenedor — conservar el envoltorio con `overflow-x-auto` si existe o añadir `<div className="overflow-x-auto rounded-xl border border-border bg-surface">`.
5. Estados: carga = filas esqueleto `animate-pulse bg-surface-2`; error (`fetchError`) conserva su aviso con `AlertCircle` en `text-destructive`; vacío = «Aún no tienes pedidos» + `Button asChild` a `/productos` (texto actual se conserva si existe; si no existe rama vacía hoy, crearla con ese texto).

### C. `src/app/cuenta/pedidos/[id]/page.tsx` — Detalle de pedido

1. Mismo tratamiento: fuera portero duplicado, fuera mapas locales, `OrderStatusBadge` + `statusInfo(order.status).hint` como línea explicativa bajo el badge (`text-sm text-muted-foreground`) — es la mejora e-commerce: decir qué significa el estado.
2. Estructura: cabecera con enlace volver (`ArrowLeft` + «Mis pedidos», `min-h-tap`), `<h1 className="text-xl font-bold text-foreground sm:text-2xl">Pedido #{order.id.slice(0, 8).toUpperCase()}</h1>`, fecha con `formatDate` en `text-sm text-muted-foreground tabular`.
3. Los bloques existentes se conservan todos, tokenizados: artículos (nombre, cantidad, `formatCurrency(item.totalPrice)`), totales (subtotal/impuesto/envío/total en `dl` con `.tabular`, total en `font-bold text-foreground`), dirección de envío, y el CTA WhatsApp (`generateOrderWhatsAppMessage`) como `Button variant="whatsapp"`.
4. Cards → `rounded-xl border border-border bg-surface p-4 sm:p-5` (mantener `Card` de ui es aceptable si no introduce literales; elegir una vía y ser consistente en el archivo).

### D. `src/app/cuenta/direcciones/page.tsx` — Direcciones

1. Fuera portero duplicado; fuera `text-gray-900` del h1 → `text-xl font-bold text-foreground sm:text-2xl`, texto «Mis direcciones».
2. El CRUD (Dialog + AddressForm + create/update/delete + isDefault) **no cambia**: solo clases. Tarjetas de dirección → `rounded-xl border border-border bg-surface p-4` con la insignia «Predeterminada» como `Badge variant="secondary"`; botones Editar/Eliminar con `size="icon"`-like de 44 px y `aria-label` con la dirección.
3. Vacío: «No tienes direcciones guardadas» (texto actual) + botón «Agregar dirección».

### E. `src/app/(auth)/**` — CERO cambios (verificación)

`git diff` vacío en todo `(auth)`. Verificar (sin modificar) que `login-form.tsx` conserva `safeRedirect` y que `nav-data.ts` conserva `loginHref` — son la regla dura #8.

## Files to Create / Modify

Modificar:
- `/home/nothing/deploy/intemperie-frontend/src/app/cuenta/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/cuenta/pedidos/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/cuenta/pedidos/[id]/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/cuenta/direcciones/page.tsx`

Sin crear archivos. Prohibido tocar: `src/app/cuenta/layout.tsx`, `account-shell.tsx`, `src/app/(auth)/**`, `src/components/shared/order-status.tsx` (se importa), `src/components/checkout/address-form.tsx`, `src/lib/**`, `globals.css`.

## Required Tests

Desde `/home/nothing/deploy/intemperie-frontend`:

1. **Estado de pedido unificado: cero mapas duplicados, badge compartido en uso**
   ```bash
   ! grep -rn "bg-yellow-100\|bg-purple-100\|bg-cyan-100" src/app/cuenta \
   && grep -q 'from "@/components/shared/order-status"' src/app/cuenta/pedidos/page.tsx \
   && grep -q 'from "@/components/shared/order-status"' "src/app/cuenta/pedidos/[id]/page.tsx" \
   && ! grep -rn "const statusColors" src/app/cuenta
   ```
   Esperado: exit 0.

2. **Portero único: las interiores ya no redirigen por su cuenta**
   ```bash
   ! grep -rn 'router.push("/login")' src/app/cuenta --include=page.tsx
   ```
   Esperado: exit 0 (la única gestión de sesión visible queda en `account-shell.tsx`).

3. **No se borró ninguna sección/función**
   ```bash
   grep -q "Accesos" src/app/cuenta/page.tsx \
   && grep -q "Mis pedidos" src/app/cuenta/pedidos/page.tsx \
   && grep -q "getOrders" src/app/cuenta/pedidos/page.tsx \
   && grep -q "generateOrderWhatsAppMessage" "src/app/cuenta/pedidos/[id]/page.tsx" \
   && grep -q "AddressForm" src/app/cuenta/direcciones/page.tsx \
   && grep -q "deleteAddress" src/app/cuenta/direcciones/page.tsx \
   && grep -q "Dialog" src/app/cuenta/direcciones/page.tsx
   ```
   Esperado: exit 0.

4. **Auth intacta y regla del redirect viva**
   ```bash
   git diff --quiet -- "src/app/(auth)" src/components/layout/nav-data.ts \
   && grep -q "function loginHref" src/components/layout/nav-data.ts \
   && grep -q "safeRedirect" "src/app/(auth)/login/login-form.tsx"
   ```
   Esperado: exit 0.

5. **Colores literales fuera de /cuenta**
   ```bash
   grep -rnE "(bg|text|border)-(gray|green|red|blue|amber|yellow|purple|cyan)-[0-9]{2,3}|#[0-9a-fA-F]{3,6}\b" src/app/cuenta --include=*.tsx
   ```
   Esperado: sin salida.

## Acceptance Criteria

- [ ] Tests 1–5 pasan; `npx tsc --noEmit` y `npm run lint` limpios.
- [ ] Las cuatro interiores se ven correctas en claro y oscuro (solo tokens) dentro del `AccountShell` sin doble canalón.
- [ ] Recargar `/cuenta/pedidos` con sesión válida no expulsa a `/login` (el bug documentado en `account-shell.tsx` no se reintroduce).
- [ ] El estado de cada pedido usa el mismo badge y el mismo vocabulario en listado, detalle (y, tras 07, en admin).

## Verification Commands

```bash
cd /home/nothing/deploy/intemperie-frontend
npx tsc --noEmit
npm run lint
grep -rn "#[0-9a-fA-F]\{3,6\}" src/app/cuenta --include=*.tsx   # vacío
```

> **ADVERTENCIA**: NO correr `npm run build` (necesita la API real; el symlink de node_modules rompe Turbopack). Tipos con `npx tsc --noEmit`.
