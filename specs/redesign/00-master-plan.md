# Plan maestro — Rediseño integral de la tienda Intemperie

> Repo: `/home/nothing/deploy/intemperie-frontend` (Next.js 16 App Router, React 19, TypeScript, Tailwind v4).
> Este documento gobierna las specs `01`–`08` de este directorio. Ante conflicto entre una spec y este plan, manda la spec (es más específica); ante silencio de una spec, manda este plan.

---

## 1. Diagnóstico: qué hay de verdad en el código

El sistema de diseño **«Perímetro»** (`src/app/globals.css`) ya existe y ya gobierna la mayor parte de la tienda. Estas zonas están **ya rediseñadas y aprobadas** — se preservan, no se reabren:

| Zona | Archivos | Estado |
|---|---|---|
| Chrome (header, banda comercial, nav, footer, menú móvil) | `src/components/layout/*` | Perímetro ✔ |
| Portada | `src/app/(store)/page.tsx` + `src/components/home/*` | Perímetro ✔ |
| Listado de catálogo | `src/app/(store)/productos/page.tsx` + `src/components/products/*` | Perímetro ✔ |
| Ficha de producto (PDP) | `src/app/(store)/productos/[slug]/*` | Perímetro ✔ (desalineaciones menores) |
| Carrito y checkout | `src/app/(store)/carrito/page.tsx`, `checkout/*` | Perímetro ✔ (mejoras puntuales) |
| Precotizador | `src/app/(store)/calculadora/*`, `src/components/calculator/*` | Perímetro ✔ (facilidad de uso pendiente) |
| Favoritos | `src/app/(store)/favoritos/page.tsx` | Perímetro ✔ |
| Auth chrome + formularios | `src/app/(auth)/*` | Perímetro ✔ |
| Armazón de cuenta | `src/app/cuenta/layout.tsx`, `account-shell.tsx`, `order-status.tsx` | Perímetro ✔ |
| Nosotros e Instaladores (landing + registro) | `src/app/nosotros/*`, `src/app/instaladores/*` | Perímetro ✔ |
| Inspecciones (tienda y admin) | `src/app/(store)/inspecciones/`, `src/app/admin/inspecciones/` | Perímetro ✔ — PRs #45–#49, aprobado por el dueño |
| Tablero admin + sidebar | `src/app/admin/page.tsx`, `src/components/admin/sidebar.tsx` | Perímetro ✔ |

Estas zonas son **legado**: colores literales de la paleta por defecto de Tailwind (`gray-900`, `green-700`, `bg-yellow-100`…), sin modo oscuro, sin `.shell`, fuera del sistema. Conteo real de clases literales por archivo (`grep -roE "(bg|text|border)-(gray|green|amber|…)-[0-9]{2,3}"`):

| Archivo | Literales |
|---|---|
| `src/app/admin/productos/page.tsx` | 58 |
| `src/app/admin/productos/[id]/page.tsx` | 51 |
| `src/app/devoluciones/page.tsx` | 33 |
| `src/app/envios/page.tsx` | 30 |
| `src/app/cuenta/pedidos/page.tsx` | 27 |
| `src/app/cuenta/pedidos/[id]/page.tsx` | 26 |
| `src/app/terminos/page.tsx` | 23 |
| `src/app/cuenta/direcciones/page.tsx` | 22 |
| `src/app/privacidad/page.tsx` | 17 |
| `src/app/admin/pedidos/page.tsx` | 17 |
| `src/app/admin/contenido/page.tsx` | 15 |
| `src/app/cuenta/page.tsx` | 12 |
| `src/app/(store)/categorias/[slug]/page.tsx` | 10 |
| `src/app/(store)/colecciones/[slug]/page.tsx` | 10 |
| `src/components/shared/recently-viewed-section.tsx` (huérfano, sin usos) | 10 |
| `src/app/admin/usuarios/page.tsx` · `categorias/page.tsx` · `colecciones/page.tsx` | 9 c/u |
| `src/app/not-found.tsx` | 8 |
| `src/app/global-error.tsx` | 5 |
| `src/components/shared/scroll-to-top.tsx` | 3 |
| `src/components/shared/whatsapp-button.tsx` | hex `#25D366`/`#20bd5a` |
| `src/components/shared/search-bar.tsx` (huérfano) | 1 |

**El rediseño integral consiste en**: (a) terminar la migración del legado al mismo sistema, (b) mejoras de patrón e-commerce puntuales en las zonas ya migradas, (c) una capa de componentes compartidos que evite que cada spec reinvente migas, cabeceras de página y estados vacíos.

---

## 2. Principios visuales (los del sistema, verificados contra `globals.css`)

