import { revalidateTag } from "next/cache";
import { NextRequest } from "next/server";
import { TAGS } from "@/app/(store)/_data/catalog";

/**
 * Purga bajo demanda de la caché del catálogo.
 *
 *   POST /api/revalidate            cabecera `x-revalidate-secret`
 *        ?tag=products&tag=product:cerca-pvc-atlas
 *
 * Las páginas de catálogo son estáticas con un TTL de 10 min (ver
 * `_data/catalog.ts`). Ese TTL es solo la red de seguridad; el camino normal es
 * que el backend llame aquí al guardar un producto y el cambio salga al
 * instante. Sin este endpoint, subir el TTL sería inaceptable para stock y
 * precios.
 *
 * Se admite GET además de POST porque es lo más cómodo para invalidar a mano
 * desde un `curl`, pero el secreto viaja preferentemente en cabecera: en query
 * string acaba en los logs de acceso de Caddy.
 */

/** Etiquetas fijas + el patrón por producto. Evita purgas arbitrarias. */
function isKnownTag(tag: string): boolean {
  if (tag === TAGS.products) return true;
  if (tag === TAGS.categories) return true;
  if (tag === TAGS.collections) return true;
  return /^product:[a-z0-9-]{1,120}$/.test(tag);
}

function authorize(request: NextRequest): boolean {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) return false;
  const provided =
    request.headers.get("x-revalidate-secret") ??
    request.nextUrl.searchParams.get("secret");
  return typeof provided === "string" && provided === expected;
}

function handle(request: NextRequest) {
  if (!authorize(request)) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const requested = request.nextUrl.searchParams.getAll("tag");
  const tags = (requested.length ? requested : [TAGS.products]).filter(
    isKnownTag,
  );

  if (!tags.length) {
    return Response.json(
      { error: "Bad Request", detail: "Ninguna etiqueta válida" },
      { status: 400 },
    );
  }

  for (const tag of tags) revalidateTag(tag, "max");

  return Response.json({ revalidated: true, tags, timestamp: Date.now() });
}

export const POST = handle;
export const GET = handle;
