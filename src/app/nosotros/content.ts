import { mediaUrl } from "@/lib/image-utils"

/* Contenido de «Nosotros» — sistema «Perímetro».
 *
 * La página anterior escribía todo dentro del JSX: tres testimonios con
 * nombre de pila y ciudad, ocho fotografías de catálogo presentadas como
 * «nuestras instalaciones» sin pie, sin ubicación y sin fecha, y una promesa
 * de cobertura —«Latinoamérica y el Caribe»— que contradice al resto del
 * sitio, donde la política de envíos habla de la República de Panamá y el
 * `areaServed` del JSON-LD dice «PA».
 *
 * Regla de la casa, la misma que en `catalog-data.ts`: no se pinta ningún
 * dato que no se pueda comprobar. Una prueba social que el visitante no puede
 * verificar no genera confianza, la gasta — y en un ticket alto la gasta con
 * la persona que estaba a punto de firmar.
 *
 * Por eso este módulo existe y por eso sus cuatro listas salen VACÍAS. No es
 * un olvido: es el estado real del contenido hoy. La página está construida
 * para leerse entera y cerrar la venta con las listas a cero, y para absorber
 * el contenido real el día que llegue sin tocar el JSX. Rellenar aquí,
 * publicar; nada más.
 *
 * Lo que hay que pedirle al cliente está escrito campo por campo abajo.
 */

/* ── Lo que la empresa dice de sí misma ───────────────────────────────────
   Texto propio, no dato comprobable: no promete nada medible, así que se
   publica tal cual lo redactó el cliente. Sólo se corrigió la geografía. */

export interface EssencePillar {
  /** «Visión», «Misión», «Propósito». */
  label: string
  /** Resumen de una línea; es el titular visible de la tarjeta. */
  title: string
  body: string
}

export const ESSENCE: EssencePillar[] = [
  {
    label: "Visión",
    title: "Ser el referente en cerramientos de Panamá",
    body: "Convertirnos en la empresa de referencia del país en cercas de PVC y malla electrosoldada, reconocida por la calidad del material, la limpieza del montaje y el trato con cada cliente.",
  },
  {
    label: "Misión",
    title: "Proteger lo que más importa",
    body: "Fabricar, vender e instalar sistemas de cerramiento que combinan seguridad, estética y durabilidad, con asesoría técnica antes de comprar y acompañamiento durante la obra.",
  },
  {
    label: "Propósito",
    title: "Transformar espacios al aire libre",
    body: "Crear entornos seguros y duraderos para hogares, empresas e instituciones, aportando tranquilidad y valor a quien confía el perímetro de su propiedad a un proveedor.",
  },
]

/* ── Modelos fotografiados ────────────────────────────────────────────────
   Estas dos fotografías son de CATÁLOGO, no de obra entregada. Antes se
   presentaban bajo el rótulo «Nuestras instalaciones», que es afirmar algo
   que la foto no demuestra. Aquí se llaman por su nombre: es el modelo tal,
   y el enlace lleva a su ficha, donde están el precio y las medidas. Así la
   imagen sigue haciendo su trabajo —enseñar el producto— sin fingir ser una
   prueba de obra. */

export interface ModelShot {
  src: string
  alt: string
  /** Nombre comercial del modelo, tal y como aparece en el catálogo. */
  model: string
  /** Ficha del producto. */
  href: string
}

export const MODEL_SHOTS: ModelShot[] = [
  {
    src: mediaUrl("/products/cerca-pvc-vesta-601/vesta-1.jpg"),
    alt: "Cerca de PVC blanca de listones verticales cerrando el frente de una parcela",
    model: "Vesta 601 · 2.0 m",
    href: "/productos/cerca-pvc-vesta-601",
  },
  {
    src: mediaUrl("/products/cerca-pvc-atenea-305/porton.jpg"),
    alt: "Portón corredizo de PVC integrado en una cerca del mismo modelo",
    model: "Atenea 305 · 1.8 m",
    href: "/productos/cerca-pvc-atenea-305",
  },
]

