/* Datos de navegación y contacto — sistema «Perímetro».
 *
 * Cabecera, panel móvil, barra superior y pie repetían el mismo número de
 * teléfono, el mismo horario y las mismas listas de producto en cuatro sitios.
 * Cuando cambie un modelo o un horario, se cambia aquí y sólo aquí.
 *
 * Es un módulo de datos sin JSX: no entra en ningún bundle de cliente más de
 * una vez y los componentes de servidor lo pueden importar sin arrastrar React.
 */

/* ── Contacto real de la empresa ──────────────────────────────────────────── */
export const CONTACT = {
  phoneDisplay: "+507 6287-4042",
  phoneHref: "tel:+50762874042",
  email: "ventas@intemperie.com",
  emailHref: "mailto:ventas@intemperie.com",
  hours: "Lun a Sáb · 8:00–18:00",
  city: "La Chorrera, Panamá Oeste",
} as const

/* Mensajes previos de WhatsApp. Cada punto de entrada abre el chat con su
   contexto puesto: el asesor sabe de dónde viene la persona sin preguntarlo. */
export const WA_MESSAGE = {
  general: "Hola Intemperie, quiero información sobre cercas.",
  quote: "Hola Intemperie, quiero cotizar el cercado de mi propiedad.",
  b2b: "Hola Intemperie, represento a una empresa y quiero precios por volumen.",
  install: "Hola Intemperie, necesito instalación de cerca.",
} as const

/* ── Catálogo para la navegación ──────────────────────────────────────────── */
export interface NavProduct {
  name: string
  slug: string
  /* La medida manda: es lo primero que pregunta quien cerca un terreno. */
  spec: string
}

export const PVC_RESIDENCIAL: NavProduct[] = [
  { name: "Oceánides 101", slug: "cerca-pvc-oceanides-101", spec: "1.2 m" },
  { name: "Super Oceánides 103", slug: "cerca-pvc-super-oceanides-103", spec: "1.5 m" },
  { name: "Pandora 201", slug: "cerca-pvc-pandora-201", spec: "1.5 m" },
  { name: "Pandora 204", slug: "cerca-pvc-pandora-204", spec: "1.5 m" },
  { name: "Afrodita 401", slug: "cerca-pvc-afrodita-401", spec: "1.8 m" },
]

export const PVC_INDUSTRIAL: NavProduct[] = [
  { name: "Atlas", slug: "cerca-pvc-atlas", spec: "1.5 m" },
  { name: "Atenea 303", slug: "cerca-pvc-atenea-303", spec: "1.8 m" },
  { name: "Atenea 305", slug: "cerca-pvc-atenea-305", spec: "1.8 m" },
  { name: "Vesta 601", slug: "cerca-pvc-vesta-601", spec: "2.0 m" },
]

export const PVC_COSTERAS: NavProduct[] = [
  { name: "Poseidón 502", slug: "cerca-pvc-poseidon-502", spec: "1.8 m" },
  { name: "Selene 701", slug: "cerca-pvc-selene-701", spec: "1.8 m" },
]

export const MALLAS: NavProduct[] = [
  { name: "Mini Titán", slug: "malla-electrosoldada-mini-titan", spec: "1.0 m" },
  { name: "Titán", slug: "malla-electrosoldada-titan", spec: "1.5 m" },
  { name: "Super Titán", slug: "malla-electrosoldada-super-titan", spec: "2.0 m" },
  { name: "Maximus", slug: "malla-electrosoldada-maximus", spec: "2.5 m" },
]

/* Las colecciones son el mapa mental del cliente: no compra «PVC», compra
   «cercar mi casa» o «cerrar una obra». Van con su público al lado. */
export const COLECCIONES = [
  { name: "Residencial", slug: "residencial", who: "Casas y quintas" },
  { name: "Industrial", slug: "industrial", who: "Naves y depósitos" },
  { name: "Zonas costeras", slug: "zonas-costeras", who: "Frente al salitre" },
  { name: "Gubernamental", slug: "gubernamental", who: "Entidades públicas" },
  { name: "Agropecuario", slug: "agropecuario", who: "Fincas y potreros" },
] as const

/* ── Enlaces sueltos de la barra de navegación ────────────────────────────── */
export const NAV_LINKS = [
  { href: "/calculadora", label: "Calculadora" },
  { href: "/inspecciones", label: "Inspecciones" },
  { href: "/instaladores", label: "Instaladores" },
  { href: "/nosotros", label: "Nosotros" },
] as const


/* ── Menú de la cuenta ─────────────────────────────────────────────────────
   Una sola lista para escritorio y para móvil.

   Estaban escritas por separado —`header-user.tsx` y `mobile-nav.tsx`— y ya
   habían divergido: el escritorio ofrecía el panel de administración e
   Inspecciones, y el móvil no, así que desde el teléfono no había forma de
   llegar a la herramienta de campo. Un menú duplicado no se desincroniza
   «si» alguien lo olvida, sino en cuanto alguien toca uno de los dos.

   Inspecciones aparece además en la barra principal. No es una fuga: la ruta
   la protege el middleware, que es donde se decide de verdad. Esconder el
   enlace era seguridad por oscuridad encima del arreglo real; lo que no debe
   estar es en el sitemap, porque una pantalla tras sesión no se indexa. */
export interface AccountLink {
  href: string
  label: string
}

export function accountLinks(role?: string): AccountLink[] {
  return [
    { href: "/cuenta", label: "Mi cuenta" },
    { href: "/cuenta/pedidos", label: "Mis pedidos" },
    { href: "/cuenta/direcciones", label: "Direcciones" },
    { href: "/favoritos", label: "Favoritos" },
    { href: "/inspecciones", label: "Inspecciones" },
    ...(role === "ADMIN" ? [{ href: "/admin", label: "Panel de administración" }] : []),
  ]
}


/* ── Volver donde estabas ──────────────────────────────────────────────────
   Quien pulsa «Iniciar sesión» desde la cabecera estaba haciendo algo: mirando
   una cerca, con el carrito a medias, comparando en el precotizador. El enlace
   no decía de dónde venía, así que el formulario caía a su destino por defecto
   —/cuenta— y la compra se quedaba atrás. Ahora el enlace lleva la ruta actual
   y el acceso devuelve exactamente ahí.

   No se arrastra la propia zona de acceso: volver a /login desde /login es un
   bucle, y venir de /registro y acabar en /registro es peor que ir al inicio. */
export function loginHref(pathname?: string | null): string {
  if (!pathname || !pathname.startsWith("/")) return "/login"
  if (pathname.startsWith("/login") || pathname.startsWith("/registro")) return "/login"
  return `/login?redirect=${encodeURIComponent(pathname)}`
}
