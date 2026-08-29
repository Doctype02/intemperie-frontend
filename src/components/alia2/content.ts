/**
 * Copy y datos estáticos de la landing B2B de ALIA2.
 *
 * Vive aparte de los componentes para que marketing pueda ajustar textos sin
 * tocar JSX, y para que el formulario y las secciones compartan exactamente las
 * mismas listas (provincias, actividades, rangos) que valida el esquema zod.
 */

export const ALIA2_ANCHOR = "solicitud";

export const HERO = {
  badge: "Programa exclusivo para empresas del sector construcción e instalación",
  titleLead: "Solicita tu ingreso a",
  titleBrand: "ALIA2",
  titleTail: "DE INTEMPERIE",
  description:
    "Completa el formulario y nuestro equipo evaluará tu empresa para enviarte una propuesta comercial.",
  eyebrowLeft: "PROGRAMA B2B",
  eyebrowLeftSub: "Para empresas",
  eyebrowRight: "EXCLUSIVO",
  eyebrowRightSub: "Para empresas",
  cta: "Solicitar ingreso",
} as const;

export const INTRO = {
  eyebrow: "Programa exclusivo para profesionales del sector",
  body:
    "ALIA2 DE INTEMPERIE está dirigido a empresas, contratistas e instaladores con actividad comprobable en construcción, remodelación, cerramientos y áreas relacionadas. Todas las solicitudes están sujetas a revisión y aprobación por parte de Intemperie.",
} as const;

export type TierAccent = "blue" | "teal" | "orange";

/**
 * Identificadores de nivel tal y como los espera el API (`requestedLevel`).
 * Viven aquí para que el esquema zod, las tarjetas y el envío usen la MISMA
 * lista y no se puedan desincronizar.
 */
export const ALIA2_LEVEL_IDS = ["ALIA2", "PRO", "MAX"] as const;

export type Alia2LevelId = (typeof ALIA2_LEVEL_IDS)[number];

export interface Tier {
  id: string;
  /** Valor que viaja al API. */
  level: Alia2LevelId;
  name: string;
  tagline: string;
  accent: TierAccent;
  bullets: readonly string[];
}

export const TIERS: readonly Tier[] = [
  {
    id: "alia2",
    level: "ALIA2",
    name: "ALIA2",
    tagline: "Nivel inicial",
    accent: "blue",
    bullets: ["Beneficios desde la primera compra", "Acceso al programa", "Descuentos iniciales"],
  },
  {
    id: "alia2-pro",
    level: "PRO",
    name: "ALIA2 PRO",
    tagline: "Mayor ventaja por volumen",
    accent: "teal",
    bullets: ["Más beneficios comerciales", "Mejores condiciones", "Crecimiento progresivo"],
  },
  {
    id: "alia2-max",
    level: "MAX",
    name: "ALIA2 MAX",
    tagline: "Beneficios preferenciales",
    accent: "orange",
    bullets: ["Condiciones superiores", "Atención prioritaria", "Ventajas especiales"],
  },
] as const;

export type BenefitIcon =
  | "discount"
  | "repurchase"
  | "quote"
  | "training"
  | "freight"
  | "labor";

export interface Benefit {
  icon: BenefitIcon;
  title: string;
}

export const BENEFITS: readonly Benefit[] = [
  { icon: "discount", title: "Descuentos escalonados" },
  { icon: "repurchase", title: "Beneficios por recompra" },
  { icon: "quote", title: "Cotización prioritaria" },
  { icon: "training", title: "Capacitaciones especiales" },
  { icon: "freight", title: "Acarreo con beneficios" },
  { icon: "labor", title: "Beneficios en mano de obra" },
] as const;

export type TrustIcon = "shield" | "users" | "lock";

export interface TrustItem {
  icon: TrustIcon;
  title: string;
  description: string;
}

export const TRUST_ITEMS: readonly TrustItem[] = [
  {
    icon: "shield",
    title: "Programa exclusivo",
    description: "Solo para empresas del sector construcción e instalación.",
  },
  {
    icon: "users",
    title: "Evaluación personalizada",
    description: "Analizamos tu empresa para ofrecerte la mejor propuesta comercial.",
  },
  {
    icon: "lock",
    title: "Información confidencial",
    description: "Tus datos están protegidos y no serán compartidos con terceros.",
  },
] as const;

/** Las 10 provincias de Panamá. */
export const PROVINCES = [
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
] as const;

/** Comarcas indígenas con estatus provincial o comarcal. */
export const COMARCAS = ["Emberá-Wounaan", "Guna Yala", "Naso Tjër Di", "Ngäbe-Buglé"] as const;

export const ALL_REGIONS: readonly string[] = [...PROVINCES, ...COMARCAS];

export const ECONOMIC_ACTIVITIES = [
  "Construcción",
  "Instalación de cercas y cerramientos",
  "Remodelación y acabados",
  "Desarrollo inmobiliario",
  "Ferretería o distribución de materiales",
  "Paisajismo y obras exteriores",
  "Agropecuaria",
  "Otra actividad relacionada",
] as const;

export const YEARS_RANGES = [
  "Menos de 1 año",
  "1 – 2 años",
  "3 – 5 años",
  "6 – 10 años",
  "Más de 10 años",
] as const;

export const TIERS_COPY = {
  title: "Elige el nivel que impulsa tu crecimiento",
  cta: "Solicitar",
  /** Texto accesible del CTA de cada tarjeta (evita tres "Solicitar" iguales). */
  ctaLabel: (name: string) => `Solicitar ingreso al nivel ${name}`,
} as const;

export const FORM_COPY = {
  title: "Formulario de registro para empresas",
  subtitle: "Toda la información será tratada de manera confidencial.",
  levelLegend: "Nivel al que deseas aplicar",
  levelHint: "Nuestro equipo confirmará el nivel definitivo tras evaluar tu empresa.",
  projectTypesHint: "Separa varios servicios con comas.",
  submit: "Enviar solicitud",
  submitting: "Enviando solicitud…",
  disclaimer: "Solicitud sujeta a validación y aprobación de Intemperie.",
} as const;

/** Límites del adjunto. El servidor los vuelve a aplicar: aquí son comodidad. */
export const DOCUMENT_MAX_BYTES = 10 * 1024 * 1024;
export const DOCUMENT_ACCEPT = ".pdf,.jpg,.jpeg,application/pdf,image/jpeg";
export const DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg"] as const;
