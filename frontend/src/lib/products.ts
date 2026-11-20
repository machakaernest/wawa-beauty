export type ProductSize = {
  label: string;
  inStock: boolean;
};

export type Product = {
  name: string;
  price: string;
  slug: string;
  category: string;
  brand: string;
  brandSlug: string;
  description: string;
  // Optional explicit image URL coming from the backend/dashboard.
  // When absent we fall back to the curated image maps below.
  image?: string;
  // Storefront placement flags, controlled from the dashboard.
  featured?: boolean;
  newArrival?: boolean;
  // Available sizes with per-size stock, managed from the dashboard.
  sizes?: ProductSize[];
};

export type ProductGroup = {
  label: string;
  items: Product[];
};

export type Brand = {
  name: string;
  slug: string;
  tagline: string;
  description: string;
  heroImage: string;
  groups: ProductGroup[];
};

function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/['']/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function inferCategory(groupLabel: string, itemName: string): string {
  const label = groupLabel.toLowerCase();
  const name = itemName.toLowerCase();

  if (label.includes("brow") || label.includes("lash") || name.includes("brow") || name.includes("lash") || name.includes("mascara")) return "Brows & Lashes";
  if (label.includes("skincare") || name.includes("serum") || name.includes("moistur") || name.includes("lotion") || name.includes("cream") || name.includes("peeling") || name.includes("niacinamide") || name.includes("hyaluronic") || name.includes("eyes")) return "Skincare";
  if (label.includes("haircare") || label.includes("hair") || name.includes("shampoo") || name.includes("conditioner")) return "Haircare";
  if (label.includes("fragrance") || name.includes("eau de parfum") || name.includes("edp") || name.includes("perfume") || name.includes("cologne")) return "Fragrance";
  if (label.includes("nail") || name.includes("nail") || name.includes("polish")) return "Nails";
  if (label.includes("makeup") || name.includes("foundation") || name.includes("lipstick") || name.includes("lip") || name.includes("gloss") || name.includes("highlighter") || name.includes("palette") || name.includes("tint") || name.includes("fix")) return "Makeup";

  return "Makeup";
}

function generateDescription(product: { name: string; price: string }, brandName: string, category: string): string {
  const descriptions: Record<string, string[]> = {
    Skincare: [
      `Powered by proven actives, the ${product.name} from ${brandName} works to visibly renew and hydrate skin. A daily ritual for a healthy, radiant complexion.`,
      `The ${product.name} by ${brandName} delivers targeted care with a lightweight, fast-absorbing formula your skin will love.`,
    ],
    Makeup: [
      `Achieve a flawless, long-wearing finish with the ${product.name} from ${brandName}. Buildable, blendable, and made to move with you.`,
      `The ${product.name} by ${brandName} brings studio-quality colour and coverage to your everyday look.`,
    ],
    Haircare: [
      `Nourish and repair with the ${product.name} from ${brandName}. Salon-inspired care that leaves hair soft, strong, and full of shine.`,
      `The ${product.name} by ${brandName} restores and protects, for healthy-looking hair from root to tip.`,
    ],
    Fragrance: [
      `An unforgettable signature — the ${product.name} from ${brandName} layers rich, lasting notes for a scent that lingers beautifully.`,
      `The ${product.name} by ${brandName} captures elegance in every spritz, an evocative fragrance for any occasion.`,
    ],
    "Brows & Lashes": [
      `Define and enhance with the ${product.name} from ${brandName}. Precision formula for bold, beautifully groomed brows and lashes.`,
      `The ${product.name} by ${brandName} shapes and lifts for an effortlessly polished eye look.`,
    ],
    Nails: [
      `Salon-perfect nails at home with the ${product.name} from ${brandName}. Rich, chip-resistant colour with a glossy finish.`,
      `The ${product.name} by ${brandName} delivers long-lasting shine and vibrant colour, wear after wear.`,
    ],
  };

  const options = descriptions[category] || descriptions.Makeup;
  const index = product.name.length % options.length;
  return options[index];
}

