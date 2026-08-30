"use client"

import Link from "next/link"

import { Button } from "@/components/ui/button"

/* Fallo al cargar el listado — sistema «Perímetro».
 *
 * Aquí se llega cuando `_data/catalog.ts` lanza `CatalogUnavailableError`: la
 * API no respondió o devolvió 5xx. No es un catálogo vacío, es un catálogo que
 * no se pudo leer, y por eso la pantalla no dice «no hay productos».
 *
 * No se imprime `error.message`. En producción React lo sustituye por un texto
 * genérico con un identificador, así que sólo asusta sin informar; el mensaje
 * real está en el registro del servidor con ese mismo `digest`.
 *
 * El botón usa `unstable_retry()` y no `reset()`. `reset()` vuelve a renderizar
 * los hijos con lo que ya había en memoria —que es justo la respuesta fallida—;
 * `unstable_retry()` vuelve a pedir el segmento al servidor, que es lo único
 * que puede arreglar una API caída (Next 16.2, ver `docs/.../error.md`).
 */
export default function ProductsError({
  unstable_retry,
}: {
  error: Error & { digest?: string }
  unstable_retry: () => void
}) {
  return (
    <div className="shell py-section-sm">
      <div className="mx-auto flex max-w-lg flex-col items-center text-center">
        <p className="eyebrow text-muted-foreground">Catálogo</p>
        <h1 className="mt-2 text-2xl font-bold text-foreground">
          No pudimos cargar el catálogo
        </h1>
        <p className="mt-2 text-base text-muted-foreground">
          Ha sido un problema nuestro, no tuyo. Vuelve a intentarlo en unos segundos;
          los precios y las existencias siguen ahí.
        </p>

        <div className="mt-6 flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button onClick={() => unstable_retry()}>Reintentar</Button>
          <Button variant="outline" asChild>
            <Link href="/">Volver al inicio</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
