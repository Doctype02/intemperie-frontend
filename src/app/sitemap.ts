import { MetadataRoute } from "next";
import { API_BASE } from "@/lib/api";

const BASE_URL = "https://intemperie.com.pa";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL,                         lastModified: new Date(), changeFrequency: "weekly",  priority: 1.0 },
    { url: `${BASE_URL}/productos`,          lastModified: new Date(), changeFrequency: "daily",   priority: 0.9 },
    { url: `${BASE_URL}/calculadora`,        lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/instaladores`,       lastModified: new Date(), changeFrequency: "weekly",  priority: 0.7 },
    { url: `${BASE_URL}/nosotros`,           lastModified: new Date(), changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE_URL}/envios`,             lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/devoluciones`,       lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/privacidad`,         lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
    { url: `${BASE_URL}/terminos`,           lastModified: new Date(), changeFrequency: "yearly",  priority: 0.3 },
  ];

  try {
    const res = await fetch(`${API_BASE}/products?limit=100`, { next: { revalidate: 3600 } });
    if (!res.ok) return staticPages;
    const data = await res.json();
    const products = data.data || data || [];

    const productPages: MetadataRoute.Sitemap = products.map((p: { slug: string; updatedAt?: string }) => ({
      url: `${BASE_URL}/productos/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    return [...staticPages, ...productPages];
  } catch {
    return staticPages;
  }
}
