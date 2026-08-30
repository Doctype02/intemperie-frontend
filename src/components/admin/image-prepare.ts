/**
 * Normalización de fotos en el navegador ANTES de subirlas.
 *
 * El caso real: el dueño del negocio fotografía una cerca con el teléfono y
 * sube el archivo tal cual. Ese archivo son 8–12 MP y 4–9 MB, y en un iPhone
 * suele ser HEIC. El servidor solo acepta JPG/PNG de hasta 5 MB y valida por
 * contenido, así que sin este paso la mitad de las subidas fallarían por
 * motivos que al usuario no le dicen nada.
 *
 * Qué hace:
 *   · Si el archivo YA es JPG/PNG, cabe en el límite y no es descomunal, se
 *     sube intacto (cero recompresión, cero pérdida).
 *   · Si no, se decodifica, se reescala a `MAX_DIMENSION` por el lado mayor y
 *     se reexporta a JPEG bajando la calidad por pasos hasta caber.
 *   · La orientación EXIF se respeta (`imageOrientation: "from-image"`); sin
 *     eso las fotos verticales del móvil llegarían tumbadas.
 *   · Si el navegador no sabe decodificar el formato (HEIC en Android), se
 *     lanza un error que nombra el archivo y los formatos válidos.
 *
 * Vive en `components/admin` y no en la capa de API a propósito: es
 * preparación del lado del cliente, no parte del contrato con el backend.
 */

import {
  PRODUCT_IMAGE_MAX_BYTES,
  isAcceptedImageType,
  tooLargeMessage,
  unreadableMessage,
} from "@/lib/api/product-images";

/**
 * 2560 px por el lado mayor. La ficha de producto sirve como máximo 1536 px
 * (`deviceSizes` en next.config.ts) y el optimizador de Next reescala desde el
 * original; el doble deja margen para zoom sin cargar 4000 px inútiles ni
 * reventar la memoria de un móvil de gama media al decodificar.
 */
const MAX_DIMENSION = 2560;

/**
 * Un JPG por encima de este tamaño se recomprime aunque quepa en el límite:
 * son fotos de móvil de varios MB que el visitante de la tienda tendría que
 * descargar si el optimizador falla o se sirve el original.
 */
const RECOMPRESS_ABOVE_BYTES = Math.min(PRODUCT_IMAGE_MAX_BYTES, 2 * 1024 * 1024);

/** Pasos de (escala, calidad). Se para en el primero que quepa. */
const ATTEMPTS: ReadonlyArray<{ scale: number; quality: number }> = [
  { scale: 1, quality: 0.86 },
  { scale: 1, quality: 0.74 },
  { scale: 0.8, quality: 0.72 },
  { scale: 0.65, quality: 0.66 },
  { scale: 0.5, quality: 0.6 },
];

export interface PreparedImage {
  /** Lo que se sube: el archivo original o su versión reencodada. */
  blob: Blob;
  fileName: string;
  bytes: number;
  originalBytes: number;
  width: number;
  height: number;
  /** `true` si se recomprimió/convirtió (la UI lo cuenta al usuario). */
  optimized: boolean;
}

interface Decoded {
  source: CanvasImageSource;
  width: number;
  height: number;
  release: () => void;
}

function isAborted(signal?: AbortSignal): boolean {
  return Boolean(signal?.aborted);
}

function abortError(): DOMException {
  return new DOMException("Subida cancelada", "AbortError");
}

/** Decodifica con `createImageBitmap` y cae a `<img>` en navegadores viejos. */
async function decode(file: File): Promise<Decoded> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        release: () => bitmap.close(),
      };
    } catch {
      /* opción no soportada o formato ilegible: se prueba con <img> */
    }
  }

  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error("decode-failed"));
      el.src = url;
    });
    // Los navegadores actuales ya aplican la orientación EXIF a <img>
    // (image-orientation: from-image es el valor inicial desde 2020).
    return {
      source: image,
      width: image.naturalWidth,
      height: image.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function toBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", quality));
}

function withJpegExtension(name: string): string {
  const base = (name || "foto").replace(/\.[^.]+$/, "").trim() || "foto";
  return `${base}.jpg`;
}

/**
 * Devuelve el archivo listo para subir. Lanza `Error` con un mensaje ya
 * redactado para el usuario cuando no hay nada que hacer con el archivo, y
 * `AbortError` si se canceló a mitad.
 */
export async function prepareProductImage(
  file: File,
  signal?: AbortSignal,
): Promise<PreparedImage> {
  if (isAborted(signal)) throw abortError();

  const alreadyValid = isAcceptedImageType(file.type);
  const smallEnough = file.size <= Math.min(PRODUCT_IMAGE_MAX_BYTES, RECOMPRESS_ABOVE_BYTES);

  let decoded: Decoded;
  try {
    decoded = await decode(file);
  } catch {
    // Ni el decodificador nativo ni <img> pudieron con él. Caso típico: HEIC
    // fuera de Apple. Si aun así es un JPG/PNG que cabe, se deja pasar y que
    // decida el servidor, que valida por contenido.
    if (alreadyValid && file.size <= PRODUCT_IMAGE_MAX_BYTES) {
      return {
        blob: file,
        fileName: file.name,
        bytes: file.size,
        originalBytes: file.size,
        width: 0,
        height: 0,
        optimized: false,
      };
    }
    throw new Error(unreadableMessage(file.name || "la imagen"));
  }

  try {
    if (isAborted(signal)) throw abortError();

    const { width, height } = decoded;
    const withinDimensions = Math.max(width, height) <= MAX_DIMENSION;

    if (alreadyValid && smallEnough && withinDimensions) {
      return {
        blob: file,
        fileName: file.name,
        bytes: file.size,
        originalBytes: file.size,
        width,
        height,
        optimized: false,
      };
    }

    const baseScale = withinDimensions ? 1 : MAX_DIMENSION / Math.max(width, height);

    for (const attempt of ATTEMPTS) {
      if (isAborted(signal)) throw abortError();

      const scale = baseScale * attempt.scale;
      const targetWidth = Math.max(1, Math.round(width * scale));
      const targetHeight = Math.max(1, Math.round(height * scale));

      const canvas = createCanvas(targetWidth, targetHeight);
      const ctx = canvas.getContext("2d");
      if (!ctx) break;

      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      // JPEG no tiene alfa: sin este relleno, un PNG transparente saldría con
      // el fondo en negro.
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, targetWidth, targetHeight);
      ctx.drawImage(decoded.source, 0, 0, targetWidth, targetHeight);

      const blob = await toBlob(canvas, attempt.quality);
      // Liberar el respaldo del canvas cuanto antes: en iOS la memoria de
      // canvas es un recurso escaso y varias fotos en cola lo agotan.
      canvas.width = 0;
      canvas.height = 0;

      if (!blob) break;

      if (blob.size <= PRODUCT_IMAGE_MAX_BYTES) {
        return {
          blob,
          fileName: withJpegExtension(file.name),
          bytes: blob.size,
          originalBytes: file.size,
          width: targetWidth,
          height: targetHeight,
          optimized: true,
        };
      }
    }

    throw new Error(tooLargeMessage(file.name || "la imagen", file.size));
  } finally {
    decoded.release();
  }
}
