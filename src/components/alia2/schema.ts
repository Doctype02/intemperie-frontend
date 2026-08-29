import { z } from "zod";

import {
  ALL_REGIONS,
  DOCUMENT_MAX_BYTES,
  DOCUMENT_MIME_TYPES,
  ECONOMIC_ACTIVITIES,
  YEARS_RANGES,
} from "./content";

/**
 * Validación del formulario de ingreso a ALIA2.
 *
 * IMPORTANTE: esta validación es comodidad para quien completa el formulario,
 * NO una barrera de seguridad. El servidor vuelve a validar cada campo, el tipo
 * y el tamaño del adjunto; aquí solo evitamos un viaje de ida y vuelta inútil.
 */

/**
 * El RUC panameño tiene varias formas históricas (`1234567890-1-2`, `8-123-456`,
 * `155123456-2-2017`). Se acepta un patrón deliberadamente permisivo: rechazar
 * un RUC válido por reglas propias sería peor que dejar que el servidor decida.
 */
const RUC_PATTERN = /^[0-9A-Za-z]{1,12}(?:-[0-9A-Za-z]{1,6}){1,3}$/;

/** Teléfonos de Panamá: 7 dígitos (fijo) u 8 dígitos (móvil), con o sin guiones. */
const isPanamaPhone = (value: string) => /^\d{7,8}$/.test(value.replace(/\D/g, ""));

const acceptedMimeTypes: readonly string[] = DOCUMENT_MIME_TYPES;

export const documentSchema = z
  .custom<File>(
    (value) => typeof File !== "undefined" && value instanceof File && value.size > 0,
    "Adjunta el aviso de operación o un documento legal de la empresa",
  )
  .refine((file) => file.size <= DOCUMENT_MAX_BYTES, "El archivo supera el máximo de 10 MB")
  .refine(
    (file) => acceptedMimeTypes.includes(file.type) || /\.(pdf|jpe?g)$/i.test(file.name),
    "Formato no admitido. Sube un archivo PDF o JPG",
  );

export const alia2ApplicationSchema = z.object({
  legalName: z
    .string()
    .trim()
    .min(3, "Ingresa la razón social de la empresa")
    .max(150, "Máximo 150 caracteres"),
  tradeName: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre comercial")
    .max(150, "Máximo 150 caracteres"),
  ruc: z
    .string()
    .trim()
    .min(1, "Ingresa el RUC de la empresa")
    .regex(RUC_PATTERN, "Formato de RUC no válido. Ej.: 1234567890-1-2"),
  operationNotice: z
    .string()
    .trim()
    .min(3, "Ingresa el número de aviso de operación")
    .max(60, "Máximo 60 caracteres"),
  representativeName: z
    .string()
    .trim()
    .min(3, "Ingresa el nombre completo del representante")
    .max(150, "Máximo 150 caracteres"),
  corporateEmail: z
    .string()
    .trim()
    .min(1, "Ingresa el correo corporativo")
    .pipe(z.email("Ingresa un correo corporativo válido. Ej.: ventas@empresa.com")),
  phone: z
    .string()
    .trim()
    .min(1, "Ingresa un teléfono de contacto")
    .refine(isPanamaPhone, "Ingresa un número de 7 u 8 dígitos. Ej.: 6000-0000"),
  province: z
    .string()
    .min(1, "Selecciona una provincia")
    .refine((value) => ALL_REGIONS.includes(value), "Selecciona una provincia de la lista"),
  economicActivity: z
    .string()
    .min(1, "Selecciona la actividad económica")
    .refine(
      (value) => (ECONOMIC_ACTIVITIES as readonly string[]).includes(value),
      "Selecciona una actividad de la lista",
    ),
  yearsOperating: z
    .string()
    .min(1, "Selecciona los años de operación")
    .refine(
      (value) => (YEARS_RANGES as readonly string[]).includes(value),
      "Selecciona un rango de la lista",
    ),
  projectTypes: z
    .string()
    .trim()
    .min(3, "Describe los principales proyectos o servicios")
    .max(300, "Máximo 300 caracteres"),
  website: z
    .string()
    .trim()
    .max(200, "Máximo 200 caracteres")
    .refine(
      (value) => value.length === 0 || value.length >= 4,
      "Ingresa una página web o un usuario de redes válido",
    ),
  document: documentSchema,
  acceptTerms: z
    .boolean()
    .refine((value) => value === true, "Debes aceptar los términos y condiciones del programa"),
});

export type Alia2ApplicationValues = z.infer<typeof alia2ApplicationSchema>;

/**
 * Orden visual de los campos. Se usa para llevar el foco al PRIMER campo
 * inválido tras un envío fallido (WCAG 2.2 – 3.3.1 / 2.4.3), y para ordenar el
 * resumen de errores.
 */
export const FIELD_ORDER = [
  "legalName",
  "tradeName",
  "ruc",
  "operationNotice",
  "representativeName",
  "corporateEmail",
  "phone",
  "province",
  "economicActivity",
  "yearsOperating",
  "projectTypes",
  "website",
  "document",
  "acceptTerms",
] as const satisfies readonly (keyof Alia2ApplicationValues)[];

export const FIELD_LABELS: Record<keyof Alia2ApplicationValues, string> = {
  legalName: "Razón social",
  tradeName: "Nombre comercial",
  ruc: "RUC",
  operationNotice: "Aviso de operación",
  representativeName: "Nombre del representante",
  corporateEmail: "Correo corporativo",
  phone: "Teléfono / WhatsApp",
  province: "Provincia",
  economicActivity: "Actividad económica",
  yearsOperating: "Años de operación",
  projectTypes: "Tipo de proyectos o servicios",
  website: "Página web / redes sociales",
  document: "Subir documento",
  acceptTerms: "Términos y condiciones",
};

/** Valores iniciales: se conservan intactos si el envío falla. */
export const EMPTY_APPLICATION: Alia2ApplicationValues = {
  legalName: "",
  tradeName: "",
  ruc: "",
  operationNotice: "",
  representativeName: "",
  corporateEmail: "",
  phone: "",
  province: "",
  economicActivity: "",
  yearsOperating: "",
  projectTypes: "",
  website: "",
  document: undefined as unknown as File,
  acceptTerms: false,
};
