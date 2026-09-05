# Spec: Portada «Mercado» — la dirección B elegida por el dueño

## Metadata
- developer_type: agent
- estimated_complexity: medium-high
- languages: [TypeScript]

## Objective

Implementar en la portada la dirección visual que el dueño eligió sobre maqueta
(scratchpad/mock-mercado.html, opción B): hero de panel verde redondeado con la etiqueta
de precio blanca gigante y el campo «¿Cuántos metros tiene su terreno?», collage de fotos
reales con precio encima, categorías como píldoras, y tarjetas de producto con botón
«Comprar». Comercial, cálido, vendedor. Debe verse CLARAMENTE distinto de la portada
actual — el dueño rechazó dos versiones por «técnica» una y por «la misma» la otra.

## Context

Repo: /home/nothing/deploy/intemperie-frontend, base = HEAD actual (e4ea85a, spec 10
aplicada). Design system «Perímetro» (globals.css): SOLO tokens, cero literales. Verde
acción (bg-primary, brand-green, brand-green-deep, brand-green-soft), navy estructura
(brand-navy-deep), ámbar acento único por pantalla (brand-amber), superficies (bg-surface,
bg-surface-sunk, border-border, border-hairline), text-on-dark/on-dark-soft. catalog-data:
getCatalog(), priceFrom, modelCount, warrantyYears, segments/segmentSections (con `from`
y counts), HomeProduct.images. La calculadora honra GET `?metros=` y `?producto=`.
5 productos tienen foto real. Referencia visual exacta: leer
/tmp/claude-1000/-home-nothing-deploy/b07d7947-8bea-4a29-9d70-4d7f4a16642b/scratchpad/mock-mercado.html
(es maqueta desechable con hex — el resultado real se construye con TOKENS equivalentes).

## Implementation Contract

### 1. Cinta ámbar de promesa — dentro de la portada, primer elemento

En page.tsx, antes del hero (NO en el header): banda a todo el ancho `bg-brand-amber`
con texto centrado `text-sm font-bold` en tinta oscura (`text-brand-navy-deep` o el token
de tinta sobre ámbar que exista): `Envío gratis en todo pedido (mínimo 10 m) · Fabricado
en Panamá`. Es EL único ámbar de la página. Enlace envolvente a /envios opcional.

### 2. Hero «panel + collage» — `hero.tsx` reescrito (servidor)

Grid `lg:grid-cols-[1.05fr_.95fr] gap-6` dentro de `.shell`, py-6/8, sobre bg-background
(el panel es el color, no la sección).

Panel izquierdo: `rounded-3xl bg-gradient-to-br from-brand-green-deep via-brand-green
to-brand-green` (tokens; si el gradiente por clase no rinde bien, bg-brand-green-deep
plano con un radial sutil vía pseudo/clase inline-safe), texto claro, p-8 sm:p-11:
- Kicker `.eyebrow` en tono claro: `Fábrica propia · La Chorrera, Panamá`.
- H1: `La cerca de su casa, al precio que ve aquí` (text-3xl sm:text-4xl lg:text-[2.75rem],
  font-bold tracking-tight, text-balance).
- Etiqueta de precio: caja blanca `bg-surface text-brand-green-deep rounded-2xl px-6 py-3
  shadow-lg w-max` con `${priceFrom}` en text-4xl sm:text-5xl font-bold .tabular y
  ` / metro · desde` en text-base text-muted-foreground.
- Párrafo: `15 modelos de PVC y malla electrosoldada con precio publicado. Escriba sus
  metros y mire su total al instante.` (el 15 = modelCount real interpolado).
- Form GET a /calculadora en caja blanca redondeada (`bg-surface rounded-2xl p-1.5 flex`):
  input `name="metros" type="number" min=10 step=5 inputMode="numeric"
  placeholder="¿Cuántos metros tiene su terreno? Ej.: 80"` (flex-1, .tabular) + botón
  submit `bg-brand-navy-deep text-on-dark rounded-xl px-5 h-12 font-bold`:
  `Calcular mi cerca →`.
- Línea de checks text-sm en tono claro suave: `✓ Con ITBMS incluido · ✓ Garantía hasta
  {warrantyYears} años · ✓ Pedido mínimo 10 m` (iconos lucide Check o texto).
- Enlace discreto debajo: `o cotice por WhatsApp` → whatsappHref (text-sm underline).

Collage derecho (oculto `hidden lg:grid` en móvil; en móvil una sola foto grande bajo el
panel, rounded-2xl): grid 2 columnas × 2 filas, la primera foto ocupa las 2 columnas
(fila alta), 2 fotos abajo; gap-3.5; cada una `relative rounded-2xl overflow-hidden` con
`next/image fill` + etiqueta blanca `absolute left-3.5 bottom-3 bg-surface rounded-xl
px-3 py-1.5 text-sm font-bold shadow-md` con `{nombre} · ${precio}/m` (la grande) o
`${precio}/m` (las chicas), precio en text-brand-green-deep .tabular. Cada foto enlaza a
su ficha `/productos/<slug>`. Datos: los 3 primeros productos CON foto (server-side desde
getCatalog(), foto-primero + stock desc — misma selección que featured). La primera con
`priority` (es el LCP junto al panel).

El buscador ya vive en el header global; el hero NO lleva buscador propio.

### 3. Categorías como píldoras — `segment-grid.tsx` reescrito

