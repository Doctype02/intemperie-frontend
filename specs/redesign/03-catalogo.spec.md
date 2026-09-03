# Spec: Catálogo — categorías y colecciones al sistema, alineación de PDP y favoritos

## Metadata

- developer_type: agent
- estimated_complexity: media
- languages: TypeScript (TSX)
- depends_on: 01-foundation (usa `Breadcrumbs`, `PageHeader`, `EmptyState` de `src/components/shared/`)
- files_shared_with_others: ninguno (dueño único de `src/app/(store)/productos/**`, `categorias/**`, `colecciones/**`, `favoritos/` y `src/components/products/*`)

## Objective

Cerrar el grupo de catálogo: (1) el **listado** `/productos` ya es Perímetro y queda intacto; (2) la **PDP** se alinea al canalón `.shell`, a `.eyebrow` y a las migas compartidas (patrón: galería + buy-box sticky + specs, que ya tiene); (3) **`/categorias/[slug]` y `/colecciones/[slug]` se reescriben** — son las dos únicas páginas de la tienda pública que siguen en gris literal sin modo oscuro; (4) **favoritos** corrige el `<main>` anidado (HTML inválido: el layout de `(store)` ya pone `<main>`) y adopta el `EmptyState` compartido.

## Context

- Listado: `src/app/(store)/productos/page.tsx` + `src/components/products/product-filters.tsx`, `product-grid.tsx`, `product-card.tsx`, `sort-select.tsx`, `search-wrapper.tsx`, `pagination-nav.tsx`, `price-filter.tsx` — todo Perímetro, streaming con Suspense, facetas por URL. **Intacto.**
- PDP: `src/app/(store)/productos/[slug]/page.tsx` (296 líneas, servidor, JSON-LD, `revalidate = 600`) + `product-detail-client.tsx` (única isla: panel de compra con barra móvil inferior) + `product-faq.tsx`, `product-spec-sheet.tsx`, `product-view.ts`. Desalineaciones reales (líneas citadas de `page.tsx`):
  - L164: `<div className="mx-auto max-w-7xl px-4 pt-4 pb-28 sm:px-6 lg:pt-6 lg:pb-14">` — no usa `.shell` (`.shell` = `max-width: 80rem` + `padding-inline: var(--gutter)`, equivalente y consistente).
  - L165: `<nav aria-label="Ruta de navegación" className="mb-4 hidden sm:block">` — las migas desaparecen en móvil; el listado las muestra siempre.
  - L189: eyebrow a mano: `className="text-2xs font-semibold uppercase text-muted-foreground"` en vez de `.eyebrow`.
- Categoría (`src/app/(store)/categorias/[slug]/page.tsx`, 85 líneas) y colección (`colecciones/[slug]/page.tsx`, 85 líneas): estructura idéntica entre sí, legado puro. Extracto real de categorías (L58–L80):

```tsx
<div className="border-b bg-gray-50">
  <div className="mx-auto max-w-7xl px-4 py-2.5">
    <div className="flex items-center gap-1.5 text-[10px] md:text-xs text-gray-400">
      <Link href="/" className="hover:text-green-600">Inicio</Link>
      ...
    </div>
  </div>
</div>
<div className="max-w-7xl mx-auto px-4 py-8">
  <h1 className="text-xl md:text-3xl font-bold text-gray-900">{category.name}</h1>
  ...
  <p className="text-sm text-gray-400 mt-1">{products.length} ... encontrados</p>
</div>
<ProductGrid products={products} />
```

  Deben conservar: `revalidate = 600` (comentario incluido), `generateStaticParams`, `generateMetadata`, la doble carga `Promise.all([getXBySlug, listProducts])`, la rama «no encontrada» y `ProductGrid`.
- Favoritos: `src/app/(store)/favoritos/page.tsx` (213 líneas, `"use client"`, Perímetro). Problema: sus tres ramas devuelven `<main className="flex-1">…` dentro del `<main>` del layout `(store)` (`src/app/(store)/layout.tsx`: `<main className="flex-1">{children}</main>`) → `<main>` anidado. El patrón correcto ya está en la PDP y el carrito: `<div id="main-content" tabIndex={-1} …>`.
- Compartidos disponibles tras 01: `Breadcrumbs` (`@/components/shared/breadcrumbs`), `PageHeader` (`@/components/shared/page-header`), `EmptyState` (`@/components/shared/empty-state`).

## Implementation Contract

### A. `/productos` — SIN CAMBIOS

`git diff` vacío en `src/app/(store)/productos/page.tsx`, `listing.ts`, `sort-select.tsx`, `search-wrapper.tsx`, `pagination-nav.tsx`, `price-filter.tsx`, `loading.tsx`, `error.tsx` y en `src/components/products/*`.

