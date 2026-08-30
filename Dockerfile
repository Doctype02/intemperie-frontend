# syntax=docker/dockerfile:1

###############################################################################
# 1. deps — instala dependencias con el lockfile
###############################################################################
FROM node:22-alpine AS deps
# libc6-compat: sharp y otros binarios nativos esperan glibc en Alpine (musl)
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

###############################################################################
# 2. builder — compila la app (output: "standalone")
###############################################################################
FROM node:22-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Solo variables PUBLICAS: next hornea NEXT_PUBLIC_* en el bundle del cliente.
# Los secretos de runtime (JWT_ACCESS_SECRET, TILOPAY_*) NO van aqui: los usa
# src/middleware.ts y las rutas de servidor en tiempo de ejecucion, y pasarlos
# como ARG los dejaria escritos en las capas de la imagen.
ARG NEXT_PUBLIC_API_URL
# URL interna de la API para los fetch del prerenderizado. El contenedor de
# build no alcanza el dominio publico (NAT sin retorno), asi que las paginas
# se generan hablando con el backend por la red de compose. Sin prefijo
# NEXT_PUBLIC_ a proposito: no debe llegar al navegador.
ARG INTERNAL_API_URL
ENV INTERNAL_API_URL=$INTERNAL_API_URL
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_WHATSAPP_NUMBER

ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
    NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_WHATSAPP_NUMBER=$NEXT_PUBLIC_WHATSAPP_NUMBER \
    NEXT_TELEMETRY_DISABLED=1 \
    NODE_ENV=production

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Red no disponible/opcional en build: las paginas que consultan la API
# degradan a listas vacias (try/catch) y el build no falla.
RUN npm run build

###############################################################################
# 3. runner — imagen final minima, sin codigo fuente ni devDependencies
###############################################################################
FROM node:22-alpine AS runner
RUN apk add --no-cache libc6-compat
WORKDIR /app

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup --system --gid 1001 nodejs \
    && adduser --system --uid 1001 --ingroup nodejs nextjs

# --chown es imprescindible: sin el, public/ queda como root y el usuario
# nextjs no puede leerlo. El contenedor arranca igualmente ("Ready in 0ms")
# pero revienta al servir con EACCES scandir '/app/public/products', y el
# healthcheck lo marca unhealthy sin explicar por que.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
# El servidor standalone escribe el cache de ISR/imagenes en .next/cache
RUN mkdir -p .next/cache && chown -R nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3000

# JWT_ACCESS_SECRET, TILOPAY_API_USER, TILOPAY_API_PASSWORD y
# TILOPAY_INTEGRATION_KEY se inyectan como variables de entorno del contenedor.
CMD ["node", "server.js"]
