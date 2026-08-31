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

/* El marcador de carga: por qué ya no es un `blurDataURL`.
 *
 * Aquí vivía `BLUR_PLACEHOLDER`, un SVG en base64 —dos rectángulos verde
 * pastel— que se pasaba como `blurDataURL` a media docena de `<Image>`. Un
 * `blurDataURL` sirve para enseñar una miniatura DE LA PROPIA FOTO mientras
 * llega la grande; ésta no lo era. Era el mismo verde para las quince fichas,
 * para las miniaturas del carrito y para la galería, así que no anticipaba
 * nada: sólo metía un color que no pertenece a ninguna fotografía de obra —y
 * que en modo oscuro aparecía como una mancha clara sobre el azul del fondo—
 * y encima obligaba a `next/image` a montar el estado del placeholder.
 *
 * El marcador correcto ya existe y no pesa: el propio recuadro de la foto.
 * El contrato que sigue ahora TODA imagen de contenido del sitio es que su
 * contenedor lleve la proporción reservada (`aspect-*` o un `size-*` fijo) más
 * `bg-surface-2`. Así el hueco se ve como una superficie del sistema —clara en
 * claro, oscura en oscuro— hasta que la foto lo cubre, y no se mueve un píxel
 * al cubrirlo. Cero bytes, cero peticiones, cero estado de placeholder, y el
 * tono lo decide el token y no un base64 que nadie va a volver a descodificar.
 *
 * Se escribe en cada sitio con sus clases, sin constante compartida: la
 * proporción cambia en cada uso (4/3 en catálogo, 16/10 en portada, cuadrada
 * en las miniaturas del carrito) y media clase en una constante y media suelta
 * se lee peor que la línea entera.
 */

/* La base del media es pública y no es un secreto: es la misma dirección que
   ya viaja en cada URL que devuelve la API. Se deja como valor por defecto en
   vez de exigir la variable, para que un `npm run dev` recién clonado vea las
   fotos sin configurar nada. `NEXT_PUBLIC_MEDIA_BASE` existe para apuntar a
   otro bucket en pruebas; al ser `NEXT_PUBLIC_*` se hornea en el build, así
   que cambiarla obliga a reconstruir la imagen, no basta con reiniciar. */
/* `||` y no `??`, y no es un detalle de estilo: el Dockerfile declara
   `ENV NEXT_PUBLIC_MEDIA_BASE=$NEXT_PUBLIC_MEDIA_BASE`, asi que cuando el
   build no recibe ese argumento la variable no queda sin definir —queda
   definida y VACIA—. `??` solo cae al valor por defecto ante `undefined`, de
   modo que la base terminaba siendo "" y `mediaUrl()` devolvia rutas
   relativas: las fotos de portada, «nosotros» e «instaladores» daban 404 en
   produccion, servidas desde un `public/` que ya no existe. */
const MEDIA_BASE = (
  process.env.NEXT_PUBLIC_MEDIA_BASE || "https://intemperie-media.atl2.vultrobjects.com"
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
