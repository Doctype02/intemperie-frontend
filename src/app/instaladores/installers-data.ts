/* Directorio de instaladores — sistema «Perímetro».
 *
 * ══════════════════════════════════════════════════════════════════════════
 * LO QUE SE PUBLICABA ANTES Y POR QUÉ SE HA DEJADO DE PUBLICAR
 * ══════════════════════════════════════════════════════════════════════════
 * La página `/instaladores` listaba seis empresas bajo el titular «Red de
 * Instaladores Certificados · Profesionales verificados por Intemperie», con
 * teléfono pulsable, enlace de WhatsApp, estrellas y conteo de obra.
 *
 * Los seis registros eran de relleno, y se nota desde fuera: los teléfonos
 * eran una serie —6123-4567, 6234-5678, 6345-6789, 6456-7890, 6567-8901,
 * 6678-9012— y los conteos de obra (47, 83, 31, 62, 28, 54) no salían de
 * ningún sitio. Publicar eso tiene tres costes, en este orden:
 *
 *   1. **Legal y reputacional.** «Verificados por Intemperie» es una
 *      afirmación de la empresa sobre terceros. Si el número no contesta o
 *      contesta otra persona, quien queda mal es la marca que lo certificó.
 *   2. **Comercial.** El visitante que llama a un número inventado no vuelve.
 *      Se pierde el lead en el momento exacto en que iba a contratar.
 *   3. **De producto.** Una serie de teléfonos consecutivos delata que la web
 *      tiene datos de mentira. A partir de ahí, el precio por metro tampoco
 *      se cree.
 *
 * ══════════════════════════════════════════════════════════════════════════
 * CÓMO PUBLICAR EL DIRECTORIO
 * ══════════════════════════════════════════════════════════════════════════
 * Rellenar `INSTALLERS` con los instaladores reales. Nada más: la página
 * detecta sola que hay lista, pinta el directorio agrupado por provincia,
 * saca el aviso legal y cambia los textos del encabezado. Con la lista vacía
 * —el estado de hoy— la misma página ofrece la vía que sí existe: coordinar
 * el montaje por WhatsApp con Intemperie.
 *
 * Se publica un instalador cuando se tienen TODOS los campos obligatorios.
 * Un registro a medias no se publica «mientras tanto»: se deja fuera.
 */

export interface Installer {
  /** Razón social o nombre comercial completo, tal y como factura. */
  name: string
  /**
   * Provincia, escrita igual que en el desplegable del formulario de registro
   * («Panamá Oeste», «Chiriquí»…). Es la clave de agrupación del directorio.
   */
  province: string
  /** Corregimientos o distritos que cubre de verdad. Ej.: ["La Chorrera", "Arraiján"] */
  areas: string[]
  /** Teléfono para mostrar, con formato panameño: «+507 6000-0000». */
  phoneDisplay: string
  /**
   * El mismo teléfono en dígitos y sin signos: «5076000000». Se usa para
   * `tel:` y para `wa.me`. Se guarda aparte para no derivarlo con una expresión
   * regular del texto visible, que es como se cuelan los enlaces rotos.
   */
  phoneDigits: string
  /** Qué monta. Ej.: «Cerca de PVC y malla electrosoldada». */
  focus: string
  /**
   * Mes en que Intemperie comprobó identidad, teléfono y referencias, en
   * formato AAAA-MM. Es lo que respalda la palabra «verificado»: sin fecha no
   * se pinta el distintivo, porque una verificación sin fecha no es una
   * verificación.
   */
  verifiedOn?: string
  /** Registro público del negocio (RUC / aviso de operación), si lo aporta. */
  taxId?: string
}

/* ── LO QUE SE PUBLICA ────────────────────────────────────────────────────
 *
 * Vacío a propósito. No es un TODO olvidado: es el estado real de la red hoy.
 * La página está construida y probada para este caso.
 *
 * PENDIENTE DEL CLIENTE, por instalador:
 *   · razón social completa
 *   · teléfono real, comprobado con una llamada
 *   · provincia y corregimientos que cubre
 *   · qué sistemas monta
 *   · mes de la verificación
 *   · RUC o aviso de operación (opcional, pero es lo que convierte
 *     «verificado» en algo que el comprador puede contrastar)
 */
