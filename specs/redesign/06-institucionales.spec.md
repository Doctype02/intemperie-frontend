# Spec: Institucionales — las cuatro legales al sistema con densidad editorial; nosotros e instaladores se preservan

## Metadata

- developer_type: agent
- estimated_complexity: media
- languages: TypeScript (TSX)
- depends_on: 01-foundation (usa `LegalPage` de `@/components/shared/legal-page`)
- files_shared_with_others: ninguno (dueño único de `src/app/nosotros/**`, `instaladores/**`, `envios/`, `devoluciones/`, `privacidad/`, `terminos/`)

## Objective

Dos realidades distintas en este grupo:

1. **`/nosotros` y `/instaladores` (+ `/instaladores/registro`) ya son Perímetro** y — importante — la queja repetida del dueño («mucho espacio disponible mal aprovechado») **ya está corregida ahí**, con comentarios en el código que documentan la corrección (p. ej. en `instaladores/page.tsx`: «Requisitos y cómo funciona, en paralelo … la mitad derecha de la pantalla quedaba en blanco de arriba abajo» y el cierre a dos columnas). Estas tres páginas se **verifican y no se tocan**.
2. **Las cuatro legales (`/envios`, `/devoluciones`, `/privacidad`, `/terminos`) son legado puro**: `bg-gray-950`, `text-green-400`, `prose prose-gray`, sin modo oscuro, y una columna de `max-w-3xl` que en escritorio deja dos tercios de la pantalla vacíos — la misma queja del dueño, sin corregir. Se reescriben sobre `LegalPage` (spec 01): banda navy de título + **índice lateral sticky en escritorio** (la columna vacía pasa a ser navegación) + prosa tokenizada. **Ni una sección de contenido se pierde: los `h2` actuales se conservan con su texto exacto.**

## Context

- `LegalPage` (tras 01, `src/components/shared/legal-page.tsx`): props `{ eyebrow, title, updated, intro?, sections: LegalSection[], footer? }`; `LegalSection = { id, title, children }`. Pinta cabecera navy con `.picket-rule`, grid `lg:grid-cols-[14rem_minmax(0,42rem)]` con índice «En esta página» sticky, secciones con `id` y `scroll-mt-24`.
- Las cuatro legales importan hoy `Header`/`Footer` directamente (viven fuera de `(store)`) y renderizan su propio `<main id="main-content" className="flex-1 bg-white">`. Ese armazón se conserva (Header/Footer + `<main id="main-content" className="flex-1">`, ahora sin `bg-white` — el fondo lo pone `bg-background` del body) y dentro va `<LegalPage …/>`.
- Contenido real a conservar (títulos `h2` exactos, verificados):
  - **envios** (`src/app/envios/page.tsx`, 112 líneas): h1 «Política de Envíos», «Última actualización: mayo 2026», grid de 4 hechos (Envío gratis +$50 / 1–3 días hábiles / Todo Panamá / Empaque seguro), secciones «1. Cobertura de envío», «2. Costos de envío» (con caja destacada «Envío GRATIS en pedidos mayores a $50.00» y la lista de tarifas), «3. Tiempos de entrega», «4. Proceso de entrega», «5. Retiro en almacén» (con la tarjeta de dirección y horario), «6. Contacto»; pie con enlaces a `/productos` y `/devoluciones`.
  - **devoluciones** (123 líneas): h1 «Política de Devoluciones», secciones «1. Plazo para devoluciones» … «5. Costos de devolución» (5 h2).
  - **privacidad** (102 líneas): h1 «Política de Privacidad», secciones «1. Responsable del tratamiento» … «8. Seguridad» (8 h2).
  - **terminos** (93 líneas): h1 «Términos y Condiciones», secciones «1. Aceptación» … «8. Contacto» (8 h2).
