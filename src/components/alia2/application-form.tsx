"use client";

import * as React from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, CheckCircle2, ClipboardList, Loader2, Send, ShieldCheck } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  ALIA2_ANCHOR,
  COMARCAS,
  ECONOMIC_ACTIVITIES,
  FORM_COPY,
  PROVINCES,
  YEARS_RANGES,
} from "./content";
import { FileDropzone } from "./file-dropzone";
import { SelectField, TextField } from "./fields";
import {
  alia2ApplicationSchema,
  EMPTY_APPLICATION,
  FIELD_LABELS,
  FIELD_ORDER,
  type Alia2ApplicationValues,
} from "./schema";
import { FOCUS_RING } from "./theme";

/* ─── Contrato con quien envía ────────────────────────────────────────────────
 *
 * El formulario NO conoce el transporte. Recibe la función de envío por prop, de
 * modo que cambiar el endpoint, el formato multipart o el envoltorio de la
 * respuesta se resuelve en `src/lib/api/alia2.ts` sin tocar este archivo (y sin
 * tocar la accesibilidad, que es lo caro de mantener).
 */

export interface Alia2SubmitResult {
  /** Referencia legible que devuelve el API, si la emite. */
  reference?: string | null;
}

export type Alia2SubmitHandler = (
  values: Alia2ApplicationValues,
  options: { signal: AbortSignal },
) => Promise<Alia2SubmitResult>;

/** Forma mínima que el formulario sabe leer de un error de envío. */
interface SubmissionFailure {
  message: string;
  fieldErrors?: Partial<Record<keyof Alia2ApplicationValues, string>>;
}

const FALLBACK_ERROR =
  "No pudimos enviar tu solicitud. Revisa tu conexión e inténtalo de nuevo: no perdiste nada de lo que escribiste.";

/**
 * Lee el error sin acoplarse a una clase concreta: cualquier objeto con
 * `message` (y opcionalmente `fieldErrors`) sirve, venga del API o de un mock.
 */
function readFailure(error: unknown): SubmissionFailure {
  if (typeof error === "object" && error !== null) {
    const candidate = error as { message?: unknown; fieldErrors?: unknown };
    const message = typeof candidate.message === "string" && candidate.message.trim().length > 0
      ? candidate.message
      : FALLBACK_ERROR;

    const fieldErrors =
      typeof candidate.fieldErrors === "object" && candidate.fieldErrors !== null
        ? (candidate.fieldErrors as SubmissionFailure["fieldErrors"])
        : undefined;

    return { message, fieldErrors };
  }

  return { message: FALLBACK_ERROR };
}

type FieldName = keyof Alia2ApplicationValues;

const fieldId = (name: FieldName): string => `alia2-${name}`;

/**
 * Lleva el foco a un campo concreto. El adjunto es un `<input type="file">`
 * accesible pero visualmente oculto, así que la vista se desplaza al recuadro
 * que sí se ve, y el foco va al control real (WCAG 2.2 – 2.4.3 / 3.3.1).
 */
function focusField(name: FieldName): void {
  if (typeof document === "undefined") return;

  const control = document.getElementById(fieldId(name));
  const anchor = document.getElementById(`${fieldId(name)}-block`) ?? control;

  anchor?.scrollIntoView({ block: "center", behavior: "smooth" });
  control?.focus({ preventScroll: true });
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "error"; message: string }
  | { kind: "success"; reference: string | null };

interface Alia2ApplicationFormProps {
  onSubmit: Alia2SubmitHandler;
}

