"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";

import { submitAlia2Application } from "@/lib/api/alia2";
import { Alia2ApplicationForm, type Alia2SubmitHandler } from "./application-form";
import type { Alia2LevelId } from "./content";

/**
 * Único punto donde el formulario se conecta con el API.
 *
 * El formulario recibe el envío por prop, así que todo lo que depende del
 * backend vive en `src/lib/api/alia2.ts` y en este archivo de pegamento: si el
 * contrato cambia, no hay que volver a tocar la accesibilidad del formulario.
 *
 * Usa `useSearchParams` (hook de cliente) para leer `?nivel=pro`, que es lo que
 * enlazan las tarjetas de niveles. Debe ir dentro de un `<Suspense>` para que
 * el resto de la página se siga prerenderizando.
 */

const LEVEL_BY_PARAM: Record<string, Alia2LevelId> = {
  alia2: "ALIA2",
  inicial: "ALIA2",
  pro: "PRO",
  max: "MAX",
};

export function Alia2ApplicationSection() {
  const searchParams = useSearchParams();
  const requested = searchParams.get("nivel")?.trim().toLowerCase() ?? "";
  const level = LEVEL_BY_PARAM[requested] ?? "ALIA2";

  const handleSubmit = React.useCallback<Alia2SubmitHandler>(async (values, { signal }) => {
    const receipt = await submitAlia2Application(values, { signal });
    return { reference: receipt.id || null };
  }, []);

  return <Alia2ApplicationForm defaultLevel={level} onSubmit={handleSubmit} />;
}
