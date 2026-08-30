/* Imágenes: de dónde salen y cómo se nombran.
 *
 * Las fotografías del catálogo viven en el Object Storage (bucket público de
 * Vultr, prefijo `products/`), y sus URL llegan absolutas desde la API: la
 * base de datos guarda la dirección completa, así que `next/image` las sirve
 * sin que este módulo tenga que tocarlas.
 *
 * Lo que sí necesita ayuda son las fotos EDITORIALES —las de portada, «nosotros»
 * e «instaladores»—, que no salen de la API sino que están escritas en el código.
 * Estaban puestas como rutas relativas (`/products/…`) y las servía el `public/`
 * del propio Next: doce megas de JPG viajando dentro de la imagen de Docker en
 * cada build, y una segunda copia de unos archivos que ya estaban en el bucket.
 * `mediaUrl` las manda al mismo sitio que las demás.
 */

export const BLUR_PLACEHOLDER =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iMzAwIiB2aWV3Qm94PSIwIDAgNDAwIDMwMCI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNlOGY1ZTkiLz48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI2M4ZTZjOSIgb3BhY2l0eT0iMC41Ii8+PC9zdmc+";

/* La base del media es pública y no es un secreto: es la misma dirección que
   ya viaja en cada URL que devuelve la API. Se deja como valor por defecto en
   vez de exigir la variable, para que un `npm run dev` recién clonado vea las
   fotos sin configurar nada. `NEXT_PUBLIC_MEDIA_BASE` existe para apuntar a
   otro bucket en pruebas; al ser `NEXT_PUBLIC_*` se hornea en el build, así
   que cambiarla obliga a reconstruir la imagen, no basta con reiniciar. */
const MEDIA_BASE = (
  process.env.NEXT_PUBLIC_MEDIA_BASE ?? "https://intemperie-media.atl2.vultrobjects.com"
).replace(/\/+$/, "");

/**
 * Dirección pública de un archivo del media.
 *
 * Acepta lo que ya es absoluto y lo devuelve intacto: así el mismo helper vale
 * para una ruta escrita a mano y para una URL que venga de la API, sin que quien
 * lo use tenga que averiguar cuál de las dos tiene delante.
 */
export function mediaUrl(path: string): string {
  if (/^(https?:)?\/\//.test(path) || path.startsWith("data:")) return path;
  return `${MEDIA_BASE}${path.startsWith("/") ? path : `/${path}`}`;
}

export function getProductImageUrl(images: { url: string }[] | undefined, index = 0): string {
  if (!images || images.length === 0) return "";
  return images[index]?.url || "";
}

export function getImageAlt(images: { alt?: string | null }[] | undefined, productName: string, index = 0): string {
  if (!images || images.length === 0) return productName;
  return images[index]?.alt || `${productName} - Imagen ${index + 1}`;
}
