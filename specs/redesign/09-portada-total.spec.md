# Spec: Rediseño total de portada — «El plano cotizado»

## Metadata
- developer_type: agent
- estimated_complexity: high
- languages: [TypeScript, CSS]

## Objective

Reconstruir la portada alrededor de la respuesta («¿cuánto me cuesta?»), no de la búsqueda.
Síntesis de dos direcciones de arte auditadas: el **hero-contador** (el precio real del
catálogo como protagonista tipográfico, con cinta métrica que lo convierte en *su* precio)
vestido con el **lenguaje de plano técnico** (rejilla de lámina, la cota como portador
visual de precio, la foto entre listones). Más la deduplicación estructural: cada producto
aparece con ficha UNA vez y en tabla UNA vez; la página móvil baja de ~8.000px a <5.000px.

## Context

Repo: `/home/nothing/deploy/intemperie-frontend`. Design system «Perímetro» en
`src/app/globals.css` (verde=acción, navy=estructura, ámbar=UN acento por pantalla;
utilidades .shell .eyebrow .tabular .picket-rule .mesh-rule .diagram-* .defer-paint
.scrollbar-hide). Portada actual: `src/app/(store)/page.tsx` + `src/components/home/*`
(hero, value-strip, segment-grid, segment-sections, height-guide, mesh-section,
services-band, new-arrivals, works-strip, price-list, quote-band, product-tile, section,
catalog-data). Hoy 100% servidor. La calculadora `/calculadora` ya honra
`?producto=<slug>&metros=<n>` en servidor (src/app/(store)/calculadora/page.tsx, ~L44-58).
`catalog-data.ts` expone `getCatalog()`, `priceFrom`, `modelCount`, `warrantyYears`,
`heightOptions`, `segmentSections`, `cheapest`. Dinero = string, `formatMoney`/`money`.

Hallazgos de auditoría que esta spec resuelve: H1-etiqueta (alta), buscador como acción
equivocada (alta), catálogo impreso 4× (alta), ritmo metrónomo (alta), calculadora
mencionada 4× con 4 nombres sin demostrarse (alta), scroll móvil 8.000px (alta), ámbar
usado 0 veces / firma al 20% (media), datos decisivos a 11px (media), pedido mínimo
escondido (media), tarjeta agropecuario→WhatsApp sin señalizar (media), doble H2 en el
cierre (baja), «Fábrica en La Chorrera» solo al fondo (media).

## Implementation Contract

### A. globals.css — tokens y utilidades nuevos (única sección que lo toca)

En `@theme` (junto a la escala tipográfica existente):
```css
--text-display: clamp(3.5rem, 2rem + 8.5vw, 7.5rem);
--text-display--line-height: 0.95;
--text-display--letter-spacing: -0.035em;
```

Tokens (en `:root` y `.dark`):
```css
:root {
  --grid-minor: oklch(1 0 0 / 0.045);   /* rejilla de lámina sobre navy */
  --grid-major: oklch(1 0 0 / 0.09);
  --cota-ink: var(--border-strong);
}
.dark { --cota-ink: var(--on-dark-soft); }
```
(La rejilla vive SOLO sobre superficies navy → las alfas blancas valen para ambos modos;
si al implementar se usa sobre superficie clara, declarar par oscuro con tinta navy.)

Utilidades en `@layer components`:
- `.sheet-grid` — papel milimetrado: dos `repeating-linear-gradient` (90deg y 0deg),
  línea menor 1px cada 24px con `var(--grid-minor)`, mayor cada 96px con `var(--grid-major)`.
  Se aplica como background del section navy, debajo del contenido.
- `.cota` — línea de dimensión: contenedor flex; línea de 1px `var(--cota-ink)` con tics
  verticales 2×9px en extremos (::before/::after), cifra central en `.tabular text-2xs
  font-bold tracking-wide` con fondo de la superficie padre (padding-inline). Variante
  `.cota-accent`: línea y cifra en `var(--brand-amber)` (ya conmuta en .dark).
- `.tape-rule` — `<input type="range">` como cinta métrica: pista de 8px con
  `repeating-linear-gradient` (marca 1px `var(--on-dark-soft)` cada 8px, marca alta cada
  40px), pulgar cuadrado 28×28 `var(--brand-green)` `var(--radius-sm)`; estilizar
  `::-webkit-slider-thumb` y `::-moz-range-thumb`; el contenedor garantiza objetivo táctil
  44px. Foco: el anillo doble global ya cubre.