const RAW_BRANDS = [
  {
    name: "L'Oréal Paris",
    tagline: "Paris, 1909",
    heroImage: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&h=900&fit=crop&q=80",
    description:
      "Since 1909, L'Oréal Paris has made accessible beauty its mission. From breakthrough skincare serums to iconic makeup, the brand pairs scientific innovation with everyday glamour — because you're worth it.",
    groups: [
      { label: "Skincare", items: [
        { name: "Revitalift Anti-Ageing Serum", price: "R349" },
        { name: "Hyaluronic Acid Serum", price: "R299" },
      ]},
      { label: "Makeup", items: [
        { name: "True Match Foundation", price: "R259" },
        { name: "Voluminous Mascara", price: "R189" },
      ]},
      { label: "Haircare", items: [
        { name: "Elvive Repair Shampoo", price: "R129" },
        { name: "Elvive Conditioner", price: "R129" },
      ]},
    ],
  },
  {
    name: "MAC Cosmetics",
    tagline: "Toronto, 1984",
    heroImage: "https://images.unsplash.com/photo-1583241800698-e8ab01c85615?w=1600&h=900&fit=crop&q=80",
    description:
      "Born backstage in Toronto in 1984, MAC is the professional's choice — bold pigments, a shade for every skin tone, and studio-grade formulas trusted by makeup artists the world over.",
    groups: [
      { label: "Makeup", items: [
        { name: "Ruby Woo Retro Matte Lipstick", price: "R450" },
        { name: "Studio Fix Fluid Foundation", price: "R720" },
        { name: "Prep + Prime Fix+", price: "R520" },
        { name: "Eyeshadow Palette Warm", price: "R890" },
      ]},
      { label: "Brows & Lashes", items: [
        { name: "Brow Styler Pencil", price: "R390" },
      ]},
    ],
  },
  {
    name: "Fenty Beauty",
    tagline: "Los Angeles, 2017",
    heroImage: "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=1600&h=900&fit=crop&q=80",
    description:
      "Created by Rihanna in 2017, Fenty Beauty rewrote the rules with inclusive shade ranges and skin-loving formulas designed so everyone, everywhere, feels seen.",
    groups: [
      { label: "Makeup", items: [
        { name: "Pro Filt'r Soft Matte Foundation", price: "R780" },
        { name: "Gloss Bomb Universal Lip Luminizer", price: "R420" },
        { name: "Killawatt Freestyle Highlighter", price: "R650" },
        { name: "Eaze Drop Blurring Skin Tint", price: "R580" },
      ]},
    ],
  },
  {
    name: "Clinique",
    tagline: "New York, 1968",
    heroImage: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=1600&h=900&fit=crop&q=80",
    description:
      "Dermatologist-developed since 1968, Clinique is allergy-tested and 100% fragrance-free. Gentle, effective skincare and makeup for healthy-looking skin.",
    groups: [
      { label: "Skincare", items: [
        { name: "Moisture Surge 100H Gel", price: "R690" },
        { name: "Dramatically Different Moisturizing Lotion+", price: "R560" },
        { name: "All About Eyes Cream", price: "R620" },
      ]},
      { label: "Makeup", items: [
        { name: "Even Better Makeup Foundation", price: "R650" },
      ]},
    ],
  },
  {
    name: "Estée Lauder",
    tagline: "New York, 1946",
    heroImage: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=1600&h=900&fit=crop&q=80",
    description:
      "Founded in 1946, Estée Lauder is the standard of prestige beauty — from the legendary Advanced Night Repair serum to timeless fragrances and long-wear makeup.",
    groups: [
      { label: "Skincare", items: [
        { name: "Advanced Night Repair Serum", price: "R1,450" },
      ]},
      { label: "Makeup", items: [
        { name: "Double Wear Stay-in-Place Foundation", price: "R980" },
        { name: "Pure Color Lipstick", price: "R560" },
      ]},
      { label: "Fragrance", items: [
        { name: "Beautiful Magnolia Eau de Parfum", price: "R1,890" },
      ]},
    ],
  },
  {
    name: "The Ordinary",
    tagline: "Toronto, 2016",
    heroImage: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=1600&h=900&fit=crop&q=80",
    description:
      "Clinical formulations with integrity. The Ordinary makes effective, single-ingredient skincare honest and affordable, letting the actives speak for themselves.",
    groups: [
      { label: "Skincare", items: [
        { name: "Niacinamide 10% + Zinc 1%", price: "R159" },
        { name: "Hyaluronic Acid 2% + B5", price: "R179" },
        { name: "AHA 30% + BHA 2% Peeling Solution", price: "R199" },
        { name: "Natural Moisturizing Factors + HA", price: "R149" },
      ]},
    ],
  },
];

