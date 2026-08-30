import { MetadataRoute } from "next";
import { SITE_URL } from "./(store)/_seo/site-url";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

/* El backend topa cada pagina en 100 resultados (`Math.min(100, ...)` en
 * utils/pagination.ts) sin importar el `limit` que se pida. Antes este sitemap
 * hacia una sola llamada con limit=100, asi que al superar los 100 productos
 * el resto quedaba fuera sin que nada avisara. Ahora pagina hasta agotar. */
const PAGE = 100;
const TOPE_PAGINAS = 50; // 5000 productos: freno contra una paginacion rota

interface Sobre<T> { data?: T[]; pagination?: { totalPages?: number } }

async function traerTodo<T>(ruta: string, tag: string): Promise<T[]> {
  const todo: T[] = [];
  for (let page = 1; page <= TOPE_PAGINAS; page++) {
    let res: Response;
    try {
      res = await fetch(`${API}${ruta}${ruta.includes("?") ? "&" : "?"}limit=${PAGE}&page=${page}`,
        { next: { revalidate: 3600, tags: [tag] } });
    } catch { break }
    if (!res.ok) break;
    const body = (await res.json().catch(() => null)) as Sobre<T> | null;
    const lote = body?.data ?? [];
    todo.push(...lote);
    if (lote.length === 0 || page >= (body?.pagination?.totalPages ?? 1)) break;
  }
  return todo;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const ahora = new Date();
  const estaticas: MetadataRoute.Sitemap = [
    { url: SITE_URL,                     lastModified: ahora, changeFrequency: "weekly",  priority: 1.0 },
    { url: `${SITE_URL}/productos`,      lastModified: ahora, changeFrequency: "daily",   priority: 0.9 },
    { url: `${SITE_URL}/calculadora`,    lastModified: ahora, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/inspecciones`,   lastModified: ahora, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/nosotros`,       lastModified: ahora, changeFrequency: "monthly", priority: 0.6 },
    { url: `${SITE_URL}/envios`,         lastModified: ahora, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/devoluciones`,   lastModified: ahora, changeFrequency: "monthly", priority: 0.4 },
    { url: `${SITE_URL}/privacidad`,     lastModified: ahora, changeFrequency: "yearly",  priority: 0.3 },
    { url: `${SITE_URL}/terminos`,       lastModified: ahora, changeFrequency: "yearly",  priority: 0.3 },
    /* /instaladores queda FUERA a proposito: hoy publica seis empresas con
     * telefonos secuenciales (6123-4567, 6234-5678, ...) y conteos de obra
     * inventados. Indexar datos falsos es peor que no indexar nada. Volver a
     * anadirla cuando tenga instaladores reales. */
  ];

  const [productos, categorias, colecciones] = await Promise.all([
    traerTodo<{ slug: string; updatedAt?: string }>("/products", "products"),
    traerTodo<{ slug: string }>("/categories", "categories"),
    traerTodo<{ slug: string }>("/collections", "collections"),
  ]);

  return [
    ...estaticas,
    ...categorias.map((c) => ({ url: `${SITE_URL}/categorias/${c.slug}`, lastModified: ahora, changeFrequency: "weekly" as const, priority: 0.7 })),
    ...colecciones.map((c) => ({ url: `${SITE_URL}/colecciones/${c.slug}`, lastModified: ahora, changeFrequency: "weekly" as const, priority: 0.65 })),
    ...productos.map((p) => ({ url: `${SITE_URL}/productos/${p.slug}`, lastModified: p.updatedAt ? new Date(p.updatedAt) : ahora, changeFrequency: "weekly" as const, priority: 0.8 })),
  ];
}
