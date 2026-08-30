/* Programa de instaladores: textos — sistema «Perímetro».
 *
 * Esto es la parte de la página que NO depende de que haya nadie dado de alta:
 * qué ofrece el programa, cómo se entra y qué hace falta para entrar. Vive
 * aparte del JSX por la misma razón que `installers-data.ts`: son condiciones
 * comerciales, cambian sin que cambie la maquetación y las tiene que poder
 * revisar alguien que no lea React.
 *
 * ⚠️ CIFRAS HEREDADAS, PENDIENTES DE CONFIRMAR POR EL CLIENTE. Vienen de la
 * versión anterior de la página y no se han inventado aquí, pero tampoco están
 * verificadas contra ninguna política escrita:
 *   · «3 a 5 días hábiles» de revisión de perfil (PASOS)
 *   · «7 a 14 días hábiles» de proceso completo (FAQ)
 *   · «desde $200 por pedido» para el descuento de instalador (FAQ)
 *   · «mínimo 2 años de experiencia» y «3 referencias» (REQUISITOS)
 * Mientras no se confirmen, son promesas que la empresa tendrá que cumplir
 * cada vez que alguien rellene el formulario.
 */

import type { LucideIcon } from "lucide-react"
import { Award, BadgePercent, Headphones, Truck } from "lucide-react"

export interface Benefit {
  Icon: LucideIcon
  title: string
  body: string
}

export const BENEFITS: Benefit[] = [
  {
    Icon: BadgePercent,
    title: "Precio de instalador",
    body: "Compra el material al precio de instalador, no al de tienda. El margen de la obra se lo queda usted.",
  },
  {
    Icon: Truck,
    title: "Despacho con prioridad",
    body: "Sus pedidos salen antes y se coordinan con su calendario de obra, no con el nuestro.",
  },
  {
    Icon: Award,
    title: "Alta en el directorio",
    body: "Cuando el directorio esté publicado, aparecerá en él con su zona de cobertura y le pasaremos los clientes que pregunten por ella.",
  },
  {
    Icon: Headphones,
    title: "Soporte técnico directo",
    body: "Una línea de WhatsApp con el taller para dudas de medida, material y montaje.",
  },
]

export interface Step {
  num: string
  title: string
  body: string
}

export const STEPS: Step[] = [
  {
    num: "01",
    title: "Envía la solicitud",
    body: "El formulario pide experiencia, zona de cobertura y referencias de obra. Diez minutos.",
  },
  {
    num: "02",
    title: "Comprobamos los datos",
    body: "Llamamos al teléfono que deja y contrastamos las referencias. Entre 3 y 5 días hábiles.",
  },
  {
    num: "03",
    title: "Capacitación de montaje",
    body: "Una sesión sobre montaje correcto de cerca de PVC y malla: replanteo, postes, anclaje y remates.",
  },
  {
    num: "04",
    title: "Alta y precio de instalador",
    body: "Queda dado de alta, con el precio de instalador activo y su ficha lista para el directorio.",
  },
]

export const REQUIREMENTS: string[] = [
  "Al menos 2 años montando cercas o estructuras similares",
  "Herramienta y equipo propios",
  "Disponibilidad real en la zona de cobertura que declare",
  "Tres referencias de obra que podamos llamar",
  "Completar la capacitación de montaje de Intemperie",
]

export interface FaqItem {
  q: string
  a: string
}

