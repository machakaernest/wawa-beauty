import type { Brand, Category, Product, ProductInput, BrandInput, CategoryInput, SiteSettings } from "./types";

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}/api${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    let message = `Request failed (${res.status})`;
    try {
      const body = await res.json();
      if (body?.error) message = body.error;
    } catch {
      /* ignore non-JSON error bodies */
    }
    throw new Error(message);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export const api = {
  health: () => request<{ status: string; db: string }>("/health"),
  getProducts: () => request<Product[]>("/products"),
  getBrands: () => request<Brand[]>("/brands"),
  getCategories: () => request<Category[]>("/categories"),
  createBrand: (input: BrandInput) =>
    request<Brand>("/brands", { method: "POST", body: JSON.stringify(input) }),
  updateBrand: (id: number, input: BrandInput) =>
    request<Brand>(`/brands/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteBrand: (id: number) => request<void>(`/brands/${id}`, { method: "DELETE" }),
  createCategory: (input: CategoryInput) =>
    request<Category>("/categories", { method: "POST", body: JSON.stringify(input) }),
  updateCategory: (id: number, input: CategoryInput) =>
    request<Category>(`/categories/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  deleteCategory: (id: number) => request<void>(`/categories/${id}`, { method: "DELETE" }),
  getSettings: () => request<SiteSettings>("/settings"),
  updateSettings: (input: Partial<SiteSettings>) =>
    request<SiteSettings>("/settings", { method: "PUT", body: JSON.stringify(input) }),
  createProduct: (input: ProductInput) =>
    request<Product>("/products", { method: "POST", body: JSON.stringify(input) }),
  updateProduct: (id: number, input: ProductInput) =>
    request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  setProductFlags: (id: number, flags: Partial<Pick<Product, "featured" | "newArrival" | "active">>) =>
    request<Product>(`/products/${id}`, { method: "PUT", body: JSON.stringify(flags) }),
  deleteProduct: (id: number) =>
    request<void>(`/products/${id}`, { method: "DELETE" }),
  uploadImage: async (file: File): Promise<{ url: string }> => {
    const data = new FormData();
    data.append("image", file);
    // Note: don't set Content-Type — the browser sets the multipart boundary.
    const res = await fetch(`${BASE_URL}/api/uploads`, { method: "POST", body: data });
    if (!res.ok) {
      let message = `Upload failed (${res.status})`;
      try {
        const body = await res.json();
        if (body?.error) message = body.error;
      } catch {
        /* ignore non-JSON error bodies */
      }
      throw new Error(message);
    }
    return res.json() as Promise<{ url: string }>;
  },
};
