/**
 * Subida de imágenes de producto a Object Storage — capa de API aislada.
 *
 * Todo el acoplamiento con el endpoint de subida vive en ESTE archivo: ruta,
 * nombre del campo multipart, forma de la respuesta, límites y traducción de
 * errores. Si el backend cambia el contrato, se toca un solo fichero y la UI
 * (`src/components/admin/product-image-uploader.tsx`) no se entera.
 *
 * ─── Contrato asumido del backend (rama `feat/object-storage`) ──────────────
 *
 *   POST {NEXT_PUBLIC_API_URL}/products/:id/images/upload
 *   Content-Type: multipart/form-data
 *     · `image` → el archivo (uno por petición: multer está configurado con
 *                 `limits.files = 1` y `.single('image')`).
 *     · `alt`   → texto alternativo opcional (allow-list explícito en el
 *                 controlador: cualquier otro campo se descarta).
 *   Auth: cookie httpOnly `accessToken` (`withCredentials`), igual que el
 *         resto del panel. Requiere rol ADMIN.
 *   201 → { success: true, data: <producto completo, con images[] } }
 *   4xx → { success: false, error: { message, code? } }
 *
 * El servidor valida el tipo real por magic bytes (`src/utils/fileSignature.ts`),
 * genera el nombre del objeto (uuid) y devuelve la URL pública ya persistida en
 * el producto: NO hay que llamar después a `POST /products/:id/images`.
 *
 * Formatos y límite salen de la config del backend en el momento de escribir
 * esto (`ALLOWED_IMAGE_MIME_TYPES` = JPEG/PNG, `UPLOAD_MAX_IMAGE_BYTES` = 5 MiB
 * por defecto). Se pueden ajustar sin recompilar la lógica vía
 * `NEXT_PUBLIC_UPLOAD_MAX_IMAGE_BYTES`.
 */

import { API_BASE, ApiError, request } from "@/lib/api";

/* ── Contrato: constantes ajustables en un solo sitio ────────────────────── */

/** Ruta del endpoint de subida, relativa a `API_BASE`. */
const UPLOAD_PATH = (productId: string) =>
  `/products/${encodeURIComponent(productId)}/images/upload`;

/** Nombre del campo multipart que espera multer (`.single('image')`). */
const FILE_FIELD = "image";
/** Campo de texto alternativo aceptado por el controlador. */
const ALT_FIELD = "alt";

/** Espejo de `UPLOAD_MAX_IMAGE_BYTES` del backend (5 MiB por defecto). */
export const PRODUCT_IMAGE_MAX_BYTES = (() => {
  const raw = Number(process.env.NEXT_PUBLIC_UPLOAD_MAX_IMAGE_BYTES);
  return Number.isFinite(raw) && raw > 0 ? raw : 5 * 1024 * 1024;
})();

/** Espejo de `ALLOWED_IMAGE_MIME_TYPES` del backend. */
export const PRODUCT_IMAGE_ACCEPTED_TYPES = ["image/jpeg", "image/png"] as const;

/** Etiqueta legible de los formatos aceptados, para los mensajes de error. */
export const PRODUCT_IMAGE_ACCEPTED_LABEL = "JPG y PNG";

/**
 * `accept` del <input type="file">. Es deliberadamente MÁS ancho que lo que
 * acepta el servidor: el móvil del dueño dispara en HEIC y muchos Android en
 * WebP. Esos formatos se convierten a JPG en el navegador antes de subir
 * (`src/components/admin/image-prepare.ts`); si el navegador no sabe
 * decodificarlos, el error lo dice con nombre y apellido.
 */
export const PRODUCT_IMAGE_ACCEPT =
  "image/jpeg,image/png,image/webp,image/heic,image/heif,.jpg,.jpeg,.png,.webp,.heic,.heif";

/* ── Tipos ───────────────────────────────────────────────────────────────── */

export interface ProductImage {
  id: string;
  url: string;
  alt?: string | null;
  order: number;
}

/** Sólo lo que consume el panel: el backend devuelve el producto entero. */
export interface ProductWithImages {
  id: string;
  images?: ProductImage[];
  [key: string]: unknown;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  /** 0–100, entero. `0` mientras el navegador no reporte tamaño total. */
  percent: number;
}

export interface UploadProductImageOptions {
  productId: string;
  /** El archivo ya normalizado (JPG/PNG) que se va a subir. */
  file: Blob;
  /** Nombre visible; el servidor genera el suyo (uuid), esto es informativo. */
  fileName: string;
  alt?: string;
  signal?: AbortSignal;
  onProgress?: (progress: UploadProgress) => void;
}

/* ── Utilidades de formato y validación ──────────────────────────────────── */

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes < 0) return "—";
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const decimals = value < 10 ? 1 : 0;
  return `${value.toFixed(decimals).replace(".", ",")} ${units[unit]}`;
}

/** El límite en MB tal y como lo anuncia el backend (entero, hacia abajo). */
export const PRODUCT_IMAGE_MAX_LABEL = formatBytes(PRODUCT_IMAGE_MAX_BYTES);