/* ── Equipo ───────────────────────────────────────────────────────────────
   VACÍO A PROPÓSITO. La sección no se pinta mientras no haya nadie cargado:
   una parrilla de siluetas grises con nombres inventados es peor que no tener
   sección.

   PENDIENTE DEL CLIENTE, por persona:
     · nombre y apellido reales
     · cargo
     · desde cuándo está en la empresa (año)
     · fotografía horizontal, mínimo 800 px de ancho, o ninguna (la tarjeta
       funciona con iniciales) */

export interface TeamMember {
  name: string
  role: string
  /** Año de incorporación, en cifras: «2014». */
  since?: string
  photo?: { src: string; alt: string }
}

export const TEAM: TeamMember[] = []

/* ── Certificaciones y respaldos ──────────────────────────────────────────
   VACÍO A PROPÓSITO. «Fábricas certificadas» sin decir por quién no es una
   certificación, es un adjetivo.

   PENDIENTE DEL CLIENTE, por certificación:
     · nombre exacto del certificado o la norma (ej.: «ASTM F964»)
     · organismo que lo emite
     · año de emisión y de caducidad si la tiene
     · a qué aplica: al material, al proceso o a la empresa
     · enlace al documento público, si existe */

export interface Certification {
  name: string
  issuer: string
  /** Año de emisión en cifras. */
  year?: string
  scope?: string
  href?: string
}

export const CERTIFICATIONS: Certification[] = []

/* ── Obras entregadas ─────────────────────────────────────────────────────
   VACÍO A PROPÓSITO. Aquí había ocho fotografías del catálogo rotuladas
   «Proyecto 1»… «Proyecto 8». Una obra sin ubicación ni fecha no prueba nada
   y encima invita a la pregunta incómoda: «¿de cuándo es esto?».

   PENDIENTE DEL CLIENTE, por obra:
     · ubicación: corregimiento y provincia (ej.: «Vista Alegre, Arraiján»)
     · mes y año de entrega, en formato AAAA-MM
     · modelo instalado y metros lineales
     · una fotografía de la obra terminada, tomada en el sitio
     · permiso del propietario para publicarla */

export interface Project {
  image: { src: string; alt: string }
  /** Corregimiento y provincia. */
  location: string
  /** Mes de entrega, «2026-03». Se muestra en letra. */
  deliveredOn: string
  /** Modelo instalado, con enlace a su ficha si está en catálogo. */
  model: string
  modelHref?: string
  /** Metros lineales entregados. */
  meters?: number
}

export const PROJECTS: Project[] = []

/* ── Testimonios ──────────────────────────────────────────────────────────
   VACÍO A PROPÓSITO. Los tres que había eran nombre de pila, ciudad y cinco
   estrellas: el formato exacto del testimonio inventado. Un comprador que se
   gasta cuatro cifras los lee así.

   PENDIENTE DEL CLIENTE, por testimonio:
     · nombre y apellido de quien lo firma
     · corregimiento y provincia
     · mes y año de la obra
     · modelo instalado
     · consentimiento por escrito para publicarlo con nombre */

export interface Testimonial {
  quote: string
  /** Nombre y apellido. Sin apellido no se publica. */
  author: string
  location: string
  /** Mes de la obra, «2026-03». */
  date: string
  model?: string
}

export const TESTIMONIALS: Testimonial[] = []

/* ── Utilidad de formato ──────────────────────────────────────────────────
   Convierte «2026-03» en «marzo de 2026». Se hace a mano y no con
   `Intl.DateTimeFormat` para no depender de que el `locale` del contenedor
   tenga datos de es-PA: en el servidor de producción no los tiene siempre. */

const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

export function monthLabel(value: string): string {
  const [year, month] = value.split("-")
  const name = MONTHS[Number(month) - 1]
  return name ? `${name} de ${year}` : year
}
