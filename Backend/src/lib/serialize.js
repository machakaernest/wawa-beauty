import { formatPrice } from "./format.js";

// Normalize a stored sizes value (JSON array, JSON string, or null) into a
// clean array of { label, inStock } objects.
export function normalizeSizes(raw) {
  let arr = raw;
  if (typeof raw === "string") {
    try {
      arr = JSON.parse(raw);
    } catch {
      arr = [];
    }
  }
  if (!Array.isArray(arr)) return [];
  return arr
    .map((s) => ({
      label: String(s?.label ?? "").trim(),
      inStock: s?.inStock !== false, // default to in stock
    }))
    .filter((s) => s.label);
}

// Maps a DB product row (joined with its brand) into the shape the
// storefront/dashboard consume.
export function serializeProduct(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    // Display string the frontend renders directly, e.g. "€6,200".
    price: formatPrice(row.price, row.currency),
    priceAmount: Number(row.price),
    currency: row.currency,
    category: row.category,
    groupLabel: row.group_label,
    brand: row.brand_name,
    brandSlug: row.brand_slug,
    brandId: row.brand_id,
    description: row.description || "",
    image: row.image || "",
    active: Boolean(row.active),
    featured: Boolean(row.featured),
    newArrival: Boolean(row.new_arrival),
    sizes: normalizeSizes(row.sizes),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function serializeBrand(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    tagline: row.tagline || "",
    description: row.description || "",
    heroImage: row.hero_image || "",
  };
}

export function serializeCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    heroImage: row.hero_image || "",
  };
}
