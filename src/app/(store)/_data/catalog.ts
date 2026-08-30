import { cache } from "react";
import { serverApiBase } from "./api-base";
import type { Category, Collection, Product } from "@/types";

/**
 * Acceso al catálogo desde componentes de servidor.
 *
 * Todo pasa por aquí para que la política de caché sea una sola y no quede
 * repartida en cada `page.tsx`. Dos reglas:
 *
 *  1. Nada usa `cache: "no-store"`. Cada respuesta se cachea con un TTL y se
 *     etiqueta, de modo que `POST /api/revalidate?tag=products` la invalida al
 *     instante cuando el admin toca el catálogo. El TTL es solo la red de
 *     seguridad por si el webhook no llega.
 *
 *  2. Se distingue "no existe" (404 -> `null`, la página responde 404) de "no
 *     se pudo consultar" (red caída, 5xx -> lanza `CatalogUnavailableError`).
 *     Es la diferencia importante para el prerenderizado: un `catch` que
 *     devuelve `null` o `[]` ante un fallo de infraestructura congelaría en el
 *     build una página vacía o un 404 durante todo el TTL. Al lanzar, Next no
 *     guarda nada en la caché de ruta y el siguiente visitante reintenta.
 */

/** TTL por defecto de las respuestas del catálogo (10 min). */
export const CATALOG_TTL = 600;

export const TAGS = {
  products: "products",
  categories: "categories",
  collections: "collections",
  product: (slug: string) => `product:${slug}`,
} as const;

/** La API no respondió o respondió 5xx. No es un 404: no se debe cachear. */
export class CatalogUnavailableError extends Error {
  constructor(path: string, cause?: unknown) {
    super(`Catálogo no disponible: ${path}`);
    this.name = "CatalogUnavailableError";
    this.cause = cause;
  }
}

type FetchOpts = { tags: string[]; revalidate?: number };

/**
 * Devuelve el cuerpo JSON, o `null` si la API dice 404.
 * Lanza `CatalogUnavailableError` en cualquier otro fallo.
 */
async function getJson<T>(path: string, opts: FetchOpts): Promise<T | null> {
  let res: Response;
  try {
    res = await fetch(`${serverApiBase()}${path}`, {
      next: { revalidate: opts.revalidate ?? CATALOG_TTL, tags: opts.tags },
    });
  } catch (err) {
    throw new CatalogUnavailableError(path, err);
  }
  if (res.status === 404) return null;
  if (!res.ok) throw new CatalogUnavailableError(`${path} -> ${res.status}`);
  try {
    return (await res.json()) as T;
  } catch (err) {
    throw new CatalogUnavailableError(`${path} (JSON inválido)`, err);
  }
}

/** La API envuelve todo en `{ success, data, pagination? }`. */
type Envelope<T> = { data?: T; pagination?: Pagination };

export interface Pagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNextPage?: boolean;
  hasPrevPage?: boolean;
}

/* ── Taxonomías ─────────────────────────────────────────────────────────── */

export const getCategories = cache(async (): Promise<Category[]> => {
  const body = await getJson<Envelope<Category[]>>("/categories", {
    tags: [TAGS.categories],
    revalidate: 3600,
  });
  return body?.data ?? [];
});

export const getCollections = cache(async (): Promise<Collection[]> => {
  const body = await getJson<Envelope<Collection[]>>("/collections", {
    tags: [TAGS.collections],
    revalidate: 3600,
  });
  return body?.data ?? [];
});

export const getCategoryBySlug = cache(
  async (slug: string): Promise<Category | null> => {
    const body = await getJson<Envelope<Category>>(
      `/categories/${encodeURIComponent(slug)}`,
      { tags: [TAGS.categories], revalidate: 3600 },
    );
    return body?.data ?? null;
  },
);

export const getCollectionBySlug = cache(
  async (slug: string): Promise<Collection | null> => {
    const body = await getJson<Envelope<Collection>>(
      `/collections/${encodeURIComponent(slug)}`,
      { tags: [TAGS.collections], revalidate: 3600 },
    );
    return body?.data ?? null;
  },
);

/* ── Productos ──────────────────────────────────────────────────────────── */

export const PAGE_SIZE = 12;

/**
 * Campos de ordenación que la API acepta. La lista blanca no es cosmética:
 * `?sortBy=basePrice` devuelve 500 (el backend interpola el campo en el ORDER
 * BY sin validarlo), así que cualquier valor que llegue por la URL se
 * normaliza aquí antes de reenviarlo.
 */
