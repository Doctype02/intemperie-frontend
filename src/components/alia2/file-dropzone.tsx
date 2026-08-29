"use client";

import * as React from "react";
import { FileText, Trash2, UploadCloud } from "lucide-react";

import { cn } from "@/lib/utils";
import { DOCUMENT_ACCEPT } from "./content";

interface FileDropzoneProps {
  id: string;
  label: string;
  hint: string;
  helper: string;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  file: File | null;
  onFileChange: (file: File | null) => void;
  onBlur?: () => void;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Zona de carga con arrastrar y soltar.
 *
 * El control real es un `<input type="file">` visible solo para lectores de
 * pantalla: así la zona es operable con teclado (Tab lleva el foco al input y
 * Enter/Espacio abre el selector del sistema) sin reimplementar el patrón a
 * mano. El recuadro visible refleja el foco del input mediante `peer-*`, y el
 * arrastre es un atajo adicional, nunca la única vía.
 */
export function FileDropzone({
  id,
  label,
  hint,
  helper,
  error,
  required = false,
  disabled = false,
  file,
  onFileChange,
  onBlur,
}: FileDropzoneProps) {
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const dragDepth = React.useRef(0);

  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const statusId = `${id}-status`;

  const openPicker = React.useCallback(() => {
    if (disabled) return;
    inputRef.current?.click();
  }, [disabled]);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    dragDepth.current = 0;
    setIsDragging(false);
    if (disabled) return;

    const dropped = event.dataTransfer.files?.[0];
    if (dropped) onFileChange(dropped);
  };

  return (
    <div id={`${id}-block`} className="flex flex-col gap-1.5">
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

      <p id={hintId} className="text-xs leading-snug text-gray-500">
        {hint}
      </p>

      <div
        onDragEnter={(event) => {
          event.preventDefault();
          dragDepth.current += 1;
          if (!disabled) setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          event.preventDefault();
          dragDepth.current -= 1;
          if (dragDepth.current <= 0) {
            dragDepth.current = 0;
            setIsDragging(false);
          }
        }}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          id={id}
          type="file"
          accept={DOCUMENT_ACCEPT}
          disabled={disabled}
          aria-required={required ? true : undefined}
          aria-invalid={error ? true : undefined}
          aria-describedby={[hintId, statusId, error ? errorId : null].filter(Boolean).join(" ")}
          className="peer sr-only"
          onBlur={onBlur}
          onChange={(event) => {
            const selected = event.target.files?.[0] ?? null;
            onFileChange(selected);
          }}
        />

        {/* Recuadro visible: refleja el foco del input real vía `peer-*`. */}
        <div
          onClick={openPicker}
          className={cn(
            "flex min-h-24 cursor-pointer flex-col items-center justify-center gap-1.5 rounded-xl border-2 border-dashed px-4 py-5 text-center transition-colors",
            "peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-[var(--a2-orange)]",
            isDragging
              ? "border-[var(--a2-orange)] bg-orange-50"
              : "border-gray-300 bg-gray-50 hover:border-[var(--a2-orange)] hover:bg-orange-50/40",
            error ? "border-red-400 bg-red-50/50" : undefined,
            disabled ? "cursor-not-allowed opacity-60" : undefined,
          )}
        >
          <UploadCloud aria-hidden="true" className="h-7 w-7 text-[var(--a2-orange)]" strokeWidth={1.5} />
          <span className="text-sm font-medium text-gray-700">
            Arrastra tu archivo aquí o haz clic para seleccionar
          </span>
          <span className="text-xs text-gray-500">{helper}</span>
        </div>
      </div>

      {/* Estado del adjunto: se anuncia al seleccionar o quitar el archivo. */}
      <p id={statusId} role="status" className="sr-only">
        {file ? `Archivo seleccionado: ${file.name}, ${formatSize(file.size)}.` : "Ningún archivo seleccionado."}
      </p>

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2">
          <FileText aria-hidden="true" className="h-5 w-5 shrink-0 text-[var(--a2-navy)]" />
          <span className="min-w-0 flex-1 truncate text-sm text-gray-700" title={file.name}>
            {file.name}
          </span>
          <span className="shrink-0 text-xs text-gray-500">{formatSize(file.size)}</span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => {
              if (inputRef.current) inputRef.current.value = "";
              onFileChange(null);
              inputRef.current?.focus();
            }}
            className={cn(
              "inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-gray-500 transition-colors hover:bg-red-50 hover:text-red-600",
              "outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--a2-orange)]",
            )}
          >
            <Trash2 aria-hidden="true" className="h-4 w-4" />
            <span className="sr-only">Quitar el archivo {file.name}</span>
          </button>
        </div>
      ) : null}

      {error ? (
        <p id={errorId} role="alert" className="text-xs font-semibold text-red-600">
          {error}
        </p>
      ) : null}
    </div>
  );
}
