#!/usr/bin/env bash
#
# Mide el tiempo de entrega del HTML de las rutas críticas de la tienda.
#
#   ./scripts/measure-perf.sh [base_url] [etiqueta]
#
# Reporta, por ruta, la MEDIANA de N repeticiones (RUNS=5 por defecto) de:
#   - time_starttransfer (TTFB): cuánto tarda el servidor en emitir el primer byte.
#   - time_total: descarga completa del documento.
#
# OJO: curl sólo mide la entrega del HTML. No captura el coste de hidratación ni
# los overlays de cliente, que es donde estaba el grueso de la lentitud percibida
# (ver el overlay de carga que bloqueaba la página hasta 8s). Para el antes/después
# de esa parte hay que mirar el render en navegador, no estos números.
#
# ── Línea base tomada en producción (2026-08-29, antes de los cambios) ────────
#   Ruta                        TTFB      Total     Cache-Control
#   /                           0.259 s   0.350 s   s-maxage=3600 (x-nextjs-cache: HIT)
#   /productos                  0.291 s   0.550 s   private, no-cache, no-store
#   /productos/cerca-pvc-atlas  0.293 s   0.383 s   private, no-cache, no-store
#
# En el build, /productos, /productos/[slug], /categorias/[slug] y
# /colecciones/[slug] salían todas como ƒ (dynamic, renderizadas por petición).

set -uo pipefail

BASE="${1:-https://intemperie.skjoldnetsystems.com}"
LABEL="${2:-run}"
RUNS="${RUNS:-5}"
PRODUCT_PATH="${PRODUCT_PATH:-/productos/cerca-pvc-atlas}"

paths=("/" "/productos" "$PRODUCT_PATH")

printf '=== %s — %s (%s repeticiones) ===\n\n' "$LABEL" "$BASE" "$RUNS"
printf '%-30s %-10s %-10s\n' "RUTA" "TTFB" "TOTAL"

for p in "${paths[@]}"; do
  [ -z "$p" ] && continue
  ttfbs=(); totals=()
  for _ in $(seq 1 "$RUNS"); do
    read -r tt ttfb <<<"$(curl -s -o /dev/null \
      -H 'Cache-Control: no-cache' \
      -w '%{time_total} %{time_starttransfer}' \
      --compressed "$BASE$p")"
    totals+=("$tt"); ttfbs+=("$ttfb")
  done
  med() { printf '%s\n' "$@" | sort -n | awk '{a[NR]=$1} END{print a[int((NR+1)/2)]}'; }
  printf '%-30s %-10s %-10s\n' "$p" "$(med "${ttfbs[@]}")" "$(med "${totals[@]}")"
done

echo
echo "--- Cache-Control por ruta ---"
for p in "${paths[@]}"; do
  [ -z "$p" ] && continue
  cc=$(curl -s -D - -o /dev/null --compressed "$BASE$p" \
       | grep -i '^cache-control:' | tr -d '\r' | cut -d' ' -f2-)
  nx=$(curl -s -D - -o /dev/null --compressed "$BASE$p" \
       | grep -i '^x-nextjs-cache:' | tr -d '\r' | cut -d' ' -f2-)
  printf '%-30s %s %s\n' "$p" "${cc:-(sin cabecera)}" "${nx:+[x-nextjs-cache: $nx]}"
done
