# Spec: Portada de venta — e-commerce clásico que convierte

## Metadata
- developer_type: agent
- estimated_complexity: medium
- languages: [TypeScript]

## Objective

Sobre la base restaurada (commit 9f7e36e, la portada pre-plano), construir una portada
CLARAMENTE MEJOR que la anterior en primera impresión y venta, con el lenguaje que un
comprador de e-commerce reconoce al instante: promesa con precio en el titular, producto
con fotografía real en la primera mitad de la página, un CTA dominante por bloque, señales
de confianza visibles, y caminos cortos al dinero. NADA de estética de plano técnico:
cálido, comercial, familiar. El dueño rechazó el rediseño anterior con estas palabras:
«lo que buscamos es generar una buena primera impresión y ventas en la pág de portada».

## Context

Repo: /home/nothing/deploy/intemperie-frontend. La portada actual (restaurada) está en
src/app/(store)/page.tsx + src/components/home/* — orden: Hero · ValueStrip · SegmentGrid ·
SegmentSections · HeightGuide · MeshSection · ServicesBand · NewArrivals(cond) ·
WorksStrip(cond) · PriceList · QuoteBand. Design system «Perímetro» (globals.css): verde
= acción, navy = estructura, ámbar = UN acento por pantalla; utilidades .shell .eyebrow
.tabular .picket-rule .diagram-*. `catalog-data.ts` expone getCatalog(), priceFrom,
modelCount, warrantyYears, cheapest; HomeProduct tiene `images?: ProductImage[]` y
`ProductTile` ya pinta `p.images?.[0]?.url` con fallback .diagram. **5 de 15 productos
tienen foto real** — son el material de merchandising desaprovechado. Dinero = string/number
según el contrato existente de cada componente; jamás inventar datos (ni testimonios, ni
estrellas, ni descuentos falsos).

Auditoría UX previa (hallazgos que esta spec SÍ aplica, en clave clásica):
- El H1 debe ser la promesa con el precio, no la etiqueta de categoría.
- Un solo CTA dominante por bloque (hoy hay 3 del mismo peso, 2 casi del mismo verde).
- «Fabricamos en La Chorrera» y la garantía son credenciales que hoy se leen tarde.
- La calculadora responde «¿cuánto cuesta?» y debe llamarse IGUAL en toda la portada:
  **«Calcular mi cerca»**.
- El pedido mínimo (10 m) se dice temprano y claro, no en letra pequeña al fondo.

## Implementation Contract

### 1. Hero de venta — `hero.tsx`

Se conserva la composición actual (texto izquierda, foto real derecha, navy) — es la
correcta para e-commerce — y se recarga de venta:

- Eyebrow: `Fabricamos e instalamos en La Chorrera, Panamá` (credencial arriba).
- H1 nuevo (promesa+precio): `Cerque su terreno desde ${priceFrom} el metro` — el precio
  dentro del H1, en `.tabular`. `priceFrom` llega por prop desde page.tsx (dato real).
  La frase actual «Cercas de PVC y malla electrosoldada» pasa a la línea de contexto.
- Línea de contexto: `Cercas de PVC y malla electrosoldada con el precio a la vista.
  Sin visitas ni esperas: usted mira, calcula y pide.`
- El buscador se queda tal cual (form GET).
- CTAs re-jerarquizados: **UN** primario sólido `Calcular mi cerca` (Button default,
  h-12, el único botón sólido del bloque de texto) + `Cotizar por WhatsApp` como
  secundario estilo outline-sobre-navy (border-on-dark/45 bg-on-dark/10, patrón existente)
  con el icono verde de WhatsApp. Desaparece el tercer botón fantasma.
- Bajo los CTAs, fila de 3 micro-señales (text-sm text-on-dark-soft, iconos lucide
  ShieldCheck/Truck/Factory): `Garantía hasta {warrantyYears} años` · `Envío gratis
  (pedido mín. 10 m)` · `Fábrica propia en Panamá Oeste`. Datos reales por props.
- La foto: intacta, sin filtros ni capas.

### 2. «Los más pedidos» — NUEVO `src/components/home/featured-products.tsx` (servidor)

La sección de merchandising que falta. Va inmediatamente después de ValueStrip (la
primera sección de contenido = producto comprable con foto).

- `SectionHeader` (de section.tsx): eyebrow `Directo del catálogo`, H2 `Los más pedidos`,
  sub `Precio por metro de material, con altura y garantía en cada ficha.`, enlace
  `Ver los {modelCount}` → /productos.
- Selección server-side desde getCatalog(): primero los productos CON foto real
  (`p.images?.length`), dentro de cada grupo por stock desc; total 4 fichas
  (grid-cols-2 lg:grid-cols-4). Render con `ProductTile` tal cual (foto, precio, altura,
  stock — ya lo hace bien).
- Fondo bg-background, padding de sección estándar (py-8 sm:py-10 lg:py-12).

### 3. Banda cotizadora — NUEVO `src/components/home/metros-band.tsx` (servidor, cero JS)

La demostración de la calculadora en una línea, en verde de acción (la única banda verde
de la página): `bg-primary text-primary-foreground`, contenido en una fila (columna en
móvil): pregunta `¿Cuántos metros tiene su terreno?` (font-bold text-lg) + form GET a
`/calculadora` con un solo `<input type="number" name="metros" min={10} step={5}
placeholder="80" inputMode="numeric">` (h-12, bg blanco/surface, .tabular) + botón
`Calcular mi cerca` (bg-brand-navy-deep text-on-dark — contraste sobre el verde). Nota
text-sm bajo el form: `Precio de material al instante, con ITBMS. Pedido mínimo 10 m.`
Verificar que /calculadora lee `?metros=` (contrato ya existente); si el parámetro exacto
difiere, usar el nombre que la calculadora ya honra — NO tocar la calculadora.
Colocación: entre SegmentSections y HeightGuide (corta la zona de catálogo con una
llamada a la acción, patrón e-commerce de banda promocional pero con promesa real).

### 4. PriceList — retoques de venta (`price-list.tsx`)

- Sub del header gana la frase de combate: `Sin llamar y sin esperar: los 15 modelos con
  su precio.` (mantener el resto del copy actual).
- Cada fila gana celda final `Calcular →` a `/calculadora?producto=<slug>`
  (text-brand-green-deep text-sm font-medium; en móvil solo la flecha con sr-only).
- El aviso de pedido mínimo bajo la tabla sube a text-sm.
- El linkLabel del header: `Calcular mi cerca`.

### 5. QuoteBand — cierre con una pregunta (`quote-band.tsx`)

UN solo H2: `¿Ya sabe cuántos metros tiene?`. Dos salidas como respuesta directa:
`Sí → Calcular mi cerca` (Button default, /calculadora) y `No → Pedir inspección en sitio`
(outline-sobre-navy, /inspecciones). WhatsApp y el teléfono escrito + horario se conservan
tal cual (cierran ventas de ticket alto). `.picket-rule` de remate se conserva. Estructura
visual: un solo bloque centrado o 2 columnas pregunta/acciones — a criterio, pero un solo
titular.

### 6. page.tsx — orden final

Hero(+props priceFrom, warrantyYears) · ValueStrip · **FeaturedProducts** · SegmentGrid ·
SegmentSections · **MetrosBand** · HeightGuide · MeshSection · ServicesBand ·
NewArrivals(cond) · WorksStrip(cond) · PriceList · QuoteBand.
Comentario-mapa actualizado. `revalidate = 3600` intacto.

### Reglas duras
- Cero estética de plano: sin sheet-grid, sin cotas, sin picket-screen (no existen ya
  tras el revert; no reintroducirlas).
- Cero colores literales; solo tokens. Ámbar: 0 usos nuevos (la portada queda sin ámbar
  o con el que ya tenga el chrome).
- Cero datos inventados. Cero librerías. Cero islas de cliente nuevas (todo servidor).
- No tocar: globals.css, layout/, shared/, product-tile.tsx, section.tsx, catalog-data.ts,
  segment-grid.tsx, segment-sections.tsx, height-guide.tsx, mesh-section.tsx,
  services-band.tsx, new-arrivals.tsx, works-strip.tsx, value-strip.tsx, calculadora,
  --plan-*.

## Files to Create / Modify
- Crear: src/components/home/featured-products.tsx, src/components/home/metros-band.tsx
- Modificar: src/components/home/hero.tsx, src/components/home/price-list.tsx,
  src/components/home/quote-band.tsx, src/app/(store)/page.tsx

## Required Tests
1. El H1 contiene el precio real: grep de `priceFrom` (o la prop equivalente) interpolado
   en el h1 de hero.tsx; y NO contiene «Cercas de PVC y malla electrosoldada» como h1.
2. FeaturedProducts renderiza exactamente 4 ProductTile y prioriza productos con
   `images`, verificable en el código de selección.
3. MetrosBand: form GET a /calculadora con input name que la calculadora honra; cero
   `"use client"` en los dos componentes nuevos.
4. Capacidades conservadas: buscador GET, wa.me, /inspecciones, /instaladores, teléfono
   escrito en el cierre, `<table>`+caption en PriceList, NewArrivals/WorksStrip
   condicionales intactos por `git diff --quiet`.
5. Cero literales de paleta y cero hex en src/components/home (grep vacío).
6. `git diff --quiet -- src/app/globals.css "src/app/(store)/calculadora"` → sin cambios.

## Acceptance Criteria
- `npx tsc --noEmit` limpio; eslint limpio en archivos tocados.
- Un solo botón sólido primario en el hero; un solo H2 en el cierre.
- Todo servidor: cero archivos nuevos con "use client".

## Verification Commands
```
npx tsc --noEmit
grep -rnE "(bg|text|border)-(gray|slate|zinc|red|yellow|blue)-[0-9]{2,3}|#[0-9a-fA-F]{6}" src/components/home --include='*.tsx'
git diff --quiet -- src/app/globals.css "src/app/(store)/calculadora" && echo BASE-OK
```
NO correr `npm run build` (API real + symlink de node_modules rompe Turbopack).
