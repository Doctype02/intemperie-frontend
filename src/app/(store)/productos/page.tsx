import { Metadata } from "next";
import { API_BASE } from "@/lib/api";
import type { Product, Category, Collection } from "@/types";
import { ProductGrid } from "@/components/products/product-grid";
import { ProductFilters } from "@/components/products/product-filters";

export const metadata: Metadata = {
  title: "Productos",
  description: "Catálogo completo de cercas de PVC y malla electrosoldada en Panamá.",
};

async function getCategories(): Promise<Category[]> {
  const res = await fetch(`${API_BASE}/categories`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

async function getCollections(): Promise<Collection[]> {
  const res = await fetch(`${API_BASE}/collections`, { cache: "no-store" });
  if (!res.ok) return [];
  const data = await res.json();
  return data.data || [];
}

async function getProducts(searchParams: {
  category?: string;
  collection?: string;
  search?: string;
  page?: string;
}): Promise<{
  products: Product[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}> {
  const params = new URLSearchParams();
  if (searchParams.category) params.set("category", searchParams.category);
  if (searchParams.collection) params.set("collection", searchParams.collection);
  if (searchParams.search) params.set("search", searchParams.search);
  if (searchParams.page) params.set("page", searchParams.page);
  params.set("limit", "12");

  const query = params.toString();
  const res = await fetch(`${API_BASE}/products${query ? `?${query}` : ""}`, {
    cache: "no-store",
  });
  if (!res.ok) return { products: [], pagination: { page: 1, limit: 12, total: 0, totalPages: 0 } };
  const data = await res.json();
  return { products: data.data || [], pagination: data.pagination || { page: 1, limit: 12, total: 0, totalPages: 0 } };
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; collection?: string; search?: string; page?: string }>;
}) {
  const params = await searchParams;
  const [categories, collections, productsData] = await Promise.all([
    getCategories(),
    getCollections(),
    getProducts(params),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
        <p className="text-gray-600 mt-1">
          Explora nuestro catálogo de cercas de PVC y malla electrosoldada
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="w-full lg:w-64 shrink-0">
          <ProductFilters
            categories={categories}
            collections={collections}
            selectedCategories={[]}
            selectedCollections={[]}
            search=""
            onCategoriesChange={() => {}}
            onCollectionsChange={() => {}}
            onSearchChange={() => {}}
          />
        </aside>

        <div className="flex-1">
          <ProductGrid products={productsData.products} />
        </div>
      </div>
    </div>
  );
}
