export type ProductSize = {
  label: string;
  inStock: boolean;
};

export type Product = {
  id: number;
  name: string;
  slug: string;
  price: string;
  priceAmount: number;
  currency: string;
  category: string;
  groupLabel: string;
  brand: string;
  brandSlug: string;
  brandId: number;
  description: string;
  image: string;
  active: boolean;
  featured: boolean;
  newArrival: boolean;
  sizes: ProductSize[];
  createdAt?: string;
  updatedAt?: string;
};

export type Brand = {
  id: number;
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImage: string;
};

export type Category = {
  id: number;
  name: string;
  slug: string;
  heroImage: string;
};

export type ProductInput = {
  name: string;
  brandId: number;
  category: string;
  groupLabel: string;
  priceAmount: number;
  currency: string;
  description: string;
  image: string;
  active: boolean;
  featured: boolean;
  newArrival: boolean;
  sizes: ProductSize[];
};

export type BrandInput = {
  name: string;
  tagline: string;
  description: string;
  heroImage: string;
};

export type CategoryInput = {
  name: string;
  heroImage: string;
};

// Editable homepage banner content. All keys optional; empty falls back to the
// frontend's bundled defaults.
export type SiteSettings = {
  hero_image?: string;
  hero_tagline?: string;
  hero_cta_primary_label?: string;
  hero_cta_primary_slug?: string;
  hero_cta_secondary_label?: string;
  hero_cta_secondary_slug?: string;
  category_image?: string;
  category_heading?: string;
  category_cta_label?: string;
  category_cta_slug?: string;
  editorial_image?: string;
};