- Datos de contacto: usar `CONTACT` y `whatsappHref`/`WA_MESSAGE` de `src/components/layout/nav-data.ts` + `@/components/ui/icon-whatsapp` donde el texto actual escribe el número a mano (`wa.me/50762874042` → `whatsappHref(WA_MESSAGE.general)`, correo → `CONTACT.emailHref`). El texto visible no cambia.
- `/nosotros`: 753 líneas, servidor, secciones hero / qué hacemos / esencia / quién le atiende / respaldo / obras entregadas (`PROJECTS`, hoy `[]`, con sustituto honesto) / testimonios (condicional) / programa de instaladores / cierre con contacto. `/instaladores`: hero, nota de contratación, beneficios 4-col, requisitos+proceso en paralelo, FAQ 3-col, cierre 2-col. `/instaladores/registro`: formulario largo con aside. **La spec 02 importa `PROJECTS` de `src/app/nosotros/content.ts` — este archivo no se modifica aquí** (si algún día se cargan obras, se hace fuera de este rediseño).

## Implementation Contract

### A. `/nosotros`, `/instaladores`, `/instaladores/registro` — SIN CAMBIOS

`git diff` vacío en `src/app/nosotros/**` y `src/app/instaladores/**`. La verificación (checklist, no código): siguen usando `.shell`, `Section`/`SectionHead` locales, tokens, y las correcciones de densidad comentadas en el propio código.

### B. `/envios` — reescritura sobre `LegalPage`

```tsx
<Header />
<main id="main-content" className="flex-1">
  <LegalPage
    eyebrow="Información de envío"
    title="Política de Envíos"
    updated="Última actualización: mayo 2026"
    intro={<KeyFacts />}   // el grid de 4 hechos actual, tokenizado (ver abajo)
    sections={SECTIONS}    // las 6 secciones actuales, texto intacto
    footer={<FooterCtas />} // Ver productos (Button default) + Política de devoluciones (Button outline)
  />
</main>
<Footer />
```

- `KeyFacts`: `grid grid-cols-2 gap-4 sm:grid-cols-4`, celdas `rounded-xl border border-border bg-surface-2 p-4 text-center`, icono `size-6 text-brand-green`, título `text-sm font-bold text-foreground`, sub `text-xs text-muted-foreground`. Los cuatro hechos actuales, texto intacto.
- Cajas destacadas dentro de secciones: la de envío gratis → `rounded-xl border border-brand-green/35 bg-brand-green-soft p-4` con `font-bold text-brand-green-deep`; la tarjeta de retiro en almacén → `rounded-xl bg-surface-2 p-4` con el horario en `font-medium text-brand-green-deep`.
- Los `id` de sección: `cobertura`, `costos`, `tiempos`, `proceso`, `retiro`, `contacto`.
- Enlaces de contacto: `whatsappHref(WA_MESSAGE.general)` y `CONTACT.emailHref`; texto visible igual que hoy (`+507 6287-4042`, `ventas@intemperie.com`).

### C. `/devoluciones`, `/privacidad`, `/terminos` — mismo contrato que B

- devoluciones: eyebrow «Garantía de compra», ids `plazo`, `condiciones`, `proceso`, `reembolso`, `costos`; pie con enlaces a `/envios` y `/productos` (los actuales; si hoy no hay pie de CTAs, crear con esos dos destinos).
- privacidad: eyebrow «Tus datos», ids `responsable`, `datos`, `finalidad`, `base-legal`, `conservacion`, `derechos`, `cookies`, `seguridad`.
- terminos: eyebrow «Condiciones de uso», ids `aceptacion`, `productos-precios`, `compra`, `garantias`, `propiedad`, `responsabilidad`, `ley`, `contacto`.
- En los tres: cada `h2` conserva su texto actual **carácter a carácter** (incluida la numeración «1. …»); listas `list-disc pl-5` se conservan; `<strong>` → `font-semibold text-foreground`.

### D. Coherencia de datos (solo presentación, contenido intacto)

El contenido actual de `/envios` dice «6 provincias» en un hecho y «10 provincias» es lo que dice la portada (`ValueStrip`). **No** corregir textos por iniciativa propia: esta spec es de presentación. Dejar el texto tal cual y añadir un comentario `{/* TODO contenido: revisar «6 provincias» vs cobertura real — decisión del dueño */}` junto al hecho.

## Files to Create / Modify

Modificar:
- `/home/nothing/deploy/intemperie-frontend/src/app/envios/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/devoluciones/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/privacidad/page.tsx`
- `/home/nothing/deploy/intemperie-frontend/src/app/terminos/page.tsx`

