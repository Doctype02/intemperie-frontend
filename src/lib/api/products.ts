import { request } from "@/lib/api";
import type { ApiResponse, PaginatedResponse, Product } from "@/types";

export async function getProducts(params?: {
  category?: string;
  collection?: string;
  search?: string;
  page?: number;
  limit?: number;
}): Promise<PaginatedResponse<Product>> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.collection) searchParams.set("collection", params.collection);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));

  const query = searchParams.toString();
  return request<PaginatedResponse<Product>>(
    `/products${query ? `?${query}` : ""}`
  );
}

export async function getProductBySlug(
  slug: string
): Promise<Product> {
  const res = await request<ApiResponse<Product>>(`/products/${slug}`);
  return res.data;
}

export async function getFeaturedProducts(): Promise<Product[]> {
  const res = await request<ApiResponse<Product[]>>("/products/featured");
  return res.data;
}
