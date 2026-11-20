import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getCategoryFromSlug, getProductImage, getCategoryHeroImage } from "@/lib/products";
import { useStorefront } from "@/hooks/use-storefront";
import { SiteHeader } from "@/components/site-header";

// Sub-category tabs per category
const CATEGORY_TABS: Record<string, string[]> = {
  "Nails": ["All", "Gel Nails", "Nail Art", "Acrylic"],
  "Men's Hair": ["All", "Haircuts", "Colouring", "Treatments"],
  "Women's Hair": ["All", "Styling", "Colouring", "Treatments"],
  "Brows & Lashes": ["All", "Brows", "Lashes", "Tinting"],
};

// Local nails images — 2 per sub-tab
import nails1 from "@/assets/nails /Screenshot 2026-09-12 at 10.52.19.png";
import nails2 from "@/assets/nails /Screenshot 2026-09-12 at 10.53.04.png";
import nails3 from "@/assets/nails /Screenshot 2026-09-12 at 10.54.49.png";
import nails4 from "@/assets/nails /Screenshot 2026-09-12 at 10.55.45.png";
import nails5 from "@/assets/nails /Screenshot 2026-09-12 at 10.56.06.png";
import nails6 from "@/assets/nails /Screenshot 2026-09-12 at 10.56.47.png";

// Men's hair images
import mensHair1 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.45.16.png";
import mensHair2 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.45.56.png";
import mensHair3 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.46.10.png";
import mensHair4 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.46.31.png";
import mensHair5 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.46.48.png";
import mensHair6 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.47.31.png";
import mensHair7 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.47.50.png";
import mensHair8 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.48.09.png";
import mensHair9 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.49.11.png";

// Women's hair images
import womensHair1 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.55.03.png";
import womensHair2 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.55.26.png";
import womensHair3 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.56.02.png";
import womensHair4 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.56.40.png";
import womensHair5 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.56.55.png";
import womensHair6 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.57.20.png";
import womensHair7 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.59.19.png";
import womensHair8 from "@/assets/women's hair/Screenshot 2026-09-12 at 12.00.02.png";
import womensHair9 from "@/assets/women's hair/Screenshot 2026-09-12 at 12.01.09.png";

const NAILS_GALLERY: Record<string, { src: string; label: string; description: string }[]> = {
  "All": [
    { src: nails1, label: "Signature Nails", description: "Flawless finishes for every occasion" },
    { src: nails2, label: "Nail Collections", description: "Curated colours & styles by our experts" },
    { src: nails3, label: "Long-lasting Gel", description: "Up to 3 weeks of chip-free shine" },
    { src: nails4, label: "Gel Polish Bar", description: "100+ shades to choose from" },
    { src: nails5, label: "Bespoke Designs", description: "Hand-painted art crafted just for you" },
    { src: nails6, label: "Trending Styles", description: "From minimalist lines to bold florals" },
  ],
  "Gel Nails": [
    { src: nails3, label: "Long-lasting Gel", description: "Up to 3 weeks of chip-free shine" },
    { src: nails4, label: "Gel Polish Bar", description: "100+ shades to choose from" },
  ],
  "Nail Art": [
    { src: nails5, label: "Bespoke Designs", description: "Hand-painted art crafted just for you" },
    { src: nails6, label: "Trending Styles", description: "From minimalist lines to bold florals" },
  ],
  "Acrylic": [
    { src: nails1, label: "Acrylic Extensions", description: "Sculpted length & strength" },
    { src: nails2, label: "French & Ombré", description: "Classic and gradient acrylic finishes" },
  ],
};

