/* Dominio canonico del sitio.
 *
 * Estaba incrustado como "https://intemperie.com.pa" en layout.tsx
 * (metadataBase, Organization JSON-LD, logo) y en productos/[slug]. Ese
 * dominio NO RESUELVE: comprobado con DNS, no tiene registro A. Es decir,
 * cada canonical, cada etiqueta Open Graph y el esquema de Organizacion
 * apuntaban a una URL muerta. Si Google rastrea el sitio en ese estado,
 * intenta canonicalizar hacia un dominio inexistente y no indexa nada.
 *
 * Ahora sale de una variable de entorno con el dominio VIVO por defecto. El
 * dia que intemperie.com.pa exista y apunte aqui, se cambia la variable en un
 * sitio y ya. Se hornea en build: `NEXT_PUBLIC_` es intencional.
 */
export const SITE_URL = (
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://intemperie.skjoldnetsystems.com"
).replace(/\/$/, "");

/** Resuelve una ruta relativa (`/products/...`) contra el dominio canonico. */
export const absoluteUrl = (path: string): string =>
  path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
