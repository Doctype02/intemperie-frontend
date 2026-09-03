# Spec: Portada — preservación del rediseño y dos secciones nuevas (servicios y obras)

## Metadata

- developer_type: agent
- estimated_complexity: baja
- languages: TypeScript (TSX)
- depends_on: 01-foundation (fusionada)
- files_shared_with_others: ninguno (solo esta spec toca `src/components/home/*` y `src/app/(store)/page.tsx`)

## Objective

La portada ya está rediseñada al sistema «Perímetro» y **no se reabre**: hero con búsqueda, `ValueStrip` (datos contados del catálogo), `SegmentGrid`, `SegmentSections`, `HeightGuide`, `MeshSection`, `NewArrivals` (condicionada al dato), `PriceList`, `QuoteBand`. Esta spec añade lo único que le falta del estándar e-commerce sin violar la regla de «datos verificables»: una **banda de servicios** (calculadora, inspección en sitio, programa de instaladores — tres rutas reales que hoy solo viven en la nav) y una **franja de obras entregadas** condicionada al dato real (`PROJECTS` de `/nosotros`), que hoy está vacío y por tanto no pinta nada hasta que exista.

**Prohibido**: reintroducir la banda de stats del hero («Desde $8.50/metro…» sobre el buscador — regla dura #9). `ValueStrip` no es esa banda y se queda tal cual.

## Context

- `src/app/(store)/page.tsx` (90 líneas): servidor puro, `revalidate = 3600`, orden actual de secciones (líneas 60–88):

```tsx
<div id="main-content" tabIndex={-1}>
  <Hero />
  <ValueStrip modelCount={...} priceFrom={...} warrantyYears={...} />
  <SegmentGrid segments={segmentCards(catalog)} />
  <SegmentSections sections={segmentSections(catalog)} />
  <HeightGuide bands={heightBands(catalog)} />
  <MeshSection products={meshes(catalog)} />
  <NewArrivals products={newArrivals(catalog, 7)} />
  <PriceList products={cheapest(catalog, catalog.length)} />
  <QuoteBand />
</div>
```

- Contrato de sección: `Section` y `SectionHeader` en `src/components/home/section.tsx` (surface `base | raised | sunk | navy`, header con eyebrow/título/sub/«Ver todo»). **Toda sección nueva los usa.**
- `.defer-paint` (globals.css): se aplica a toda sección bajo el pliegue (todas las de esta spec).
- Obras: `src/app/nosotros/content.ts` exporta `PROJECTS: Project[]` (hoy `= []`, línea 157) con `{ location, deliveredOn, meters?, model, modelHref?, image: { src, alt } }`; `/nosotros` los pinta en `Section id="obras"`. `monthLabel` vive en `src/app/nosotros/page.tsx` (no exportado — no depender de él; formatear localmente).
- Ninguna sección de la portada es de cliente; las nuevas tampoco pueden serlo.
- `src/app/nosotros/content.ts` es propiedad de la spec 06: **aquí solo se importa, no se modifica.**

## Implementation Contract

### Sección por sección — lo que existe hoy queda EXACTAMENTE igual

`Hero`, `ValueStrip`, `SegmentGrid`, `SegmentSections`, `HeightGuide`, `MeshSection`, `NewArrivals`, `PriceList`, `QuoteBand`: **cero cambios de código**. Cualquier diff en `hero.tsx`, `value-strip.tsx`, `segment-grid.tsx`, `segment-sections.tsx`, `height-guide.tsx`, `mesh-section.tsx`, `new-arrivals.tsx`, `price-list.tsx`, `quote-band.tsx`, `product-tile.tsx`, `section.tsx`, `catalog-data.ts` invalida la implementación.

### A. `src/components/home/services-band.tsx` — NUEVO (servidor)

Tres tarjetas-enlace, una por servicio real. Sin props (datos estáticos internos):

```ts
const SERVICES = [
  { href: "/calculadora",  Icon: Calculator,     title: "Precotizador",
    body: "Modelo + metros = total con ITBMS, con los precios del catálogo. Sin dejar el correo.",
    cta: "Calcular mi cerca" },
  { href: "/inspecciones", Icon: ClipboardList,  title: "Inspección en sitio",
    body: "Un técnico levanta el terreno, dibuja el plano y confirma la medida antes de comprar.",
    cta: "Solicitar inspección" },
  { href: "/instaladores", Icon: HardHat,        title: "Programa de instaladores",
    body: "Precio de instalador y despacho con prioridad para quien monta cercas por oficio.",
    cta: "Conocer el programa" },
]
```

(Iconos de `lucide-react`, ya en el bundle.) Markup:

```tsx
export function ServicesBand() {
  return (
    <section className="defer-paint border-b border-border bg-surface">
      <div className="shell py-8 sm:py-10 lg:py-12">
        <SectionHeader
          eyebrow="Más que material"
          title="Tres maneras de empezar"
          sub="Calcule solo, pida que midan por usted, o instale con nosotros si es su oficio."
        />
        <ul className="grid gap-3 sm:grid-cols-3">
          {SERVICES.map(({ href, Icon, title, body, cta }) => (
            <li key={href}>
              <Link href={href}
                className="group flex h-full flex-col rounded-xl border border-border bg-surface-sunk p-5 transition-colors hover:border-brand-green">
                <span className="flex size-11 items-center justify-center rounded-lg bg-secondary">
                  <Icon className="size-5 text-secondary-foreground" aria-hidden="true" />
                </span>
                <h3 className="mt-3 text-base font-bold text-foreground group-hover:text-brand-green-deep">{title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{body}</p>
                <span className="mt-auto inline-flex items-center gap-1 pt-4 text-sm font-semibold text-brand-green-deep">
                  {cta}<ChevronRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
```

El texto de `body` de instaladores usa las palabras exactas de los beneficios ya publicados en `src/app/instaladores/content.ts` («Precio de instalador», «Despacho con prioridad») — nada de promesas nuevas.

### B. `src/components/home/works-strip.tsx` — NUEVO (servidor, condicionado al dato)

```tsx
import { PROJECTS } from "@/app/nosotros/content"   // solo lectura
```

- Si `PROJECTS.length < 2`: `return null` (hoy: no pinta nada). Mismo criterio que `NewArrivals`.
- Si hay datos: `Section`-like con `defer-paint border-b border-border bg-surface-sunk`, `SectionHeader` con `eyebrow="Obras entregadas"`, `title="Cercas que ya están en pie"`, `href="/nosotros#obras"`, `linkLabel="Ver todas las obras"`; lista horizontal desplazable `<ul className="scrollbar-hide -mx-gutter flex snap-x gap-3 overflow-x-auto px-gutter pb-1">` con tarjetas `w-64 shrink-0 snap-start`: imagen `aspect-[4/3]` con `next/image` (`sizes="256px"`, `loading="lazy"`), pie con `location` (`text-sm font-semibold text-foreground`), mes de entrega + metros en `text-xs text-muted-foreground tabular` (formato `Entregada en <mes año> · <n> m`, mes con `new Intl.DateTimeFormat("es-PA", { month: "long", year: "numeric" })` sobre `deliveredOn`), y el `model` enlazado a `modelHref` cuando exista.
- Fotos sin `preload`: sección bajo el pliegue.

### C. `src/app/(store)/page.tsx` — MODIFICAR (solo insertar)

Insertar en este orden (diff mínimo, el resto de líneas intactas):

```tsx
<MeshSection products={meshes(catalog)} />
<ServicesBand />                                {/* ← nuevo */}
<NewArrivals products={newArrivals(catalog, 7)} />
<PriceList products={cheapest(catalog, catalog.length)} />
<WorksStrip />                                  {/* ← nuevo, hoy no pinta */}
<QuoteBand />
```

Con los imports correspondientes. `revalidate = 3600` no cambia.

## Files to Create / Modify

Crear:
- `/home/nothing/deploy/intemperie-frontend/src/components/home/services-band.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/components/home/works-strip.tsx`

Modificar:
- `/home/nothing/deploy/intemperie-frontend/src/app/(store)/page.tsx` (solo 2 imports + 2 líneas JSX)

Prohibido tocar: el resto de `src/components/home/*`, `src/app/nosotros/content.ts`, `globals.css`.

## Required Tests

Desde `/home/nothing/deploy/intemperie-frontend`:

1. **Ninguna sección existente se borró ni se reordenó fuera del contrato**
   ```bash
   python3 - <<'EOF'
   src = open("src/app/(store)/page.tsx").read()
   order = ["<Hero", "<ValueStrip", "<SegmentGrid", "<SegmentSections", "<HeightGuide",
            "<MeshSection", "<ServicesBand", "<NewArrivals", "<PriceList", "<WorksStrip", "<QuoteBand"]
   pos = [src.index(t) for t in order]          # lanza ValueError si falta alguna
   assert pos == sorted(pos), "orden roto: " + str(list(zip(order, pos)))
   print("OK")
   EOF
   ```
   Esperado: `OK`.

2. **Los componentes de portada existentes no cambiaron**
   ```bash
   git diff --name-only -- src/components/home | grep -vE "services-band|works-strip" ; echo "exit=$?"
   ```
   Esperado: `exit=1` (solo los dos archivos nuevos aparecen en el diff de home/).

3. **La banda de servicios enlaza a las tres rutas reales y usa el contrato de sección**
   ```bash
   grep -q 'href="/calculadora"\|"/calculadora"' src/components/home/services-band.tsx \
   && grep -q '"/inspecciones"' src/components/home/services-band.tsx \
   && grep -q '"/instaladores"' src/components/home/services-band.tsx \
   && grep -q "SectionHeader" src/components/home/services-band.tsx \
   && grep -q "defer-paint" src/components/home/services-band.tsx
   ```
   Esperado: exit 0.

4. **WorksStrip es condicional al dato y hoy no pinta**
   ```bash
   grep -q "PROJECTS.length < 2" src/components/home/works-strip.tsx \
   && grep -q "return null" src/components/home/works-strip.tsx \
   && ! grep -q '"use client"' src/components/home/works-strip.tsx
   ```
   Esperado: exit 0.

5. **No se reintrodujo la banda de stats del hero**
   ```bash
   git diff -- src/components/home/hero.tsx | wc -l
   ```
   Esperado: `0`.

6. **Sin colores literales en lo tocado**
   ```bash
   grep -rnE "(bg|text|border)-(gray|green|red|blue|amber|yellow)-[0-9]{2,3}|#[0-9a-fA-F]{3,6}\b" \
     src/components/home/services-band.tsx src/components/home/works-strip.tsx "src/app/(store)/page.tsx"
   ```
   Esperado: sin salida.

## Acceptance Criteria

- [ ] Tests 1–6 pasan.
- [ ] `npx tsc --noEmit` y `npm run lint` limpios.
- [ ] Las dos secciones nuevas son componentes de servidor (sin `"use client"`, sin hooks) y llevan `defer-paint`.
- [ ] Con `PROJECTS = []` (estado actual) la portada renderiza exactamente una sección más que antes (la banda de servicios).

## Verification Commands

```bash
cd /home/nothing/deploy/intemperie-frontend
npx tsc --noEmit
npm run lint
grep -rn "#[0-9a-fA-F]\{3,6\}" src/components/home --include=*.tsx   # vacío
```

> **ADVERTENCIA**: NO correr `npm run build` (necesita la API real; el symlink de node_modules rompe Turbopack). Tipos con `npx tsc --noEmit`.