// Process raw data into typed brands with slugs
export const BRANDS: Brand[] = RAW_BRANDS.map((raw) => {
  const brandSlug = slugify(raw.name);
  return {
    name: raw.name,
    slug: brandSlug,
    tagline: raw.tagline,
    description: raw.description,
    heroImage: raw.heroImage,
    groups: raw.groups.map((g) => ({
      label: g.label,
      items: g.items.map((item) => {
        const category = inferCategory(g.label, item.name);
        return {
          name: item.name,
          price: item.price,
          slug: slugify(item.name),
          category,
          brand: raw.name,
          brandSlug,
          description: generateDescription(item, raw.name, category),
        };
      }),
    })),
  };
});

// Flat list of all products
export const ALL_PRODUCTS: Product[] = BRANDS.flatMap((b) =>
  b.groups.flatMap((g) => g.items),
);

// All available categories
export const CATEGORIES = [
  "Men's Hair",
  "Women's Hair",
  "Brows & Lashes",
  "Nails",
  "Skincare",
  "Makeup",
  "Haircare",
  "Fragrance",
] as const;

export type Category = (typeof CATEGORIES)[number];

// Category hero images
const CATEGORY_HERO_IMAGES: Record<string, string> = {
  "Men's Hair": "https://images.unsplash.com/photo-1503951914875-452162b0f3f1?w=1600&h=900&fit=crop&q=80",
  "Women's Hair": "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=1600&h=900&fit=crop&q=80",
  "Brows & Lashes": "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=1600&h=900&fit=crop&q=80",
  Nails: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=1600&h=900&fit=crop&q=80",
  Skincare: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=1600&h=900&fit=crop&q=80",
  Makeup: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=1600&h=900&fit=crop&q=80",
  Haircare: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=1600&h=900&fit=crop&q=80",
  Fragrance: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=1600&h=900&fit=crop&q=80",
};

export function getCategoryHeroImage(category: string): string {
  return CATEGORY_HERO_IMAGES[category] || CATEGORY_HERO_IMAGES.Makeup;
}

// Helper functions
export function getBrandBySlug(slug: string): Brand | undefined {
  return BRANDS.find((b) => b.slug === slug);
}

export function getProductBySlug(brandSlug: string, productSlug: string): Product | undefined {
  const brand = getBrandBySlug(brandSlug);
  if (!brand) return undefined;
  return brand.groups.flatMap((g) => g.items).find((p) => p.slug === productSlug);
}

export function getProductsByCategory(category: string): Product[] {
  return ALL_PRODUCTS.filter(
    (p) => p.category.toLowerCase() === category.toLowerCase(),
  );
}

export function getCategorySlug(category: string): string {
  return slugify(category);
}

export function getCategoryFromSlug(slug: string): string | undefined {
  return CATEGORIES.find((c) => slugify(c) === slug);
}