const MENS_HAIR_GALLERY: Record<string, { src: string; label: string }[]> = {
  "All":        [{ src: mensHair1, label: "Fresh Cut" }, { src: mensHair2, label: "Sharp Fade" }, { src: mensHair3, label: "Classic Style" }, { src: mensHair4, label: "Textured Top" }, { src: mensHair5, label: "Clean Taper" }, { src: mensHair6, label: "Modern Crop" }, { src: mensHair7, label: "Precision Cut" }, { src: mensHair8, label: "Bold Look" }, { src: mensHair9, label: "Signature Style" }],
  "Haircuts":   [{ src: mensHair1, label: "Fresh Cut" }, { src: mensHair2, label: "Sharp Fade" }, { src: mensHair3, label: "Classic Style" }],
  "Colouring":  [{ src: mensHair4, label: "Textured Top" }, { src: mensHair5, label: "Clean Taper" }, { src: mensHair6, label: "Modern Crop" }],
  "Treatments": [{ src: mensHair7, label: "Precision Cut" }, { src: mensHair8, label: "Bold Look" }, { src: mensHair9, label: "Signature Style" }],
};

const WOMENS_HAIR_GALLERY: Record<string, { src: string; label: string }[]> = {
  "All":        [{ src: womensHair1, label: "Blowout" }, { src: womensHair2, label: "Waves" }, { src: womensHair3, label: "Sleek & Straight" }, { src: womensHair4, label: "Balayage" }, { src: womensHair5, label: "Highlights" }, { src: womensHair6, label: "Colour Gloss" }, { src: womensHair7, label: "Deep Condition" }, { src: womensHair8, label: "Keratin" }, { src: womensHair9, label: "Scalp Treatment" }],
  "Styling":    [{ src: womensHair1, label: "Blowout" }, { src: womensHair2, label: "Waves" }, { src: womensHair3, label: "Sleek & Straight" }],
  "Colouring":  [{ src: womensHair4, label: "Balayage" }, { src: womensHair5, label: "Highlights" }, { src: womensHair6, label: "Colour Gloss" }],
  "Treatments": [{ src: womensHair7, label: "Deep Condition" }, { src: womensHair8, label: "Keratin" }, { src: womensHair9, label: "Scalp Treatment" }],
};

export const Route = createFileRoute("/category/$slug")({
  component: CategoryPage,
  head: ({ params }) => {
    const category = getCategoryFromSlug(params.slug);
    return {
      meta: [
        { title: category ? `${category} — Wawa La Beauty` : "Category — Wawa La Beauty" },
        {
          name: "description",
          content: category
            ? `Explore ${category} services and products at Wawa La Beauty.`
            : "",
        },
      ],
    };
  },
});