/** `true` si el archivo ya es exactamente lo que el servidor acepta. */
export function isAcceptedImageType(type: string): boolean {
  return (PRODUCT_IMAGE_ACCEPTED_TYPES as readonly string[]).includes(type);
}

/**
 * Comprobación previa a cualquier trabajo pesado. Devuelve `null` si el
 * archivo puede intentar subirse (quizá tras convertirlo) o un mensaje
 * accionable: qué pasa, cuál es el límite y qué hacer.
 */
export function describeRejection(file: File): string | null {
  const name = file.name || "el archivo";

  if (file.size === 0) {
    return `«${name}» está vacío (0 bytes). Vuelve a exportarlo o elige otra foto.`;
  }

  const looksLikeImage =
    file.type.startsWith("image/") || /\.(jpe?g|png|webp|heic|heif)$/i.test(name);

  if (!looksLikeImage) {
    const kind = file.type || "tipo desconocido";
    return `«${name}» no es una imagen (${kind}). Solo se aceptan ${PRODUCT_IMAGE_ACCEPTED_LABEL}.`;
  }

  if (file.type === "image/gif" || /\.gif$/i.test(name)) {
    return `«${name}» es un GIF y el catálogo solo admite ${PRODUCT_IMAGE_ACCEPTED_LABEL}. Guárdalo como JPG y vuelve a intentarlo.`;
  }

  if (file.type === "image/svg+xml" || /\.svg$/i.test(name)) {
    return `«${name}» es un SVG y no se admite por seguridad. Exporta la imagen como ${PRODUCT_IMAGE_ACCEPTED_LABEL}.`;
  }

  // El tamaño NO se rechaza aquí: una foto de 9 MB del móvil se comprime en el
  // navegador antes de subirla. Solo se rechaza si sigue pasada tras optimizar
  // (ver `tooLargeMessage`).
  return null;
}

/** Mensaje para un archivo que sigue excediendo el límite tras optimizarlo. */
export function tooLargeMessage(name: string, bytes: number): string {
  return `«${name}» pesa ${formatBytes(bytes)} y el máximo por imagen es ${PRODUCT_IMAGE_MAX_LABEL}. Recórtala o expórtala a menor resolución.`;
}

/** Mensaje para un archivo que el navegador no pudo decodificar ni convertir. */
export function unreadableMessage(name: string): string {
  return `No se pudo leer «${name}». Puede estar dañado o en un formato que este dispositivo no sabe convertir. Formatos seguros: ${PRODUCT_IMAGE_ACCEPTED_LABEL}.`;
}

/* ── Cancelación ─────────────────────────────────────────────────────────── */

/** `true` si el fallo es una cancelación deliberada del usuario. */
export function isAbortError(error: unknown): boolean {
  return (
    (error instanceof DOMException && error.name === "AbortError") ||
    (error instanceof Error && error.name === "AbortError")
  );
}

function abortError(): DOMException {
  return new DOMException("Subida cancelada", "AbortError");
}

/* ── Traducción de errores del servidor ──────────────────────────────────── */

interface ErrorEnvelope {
  success?: boolean;
  message?: string;
  error?: { message?: string; code?: string };
}

/**
 * Convierte una respuesta fallida en un `ApiError` con un mensaje que el
 * administrador pueda accionar. Se prefiere siempre el mensaje del backend
 * (ya viene en español y con el límite real); los textos de aquí son la red
 * de seguridad cuando la respuesta no trae cuerpo útil (proxy, 413 de nginx…).
 */
function toApiError(status: number, rawBody: string): ApiError {
  let envelope: ErrorEnvelope = {};
  try {
    envelope = JSON.parse(rawBody) as ErrorEnvelope;
  } catch {
    /* respuesta no-JSON: se usan los mensajes por defecto de abajo */
  }

  const serverMessage = envelope.error?.message || envelope.message;
  const code = envelope.error?.code;

  const fallback = (() => {
    switch (status) {
      case 400:
        return `El servidor rechazó la imagen. Solo admite ${PRODUCT_IMAGE_ACCEPTED_LABEL} de hasta ${PRODUCT_IMAGE_MAX_LABEL}, y valida el contenido real del archivo, no su extensión.`;
      case 401:
        return "Tu sesión expiró. Inicia sesión de nuevo y vuelve a subir la imagen.";
      case 403:
        return "Tu cuenta no tiene permisos de administrador para subir imágenes.";
      case 404:
        return "Este producto ya no existe en el servidor. Recarga la página.";
      case 413:
        return `La imagen supera el máximo que acepta el servidor (${PRODUCT_IMAGE_MAX_LABEL}).`;
      case 415:
        return `Formato no admitido. Solo ${PRODUCT_IMAGE_ACCEPTED_LABEL}.`;
      case 502:
      case 503:
      case 504:
        return "El servidor de imágenes no respondió. Inténtalo de nuevo en un momento.";
      default:
        return status >= 500
          ? "El servidor falló al guardar la imagen. Vuelve a intentarlo; si persiste, avisa a soporte."
          : "No se pudo subir la imagen.";
    }
  })();

  return new ApiError(serverMessage || fallback, status, code);
}