export function Alia2ApplicationForm({ onSubmit }: Alia2ApplicationFormProps) {
  const [status, setStatus] = React.useState<Status>({ kind: "idle" });
  const errorRef = React.useRef<HTMLDivElement | null>(null);
  const successRef = React.useRef<HTMLDivElement | null>(null);
  const abortRef = React.useRef<AbortController | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    setError,
    reset,
    watch,
    formState: { errors, isSubmitted },
  } = useForm<Alia2ApplicationValues>({
    resolver: zodResolver(alia2ApplicationSchema),
    defaultValues: EMPTY_APPLICATION,
    // El foco lo movemos nosotros: react-hook-form no puede enfocar el adjunto
    // ni la casilla de términos de forma fiable porque no van por `register`.
    shouldFocusError: false,
    mode: "onSubmit",
    reValidateMode: "onChange",
  });

  React.useEffect(() => () => abortRef.current?.abort(), []);

  const documentFile = watch("document") as File | undefined;
  const isSubmitting = status.kind === "submitting";

  /** Campos con error, en el orden en que se ven en pantalla. */
  const invalidFields = React.useMemo(
    () => FIELD_ORDER.filter((name) => Boolean(errors[name])),
    [errors],
  );

  const submitValid = async (values: Alia2ApplicationValues) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setStatus({ kind: "submitting" });

    try {
      const result = await onSubmit(values, { signal: controller.signal });
      setStatus({ kind: "success", reference: result.reference ?? null });
    } catch (error) {
      if (controller.signal.aborted) return;

      const failure = readFailure(error);
      const rejected: FieldName[] = [];

      // Errores por campo devueltos por el servidor: se pintan donde tocan en
      // lugar de perderse en un mensaje genérico.
      if (failure.fieldErrors) {
        for (const name of FIELD_ORDER) {
          const message = failure.fieldErrors[name];
          if (message) {
            setError(name, { type: "server", message });
            rejected.push(name);
          }
        }
      }

      setStatus({ kind: "error", message: failure.message });

      // Nada se borra: el formulario conserva lo escrito para reintentar.
      if (rejected[0]) {
        focusField(rejected[0]);
      } else {
        window.requestAnimationFrame(() => errorRef.current?.focus());
      }
    }
  };

  const submitInvalid = () => {
    const first = FIELD_ORDER.find((name) => Boolean(errors[name]));
    if (first) focusField(first);
  };

  const startOver = () => {
    reset(EMPTY_APPLICATION);
    setStatus({ kind: "idle" });
  };

  if (status.kind === "success") {
    return (
      <SectionShell>
        <div
          ref={successRef}
          tabIndex={-1}
          role="status"
          className={cn(
            "flex flex-col items-center gap-4 px-2 py-8 text-center sm:px-6",
            "outline-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[var(--a2-orange)]",
          )}
        >
          <CheckCircle2 aria-hidden="true" className="h-14 w-14 text-[var(--a2-teal)]" strokeWidth={1.5} />
          <h3 className="text-xl font-extrabold text-[var(--a2-navy)] sm:text-2xl">
            Recibimos tu solicitud
          </h3>
          <p className="max-w-md text-sm leading-relaxed text-gray-600">
            Tu solicitud queda <strong className="font-semibold text-gray-800">sujeta a revisión y
            aprobación de Intemperie</strong>. Nuestro equipo evaluará la información de tu empresa y
            te contactará por el correo corporativo que registraste.
          </p>
          {status.reference ? (
            <p className="rounded-lg bg-gray-100 px-4 py-2 text-sm text-gray-700">
              Número de referencia:{" "}
              <span className="font-bold tracking-wide text-[var(--a2-navy)]">{status.reference}</span>
            </p>
          ) : null}
          <button
            type="button"
            onClick={startOver}
            className={cn(
              "mt-2 inline-flex min-h-11 items-center justify-center rounded-xl border border-gray-300 px-5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50",
              FOCUS_RING,
            )}
          >
            Enviar otra solicitud
          </button>
        </div>
      </SectionShell>
    );
  }

  return (
    <SectionShell>
      <form noValidate onSubmit={handleSubmit(submitValid, submitInvalid)} aria-busy={isSubmitting}>
        {/* Resumen de errores: orientación rápida en móvil, donde la lista de
            campos no cabe en pantalla. El anuncio lo hace el error del campo
            enfocado, así que aquí no se duplica una región viva. */}
        {isSubmitted && invalidFields.length > 0 ? (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4">
            <h3 className="flex items-center gap-2 text-sm font-bold text-red-800">
              <AlertTriangle aria-hidden="true" className="h-4 w-4 shrink-0" />
              Revisa {invalidFields.length === 1 ? "este campo" : `estos ${invalidFields.length} campos`}
            </h3>
            <ul className="mt-2 space-y-1">
              {invalidFields.map((name) => (
                <li key={name}>
                  <button
                    type="button"
                    onClick={() => focusField(name)}
                    className={cn(
                      "text-left text-sm font-medium text-red-700 underline underline-offset-2 hover:text-red-900",
                      FOCUS_RING,
                    )}
                  >
                    {FIELD_LABELS[name]}: {errors[name]?.message}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {status.kind === "error" ? (
          <div
            ref={errorRef}
            tabIndex={-1}
            role="alert"
            className={cn(
              "mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4",
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600",
            )}
          >
            <AlertTriangle aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-red-600" />
            <div>
              <p className="text-sm font-bold text-red-800">No se pudo enviar la solicitud</p>
              <p className="mt-1 text-sm leading-relaxed text-red-700">{status.message}</p>
            </div>
          </div>
        ) : null}

        <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
          <TextField
            id={fieldId("legalName")}
            label={FIELD_LABELS.legalName}
            required
            autoComplete="organization"
            placeholder="Ingresa la razón social"
            disabled={isSubmitting}
            error={errors.legalName?.message}
            {...register("legalName")}
          />

          <TextField
            id={fieldId("tradeName")}
            label={FIELD_LABELS.tradeName}
            required
            placeholder="Ingresa el nombre comercial"
            disabled={isSubmitting}
            error={errors.tradeName?.message}
            {...register("tradeName")}
          />

          <TextField
            id={fieldId("ruc")}
            label={FIELD_LABELS.ruc}
            required
            inputMode="text"
            placeholder="Ej.: 1234567890-1-2"
            disabled={isSubmitting}
            error={errors.ruc?.message}
            {...register("ruc")}
          />

          <TextField
            id={fieldId("operationNotice")}
            label={FIELD_LABELS.operationNotice}
            required
            placeholder="Número de aviso de operación"
            disabled={isSubmitting}
            error={errors.operationNotice?.message}
            {...register("operationNotice")}
          />

          <TextField
            id={fieldId("representativeName")}
            label={FIELD_LABELS.representativeName}
            required
            autoComplete="name"
            placeholder="Nombre completo"
            disabled={isSubmitting}
            error={errors.representativeName?.message}
            {...register("representativeName")}
          />

          <TextField
            id={fieldId("corporateEmail")}
            label={FIELD_LABELS.corporateEmail}
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            placeholder="ejemplo@empresa.com"
            disabled={isSubmitting}
            error={errors.corporateEmail?.message}
            {...register("corporateEmail")}
          />

          <TextField
            id={fieldId("phone")}
            label={FIELD_LABELS.phone}
            required
            type="tel"
            inputMode="tel"
            autoComplete="tel-national"
            addon="+507"
            placeholder="6000-0000"
            hint="Número de Panamá, con WhatsApp si es posible."
            disabled={isSubmitting}
            error={errors.phone?.message}
            {...register("phone")}
          />

          <SelectField
            id={fieldId("province")}
            label={FIELD_LABELS.province}
            required
            placeholder="Selecciona una provincia"
            disabled={isSubmitting}
            error={errors.province?.message}
            defaultValue=""
            {...register("province")}
          >
            <optgroup label="Provincias">
              {PROVINCES.map((province) => (
                <option key={province} value={province}>
                  {province}
                </option>
              ))}
            </optgroup>
            <optgroup label="Comarcas">
              {COMARCAS.map((comarca) => (
                <option key={comarca} value={comarca}>
                  {comarca}
                </option>
              ))}
            </optgroup>
          </SelectField>

          <SelectField
            id={fieldId("economicActivity")}
            label={FIELD_LABELS.economicActivity}
            required
            placeholder="Selecciona actividad"
            disabled={isSubmitting}
            error={errors.economicActivity?.message}
            defaultValue=""
            {...register("economicActivity")}
          >
            {ECONOMIC_ACTIVITIES.map((activity) => (
              <option key={activity} value={activity}>
                {activity}
              </option>
            ))}
          </SelectField>

          <SelectField
            id={fieldId("yearsOperating")}
            label={FIELD_LABELS.yearsOperating}
            required
            placeholder="Selecciona rango"
            disabled={isSubmitting}
            error={errors.yearsOperating?.message}
            defaultValue=""
            {...register("yearsOperating")}
          >
            {YEARS_RANGES.map((range) => (
              <option key={range} value={range}>
                {range}
              </option>
            ))}
          </SelectField>

          <TextField
            id={fieldId("projectTypes")}
            label={FIELD_LABELS.projectTypes}
            required
            placeholder="Ej.: cerramientos perimetrales, mallas y portones"
            disabled={isSubmitting}
            error={errors.projectTypes?.message}
            {...register("projectTypes")}
          />

          <TextField
            id={fieldId("website")}
            label={FIELD_LABELS.website}
            inputMode="url"
            placeholder="https://www.empresa.com o @empresa"
            disabled={isSubmitting}
            error={errors.website?.message}
            {...register("website")}
          />

          <div className="sm:col-span-2">
            <FileDropzone
              id={fieldId("document")}
              label={FIELD_LABELS.document}
              required
              hint="Sube tu aviso de operación o documento legal de la empresa (PDF o JPG)."
              helper="Máx. 10 MB"
              disabled={isSubmitting}
              error={errors.document?.message}
              file={documentFile instanceof File ? documentFile : null}
              onFileChange={(file) =>
                setValue("document", file as File, {
                  shouldValidate: isSubmitted,
                  shouldDirty: true,
                })
              }
            />
          </div>
        </div>

        <div className="mt-6 flex items-start gap-3">
          <input
            id={fieldId("acceptTerms")}
            type="checkbox"
            disabled={isSubmitting}
            aria-invalid={errors.acceptTerms ? true : undefined}
            aria-required="true"
            aria-describedby={errors.acceptTerms ? `${fieldId("acceptTerms")}-error` : undefined}
            className={cn(
              "mt-0.5 h-6 w-6 shrink-0 cursor-pointer rounded border-2 border-gray-400 accent-[var(--a2-orange)]",
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--a2-orange)]",
              errors.acceptTerms ? "border-red-500" : undefined,
            )}
            {...register("acceptTerms")}
          />
          <label htmlFor={fieldId("acceptTerms")} className="text-sm leading-relaxed text-gray-700">
            Acepto los{" "}
            <Link
              href="/terminos"
              className={cn(
                "font-semibold text-[var(--a2-blue)] underline underline-offset-2 hover:text-[var(--a2-navy)]",
                FOCUS_RING,
              )}
            >
              términos y condiciones
            </Link>{" "}
            del programa{" "}
            <span aria-hidden="true" className="text-[var(--a2-orange)]">
              *
            </span>
            <span className="sr-only">(obligatorio)</span>
          </label>
        </div>

        {errors.acceptTerms ? (
          <p
            id={`${fieldId("acceptTerms")}-error`}
            role="alert"
            className="mt-1.5 text-xs font-semibold text-red-600"
          >
            {errors.acceptTerms.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={isSubmitting}
          data-track="alia2-submit"
          data-track-location="form"
          className={cn(
            "mt-6 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--a2-orange)] px-6 text-base font-bold text-white transition-colors",
            "hover:bg-[var(--a2-orange-strong)] disabled:cursor-not-allowed disabled:opacity-70",
            FOCUS_RING,
          )}
        >
          {isSubmitting ? (
            <Loader2 aria-hidden="true" className="h-5 w-5 animate-spin" />
          ) : (
            <Send aria-hidden="true" className="h-5 w-5" />
          )}
          {isSubmitting ? FORM_COPY.submitting : FORM_COPY.submit}
        </button>

        {/* Estado del envío para lectores de pantalla. */}
        <p role="status" className="sr-only">
          {isSubmitting ? "Enviando la solicitud, espera un momento." : ""}
        </p>

        <p className="mt-3 flex items-center justify-center gap-2 text-center text-xs text-gray-500">
          <ShieldCheck aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--a2-teal)]" />
          {FORM_COPY.disclaimer}
        </p>
      </form>
    </SectionShell>
  );
}

/** Tarjeta contenedora: cabecera del formulario + contenido, como en el diseño. */
function SectionShell({ children }: { children: React.ReactNode }) {
  return (
    <section
      id={ALIA2_ANCHOR}
      aria-labelledby="alia2-formulario-title"
      className="scroll-mt-20 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm sm:p-7"
    >
      <div className="mb-6 flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--a2-navy)]"
        >
          <ClipboardList className="h-6 w-6 text-white" strokeWidth={1.75} />
        </span>
        <div>
          <h2
            id="alia2-formulario-title"
            className="text-lg font-extrabold tracking-tight text-[var(--a2-navy)] sm:text-xl"
          >
            {FORM_COPY.title}
          </h2>
          <p className="mt-0.5 text-sm text-gray-500">{FORM_COPY.subtitle}</p>
        </div>
      </div>

      {children}
    </section>
  );
}