La sección «Comprar por uso» pasa de grid de tarjetas a fila de píldoras desplazable
(`flex gap-3 overflow-x-auto .scrollbar-hide` en móvil, wrap en lg): cada segmento una
píldora `flex items-center gap-3 rounded-full border border-border bg-surface pl-2 pr-5
py-2 min-h-tap` con círculo `size-10 rounded-full bg-brand-green-soft grid place-items-center`
conteniendo el mini `.diagram-picket`/`.diagram-mesh` (o icono lucide coherente), nombre
en font-bold text-sm y debajo `text-2xs→text-xs text-brand-green-deep font-semibold`:
`{n} modelos · desde ${from}/m`. Enlace: el mismo destino actual de cada tarjeta.
Agropecuario (sin modelos): borde dashed + icono WhatsApp + `Cotizar por WhatsApp`.
El SectionHeader («Empiece por aquí / Comprar por uso») se conserva encima.
Los textos who/promise de cada segmento pueden omitirse aquí (viven en SegmentSections).

### 4. Tarjetas «Los más pedidos» — `featured-products.tsx` reescrito

Mismo lugar y selección (4, foto primero, stock desc). Tarjeta nueva estilo B (markup
propio, NO ProductTile):
- `rounded-2xl border border-border bg-surface overflow-hidden`.
- Foto aspect-[4/3] con `next/image fill`; píldora blanca arriba-izquierda con el rango
  de altura (`bg-surface rounded-full px-3 py-1 text-xs font-bold shadow-sm`).
- Cuerpo p-4: nombre font-bold, línea `{"segmento"} · {garantía}` text-sm
  text-muted-foreground, precio grande `text-2xl font-bold text-brand-green-deep .tabular`
  con `/metro` en text-sm text-muted-foreground.
- Fila CTA: `Comprar` (flex-1, bg-primary text-primary-foreground rounded-xl h-11
  font-bold, → /productos/<slug>) + botón cuadrado `size-11 rounded-xl border
  border-border grid place-items-center` con icono Calculator (lucide) →
  /calculadora?producto=<slug>, aria-label `Calcular {nombre}`.
Fallback sin foto: `.diagram diagram-picket` como hoy hace ProductTile.

### 5. Limpieza de redundancias

- `metros-band.tsx` SE ELIMINA (archivo y uso en page.tsx): el hero ya lleva el mismo
  form; dos campos idénticos en una página confunden.
- `value-strip.tsx` se conserva tal cual (franja de confianza tras el hero) PERO su
  celda «Desde $8.50 el metro» se sustituye por «Precio publicado · sin llamar ni
  esperar» → /productos (el precio ya es el hero; no repetirlo a 4 líneas de distancia).
- El resto del recorrido queda como está (SegmentSections, HeightGuide, MeshSection,
  ServicesBand, condicionales, PriceList con Calcular→, QuoteBand).

### 6. page.tsx — orden final

CintaÁmbar · Hero(panel+collage) · ValueStrip · FeaturedProducts · SegmentGrid(píldoras) ·
SegmentSections · HeightGuide · MeshSection · ServicesBand · NewArrivals(cond) ·
WorksStrip(cond) · PriceList · QuoteBand. Comentario-mapa actualizado. revalidate intacto.

### Reglas duras
- Cero colores literales (la maqueta usa hex SOLO como referencia visual; el código usa
  tokens). Cero librerías. Cero "use client" nuevo (todo servidor: forms GET y enlaces).
- Ámbar: SOLO la cinta del punto 1.
- Cero datos inventados; todo interpolado del catálogo real.
- No tocar: globals.css, layout/, shared/, section.tsx, product-tile.tsx, catalog-data.ts,
  segment-sections, height-guide, mesh-section, services-band, price-list, quote-band,
  new-arrivals, works-strip, calculadora, --plan-*.

## Files to Create / Modify
- Modificar: src/app/(store)/page.tsx, src/components/home/hero.tsx,
  src/components/home/featured-products.tsx, src/components/home/segment-grid.tsx,
  src/components/home/value-strip.tsx (solo la celda indicada)
- Eliminar: src/components/home/metros-band.tsx

## Required Tests
1. Cinta ámbar única: grep `brand-amber` en src/components/home + page.tsx → solo en el
   elemento de la cinta (1 aparición de contexto).
2. Hero: form GET /calculadora con name="metros"; priceFrom interpolado en la etiqueta;
   collage con 3 enlaces a /productos/; cero buscador propio en hero.tsx.
3. metros-band.tsx no existe y page.tsx no lo importa.
4. featured: 4 tarjetas, botón Comprar → /productos/<slug> y botón calculadora →
   /calculadora?producto=; selección foto-primero verificable.
5. Capacidades: wa.me presente (hero o value-strip o quote-band), /inspecciones,
   /instaladores, tabla PriceList intacta (`git diff --quiet` sobre los archivos de la
   lista «No tocar»).
6. Cero literales de paleta/hex en src/components/home (grep vacío) y
   `git diff --quiet -- src/app/globals.css` limpio.

## Acceptance Criteria
- `npx tsc --noEmit` limpio; eslint limpio en tocados.
- Cero "use client" en los archivos de esta spec.
- El hero no comparte composición con el anterior (panel de color + collage, sin foto
  única a la derecha del texto).

## Verification Commands
```
npx tsc --noEmit
grep -rnE "(bg|text|border)-(gray|slate|zinc|red|yellow|blue)-[0-9]{2,3}|#[0-9a-fA-F]{6}" src/components/home --include='*.tsx'
git diff --quiet -- src/app/globals.css "src/app/(store)/calculadora" && echo BASE-OK
```
NO correr `npm run build`.
