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
  { href: "/instaladores", label: "Instaladores" },
  { href: "/inspecciones", label: "Inspecciones" },
  { href: "/nosotros", label: "Nosotros" },
] as const