- `.picket-screen` — capa sobre un contenedor de foto: listones en silueta
  `repeating-linear-gradient(90deg, var(--brand-navy-deep) 0 14px, transparent 14px 26px)`
  + dos postes de 10px en los bordes (::before/::after o borde).

Cero colores literales fuera de estas declaraciones. `--plan-*` NO SE TOCA.

### B. Hero nuevo — «el contador cotizado»

`hero.tsx` se reescribe. Composición de lámina sobre `bg-brand-navy-deep` + `.sheet-grid`,
`.shell`, py-generoso pero sin exceso (objetivo: primera pantalla completa en 390×844).

Server wrapper (el propio hero.tsx, sin "use client") recibe del page.tsx:
`{ models: {slug, name, basePrice, unit}[], priceFrom: string }` — models = los 15 del
catálogo ordenados por precio asc (derivar de `getCatalog()` en page.tsx). Renderiza:

1. Eyebrow verde: `Fabricamos e instalamos en La Chorrera, Panamá` (credencial arriba).
2. H1 (tesis, no etiqueta): `Sepa hoy cuánto cuesta cercar su terreno` — text-3xl sm:text-4xl
   lg:text-5xl font-bold tracking-tight text-on-dark text-balance.
3. Línea de contexto text-on-dark-soft: `Cercas de PVC y malla electrosoldada con el precio
   por metro delante, no después de una visita.`
4. LA CIFRA: `<HeroCounter>` (client island, archivo nuevo
   `src/components/home/hero-counter.tsx`, "use client"):
   - Cifra `$X.XX` del modelo activo en `text-display` (usar la clase Tailwind generada
     por el token; si Tailwind v4 no la expone, `text-[length:var(--text-display)]` con
     line-height/tracking inline en clase), font-bold, `.tabular`, text-on-dark. Sufijo
     `/metro` en text-xl font-medium text-brand-green a la línea base.
   - Debajo, LA COTA insignia (`.cota .cota-accent`, único ámbar de la página): cifra
     central `1 m instalado en su terreno` — la cota "mide" la cifra grande.
   - Cinta métrica: label `¿Cuántos metros tiene su lote?` (text-sm text-on-dark-soft) +
     `<input type="range" min={10} max={200} step={5} defaultValue={10}>` con `.tape-rule`
     + `<output aria-live="polite">` en vivo: `{n} m de {nombre} = ${total} de material`
     con el total en text-brand-amber… **NO**: el ámbar único ya está en la cota. El total
     va en font-bold text-on-dark `.tabular`; añadir `· pedido mínimo 10 m` en text-2xs
     text-on-dark-soft (hallazgo 10). total = basePrice(string)→Number × metros, formateado
     con `money`/`formatCurrency` existente (es UI de estimación, el server-quote sigue
     mandando en carrito).
   - Chips de modelo: fila `.scrollbar-hide` overflow-x-auto con los 15, cada chip
     `nombre · $X.XX/m` (border-hairline, bg-surface/10 sobre navy, activo:
     border-brand-green bg-brand-green/15); tocar cambia cifra y total.
   - CTAs: primario único sólido `Calcular mi cerca` (Button default, h-12) cuyo href la
     isla reescribe a `/calculadora?producto=<slug>&metros=<n>`; secundario
     `Cotizar por WhatsApp` (variant whatsapp, h-12) — dos botones, jerarquía clara
     (hallazgo 3). Sin JS: cifra del más barato server-rendered, range nativo, href
     `/calculadora?metros=10`.
   - Estado: `useState` de `metros` y `slugActivo`. Nada más. Sin fetch.
5. Franja `.picket-screen`: la foto actual del hero (misma `next/image`, `priority`)
   dentro de un contenedor h-36 sm:h-48 con la capa de listones encima; debajo, una
   `.cota` en tinta normal de ancho contenido: `así se ve un tramo instalado`.
   En móvil esta franja va DESPUÉS del bloque contador (la cifra manda).
6. El buscador SALE del hero (baja al cajetín, sección C).

Motion (una secuencia, CSS puro, keyframes en el propio módulo o globals):
pista de cinta scaleX 0→1 (250ms, --ease-out-brand), cota-accent scaleX 0→1 (a los 300ms),
picket-screen clip-path inset derecha→0 (600ms). La cifra y el H1 NO animan (LCP).
`prefers-reduced-motion` ya colapsa todo globalmente: cada animación debe terminar en el
estado de reposo.