1. **El triángulo de color por rol** — comentado en `globals.css` líneas 7–20 y en `button.tsx`:
   - **Verde** (`bg-primary`, `brand-green*`) = **acción**: comprar, cotizar, avanzar, precio, disponibilidad.
   - **Azul de obra** (`brand-navy`, `brand-navy-deep`) = **estructura y autoridad**: cabeceras de sección oscuras, pie, hero, bandas de cierre.
   - **Ámbar** (`brand-amber*`, variante `accent` de Button/Badge) = **acento**: urgencia, destacados, B2B. *Uno por pantalla o deja de significar nada.*
   No inventar otra semántica. `--whatsapp` es la cuarta variante para el canal comercial real.
2. **Ningún color literal en componentes.** Todo por token (`bg-surface`, `text-foreground`, `text-muted-foreground`, `bg-brand-navy-deep`, `text-on-dark-soft`, `border-hairline`, `bg-surface-sunk`…). Un token nuevo se declara en `globals.css` con par claro (`:root`) y oscuro (`.dark`) — pero las specs 01–08 **no necesitan ninguno nuevo**.
3. **Jerarquía tipográfica por peso y cuerpo, no por familia**: `.eyebrow` (antetítulo versalitas) → `h1/h2` con `font-bold tracking-tight text-balance` → línea de contexto en `text-sm text-muted-foreground`. El patrón canónico de cabecera de página es el de `productos/page.tsx` (migas → eyebrow → h1 → contador/contexto).
4. **Ritmo vertical con las variables del sistema**: `.shell` como único canalón; `py-8 sm:py-10 lg:py-12` en secciones de catálogo; `py-section` / `py-section-sm` en páginas; secciones separadas por `border-b border-border` y alternancia de superficie (`bg-background` / `bg-surface` / `bg-surface-sunk` / `bg-brand-navy-deep`), como hace `components/home/section.tsx`.
5. **Cifras siempre `.tabular`** (precios, medidas, contadores). Dinero que llega como **string del backend (Decimal) nunca se convierte a float**: se formatea con `formatMoney(amount: string)` de `src/lib/utils.ts` (línea 87). `formatCurrency(number)` solo para importes que ya son number en el tipo existente.
6. **Objetivo táctil 44 px** (`min-h-tap`, `size-tap`, `size-11`); foco visible con el anillo doble global; `transition-colors`, nunca `transition-all`.
7. **Sin datos inventados**: ni estrellas, ni testimonios, ni promesas sin respaldo. Las firmas visuales sin coste de red son `.picket-rule`, `.mesh-rule`, `.diagram .diagram-picket|-mesh`.

---

## 3. Patrón e-commerce estándar por grupo (qué aplica dónde)