const SORT_MAP = {
  price_asc: { sortBy: "price", order: "asc" },
  price_desc: { sortBy: "price", order: "desc" },
  name_asc: { sortBy: "name", order: "asc" },
  newest: { sortBy: "createdAt", order: "desc" },
} as const;

export type SortKey = keyof typeof SORT_MAP;

export function normalizeSort(value: string | undefined): SortKey | undefined {
  return value && value in SORT_MAP ? (value as SortKey) : undefined;
}

/** Solo números finitos y no negativos llegan a la API. */
function normalizePrice(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? String(n) : undefined;
}

function normalizePage(value: string | undefined): number {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}

export interface ProductQuery {
  category?: string;
  collection?: string;
  search?: string;
  sort?: string;
  minPrice?: string;
  maxPrice?: string;
  page?: string;
}

export interface ProductListResult {
  products: Product[];
  pagination: Pagination;
}

/**
 * Listado paginado. Filtro, orden y paginación los resuelve la API; antes se
 * pedían 50 productos y se recortaban en memoria en cada render.
 */
export async function listProducts(
  query: ProductQuery,
  limit: number = PAGE_SIZE,
): Promise<ProductListResult> {
  const page = normalizePage(query.page);
  const sp = new URLSearchParams();
  if (query.category) sp.set("category", query.category);
  if (query.collection) sp.set("collection", query.collection);
  if (query.search) sp.set("search", query.search);

  const min = normalizePrice(query.minPrice);
  const max = normalizePrice(query.maxPrice);
  if (min) sp.set("minPrice", min);
  if (max) sp.set("maxPrice", max);

  const sort = normalizeSort(query.sort);
  if (sort) {
    sp.set("sortBy", SORT_MAP[sort].sortBy);
    sp.set("order", SORT_MAP[sort].order);
  }

  sp.set("page", String(page));
  sp.set("limit", String(limit));

  const body = await getJson<Envelope<Product[]>>(`/products?${sp}`, {
    tags: [TAGS.products],
  });

  const products = body?.data ?? [];
  return {
    products,
    pagination: body?.pagination ?? {
      total: products.length,
      page,
      limit,
      totalPages: products.length ? 1 : 0,
    },
  };
}

/**
 * `listProducts` memoizado por render.
 *
 * La página de listado necesita el mismo resultado en dos sitios (el contador
 * de la cabecera y la parrilla), cada uno bajo su propio `<Suspense>`. React
 * `cache` memoiza por identidad de argumentos, así que se le pasa una clave
 * serializada y estable en lugar del objeto de consulta.
 */
const productPageByKey = cache(
  async (key: string): Promise<ProductListResult> => {
    const { query, limit } = JSON.parse(key) as {
      query: ProductQuery;
      limit: number;
    };
    return listProducts(query, limit);
  },
);

export function loadProductPage(
  query: ProductQuery,
  limit: number = PAGE_SIZE,
): Promise<ProductListResult> {
  const stable = Object.fromEntries(
    Object.entries(query)
      .filter(([, v]) => v !== undefined && v !== "")
      .sort(([a], [b]) => a.localeCompare(b)),
  );
  return productPageByKey(JSON.stringify({ query: stable, limit }));
}

export const getProductBySlug = cache(
  async (slug: string): Promise<Product | null> => {
    const body = await getJson<Envelope<Product>>(
      `/products/${encodeURIComponent(slug)}`,
      { tags: [TAGS.products, TAGS.product(slug)] },
    );
    return body?.data ?? null;
  },
);

/**
 * Slugs para `generateStaticParams`. A diferencia del resto, aquí sí se traga
 * el error: se ejecuta durante `docker build`, y si la API no está arriba en
 * ese momento lo correcto es construir sin páginas prerenderizadas (todas se
 * generarán bajo demanda en la primera visita) en lugar de romper el build.
 */
export async function getAllProductSlugs(): Promise<string[]> {
  try {
    const { products } = await listProducts({}, 200);
    return products.map((p) => p.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getAllCategorySlugs(): Promise<string[]> {
  try {
    return (await getCategories()).map((c) => c.slug).filter(Boolean);
  } catch {
    return [];
  }
}

export async function getAllCollectionSlugs(): Promise<string[]> {
  try {
    return (await getCollections()).map((c) => c.slug).filter(Boolean);
  } catch {
    return [];
  }
}
