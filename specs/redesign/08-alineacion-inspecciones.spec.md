# Spec: Inspecciones — alineación mínima (NO es un rediseño)

## Metadata

- developer_type: agent
- estimated_complexity: trivial
- languages: TypeScript (TSX)
- depends_on: ninguna (autónoma; no usa componentes de 01)
- files_shared_with_others: ninguno (dueño único de `src/app/(store)/inspecciones/`, `src/app/admin/inspecciones/`, `src/components/inspecciones/*`)

## Objective

`/inspecciones` y `/admin/inspecciones` acaban de rediseñarse (PRs #45–#49) y el dueño **ya las aprobó**. Esta spec NO las rediseña: hace exactamente dos micro-alineaciones tipográficas para que sus `h1` usen la misma escala que el resto de la tienda rediseñada, y deja por escrito la lista de prohibiciones y verificaciones. Si cualquiera de los dos cambios provocara un efecto visual mayor que el descrito, la acción correcta es **no hacerlo** y dejar la página como está.

## Context

- `src/app/(store)/inspecciones/page.tsx` (336 líneas): servidor + islas (`PlanoEditor`, `ConsultasBox`). Usa `shell max-w-[100rem]` (constante local `MEDIDA` — decisión deliberada para el lienzo del plano: **se conserva**). Cabecera actual (líneas 133–137):

```tsx
<p className="eyebrow text-brand-green">Inspección en sitio</p>
…
<h1 className="mt-1 text-2xl font-bold text-foreground">Solicitar inspección</h1>
```

- `src/app/admin/inspecciones/page.tsx` (493 líneas): ficha imprimible con firmas y plano. Cabecera (líneas 207–211):

```tsx
<p className="eyebrow flex items-center gap-1.5 text-brand-green">…</p>
<h1 className="mt-1 text-2xl font-bold text-foreground">Ficha de inspección</h1>
```

- Escala de referencia del resto de páginas rediseñadas: `text-2xl font-bold text-foreground sm:text-3xl` (listado de catálogo, cuenta tras 05).
- **Regla dura #2**: los tokens `--plan-*` viven SOLO en `:root` a propósito (el plano se exporta con `toDataURL` y se imprime; si siguieran el tema oscuro, la hoja llegaría en blanco a la obra). Viven en `globals.css` y se usan via `bg-plan-paper` etc. en estas dos páginas y en `src/components/inspecciones/*` — **intocables**.
- Los estilos `print:*` de la ficha admin y el lienzo (`use-canvas.ts`, `plano-editor.tsx`, `plan-palette.ts`, `moldes.ts`) — **intocables**.

## Implementation Contract

### A. `src/app/(store)/inspecciones/page.tsx` — 1 cambio

- Hoy: `<h1 className="mt-1 text-2xl font-bold text-foreground">Solicitar inspección</h1>`
- Queda: `<h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Solicitar inspección</h1>`

Nada más en el archivo.

### B. `src/app/admin/inspecciones/page.tsx` — 1 cambio

- Hoy: `<h1 className="mt-1 text-2xl font-bold text-foreground">Ficha de inspección</h1>`
- Queda: `<h1 className="mt-1 text-2xl font-bold text-foreground sm:text-3xl">Ficha de inspección</h1>`

Nada más en el archivo.

### C. Prohibiciones explícitas (parte del contrato)

1. Cero cambios en `src/components/inspecciones/*`.
2. Cero cambios en `globals.css`; los `--plan-*` ni se leen distinto ni se redeclaran.
3. No sustituir `MEDIDA = "shell max-w-[100rem]"` por `.shell` a secas.
4. No adoptar `PageHeader`/`Breadcrumbs` de la spec 01 aquí: cambiaría markup aprobado.
5. No tocar bloques `print:*`, firmas, ni el `<canvas>`.

### D. Verificación de alineación (checklist, sin código)

Confirmar por lectura que ambas páginas ya cumplen el sistema (lo cumplen — dejar constancia en el PR): tokens sin literales, `.eyebrow`, `.shell`, foco visible, objetivos táctiles 44 px, enlaces de nav intactos (`/inspecciones` en `NAV_LINKS` y en `accountLinks`; `/admin/inspecciones` en el sidebar).

## Files to Create / Modify

Modificar (una línea cada uno):
- `/home/nothing/deploy/intemperie-frontend/src/app/(store)/inspecciones/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/admin/inspecciones/page.tsx`

## Required Tests

Desde `/home/nothing/deploy/intemperie-frontend`:

1. **Los dos h1 quedaron en la escala del sistema y con su texto exacto**
   ```bash
   grep -q 'text-2xl font-bold text-foreground sm:text-3xl">Solicitar inspección</h1>' "src/app/(store)/inspecciones/page.tsx" \
   && grep -q 'text-2xl font-bold text-foreground sm:text-3xl">Ficha de inspección</h1>' src/app/admin/inspecciones/page.tsx
   ```
   Esperado: exit 0.

2. **El diff es mínimo: exactamente 2 líneas cambiadas en total, en 2 archivos**
   ```bash
   git diff --numstat -- "src/app/(store)/inspecciones/page.tsx" src/app/admin/inspecciones/page.tsx \
     | awk '{a+=$1; d+=$2; n+=1} END { exit !(a==2 && d==2 && n==2) }'
   ```
   Esperado: exit 0 (2 añadidas, 2 borradas, 2 archivos).

3. **Componentes del plano y tokens de papel intactos**
   ```bash
   git diff --quiet -- src/components/inspecciones src/app/globals.css \
   && grep -q -- "--plan-paper: oklch(1 0 0)" src/app/globals.css \
   && grep -q "bg-plan-paper" src/app/admin/inspecciones/page.tsx
   ```
   Esperado: exit 0.

4. **Nada aprobado se perdió**
   ```bash
   grep -q "Solicitar inspección" "src/app/(store)/inspecciones/page.tsx" \
   && grep -q "Cómo funciona" "src/app/(store)/inspecciones/page.tsx" \
   && grep -q 'shell max-w-\[100rem\]' "src/app/(store)/inspecciones/page.tsx" \
   && grep -q "Datos del cliente" src/app/admin/inspecciones/page.tsx \
   && grep -q "Firmas" src/app/admin/inspecciones/page.tsx \
   && grep -q "Materiales y especificaciones" src/app/admin/inspecciones/page.tsx
   ```
   Esperado: exit 0.

## Acceptance Criteria

- [ ] Tests 1–4 pasan; `npx tsc --noEmit` y `npm run lint` limpios.
- [ ] El diff total de esta spec son 2 líneas.
- [ ] El plano imprimible sigue saliendo en tinta sobre papel con el tema oscuro activado (garantizado por no tocar `--plan-*` — test 3).

## Verification Commands

```bash
cd /home/nothing/deploy/intemperie-frontend
npx tsc --noEmit
npm run lint
git diff --stat -- "src/app/(store)/inspecciones" src/app/admin/inspecciones src/components/inspecciones
```

> **ADVERTENCIA**: NO correr `npm run build` (necesita la API real; el symlink de node_modules rompe Turbopack). Tipos con `npx tsc --noEmit`.