### C. El cajetín — buscador + datos (sustituye a ValueStrip como banda post-hero)

`value-strip.tsx` se reescribe como cajetín de lámina: franja `bg-surface border-b
border-border` pegada al hero, una fila (grid móvil 2×2 → lg una línea):
- Celda 1 (la más ancha): el `<form method="get" action="/productos">` del buscador actual
  (input + botón Buscar) — misma semántica que hoy, placeholder más llano:
  `Buscar: malla, PVC, 2 m de alto…`.
- Celdas 2-4: `15 modelos` → /productos · `Garantía hasta 15 años` (warrantyYears real) ·
  `Envío gratis en todo pedido` con nota `mínimo 10 m` → /envios (hallazgo 10: con mínimo
  10 m todo pedido supera $50; decir la verdad simple).
Etiqueta `.eyebrow` + cifra `.tabular text-base font-bold` por celda; separadores
border-hairline. El dato «desde $8.50/m» NO va aquí (ya es el hero entero).

### D. La pizarra — PriceList asciende a posición 3

`price-list.tsx`: sube en page.tsx justo tras el cajetín. Retoques:
- Remate superior `.picket-rule`; eyebrow `Sin llamar, sin esperar`.
- Marco de lámina: `border border-border` + `outline outline-1 outline-border/50
  outline-offset-[3px]` en el contenedor de la tabla.
- Cada fila gana enlace `Calcular →` a `/calculadora?producto=<slug>` (text-brand-green-deep
  text-sm, celda final; en móvil puede ser la fila entera clicable manteniendo el enlace
  del nombre).
- En móvil el precio pasa a celda dominante: font-bold text-brand-green-deep text-base.
- Pierde `defer-paint` (queda cerca del viewport).
- El aviso de pedido mínimo se mantiene bajo la tabla pero sube a text-sm.

### E. Guía de alturas dibujada — la pieza editorial (posición 4)

`height-guide.tsx`: sobre navy + `.sheet-grid` (el respiro oscuro central). Cada una de las
tres franjas se DIBUJA a escala: columna con un alzado CSS (misma gramática que
`.diagram-picket`: gradientes repetidos, sin imágenes) cuya altura es proporcional al tope
de la franja — 1.5m→h-24, 2.1m→h-32, 3.0m→h-44 aprox — con `.cota` VERTICAL al lado
rotulando el rango real de `heightOptions` (escribir la variante de cota vertical en el
componente con las mismas piezas: línea 1px de alto completo + tics horizontales).
Una línea de referencia horizontal cruza las tres columnas rotulada
`1.70 m · altura de una persona` (borde dashed border-hairline + label text-2xs).
Las listas de modelos+precio de cada franja se conservan bajo cada alzado, con el precio
en text-sm (nunca 2xs, hallazgo 13).

### F. Comprar por uso — deduplicado (posición 5)

- `segment-grid.tsx`: las 5 tarjetas se retratan como fichas de tramo: alzado
  `.diagram-picket`/`.diagram-mesh` + marcas de esquina en L (::before border-l border-t),
  precio `desde $X/m` como mini-`.cota` en text-sm (no 2xs). En móvil: lista vertical de
  filas (icono+nombre+precio), no grid con huérfano (hallazgo 14). La tarjeta Agropecuario
  (sin modelos → WhatsApp) se diferencia: borde dashed + icono WhatsApp visible + verbo
  `Cotizar agropecuario por WhatsApp` (hallazgo 9).
- `segment-sections.tsx`: cada segmento muestra **3 fichas + ViewAllTile** (hoy 7+1) —
  `cheapest(seg.products, 3)` o slice equivalente; separador entre segmentos =
  `.picket-rule` (el separador ES un tramo de cerca). Esto y la pizarra ascendida matan
  la cuádruple impresión del catálogo (hallazgo 5) y bajan el scroll móvil (hallazgo 12).

### G. Resto del recorrido

- `mesh-section.tsx`: cabecera con fondo `.mesh-rule` sutil (una franja fina, no toda la
  sección). Sin más cambios.
