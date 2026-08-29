#!/usr/bin/env bash
#
# Mide el JavaScript de primera carga de una ruta: arranca el build de
# produccion, pide el HTML y suma el tamano (comprimido y en bruto) de todos los
# <script src> que el documento referencia.
#
#   ./scripts/measure-bundle.sh [ruta] [etiqueta]
#
# Requiere un `npm run build` previo y la API en NEXT_PUBLIC_API_URL
# (por defecto http://localhost:4000).
#
# Complementa a measure-perf.sh: aquel mide la entrega del HTML contra
# produccion, este mide cuanto JS tiene que descargar y ejecutar el navegador
# antes de que la pagina sea interactiva, que es lo que mueven los cambios de
# componente de servidor vs cliente.

set -uo pipefail

ROUTE="${1:-/productos}"
LABEL="${2:-run}"
PORT="${PORT:-3311}"
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

cd "$ROOT" || exit 1

npx next start -p "$PORT" >/tmp/next-start-$PORT.log 2>&1 &
SERVER_PID=$!
trap 'kill $SERVER_PID 2>/dev/null' EXIT

for _ in $(seq 1 40); do
  curl -sf -o /dev/null "http://localhost:$PORT/" && break
  sleep 0.5
done

html=$(curl -s --compressed "http://localhost:$PORT$ROUTE")
if [ -z "$html" ]; then
  echo "sin respuesta en $ROUTE — ver /tmp/next-start-$PORT.log"
  exit 1
fi

# src de cada <script>, deduplicado: el mismo chunk puede aparecer varias veces.
srcs=$(printf '%s' "$html" \
  | grep -o 'src="/_next/static/[^"]*\.js"' \
  | sed 's/src="//; s/"$//' \
  | sort -u)

gz_total=0
raw_total=0
count=0
while read -r s; do
  [ -z "$s" ] && continue
  gz=$(curl -s -o /dev/null -w '%{size_download}' \
       -H 'Accept-Encoding: gzip' "http://localhost:$PORT$s")
  raw=$(curl -s -o /dev/null -w '%{size_download}' "http://localhost:$PORT$s")
  gz_total=$((gz_total + gz))
  raw_total=$((raw_total + raw))
  count=$((count + 1))
done <<<"$srcs"

printf '%s  %s\n' "$LABEL" "$ROUTE"
printf '  chunks:      %s\n' "$count"
printf '  transferido:   %s KB (gzip)\n' "$(awk -v b="$gz_total" 'BEGIN{printf "%.1f", b/1024}')"
printf '  sin comprimir: %s KB\n' "$(awk -v b="$raw_total" 'BEGIN{printf "%.1f", b/1024}')"
