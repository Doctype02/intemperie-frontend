import { request, requestPaginated } from "@/lib/api";
import type { Product, Category, Collection } from "@/types";

export async function getProducts(params?: {
  category?: string;
  collection?: string;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: string;
  minPrice?: string;
  maxPrice?: string;
}): Promise<{ data: Product[]; pagination?: { page: number; limit: number; total: number; totalPages: number } }> {
  const searchParams = new URLSearchParams();
  if (params?.category) searchParams.set("category", params.category);
  if (params?.collection) searchParams.set("collection", params.collection);
  if (params?.search) searchParams.set("search", params.search);
  if (params?.page) searchParams.set("page", String(params.page));
  if (params?.limit) searchParams.set("limit", String(params.limit));
  if (params?.sortBy) searchParams.set("sortBy", params.sortBy);
  if (params?.order) searchParams.set("order", params.order);
  if (params?.minPrice) searchParams.set("minPrice", params.minPrice);
  if (params?.maxPrice) searchParams.set("maxPrice", params.maxPrice);

  const query = searchParams.toString();
  return requestPaginated<Product>(
    `/products${query ? `?${query}` : ""}`
  );
}

export async function getProductBySlug(slug: string): Promise<Product> {
  return request<Product>(`/products/${slug}`);
}

export async function getCategories(): Promise<Category[]> {
  return request<Category[]>("/categories");
}

export async function getCollections(): Promise<Collection[]> {
  return request<Collection[]>("/collections");
}