- `services-band.tsx`: intacta salvo nomenclatura (H).
- `new-arrivals.tsx` / `works-strip.tsx`: intactos (condicionales, hoy no pintan).
- `quote-band.tsx`: cierre en navy + `.sheet-grid` (el perímetro se cierra donde se abrió).
  UN solo H2: `¿Ya sabe cuántos metros tiene?`; dos salidas como respuesta:
  `Sí → Calcular mi cerca` (primario, /calculadora) y `No → Pedir inspección en sitio`
  (outline, /inspecciones) + WhatsApp y el teléfono escrito tal cual. `.picket-rule` de
  remate se conserva.
- `page.tsx` — orden final: Hero · Cajetín · Pizarra · Alturas · Usos(grid) ·
  Usos(secciones reducidas) · Malla · Servicios · Novedades(cond) · Obras(cond) · Cierre.
  Actualizar el comentario-mapa del archivo. `revalidate = 3600` se mantiene.

### H. Un solo nombre para la calculadora (hallazgo 8)

Toda referencia en la PORTADA usa el mismo verbo: **`Calcular mi cerca`** (hero, pizarra
usa `Calcular →` por fila que es forma corta aceptada, services-band, quote-band).
No tocar otras páginas.

## Files to Create / Modify
- Modificar: `src/app/globals.css` (SOLO lo del contrato A)
- Crear: `src/components/home/hero-counter.tsx` (client island)
- Modificar: `src/components/home/hero.tsx`, `value-strip.tsx`, `price-list.tsx`,
  `height-guide.tsx`, `segment-grid.tsx`, `segment-sections.tsx`, `mesh-section.tsx`,
  `quote-band.tsx`, `services-band.tsx` (solo etiqueta CTA), `src/app/(store)/page.tsx`
- PROHIBIDO tocar: `components/layout/`, `components/shared/`, `product-tile.tsx` (se usa
  tal cual), `section.tsx` (se usa tal cual), `catalog-data.ts` (solo lectura),
  `works-strip.tsx`, `new-arrivals.tsx`, cualquier ruta fuera de la portada, tokens
  `--plan-*`.

## Required Tests
1. Capacidades conservadas (grep sobre el árbol de portada): el form GET de búsqueda
   existe con action a productos; enlaces a /calculadora, /inspecciones, /instaladores,
   wa.me presentes; PriceList sigue siendo `<table>` con caption; teléfono escrito en el
   cierre; `heightOptions` y `segmentSections` siguen consumiéndose.
2. Ámbar único: `grep -c "cota-accent\|brand-amber" src/components/home/*.tsx` → el ámbar
   aparece en UN solo componente (hero). 0 usos de brand-amber en el resto de la portada.
3. Isla mínima: `grep -l '"use client"' src/components/home/*.tsx` → SOLO
   hero-counter.tsx. hero.tsx sin "use client".
4. Deduplicación: en `segment-sections.tsx` ningún render de más de 3 ProductTile por
   segmento (verificable por el argumento del slice/cheapest).
5. Sin literales: grep de paleta Tailwind literal y de hex en `src/components/home/` y en
   los diffs de globals.css (fuera de las declaraciones del contrato A) → vacío.
6. Contrato de la calculadora intacto: `git diff --quiet -- "src/app/(store)/calculadora"`.
7. `--plan-*` intacto: `git diff src/app/globals.css | grep -c "plan-"` → 0.

## Acceptance Criteria
- `npx tsc --noEmit` limpio; `npx eslint` limpio sobre los archivos tocados.
- Sin JS deshabilitado la portada sigue mostrando cifra, cinta (range nativo) y enlaces
  server-rendered válidos.
- El H1 ya no es «Cercas de PVC y malla electrosoldada»; esa frase vive en el eyebrow o
  línea de contexto.
- La foto del hero actual sigue en el primer viewport (dentro de .picket-screen).
- Ninguna sección/capacidad eliminada; NewArrivals y WorksStrip conservan su condición.

## Verification Commands
```
npx tsc --noEmit
npx eslint src/components/home src/app/\(store\)/page.tsx src/app/globals.css 2>/dev/null || npm run lint
grep -rnE "(bg|text|border)-(gray|slate|zinc|red|yellow|blue)-[0-9]{2,3}" src/components/home --include='*.tsx'
git diff --quiet -- "src/app/(store)/calculadora" && echo CALC-OK
```
NO correr `npm run build` (necesita la API real; el symlink de node_modules rompe Turbopack).
