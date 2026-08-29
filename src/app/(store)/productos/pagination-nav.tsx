import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { Pagination } from "../_data/catalog";

/**
 * Paginación del listado. Componente de servidor: son enlaces normales, así que
 * funciona sin JavaScript y no añade nada al bundle. `<Link>` prefetch-ea la
 * página siguiente al entrar en viewport.
 */

/** Conserva filtros y orden al cambiar de página. `page=1` no se escribe. */
function hrefForPage(params: Record<string, string>, page: number) {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (k !== "page" && v) sp.set(k, v);
  }
  if (page > 1) sp.set("page", String(page));
  const qs = sp.toString();
  return qs ? `/productos?${qs}` : "/productos";
}

/**
 * Ventana de páginas alrededor de la actual, con la primera y la última
 * siempre visibles. `null` marca un salto ("…").
 */
function pageWindow(current: number, total: number): (number | null)[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const around = [current - 1, current, current + 1].filter(
    (p) => p > 1 && p < total,
  );
  const pages = [1, ...around, total];
  const out: (number | null)[] = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev > 1) out.push(null);
    out.push(p);
    prev = p;
  }
  return out;
}

const linkBase =
  "inline-flex h-9 min-w-9 items-center justify-center gap-1 rounded-lg border px-3 text-sm font-semibold transition-colors";

export function PaginationNav({
  params,
  pagination,
}: {
  params: Record<string, string>;
  pagination: Pagination;
}) {
  const { page, totalPages } = pagination;
  if (totalPages <= 1) return null;

  const hasPrev = pagination.hasPrevPage ?? page > 1;
  const hasNext = pagination.hasNextPage ?? page < totalPages;

  return (
    <nav
      className="mt-8 flex items-center justify-center gap-1.5"
      aria-label="Paginación de productos"
    >
      {hasPrev ? (
        <Link
          href={hrefForPage(params, page - 1)}
          rel="prev"
          aria-label="Página anterior"
          className={`${linkBase} border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:text-green-700`}
        >
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={`${linkBase} border-gray-100 bg-gray-50 text-gray-300`}
        >
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pageWindow(page, totalPages).map((p, i) =>
        p === null ? (
          <span key={`gap-${i}`} className="px-1 text-sm text-gray-400">
            …
          </span>
        ) : p === page ? (
          <span
            key={p}
            aria-current="page"
            className={`${linkBase} border-green-600 bg-green-600 text-white`}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={hrefForPage(params, p)}
            aria-label={`Página ${p}`}
            className={`${linkBase} border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:text-green-700`}
          >
            {p}
          </Link>
        ),
      )}

      {hasNext ? (
        <Link
          href={hrefForPage(params, page + 1)}
          rel="next"
          aria-label="Página siguiente"
          className={`${linkBase} border-gray-200 bg-white text-gray-700 hover:border-green-400 hover:text-green-700`}
        >
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span
          aria-hidden="true"
          className={`${linkBase} border-gray-100 bg-gray-50 text-gray-300`}
        >
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