### B. PDP `src/app/(store)/productos/[slug]/page.tsx` — 3 cambios quirúrgicos

1. **Contenedor** (L164):
   - Hoy: `<div className="mx-auto max-w-7xl px-4 pt-4 pb-28 sm:px-6 lg:pt-6 lg:pb-14">`
   - Queda: `<div className="shell pt-4 pb-28 lg:pt-6 lg:pb-14">`
2. **Migas** (L165–187): sustituir el `<nav>` manual por el componente compartido, visible en todos los anchos:
   ```tsx
   <Breadcrumbs
     className="mb-4"
     items={[
       { label: "Inicio", href: "/" },
       { label: "Catálogo", href: "/productos" },
       { label: product.name },
     ]}
   />
   ```
   («Productos» pasa a llamarse «Catálogo», el nombre que ya usa la miga del listado.)
3. **Eyebrow** (L189–194): `className="text-2xs font-semibold uppercase text-muted-foreground"` → `className="eyebrow text-muted-foreground"`. El contenido (`collectionName · categoryName`) no cambia.

**Nada más se toca**: JSON-LD, `PriceBlock`, `TrustStrip`, grid `lg:grid-cols-[minmax(0,1fr)_21rem]`, aside sticky `lg:top-[77px]`, `contentVisibility` del bloque bajo el pliegue, `product-detail-client.tsx` completo (incluida la barra móvil fija), FAQ y spec-sheet quedan idénticos.

### C. `src/app/(store)/categorias/[slug]/page.tsx` — reescritura del render (la carga de datos no cambia)

Mantener intactos: imports de datos, `revalidate = 600` con su comentario, `generateStaticParams`, `generateMetadata`, `Promise.all`. Sustituir solo el JSX:

1. **Rama «no encontrada»** (hoy `text-gray-900`/`text-gray-600` centrados):
   ```tsx
   return (
     <div className="shell py-section">
       <EmptyState
         diagram="picket"
         title="Categoría no encontrada"
         body="La categoría que buscas no existe."
       >
         <Button asChild variant="outline"><Link href="/productos">Ver todos los productos</Link></Button>
       </EmptyState>
     </div>
   )
   ```
2. **Rama normal**:
   ```tsx
   return (
     <div className="pb-section-sm">
       <PageHeader
         crumbs={[
           { label: "Inicio", href: "/" },
           { label: "Catálogo", href: "/productos" },
           { label: category.name },
         ]}
         eyebrow="Cercado por uso"
         title={category.name}
         sub={
           <>
             <span className="tabular">{products.length}</span>{" "}
             {products.length === 1 ? "modelo" : "modelos"} · precio de material por metro; la instalación se cotiza aparte
           </>
         }
       >
         {category.description && (
           <p className="mt-2 max-w-prose text-sm text-muted-foreground">{category.description}</p>
         )}
       </PageHeader>
       <div className="shell pt-5 sm:pt-6">
         <ProductGrid products={products} />
       </div>
     </div>
   )
   ```
   (Es el mismo esqueleto de cabecera que `/productos`; la descripción y el recuento actuales se conservan, cambiando «productos encontrados» por el vocabulario del listado, «modelos».)

### D. `src/app/(store)/colecciones/[slug]/page.tsx` — idéntico a C

Mismo contrato con `collection` en lugar de `category`, eyebrow `"Línea de producto"` (el nombre que el listado da a las colecciones en `FacetGroup title="Línea de producto"`), migas `Inicio → Catálogo → {collection.name}`, y rama vacía «Colección no encontrada» / «La colección que buscas no existe.» con `diagram="mesh"`.

### E. `src/app/(store)/favoritos/page.tsx` — 2 cambios

1. **Main anidado**: en las tres ramas, `<main className="flex-1">` → `<div id="main-content" tabIndex={-1} className="flex-1 outline-none">` (y `flex flex-1 items-center justify-center py-section` conserva sus clases sobre el `div`). Cierres `</main>` → `</div>`.
2. **Estado vacío**: sustituir el bloque actual (círculo con `<Heart>` + h1 + p + 2 botones, L60–89) por:
   ```tsx
   <div className="shell max-w-lg py-section">
     <EmptyState
       icon={<Heart className="size-9 text-muted-foreground" aria-hidden="true" />}
       title="Todavía no has guardado nada"
       body="Toca el corazón en cualquier producto y lo tendrás aquí para compararlo con calma."
     >
       <Button size="block" asChild>
         <Link href="/productos">Ver el catálogo <ArrowRight className="ml-1.5 h-4 w-4" aria-hidden="true" /></Link>
       </Button>
       <Button variant="outline" size="block" asChild>
         <Link href="/calculadora">Calcular cuántos metros necesito</Link>
       </Button>
     </EmptyState>
   </div>
   ```
   Título, texto y las dos salidas se conservan literalmente (el `<h1>` de esa rama pasa a ser el `<h2>` interno de `EmptyState`; es aceptable: la página vacía no necesita h1 propio para SEO — `robots` ya no la indexa al ser cliente puro; si el implementador prefiere conservar h1, puede pasar `EmptyState` con un wrapper `<h1>` — pero el texto no cambia).

