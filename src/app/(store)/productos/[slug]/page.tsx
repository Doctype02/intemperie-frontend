import { Metadata } from "next";
import { notFound } from "next/navigation";
import { API_BASE } from "@/lib/api";
import { ProductDetailClient } from "./product-detail-client";

async function getProduct(slug: string) {
  try {
    const res = await fetch(`${API_BASE}/products/${slug}`, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch {
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: "Producto no encontrado" };
  return {
    title: product.name,
    description: product.description?.slice(0, 160),
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProduct(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="flex-1 bg-white">
      <ProductDetailClient product={product} />
    </main>
  );
}
