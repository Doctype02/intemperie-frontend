import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === "development";

/**
 * Origen de la API pública. Se inyecta como build arg en Docker
 * (NEXT_PUBLIC_API_URL) y se usa para abrir `connect-src` en la CSP.
 */
const apiOrigin = (() => {
  try {
    return new URL(
      process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000",
    ).origin;
  } catch {
    return "";
  }
})();

/** Pasarela de pago: el checkout embebe su formulario en un iframe. */
const TILOPAY_ORIGINS = ["https://app.tilopay.com", "https://tilopay.com"];

const csp = [
  "default-src 'self'",
  // Next inyecta scripts inline (hidratación, flight data) y el JSON-LD del
  // layout raíz es un <script type="application/ld+json"> inline.
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  // El admin permite pegar URLs https arbitrarias de imagen (ver remotePatterns).
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  `connect-src 'self' https:${isDev ? " ws: http://localhost:*" : ""}${apiOrigin ? ` ${apiOrigin}` : ""}`,
  `frame-src 'self' ${TILOPAY_ORIGINS.join(" ")}`,
  `form-action 'self' ${TILOPAY_ORIGINS.join(" ")}`,
  "media-src 'self' https:",
  "worker-src 'self' blob:",
  "object-src 'none'",
  "base-uri 'self'",
  "frame-ancestors 'none'",
  "upgrade-insecure-requests",
].join("; ");

/**
 * Tilopay redirige el iframe de pago a nuestra propia página de retorno
 * (`/checkout/tilopay-return`), que hace postMessage al opener. Con
 * `frame-ancestors 'none'` global esa página quedaría bloqueada, así que se
 * relaja SOLO en esa ruta: puede embeberse desde nosotros mismos o desde Tilopay.
 */
const cspTilopayReturn = csp.replace(
  "frame-ancestors 'none'",
  `frame-ancestors 'self' ${TILOPAY_ORIGINS.join(" ")}`,
);

const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "on" },
];

const nextConfig: NextConfig = {
  // Salida autocontenida para la imagen Docker (server.js + node_modules mínimos).
  output: "standalone",
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [75],
    deviceSizes: [400, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256],
    // El optimizador cachea en disco un año; evita re-fetch del origen remoto.
    minimumCacheTTL: 31536000,
    // El panel de admin permite pegar cualquier URL https de imagen (S3, CDN del
    // proveedor, Cloudinary, etc.), por lo que no existe una lista cerrada de
    // hosts posible sin romper el catálogo. Se permite https genérico y se
    // compensa el riesgo del optimizador: SVG deshabilitado (por defecto),
    // Content-Disposition: attachment y CSP con object-src 'none'.
    remotePatterns: [{ protocol: "https", hostname: "**" }],
    dangerouslyAllowSVG: false,
    contentDispositionType: "attachment",
  },
  headers: async () => [
    {
      // Cabeceras de seguridad en todas las respuestas HTML/asset.
      source: "/:path*",
      headers: securityHeaders,
    },
    {
      // Excepción de framing para el retorno de la pasarela (ver arriba).
      // Debe ir después de la regla global para sobrescribir sus valores.
      source: "/checkout/tilopay-return",
      headers: [
        ...securityHeaders.filter(
          (h) =>
            h.key !== "Content-Security-Policy" && h.key !== "X-Frame-Options",
        ),
        { key: "Content-Security-Policy", value: cspTilopayReturn },
        { key: "X-Frame-Options", value: "SAMEORIGIN" },
      ],
    },
    {
      /* CADA DESPLIEGUE TARDABA UNA CARGA EXTRA EN VERSE.
       *
       * Las paginas con `revalidate` emiten
       * `s-maxage=3600, stale-while-revalidate=31532400`. Ese segundo numero son
       * 365 dias: el navegador puede servir la copia guardada durante un ano
       * mientras revalida por detras. Efecto practico: quien ya habia visitado
       * el sitio veia la version ANTERIOR despues de desplegar, y la nueva solo
       * en la segunda carga. Costo varias vueltas de «no veo los cambios» que no
       * eran del despliegue sino de esto.
       *
       * `max-age=0, must-revalidate` obliga a preguntar antes de reutilizar. No
       * es lento: la respuesta normal es un 304 vacio. La cache de ruta de Next
       * no se toca —es interna y sigue sirviendo la pagina prerenderizada sin
       * recalcularla—; lo unico que cambia es que el navegador deja de ensenar
       * una copia vieja sin preguntar.
       *
       * Se excluyen `_next` y `api`: los activos de `_next/static` llevan hash en
       * el nombre y deben cachearse un ano. Por el mismo motivo NO se toca
       * `_next/image`, que ya se intento una vez y congelaba las respuestas de
       * error del optimizador (ver la nota de debajo). */
      source: "/((?!_next|api).*)",
      headers: [
        { key: "Cache-Control", value: "public, max-age=0, must-revalidate" },
      ],
    },
    // NOTA: se eliminó el override `Cache-Control: immutable` sobre /_next/image.
    // Esa regla se aplicaba también a las respuestas de error del optimizador
    // (400/404/500 cuando el origen remoto falla), congelando el fallo un año en
    // el navegador y en cualquier CDN intermedio. El optimizador ya emite su
    // propio Cache-Control derivado de `minimumCacheTTL` solo en los 200.
  ],
};

export default nextConfig;
