import { API_BASE } from "@/lib/api";
import type { Alia2ApplicationValues } from "@/components/alia2/schema";

/* ─── Contrato asumido con el API comercial ───────────────────────────────────
 *
 * `POST {API_BASE}/alia2/applications` — público (sin login), multipart porque
 * lleva el adjunto de la empresa. Todo el acoplamiento con el backend vive en
 * ESTE archivo: si cambia el endpoint, el nombre de un campo o el envoltorio de
 * la respuesta, no hay que tocar el formulario ni su accesibilidad.
 *
 * Petición (multipart/form-data):
 *   requestedLevel       "ALIA2" | "PRO" | "MAX"
 *   legalName, tradeName, ruc, operationNotice, representativeName,
 *   corporateEmail, phone, province, economicActivity, yearsOperating
 *   projectTypes         repetido (el servidor lo recibe como lista)
 *   website              opcional
 *   termsAccepted        "true"
 *   document             archivo PDF o JPG (campo `document`)
 *   utmSource / utmMedium / utmCampaign / referrer   opcionales, procedencia
 *
 * Respuesta 201: { success: true, data: { id, status, createdAt } }
 * Errores:
 *   400 validación → { message: "Validation failed", errors: [{ field, message }] }
 *                    (el `field` viene prefijado con "body.")
 *   otros          → { success: false, error: { message, errors? } }
 *   429            → límite de envíos del propio endpoint.
 *
 * La validación de verdad la hace el servidor: valida cada campo, comprueba el
 * tipo real del adjunto por contenido (no por extensión) y aplica su propio
 * límite de tamaño. Lo de este lado es comodidad para quien rellena.
 */

export const ALIA2_APPLICATIONS_PATH = "/alia2/applications";

export type Alia2Level = "ALIA2" | "PRO" | "MAX";

/** Lo que el API devuelve al aceptar la solicitud. */
export interface Alia2ApplicationReceipt {
  id: string;
  /** Estado inicial que asigna el servidor (p. ej. "PENDING"). */
  status: string | null;
  createdAt: string | null;
}

export type Alia2FieldErrors = Partial<Record<keyof Alia2ApplicationValues, string>>;

/**
 * Error de envío con la forma que el formulario sabe leer: un mensaje para la
 * región de error y, si el servidor los detalló, errores por campo.
 */
export class Alia2SubmitError extends Error {
  readonly status: number;
  readonly fieldErrors?: Alia2FieldErrors;

  constructor(message: string, status: number, fieldErrors?: Alia2FieldErrors) {
    super(message);
    this.name = "Alia2SubmitError";
    this.status = status;
    this.fieldErrors = fieldErrors;
  }
}

const GENERIC_ERROR =
  "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo: no perdiste nada de lo que escribiste.";

const MESSAGE_BY_STATUS: Record<number, string> = {
  413: "El documento adjunto es demasiado grande. Sube un archivo de máximo 10 MB.",
  429: "Recibimos varias solicitudes desde esta conexión. Espera unos minutos e inténtalo de nuevo.",
  500: "El servidor no pudo procesar la solicitud. Vuelve a intentarlo en unos minutos.",
  502: "El servidor no está respondiendo. Vuelve a intentarlo en unos minutos.",
  503: "El servidor no está respondiendo. Vuelve a intentarlo en unos minutos.",
  504: "El servidor tardó demasiado en responder. Vuelve a intentarlo en unos minutos.",
};

/**
 * Nombres del servidor → nombres del formulario. Solo hace falta declarar los
 * que difieren; el resto coincide y se traduce solo.
 */
const SERVER_TO_FORM_FIELD: Record<string, keyof Alia2ApplicationValues> = {
  termsAccepted: "acceptTerms",
};

const FORM_FIELD_NAMES = new Set<string>([
  "requestedLevel",
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
]);

/** `"body.ruc"` → `"ruc"`; `"termsAccepted"` → `"acceptTerms"`. */
function toFormField(rawField: unknown): keyof Alia2ApplicationValues | null {
  if (typeof rawField !== "string" || rawField.length === 0) return null;

  const leaf = rawField.split(".").filter(Boolean).pop();
  if (!leaf) return null;

  const mapped = SERVER_TO_FORM_FIELD[leaf] ?? leaf;
  return FORM_FIELD_NAMES.has(mapped) ? (mapped as keyof Alia2ApplicationValues) : null;
}

interface ServerIssue {
  field?: unknown;
  message?: unknown;
}

/** Extrae la lista de errores por campo venga en la raíz o dentro de `error`. */
function readIssues(payload: unknown): ServerIssue[] {
  if (typeof payload !== "object" || payload === null) return [];

  const root = payload as { errors?: unknown; error?: { errors?: unknown } };
  const candidate = Array.isArray(root.errors)
    ? root.errors
    : Array.isArray(root.error?.errors)
      ? root.error.errors
      : [];

  return candidate.filter(
    (issue): issue is ServerIssue => typeof issue === "object" && issue !== null,
  );
}