export const FAQ: FaqItem[] = [
  {
    q: "¿La certificación cuesta algo?",
    a: "No. El alta y la capacitación son gratuitas para el instalador que cumple los requisitos. Sólo pone su tiempo.",
  },
  {
    q: "¿Cuánto tarda el proceso?",
    a: "Entre 7 y 14 días hábiles desde que envía la solicitud, según la agenda de capacitaciones.",
  },
  {
    q: "¿Puedo montar cercas de otras marcas?",
    a: "Sí. El alta sólo afecta a lo que monte de Intemperie. Con el resto de su trabajo no nos metemos.",
  },
  {
    q: "¿Cómo llegan los clientes?",
    a: "Cuando alguien de su zona pide instalación, le pasamos el contacto por WhatsApp. Usted decide si coge la obra. Mientras el directorio no esté publicado, el reparto lo hacemos nosotros a mano.",
  },
  {
    q: "¿Hay compra mínima?",
    a: "No hay volumen mínimo para seguir de alta. El precio de instalador se aplica a partir de $200 en producto por pedido.",
  },
  {
    q: "¿Intemperie responde por el trabajo del instalador?",
    a: "No. La garantía de Intemperie cubre el material, con el plazo que indica la ficha de cada modelo. El montaje lo contrata usted directamente con el instalador y lo responde él. Pida siempre cotización por escrito.",
  },
]

/* ── Opciones del formulario de registro ──────────────────────────────────
 *
 * Estaban escritas dentro de `registro/page.tsx`, que además es un componente
 * de cliente: cada opción viajaba al navegador dentro del bundle y nadie que
 * no leyera React podía revisarlas. Ahora viven aquí, junto a los requisitos
 * que el formulario dice comprobar, para que las dos listas no se contradigan
 * —que es exactamente lo que pasaba: la página decía «mínimo 2 años» y la
 * barra lateral del formulario decía «al menos 1 año».
 */

/* División político-administrativa de Panamá: diez provincias y cinco
 * comarcas. La lista anterior las mezclaba en un solo desplegable, ponía
 * «Emberá» y «Madungandí» al nivel de una provincia y se dejaba fuera la
 * comarca Guna de Wargandí. Se agrupan porque el instalador declara dónde
 * trabaja y porque `Installer.province` usa esta misma cadena como clave del
 * directorio: si aquí se escribe distinto, la agrupación se parte.
 */
export interface OptionGroup {
  label: string
  options: string[]
}

export const COVERAGE_AREAS: OptionGroup[] = [
  {
    label: "Provincias",
    options: [
      "Bocas del Toro",
      "Chiriquí",
      "Coclé",
      "Colón",
      "Darién",
      "Herrera",
      "Los Santos",
      "Panamá",
      "Panamá Oeste",
      "Veraguas",
    ],
  },
  {
    label: "Comarcas",
    options: [
      "Emberá-Wounaan",
      "Guna de Madugandí",
      "Guna de Wargandí",
      "Guna Yala",
      "Ngäbe-Buglé",
    ],
  },
]

/* Qué monta. La lista anterior ofrecía «cercas de madera» y «cercas
 * metálicas»: Intemperie no fabrica ninguna de las dos, así que preguntarlo
 * en un formulario de alta no informaba de nada y sugería un catálogo que no
 * existe. Estas cuatro salen del catálogo real. */
export interface SpecialtyOption {
  value: string
  label: string
}

export const SPECIALTIES: SpecialtyOption[] = [
  { value: "pvc", label: "Cerca de PVC" },
  { value: "malla", label: "Malla electrosoldada" },
  { value: "portones", label: "Portones y accesos" },
  { value: "obra", label: "Obra civil: bases, dados y anclajes" },
]

export const EXPERIENCE_RANGES: string[] = [
  "Menos de 1 año",
  "Entre 1 y 2 años",
  "Entre 3 y 5 años",
  "Entre 6 y 10 años",
  "Más de 10 años",
]

/* El número mínimo de años que pide REQUISITOS, escrito una vez. El campo de
 * experiencia lo cita bajo el desplegable en lugar de dejar que alguien
 * rellene diez minutos de formulario para que le digan que no llega. */
export const MIN_YEARS_NOTE =
  "El programa pide al menos 2 años montando cercas. Puede enviar la solicitud igualmente: lo valoramos caso por caso."

/* Texto de cierre del formulario. Dice lo que de verdad pasa al pulsar el
 * botón —se abre WhatsApp con la solicitud escrita— y no promete un plazo
 * distinto del que promete PASOS. */
export const SUBMIT_NOTE =
  "El botón abre WhatsApp con la solicitud ya redactada. Nada se envía hasta que usted le dé a enviar en WhatsApp."