Sin crear archivos (los helpers `KeyFacts`/`SECTIONS` viven como funciones/constantes locales de cada page.tsx). Prohibido tocar: `src/app/nosotros/**`, `src/app/instaladores/**`, `src/components/shared/legal-page.tsx`, `src/components/layout/**`, `globals.css`.

## Required Tests

Desde `/home/nothing/deploy/intemperie-frontend`:

1. **Ningún h2 legal se perdió (conteo y texto)**
   ```bash
   python3 - <<'EOF'
   import re
   want = {
     "src/app/envios/page.tsx": ["1. Cobertura de envío","2. Costos de envío","3. Tiempos de entrega","4. Proceso de entrega","5. Retiro en almacén","6. Contacto"],
     "src/app/devoluciones/page.tsx": ["1. Plazo para devoluciones","2. Condiciones para devolución","3. Proceso de devolución","4. Métodos de reembolso","5. Costos de devolución"],
     "src/app/privacidad/page.tsx": ["1. Responsable del tratamiento","2. Datos que recopilamos","3. Finalidad del tratamiento","4. Base legal","5. Conservación de datos","6. Sus derechos","7. Cookies","8. Seguridad"],
     "src/app/terminos/page.tsx": ["1. Aceptación","2. Productos y precios","3. Proceso de compra","4. Garantías","5. Propiedad intelectual","6. Limitación de responsabilidad","7. Ley aplicable","8. Contacto"],
   }
   for f, titles in want.items():
       src = open(f).read()
       missing = [t for t in titles if t not in src]
       assert not missing, f"{f}: faltan {missing}"
   print("OK")
   EOF
   ```
   Esperado: `OK`.

2. **Las cuatro usan LegalPage y conservan h1 y fecha**
   ```bash
   for f in envios devoluciones privacidad terminos; do
     grep -q "LegalPage" "src/app/$f/page.tsx" || exit 1
   done \
   && grep -q "Política de Envíos" src/app/envios/page.tsx \
   && grep -q "Política de Devoluciones" src/app/devoluciones/page.tsx \
   && grep -q "Política de Privacidad" src/app/privacidad/page.tsx \
   && grep -q "Términos y Condiciones" src/app/terminos/page.tsx
   ```
   Esperado: exit 0.

3. **Colores literales fuera de las cuatro legales**
   ```bash
   grep -rnE "(bg|text|border)-(gray|green|red|blue|amber|yellow)-[0-9]{2,3}|#[0-9a-fA-F]{3,6}\b" \
     src/app/envios src/app/devoluciones src/app/privacidad src/app/terminos --include=*.tsx
   ```
   Esperado: sin salida.

4. **nosotros e instaladores intactos**
   ```bash
   git diff --quiet -- src/app/nosotros src/app/instaladores
   ```
   Esperado: exit 0.

5. **Contacto centralizado: el número ya no está escrito a mano en las legales**
   ```bash
   ! grep -rn "wa.me/50762874042" src/app/envios src/app/devoluciones src/app/privacidad src/app/terminos \
   && grep -q "nav-data" src/app/envios/page.tsx
   ```
   Esperado: exit 0.

## Acceptance Criteria

- [ ] Tests 1–5 pasan; `npx tsc --noEmit` y `npm run lint` limpios.
- [ ] En `lg`, cada legal muestra el índice «En esta página» sticky a la izquierda con anclas funcionales a cada sección (los `id` del contrato) — el espacio antes vacío ahora navega.
- [ ] En claro y oscuro las cuatro se leen con contraste del sistema (sin `bg-white`/`bg-gray-950`).
- [ ] Header y Footer siguen presentes en las cuatro; `id="main-content"` conservado.

## Verification Commands

```bash
cd /home/nothing/deploy/intemperie-frontend
npx tsc --noEmit
npm run lint
grep -rn "#[0-9a-fA-F]\{3,6\}" src/app/envios src/app/devoluciones src/app/privacidad src/app/terminos --include=*.tsx   # vacío
```

> **ADVERTENCIA**: NO correr `npm run build` (necesita la API real; el symlink de node_modules rompe Turbopack). Tipos con `npx tsc --noEmit`.
