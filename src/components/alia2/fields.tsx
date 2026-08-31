"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Campos accesibles del formulario ALIA2.
 *
 * Cada campo garantiza:
 *  - etiqueta asociada por `htmlFor` / `id` (nada de placeholders como etiqueta);
 *  - `aria-invalid` cuando hay error;
 *  - `aria-describedby` apuntando a la ayuda y al mensaje de error;
 *  - el error se anuncia con `role="alert"`;
 *  - altura mínima de 44px, cómoda para dedos en móvil (WCAG 2.2 – 2.5.8).
 */

export const controlBase =
  "w-full min-h-11 rounded-lg border border-gray-300 bg-white px-3 py-2 text-base text-gray-900 shadow-xs transition-colors placeholder:text-gray-400 " +
  "outline-none focus-visible:border-[var(--a2-orange)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--a2-orange)] " +
  "aria-[invalid=true]:border-red-500 aria-[invalid=true]:bg-red-50/50 disabled:cursor-not-allowed disabled:bg-gray-100 sm:text-sm";

export function describedBy(id: string, hasHint: boolean, hasError: boolean): string | undefined {
  const ids = [hasHint ? `${id}-hint` : null, hasError ? `${id}-error` : null].filter(Boolean);
  return ids.length > 0 ? ids.join(" ") : undefined;
}

interface FieldFrameProps {
  id: string;
  label: string;
  required?: boolean;
  hint?: string;
  error?: string;
  className?: string;
  children: React.ReactNode;
}

/** Estructura común: etiqueta, control, ayuda y error. */
export function FieldFrame({
  id,
  label,
  required = false,
  hint,
  error,
  className,
  children,
}: FieldFrameProps) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-sm font-semibold text-gray-800">
        {label}
        {required ? (
          <>
            {" "}
            <span aria-hidden="true" className="text-[var(--a2-orange)]">
              *
            </span>
            <span className="sr-only">(obligatorio)</span>
          </>
        ) : null}
      </label>

      {hint ? (
        <p id={`${id}-hint`} className="text-xs leading-snug text-gray-500">
          {hint}
        </p>
      ) : null}

      {children}

      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}

interface TextFieldProps extends Omit<React.ComponentProps<"input">, "id" | "className"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  /** Adorno fijo a la izquierda del control (p. ej. el prefijo telefónico). */
  addon?: React.ReactNode;
}

export function TextField({
  id,
  label,
  hint,
  error,
  className,
  required,
  addon,
  ref,
  ...inputProps
}: TextFieldProps) {
  const input = (
    <input
      {...inputProps}
      ref={ref}
      id={id}
      aria-invalid={error ? true : undefined}
      aria-required={required ? true : undefined}
      aria-describedby={describedBy(id, Boolean(hint), Boolean(error))}
      className={cn(controlBase, addon ? "rounded-l-none border-l-0 pl-2" : undefined)}
    />
  );

  return (
    <FieldFrame id={id} label={label} required={required} hint={hint} error={error} className={className}>
      {addon ? (
        <div className="flex items-stretch">
          <span
            aria-hidden="true"
            className={cn(
              "inline-flex min-h-11 items-center gap-1.5 rounded-l-lg border border-gray-300 bg-gray-50 px-3 text-sm font-semibold text-gray-600",
              error ? "border-red-500" : undefined,
            )}
          >
            {addon}
          </span>
          {input}
        </div>
      ) : (
        input
      )}
    </FieldFrame>
  );
}

interface SelectFieldProps extends Omit<React.ComponentProps<"select">, "id" | "className"> {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
  placeholder: string;
}

/**
 * Se usa `<select>` nativo a propósito: en móvil abre el selector del sistema
 * (mejor para contratistas en obra) y el foco programático tras un error
 * funciona sin trucos, a diferencia de un combobox personalizado.
 */
export function SelectField({
  id,
  label,
  hint,
  error,
  className,
  required,
  placeholder,
  children,
  ref,
  ...selectProps
}: SelectFieldProps) {
  return (
    <FieldFrame id={id} label={label} required={required} hint={hint} error={error} className={className}>
      <div className="relative">
        <select
          {...selectProps}
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-required={required ? true : undefined}
          aria-describedby={describedBy(id, Boolean(hint), Boolean(error))}
          className={cn(controlBase, "appearance-none pr-10")}
        >
          <option value="" disabled>
            {placeholder}
          </option>
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500"
        />
      </div>
    </FieldFrame>
  );
}