// Unique product images using Unsplash (free, no auth needed for small sizes).
// Each product gets a relevant image based on its slug.
const PRODUCT_IMAGES: Record<string, string> = {
  // L'Oréal Paris
  "revitalift-anti-ageing-serum": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=1000&fit=crop&q=80",
  "hyaluronic-acid-serum": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&h=1000&fit=crop&q=80",
  "true-match-foundation": "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800&h=1000&fit=crop&q=80",
  "voluminous-mascara": "https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=800&h=1000&fit=crop&q=80",
  "elvive-repair-shampoo": "https://images.unsplash.com/photo-1585232351009-aa87416fca90?w=800&h=1000&fit=crop&q=80",
  "elvive-conditioner": "https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&h=1000&fit=crop&q=80",

  // MAC Cosmetics
  "ruby-woo-retro-matte-lipstick": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=1000&fit=crop&q=80",
  "studio-fix-fluid-foundation": "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&h=1000&fit=crop&q=80",
  "prep-prime-fix": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=1000&fit=crop&q=80&sat=-10",
  "eyeshadow-palette-warm": "https://images.unsplash.com/photo-1583241800698-e8ab01c85615?w=800&h=1000&fit=crop&q=80",
  "brow-styler-pencil": "https://images.unsplash.com/photo-1631214540242-3cd8c9f6f5c5?w=800&h=1000&fit=crop&q=80",

  // Fenty Beauty
  "pro-filtr-soft-matte-foundation": "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&h=1000&fit=crop&q=80&bri=-5",
  "gloss-bomb-universal-lip-luminizer": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=1000&fit=crop&q=80&bri=5",
  "killawatt-freestyle-highlighter": "https://images.unsplash.com/photo-1583241800698-e8ab01c85615?w=800&h=1000&fit=crop&q=80&bri=5",
  "eaze-drop-blurring-skin-tint": "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800&h=1000&fit=crop&q=80&bri=-5",

  // Clinique
  "moisture-surge-100h-gel": "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=800&h=1000&fit=crop&q=80",
  "dramatically-different-moisturizing-lotion": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=1000&fit=crop&q=80",
  "all-about-eyes-cream": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&h=1000&fit=crop&q=80&sat=-15",
  "even-better-makeup-foundation": "https://images.unsplash.com/photo-1631730359585-38a4935cbec4?w=800&h=1000&fit=crop&q=80&sat=-10",

  // Estée Lauder
  "advanced-night-repair-serum": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=1000&fit=crop&q=80&bri=-8",
  "double-wear-stay-in-place-foundation": "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&h=1000&fit=crop&q=80&sat=-5",
  "pure-color-lipstick": "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=1000&fit=crop&q=80&sat=-10",
  "beautiful-magnolia-eau-de-parfum": "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop&q=80",

  // The Ordinary
  "niacinamide-10-zinc-1": "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=1000&fit=crop&q=80",
  "hyaluronic-acid-2-b5": "https://images.unsplash.com/photo-1611930022073-b7a4ba5fcccd?w=800&h=1000&fit=crop&q=80&bri=-5",
  "aha-30-bha-2-peeling-solution": "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=1000&fit=crop&q=80&sat=10",
  "natural-moisturizing-factors-ha": "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?w=800&h=1000&fit=crop&q=80&bri=5",
};

// Fallback images by category
const CATEGORY_FALLBACK_IMAGES: Record<string, string> = {
  Skincare: "https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=800&h=1000&fit=crop&q=80",
  Makeup: "https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=800&h=1000&fit=crop&q=80",
  Haircare: "https://images.unsplash.com/photo-1522338242992-e1a54906a8da?w=800&h=1000&fit=crop&q=80",
  Fragrance: "https://images.unsplash.com/photo-1541643600914-78b084683601?w=800&h=1000&fit=crop&q=80",
  Nails: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=800&h=1000&fit=crop&q=80",
  "Brows & Lashes": "https://images.unsplash.com/photo-1519415943484-9fa1873496d4?w=800&h=1000&fit=crop&q=80",
};

export function getProductImage(product: Product): string {
  return (
    product.image ||
    PRODUCT_IMAGES[product.slug] ||
    CATEGORY_FALLBACK_IMAGES[product.category] ||
    CATEGORY_FALLBACK_IMAGES.Makeup
  );
}