function CategoryPage() {
  const { slug } = Route.useParams();
  const category = getCategoryFromSlug(slug);
  const { getProductsByCategory } = useStorefront();
  const [activeTab, setActiveTab] = useState("All");

  if (!category) {
    return (
      <div className="min-h-screen bg-cream text-ink flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-5xl mb-4">Category not found</h1>
          <Link to="/" className="text-[11px] tracking-[0.3em] uppercase border-b border-ink pb-1">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const allProducts = getProductsByCategory(category);

  // Filter by active sub-tab (simple name match; "All" shows everything)
  const products = activeTab === "All"
    ? allProducts
    : allProducts.filter((p) =>
        p.name.toLowerCase().includes(activeTab.toLowerCase()) ||
        p.category.toLowerCase().includes(activeTab.toLowerCase())
      );

  // Group by brand for a cleaner presentation
  const brandGroups = products.reduce(
    (acc, product) => {
      if (!acc[product.brand]) acc[product.brand] = [];
      acc[product.brand].push(product);
      return acc;
    },
    {} as Record<string, typeof products>,
  );

  const subTabs = CATEGORY_TABS[category];

  return (
    <div className="bg-cream text-ink min-h-screen flex flex-col">
      <SiteHeader />

      {/* Hero */}
      <section className="relative pt-24 pb-16 md:pt-0 md:pb-0 md:h-[50vh] overflow-hidden">
        <img
          src={getCategoryHeroImage(category)}
          alt={`${category} collection`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-10 py-12 md:py-16 text-cream">
          <p className="text-[11px] tracking-[0.3em] uppercase text-cream/70 mb-4">
            Collection
          </p>
          <h1 className="font-serif font-light text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight">
            {category}
          </h1>
        </div>
      </section>

      {/* Sub-category tabs — only shown for categories that have them */}
      {subTabs && (
        <section className="px-6 md:px-10 py-5 border-b border-[#c9a84c]/20 bg-[#1a237e]/[0.03]">
          <div className="flex flex-wrap gap-2">
            {subTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-[11px] tracking-[0.25em] uppercase px-5 py-2.5 rounded-sm transition-all font-medium ${
                  tab === activeTab
                    ? "bg-[#c9a84c] text-[#1a237e] shadow-sm"
                    : "bg-transparent text-[#1a237e]/60 hover:text-[#1a237e] hover:bg-[#c9a84c]/10 border border-[#c9a84c]/30"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>
      )}

      {/* Nails image gallery — 2 cards per sub-tab */}
      {category === "Nails" && (
        <section className="px-6 md:px-10 pt-10 pb-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5 md:gap-8">
            {(NAILS_GALLERY[activeTab] ?? NAILS_GALLERY["All"]).map((item, i) => (
              <div
                key={i}
                className="group relative overflow-hidden rounded-sm shadow-md border border-[#c9a84c]/15"
              >
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.label}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Men's Hair image gallery — 3 per tab */}
      {category === "Men's Hair" && (
        <section className="px-6 md:px-10 pt-10 pb-4">
          <div className="grid grid-cols-3 gap-5 md:gap-8">
            {(MENS_HAIR_GALLERY[activeTab] ?? MENS_HAIR_GALLERY["All"]).map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-sm shadow-md border border-[#c9a84c]/15">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.label}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 py-3 bg-cream">
                  <p className="font-serif text-base text-ink">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Women's Hair image gallery — 3 per tab */}
      {category === "Women's Hair" && (
        <section className="px-6 md:px-10 pt-10 pb-4">
          <div className="grid grid-cols-3 gap-5 md:gap-8">
            {(WOMENS_HAIR_GALLERY[activeTab] ?? WOMENS_HAIR_GALLERY["All"]).map((item, i) => (
              <div key={i} className="group relative overflow-hidden rounded-sm shadow-md border border-[#c9a84c]/15">
                <div className="relative aspect-[4/5] overflow-hidden">
                  <img
                    src={item.src}
                    alt={item.label}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="px-3 py-3 bg-cream">
                  <p className="font-serif text-base text-ink">{item.label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Products grid */}
      <section className="px-6 md:px-10 py-16 md:py-24">
        {products.length === 0 ? null : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {products.map((product) => (
              <Link
                key={`${product.brandSlug}-${product.slug}`}
                to="/brand/$slug/product/$productSlug"
                params={{ slug: product.brandSlug, productSlug: product.slug }}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={getProductImage(product)}
                    alt={product.name}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    loading="lazy"
                  />
                  <span className="absolute top-3 left-3 text-[9px] tracking-[0.25em] uppercase bg-cream/80 px-2 py-1">
                    {product.brand}
                  </span>
                </div>
                <div className="pt-4">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    {product.brand}
                  </p>
                  <div className="flex items-baseline justify-between mt-1 gap-2">
                    <h3 className="font-serif text-lg md:text-xl group-hover:italic transition-all">
                      {product.name}
                    </h3>
                    <span className="font-serif text-sm shrink-0">{product.price}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Spacer keeps footer pinned to bottom when content is short */}
      <div className="flex-1" />

      {/* Footer */}
      <footer className="bg-[#1a237e] text-[#c9a84c] px-6 md:px-10 pt-16 pb-8 border-t border-[#c9a84c]/20">
        <div className="flex flex-col md:flex-row justify-between gap-4 text-[11px] tracking-[0.25em] uppercase text-[#c9a84c]/60">
          <p>© 2026 Wawa La Beauty. All rights reserved.</p>
          <p>Beauty · Style · Wellness</p>
        </div>
      </footer>
    </div>
  );
}