export const INSTALLERS: Installer[] = []

/* ── DATOS PROVISIONALES · NO SE PUBLICAN ─────────────────────────────────
 *
 * ⚠️ ESTO ES RELLENO. Los teléfonos son una serie inventada y las zonas no
 * están confirmadas. Se conservan sólo como plantilla del formato y para que
 * quede constancia de qué estuvo publicado, no para volver a publicarlo.
 *
 * NO IMPORTAR ESTA CONSTANTE DESDE `page.tsx`. Si alguna vez hay que dar de
 * alta a alguna de estas empresas, se llama por teléfono, se confirma cada
 * campo, se le pone `verifiedOn` y se mueve a `INSTALLERS` una por una.
 *
 * Los conteos de obra que acompañaban a estos registros (47, 83, 31, 62, 28
 * y 54 proyectos) y las estrellas de valoración no se han trasladado: no hay
 * ni una obra ni una reseña detrás de esas cifras, y el tipo `Installer` ya
 * no tiene campo donde meterlas. Si algún día hay reseñas, vendrán de la API
 * con su autor y su fecha, no de un array escrito a mano.
 */
export const PROVISIONALES_SIN_VERIFICAR: Installer[] = [
  {
    name: "Construcciones Ríos",
    province: "Panamá Oeste",
    areas: ["La Chorrera"],
    phoneDisplay: "+507 6123-4567",
    phoneDigits: "50761234567",
    focus: "Cerca de PVC residencial",
  },
  {
    name: "Instalaciones Herrera & Asociados",
    province: "Panamá",
    areas: ["Ciudad de Panamá"],
    phoneDisplay: "+507 6234-5678",
    phoneDigits: "50762345678",
    focus: "Cerca de PVC industrial",
  },
  {
    name: "TechFence Panamá",
    province: "Panamá",
    areas: ["San Miguelito", "Arraiján"],
    phoneDisplay: "+507 6345-6789",
    phoneDigits: "50763456789",
    focus: "Malla electrosoldada",
  },
  {
    name: "Obras y Cercas del Pacífico",
    province: "Panamá Oeste",
    areas: ["Coronado", "Chame", "Antón"],
    phoneDisplay: "+507 6456-7890",
    phoneDigits: "50764567890",
    focus: "Zonas costeras, montaje anti-salitre",
  },
  {
    name: "Estructuras Moreno",
    province: "Veraguas",
    areas: ["Santiago"],
    phoneDisplay: "+507 6567-8901",
    phoneDigits: "50765678901",
    focus: "Cerca de PVC para entidades públicas",
  },
  {
    name: "Cercas del Interior",
    province: "Chiriquí",
    areas: ["David"],
    phoneDisplay: "+507 6678-9012",
    phoneDigits: "50766789012",
    focus: "Cerca de PVC residencial e industrial",
  },
]

/* ── Agrupación para el directorio ────────────────────────────────────────
 * El comprador no busca «un instalador»: busca uno que llegue hasta su
 * terreno. Por eso el directorio se ordena por provincia y no por nombre, y
 * la lista de provincias se cuenta de los datos —nunca se escribe a mano un
 * «6+ provincias cubiertas» como el que había en el encabezado—. */
export function byProvince(installers: Installer[]) {
  const groups = new Map<string, Installer[]>()

  for (const installer of installers) {
    const list = groups.get(installer.province)
    if (list) list.push(installer)
    else groups.set(installer.province, [installer])
  }

  return [...groups.entries()]
    .map(([province, list]) => ({
      province,
      installers: [...list].sort((a, b) => a.name.localeCompare(b.name, "es")),
    }))
    .sort((a, b) => a.province.localeCompare(b.province, "es"))
}

/* Mes de verificación en letra: «marzo de 2026». A mano y no con
 * `Intl.DateTimeFormat`, porque el contenedor de producción no siempre trae
 * los datos de `es-PA`. */
const MONTHS = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
]

export function monthLabel(value: string): string {
  const [year, month] = value.split("-")
  const name = MONTHS[Number(month) - 1]
  return name ? `${name} de ${year}` : year
}