/* ── La subida ───────────────────────────────────────────────────────────── */

/**
 * `XMLHttpRequest` y no `fetch`: es el único transporte que da progreso REAL
 * de subida en todos los navegadores (`fetch` con `ReadableStream` en el body
 * requiere HTTP/2 + `duplex: "half"` y no lo soporta Safari, que es
 * exactamente el navegador del móvil desde el que se van a subir las fotos).
 */
function sendMultipart(
  options: UploadProductImageOptions,
): Promise<ProductWithImages> {
  const { productId, file, fileName, alt, signal, onProgress } = options;

  return new Promise<ProductWithImages>((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }

    const form = new FormData();
    form.append(FILE_FIELD, file, fileName);
    if (alt && alt.trim()) form.append(ALT_FIELD, alt.trim());

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `${API_BASE}${UPLOAD_PATH(productId)}`, true);
    // Las cookies httpOnly (`accessToken`) son la fuente de verdad de la sesión
    // en este panel; `withCredentials` es el equivalente de
    // `credentials: "include"` en el `fetch` de `src/lib/api.ts`.
    xhr.withCredentials = true;
    xhr.responseType = "text";
    // Sin timeout: 5 MB por 4G lento pueden tardar minutos y cortar la subida
    // a mitad es peor que esperar. El usuario tiene un botón de cancelar.
    xhr.timeout = 0;
    // NO se fija Content-Type: el navegador debe añadir el `boundary`.

    const onAbort = () => xhr.abort();
    signal?.addEventListener("abort", onAbort, { once: true });

    const cleanup = () => signal?.removeEventListener("abort", onAbort);

    xhr.upload.onprogress = (event) => {
      if (!onProgress) return;
      const total = event.lengthComputable ? event.total : 0;
      const percent = total > 0 ? Math.min(100, Math.round((event.loaded / total) * 100)) : 0;
      onProgress({ loaded: event.loaded, total, percent });
    };

    xhr.onload = () => {
      cleanup();
      const body = typeof xhr.response === "string" ? xhr.response : "";

      if (xhr.status < 200 || xhr.status >= 300) {
        reject(toApiError(xhr.status, body));
        return;
      }

      let parsed: { success?: boolean; data?: ProductWithImages } | null = null;
      try {
        parsed = JSON.parse(body) as { success?: boolean; data?: ProductWithImages };
      } catch {
        reject(
          new ApiError(
            "El servidor respondió algo que no se pudo interpretar. Recarga la página para ver si la imagen se guardó.",
            xhr.status,
          ),
        );
        return;
      }

      if (parsed?.success === false || !parsed?.data) {
        reject(toApiError(xhr.status, body));
        return;
      }

      // El progreso puede quedarse en 99 si el servidor responde antes del
      // último evento; se cierra a 100 para que la barra no mienta.
      onProgress?.({ loaded: file.size, total: file.size, percent: 100 });
      resolve(parsed.data);
    };

    xhr.onerror = () => {
      cleanup();
      reject(
        new ApiError(
          "No se pudo conectar con el servidor. Revisa tu conexión y vuelve a intentarlo.",
          0,
        ),
      );
    };

    xhr.ontimeout = () => {
      cleanup();
      reject(new ApiError("La subida tardó demasiado y se canceló.", 0));
    };

    xhr.onabort = () => {
      cleanup();
      reject(abortError());
    };

    xhr.send(form);
  });
}

/**
 * Sube una imagen y devuelve el PRODUCTO ACTUALIZADO (el backend persiste la
 * URL y responde con el producto completo, así que la lista de imágenes del
 * panel se reemplaza con lo que diga el servidor en vez de adivinarse).
 *
 * Ante un 401 se reintenta una vez: `XMLHttpRequest` queda fuera del ciclo de
 * refresco de `src/lib/api.ts`, así que se fuerza ese refresco con una llamada
 * JSON barata (`/auth/me`, que sí pasa por `request()` y renueva las cookies)
 * y se repite la subida. Si el refresco tampoco vale, `request()` ya se encarga
 * de mandar al login.
 */
export async function uploadProductImage(
  options: UploadProductImageOptions,
): Promise<ProductWithImages> {
  try {
    return await sendMultipart(options);
  } catch (error) {
    if (!(error instanceof ApiError) || error.status !== 401) throw error;
    if (options.signal?.aborted) throw abortError();

    await request("/auth/me");
    options.onProgress?.({ loaded: 0, total: 0, percent: 0 });
    return sendMultipart(options);
  }
}

/** Ordena por `order` sin mutar, que es como el panel espera las imágenes. */
export function sortProductImages(images: ProductImage[] | undefined | null): ProductImage[] {
  return [...(images ?? [])].sort((a, b) => a.order - b.order);
}