Nada más de favoritos se toca: esqueleto de carga, parrilla, botón quitar con deshacer, `addItem` con mínimo 10 m quedan idénticos.

## Files to Create / Modify

Modificar:
- `/home/nothing/deploy/intemperie-frontend/src/app/(store)/productos/[slug]/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/(store)/categorias/[slug]/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/(store)/colecciones/[slug]/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/(store)/favoritos/page.tsx`

Sin crear archivos. Prohibido tocar: `src/app/(store)/productos/page.tsx` y demás archivos del listado, `src/components/products/*`, `product-detail-client.tsx`, `globals.css`, `src/components/shared/*`.

## Required Tests

Desde `/home/nothing/deploy/intemperie-frontend`:

1. **No se borró contenido: los textos clave siguen en el fuente**
   ```bash
   grep -q "Categoría no encontrada" "src/app/(store)/categorias/[slug]/page.tsx" \
   && grep -q "Colección no encontrada" "src/app/(store)/colecciones/[slug]/page.tsx" \
   && grep -q "Todavía no has guardado nada" "src/app/(store)/favoritos/page.tsx" \
   && grep -q "Mis favoritos" "src/app/(store)/favoritos/page.tsx" \
   && grep -q "ProductGrid" "src/app/(store)/categorias/[slug]/page.tsx" \
   && grep -q "ProductGrid" "src/app/(store)/colecciones/[slug]/page.tsx"
   ```
   Esperado: exit 0.

2. **Categorías/colecciones quedaron limpias de literales y con el contrato de datos intacto**
   ```bash
   ! grep -qE "(bg|text|border)-(gray|green)-[0-9]{2,3}" "src/app/(store)/categorias/[slug]/page.tsx" \
   && ! grep -qE "(bg|text|border)-(gray|green)-[0-9]{2,3}" "src/app/(store)/colecciones/[slug]/page.tsx" \
   && grep -q "export const revalidate = 600" "src/app/(store)/categorias/[slug]/page.tsx" \
   && grep -q "generateStaticParams" "src/app/(store)/categorias/[slug]/page.tsx" \
   && grep -q "generateStaticParams" "src/app/(store)/colecciones/[slug]/page.tsx"
   ```
   Esperado: exit 0.

3. **PDP: shell, migas compartidas y eyebrow del sistema; nada más cambió**
   ```bash
   grep -q 'className="shell pt-4 pb-28 lg:pt-6 lg:pb-14"' "src/app/(store)/productos/[slug]/page.tsx" \
   && grep -q "Breadcrumbs" "src/app/(store)/productos/[slug]/page.tsx" \
   && ! grep -q "hidden sm:block" "src/app/(store)/productos/[slug]/page.tsx" \
   && git diff --quiet -- "src/app/(store)/productos/[slug]/product-detail-client.tsx"
   ```
   Esperado: exit 0.

4. **Favoritos sin `<main>` anidado**
   ```bash
   ! grep -q "<main" "src/app/(store)/favoritos/page.tsx" \
   && grep -q 'id="main-content"' "src/app/(store)/favoritos/page.tsx"
   ```
   Esperado: exit 0.

5. **El listado no cambió ni un byte**
   ```bash
   git diff --quiet -- "src/app/(store)/productos/page.tsx" src/components/products
   ```
   Esperado: exit 0.

## Acceptance Criteria

- [ ] Tests 1–5 pasan; `npx tsc --noEmit` y `npm run lint` limpios.
- [ ] `/categorias/x` y `/colecciones/x` renderizan con la misma cabecera de página (migas → eyebrow → h1 → contador) que `/productos`, en claro y en oscuro (solo tokens).
- [ ] La PDP conserva JSON-LD, buy-box sticky y barra móvil sin cambios.
- [ ] Grep de colores literales limpio en los 4 archivos tocados.

## Verification Commands

```bash
cd /home/nothing/deploy/intemperie-frontend
npx tsc --noEmit
npm run lint
grep -rn "#[0-9a-fA-F]\{3,6\}" "src/app/(store)/categorias" "src/app/(store)/colecciones" "src/app/(store)/favoritos" "src/app/(store)/productos/[slug]" --include=*.tsx   # vacío
```

> **ADVERTENCIA**: NO correr `npm run build` (necesita la API real; el symlink de node_modules rompe Turbopack). Tipos con `npx tsc --noEmit`.