function readMessage(payload: unknown): string | null {
  if (typeof payload !== "object" || payload === null) return null;

  const root = payload as { message?: unknown; error?: { message?: unknown } };
  const candidates = [root.error?.message, root.message];

  for (const value of candidates) {
    // "Validation failed" es un mensaje interno del servidor: no se enseña.
    if (typeof value === "string" && value.trim() && !/^validation failed$/i.test(value.trim())) {
      return value.trim();
    }
  }

  return null;
}

async function readBody(response: Response): Promise<unknown> {
  try {
    return await response.json();
  } catch {
    return null;
  }
}

/** Teléfono panameño: se manda con prefijo internacional, como espera Ventas. */
function formatPhone(raw: string): string {
  const digits = raw.replace(/\D/g, "");
  const local = digits.startsWith("507") && digits.length > 8 ? digits.slice(3) : digits;
  return `+507 ${local}`;
}

/**
 * El servidor espera una lista de tipos de proyecto. En el formulario es un
 * campo de texto (así lo pidió el diseño), de modo que aquí se separa por comas
 * o saltos de línea y se envía como campos repetidos.
 */
function splitProjectTypes(raw: string): string[] {
  const parts = raw
    .split(/[,\n;]+/)
    .map((part) => part.trim())
    .filter(Boolean);

  return parts.length > 0 ? parts : [raw.trim()].filter(Boolean);
}

/** Procedencia de la visita (campañas). Silencioso: si no hay, no se manda. */
export interface Alia2Attribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  referrer?: string;
}

export function readAttribution(): Alia2Attribution {
  if (typeof window === "undefined") return {};

  try {
    const params = new URLSearchParams(window.location.search);
    const attribution: Alia2Attribution = {};

    const source = params.get("utm_source");
    const medium = params.get("utm_medium");
    const campaign = params.get("utm_campaign");

    if (source) attribution.utmSource = source.slice(0, 200);
    if (medium) attribution.utmMedium = medium.slice(0, 200);
    if (campaign) attribution.utmCampaign = campaign.slice(0, 200);
    if (document.referrer) attribution.referrer = document.referrer.slice(0, 2000);

    return attribution;
  } catch {
    return {};
  }
}

/** Arma el `FormData` exacto que espera el endpoint. */
export function buildApplicationFormData(
  values: Alia2ApplicationValues,
  attribution: Alia2Attribution = {},
): FormData {
  const body = new FormData();

  body.append("requestedLevel", values.requestedLevel);
  body.append("legalName", values.legalName.trim());
  body.append("tradeName", values.tradeName.trim());
  body.append("ruc", values.ruc.trim());
  body.append("operationNotice", values.operationNotice.trim());
  body.append("representativeName", values.representativeName.trim());
  body.append("corporateEmail", values.corporateEmail.trim());
  body.append("phone", formatPhone(values.phone));
  body.append("province", values.province);
  body.append("economicActivity", values.economicActivity);
  body.append("yearsOperating", values.yearsOperating);

  for (const projectType of splitProjectTypes(values.projectTypes)) {
    body.append("projectTypes", projectType);
  }

  const website = values.website.trim();
  if (website) body.append("website", website);

  body.append("termsAccepted", values.acceptTerms ? "true" : "false");
  body.append("document", values.document, values.document.name);

  for (const [key, value] of Object.entries(attribution)) {
    if (value) body.append(key, value);
  }

  return body;
}

/**
 * Envía la solicitud de ingreso a ALIA2.
 *
 * No se fija `Content-Type` a mano: el navegador debe añadir el `boundary` del
 * multipart. `credentials: "include"` porque el endpoint enlaza la solicitud a
 * la cuenta si ya hay sesión (nunca la exige).
 */
export async function submitAlia2Application(
  values: Alia2ApplicationValues,
  options: { signal?: AbortSignal } = {},
): Promise<Alia2ApplicationReceipt> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE}${ALIA2_APPLICATIONS_PATH}`, {
      method: "POST",
      body: buildApplicationFormData(values, readAttribution()),
      credentials: "include",
      signal: options.signal,
    });
  } catch (error) {
    // `AbortError` se propaga tal cual: no es un fallo que enseñar al usuario.
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    throw new Alia2SubmitError(GENERIC_ERROR, 0);
  }

  const payload = await readBody(response);

  if (!response.ok) {
    const fieldErrors: Alia2FieldErrors = {};

    for (const issue of readIssues(payload)) {
      const field = toFormField(issue.field);
      const message = typeof issue.message === "string" ? issue.message.trim() : "";
      if (field && message && !fieldErrors[field]) {
        fieldErrors[field] = message;
      }
    }

    const detailed = Object.keys(fieldErrors).length > 0;
    const message =
      readMessage(payload) ??
      MESSAGE_BY_STATUS[response.status] ??
      (detailed
        ? "Revisa los campos marcados y vuelve a enviar la solicitud."
        : GENERIC_ERROR);

    throw new Alia2SubmitError(
      message,
      response.status,
      detailed ? fieldErrors : undefined,
    );
  }

  const data = (payload as { data?: Partial<Alia2ApplicationReceipt> } | null)?.data;

  return {
    id: typeof data?.id === "string" ? data.id : "",
    status: typeof data?.status === "string" ? data.status : null,
    createdAt: typeof data?.createdAt === "string" ? data.createdAt : null,
  };
}