| Grupo | Patrón estándar | Estado / trabajo |
|---|---|---|
| **Portada** | Hero con propuesta de valor + búsqueda; categorías navegables; guías de compra; lista de precios; cierre con CTA doble | Ya lo tiene. Se añade **prueba social verificable** (obras entregadas reales, ya publicadas en `/nosotros`) y una **banda de servicios** (calculadora, inspección en sitio, instaladores). Sin reintroducir la banda de stats del hero (regla dura #9; la banda actual de datos contados del catálogo es `ValueStrip` y se queda). |
| **Catálogo** | Listado con facetas + orden + migas + estados vacíos con salida | Ya lo tiene el listado. Categorías y colecciones (`/categorias/[slug]`, `/colecciones/[slug]`) se rehacen con el **mismo patrón de cabecera del listado**. PDP: galería + buy-box sticky + barra móvil inferior — ya lo tiene; se alinea el contenedor a `.shell` y las migas al componente compartido. |
| **Compra** | Carrito con resumen sticky y CTA persistente; checkout por pasos con resumen visible; success con siguientes pasos | Checkout ya lo tiene. Carrito pasa a dos columnas en `lg` con resumen sticky. Calculadora: resumen sticky en escritorio + barra de total fija en móvil + tarjeta de «modelo elegido». |
| **Cuenta** | Shell con navegación persistente; listados con estado semántico; detalle con línea de tiempo de estado | El shell ya existe (`AccountShell`); las 4 pantallas interiores son legado y se rehacen dentro de él, unificando el estado de pedido en `OrderStatusBadge`. |
| **Institucionales** | Página legal con banda de título + índice de secciones + prosa tokenizada; landing editorial densa | `nosotros` e `instaladores` ya son densos (la queja de «espacio mal aprovechado» está corregida ahí con comentarios que lo documentan — verificar, no reabrir). Las cuatro legales (`envios`, `devoluciones`, `privacidad`, `terminos`) se rehacen sobre un componente compartido `LegalPage` con índice lateral en escritorio: la densidad editorial que pide el dueño. |
| **Admin** | Herramienta interna: tablas densas, acciones inline, estado semántico, accesos rápidos | Tablero ya migrado; se densifica a dos columnas en `xl`. Las 7 pantallas de gestión son legado y se rehacen utilitarias: tokens, tablas, `OrderStatusBadge`, dinero-string con `formatMoney`. |
| **Inspecciones** | — | **Solo alineación ligera** (spec 08). Aprobadas en PRs #45–#49. Los tokens `--plan-*` no se tocan (regla dura #2). |

---

## 4. Orden de implementación y dependencias

```
01-foundation  ──────────────┐  (bloquea a todas: crea shared/* y toca globals.css si hiciera falta)
                             │
   ┌─────────┬──────────┬────┴────┬──────────┬──────────┬─────────┐
   02        03         04        05         06         07        08
 portada  catálogo    compra   cuenta     institu.   admin    inspecciones
```

- **01 primero, siempre.** Es la única spec autorizada a tocar `src/app/globals.css` y la única que crea/modifica archivos en `src/components/shared/`. Las demás solo **importan** de ahí.
- **02–08 son paralelizables entre sí** una vez fusionada 01: sus conjuntos de archivos son disjuntos (ver §5).
- 08 depende además de que 01 esté fusionada solo si se adopta el `PageHeader` compartido; su alternativa mínima no depende de nada.

## 5. Mapa de propiedad de archivos (anti-colisión entre agentes paralelos)

| Archivo / directorio | Dueño único | Los demás |
|---|---|---|
| `src/app/globals.css` | **01** (y solo si de verdad hace falta; el plan actual: 0 tokens nuevos) | solo lectura |
| `src/components/shared/*` (breadcrumbs, page-header, empty-state, legal-page, order-status, whatsapp-button, scroll-to-top, search-bar, recently-viewed-section) | **01** | solo importan |
| `src/components/layout/*` (header, footer, nav…) | **nadie** — no se tocan en este rediseño | solo lectura |
| `src/components/home/*` + `src/app/(store)/page.tsx` | **02** | — |
| `src/app/(store)/productos/**`, `categorias/**`, `colecciones/**`, `favoritos/` + `src/components/products/*` | **03** | — |
| `src/app/(store)/carrito/`, `checkout/**`, `calculadora/**` + `src/components/calculator/*`, `src/components/cart/*` | **04** | — |
| `src/app/cuenta/**`, `src/app/(auth)/**` | **05** | — |
| `src/app/nosotros/**`, `instaladores/**`, `envios/`, `devoluciones/`, `privacidad/`, `terminos/` | **06** | — |
| `src/app/admin/**` (salvo `admin/inspecciones/`) + `src/components/admin/*` | **07** | — |
| `src/app/(store)/inspecciones/`, `src/app/admin/inspecciones/`, `src/components/inspecciones/*` | **08** | — |
| `src/app/not-found.tsx`, `src/app/global-error.tsx` | **01** | — |
| `src/lib/*`, `src/hooks/*`, `src/types/*` | **nadie** — sin cambios de contrato; una spec puede añadir helpers *solo* en archivos nuevos propios | solo lectura |

Punto de fricción conocido y resuelto por adelantado: `src/app/cuenta/order-status.tsx` (badge de estado con tokens, hoy **huérfano** — nadie lo importa). **01 lo traslada** a `src/components/shared/order-status.tsx`; 05 y 07 lo consumen desde ahí. 05 no debe redefinirlo, 07 tampoco.

---

## 6. Reglas duras (copiar en la cabeza antes de implementar cualquier spec)

1. Todo color via token del sistema «Perímetro». Grep de literales limpio en los archivos tocados.
2. `--plan-*` en `:root` no se toca (el plano de inspección se exporta con `toDataURL` y se imprime).
3. **No se elimina ninguna sección, ruta ni funcionalidad.** Reorganizar y re-estilizar sí; borrar no. Cada spec incluye tests que verifican que los textos/encabezados existentes siguen presentes.
4. `/inspecciones` y `/admin/inspecciones`: solo alineación (spec 08).
5. La responsividad existente se preserva; no es un objetivo a reabrir.
6. Dinero del backend = string. `formatMoney(string)` para totales de pedidos admin; jamás `parseFloat` sobre un Decimal para operar.
7. Cero librerías nuevas. Solo Tailwind v4 + `package.json` actual (lucide-react, sonner, @base-ui/react, cva, etc.).
8. `loginHref(pathname)` de `src/components/layout/nav-data.ts` y `?redirect=` en `/login` se preservan.
9. La portada no recupera la banda de stats del hero («Desde $8.50/metro…» encima del buscador).
10. **No correr `npm run build`** (necesita la API real; el symlink de node_modules rompe Turbopack). Tipos: `npx tsc --noEmit`. Lint: `npm run lint`.
