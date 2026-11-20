import { BRANDS, type Brand, type Product } from "./products";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

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

export type Storefront = {
  brands: Brand[];
  settings?: SiteSettings;
};

type ApiProduct = {
  name: string;
  slug: string;
  price: string;
  priceAmount?: number;
  currency?: string;
  category: string;
  brand: string;
  brandSlug: string;
  description: string;
  image?: string;
  groupLabel?: string;
  featured?: boolean;
  newArrival?: boolean;
  sizes?: { label: string; inStock: boolean }[];
};

type ApiBrand = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImage: string;
  groups: { label: string; items: ApiProduct[] }[];
};

function mapProduct(p: ApiProduct): Product {
  return {
    name: p.name,
    price: p.price,
    slug: p.slug,
    category: p.category,
    brand: p.brand,
    brandSlug: p.brandSlug,
    description: p.description,
    image: p.image || undefined,
    featured: p.featured,
    newArrival: p.newArrival,
    sizes: Array.isArray(p.sizes) ? p.sizes : undefined,
  };
}

function mapBrand(b: ApiBrand): Brand {
  return {
    name: b.name,
    slug: b.slug,
    tagline: b.tagline,
    description: b.description,
    heroImage: b.heroImage,
    groups: b.groups.map((g) => ({
      label: g.label,
      items: g.items.map(mapProduct),
    })),
  };
}

// Fetches the live catalogue from the backend API. Falls back to the bundled
// static catalogue if the API is unreachable, so the storefront always renders.
export async function fetchStorefront(): Promise<Storefront> {
  try {
    const res = await fetch(`${API_URL}/api/storefront`);
    if (!res.ok) throw new Error(`Storefront request failed (${res.status})`);
    const data = (await res.json()) as { brands: ApiBrand[]; settings?: SiteSettings };
    if (!data?.brands?.length) return { brands: BRANDS, settings: data?.settings ?? {} };
    return { brands: data.brands.map(mapBrand), settings: data.settings ?? {} };
  } catch {
    return { brands: BRANDS, settings: {} };
  }
}
