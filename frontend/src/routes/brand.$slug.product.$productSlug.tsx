import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { getProductImage } from "@/lib/products";
import { useStorefront } from "@/hooks/use-storefront";
import { SiteHeader } from "@/components/site-header";
import { useCartStore } from "@/stores/cart-store";

export const Route = createFileRoute("/brand/$slug/product/$productSlug")({
  component: ProductPage,
  head: ({ params }) => {
    return {
      meta: [
        { title: `${params.productSlug} — ${params.slug} — WAWA LA BEAUTY` },
        { name: "description", content: "" },
      ],
    };
  },
});

function ProductPage() {
  const { slug, productSlug } = Route.useParams();
  const { getBrandBySlug, getProductBySlug, allProducts, isLoading } = useStorefront();
  const brand = getBrandBySlug(slug);
  const product = getProductBySlug(slug, productSlug);

  const [sizeOpen, setSizeOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);

  const addItem = useCartStore((s) => s.addItem);

  if (isLoading && !product) {
    return (
      <div className="min-h-screen bg-cream text-ink flex items-center justify-center">
        <div className="text-center">
          <p className="font-serif text-2xl">Loading...</p>
        </div>
      </div>
    );
  }

  if (!brand || !product) {
    return (
      <div className="min-h-screen bg-cream text-ink flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-5xl mb-4">Product not found</h1>
          <Link to="/" className="text-[11px] tracking-[0.3em] uppercase border-b border-ink pb-1">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  // Get related products from same brand (different product)
  const relatedFromBrand = brand.groups
    .flatMap((g) => g.items)
    .filter((p) => p.slug !== product.slug)
    .slice(0, 4);

  // Get related products from same category (different brand)
  const relatedByCategory = allProducts.filter(
    (p) => p.category === product.category && p.brandSlug !== product.brandSlug,
  ).slice(0, 4);

  const sizes = product.sizes ?? [];

  return (
    <div className="bg-cream text-ink min-h-screen">
      <SiteHeader />

      {/* Breadcrumb */}
      <div className="pt-24 px-6 md:px-10">
        <nav className="flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-muted-foreground">
          <Link to="/" className="hover:text-ink transition-colors">Home</Link>
          <span>/</span>
          <Link
            to="/brand/$slug"
            params={{ slug: brand.slug }}
            className="hover:text-ink transition-colors"
          >
            {brand.name}
          </Link>
          <span>/</span>
          <span className="text-ink">{product.name}</span>
        </nav>
      </div>

      {/* Product Detail */}
      <section className="px-6 md:px-10 py-12 md:py-20">
        <div className="grid md:grid-cols-2 gap-12 md:gap-20 max-w-7xl mx-auto">
          {/* Image */}
          <div className="relative aspect-[4/5] overflow-hidden bg-muted">
            <img
              src={getProductImage(product)}
              alt={product.name}
              className="h-full w-full object-cover"
            />
            <span className="absolute top-4 left-4 text-[9px] tracking-[0.25em] uppercase bg-cream/80 px-3 py-1">
              {product.category}
            </span>
          </div>

          {/* Info */}
          <div className="flex flex-col justify-center">
            <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-2">
              {brand.name} · {brand.tagline}
            </p>
            <h1 className="font-serif font-light text-4xl md:text-6xl leading-[0.95] mb-6">
              {product.name}
            </h1>
            <p className="font-serif text-2xl md:text-3xl text-gold mb-8">
              {product.price}
            </p>

            {sizes.length > 0 && (
              <button
                onClick={() => setSizeOpen(true)}
                className="w-full flex items-center justify-between border border-ink px-5 py-4 mb-8 text-sm tracking-wide hover:border-gold transition-colors"
              >
                <span>{selectedSize ? `Size ${selectedSize}` : "Select size"}</span>
                <span className="text-lg leading-none">+</span>
              </button>
            )}

            <p className="text-sm md:text-base leading-relaxed text-ink/70 mb-10 max-w-lg">
              {product.description}
            </p>

            {/* Details */}
            <div className="border-t border-ink/10 pt-8 space-y-4">
              <div className="flex justify-between text-sm border-b border-ink/5 pb-4">
                <span className="text-muted-foreground">House</span>
                <span>{brand.name}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-ink/5 pb-4">
                <span className="text-muted-foreground">Category</span>
                <span>{product.category}</span>
              </div>
              <div className="flex justify-between text-sm border-b border-ink/5 pb-4">
                <span className="text-muted-foreground">Origin</span>
                <span>{brand.tagline}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-10 flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  addItem({
                    productSlug: product.slug,
                    brandSlug: brand.slug,
                    name: product.name,
                    price: product.price,
                    image: product.image,
                    size: selectedSize ?? undefined,
                  });
                }}
                className="bg-ink text-cream px-8 py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-ink/90 transition-colors"
              >
                Add to Bag
              </button>
              <button className="border border-ink px-8 py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-ink hover:text-cream transition-colors">
                Save to Wishlist
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Related from same brand */}
      {relatedFromBrand.length > 0 && (
        <section className="px-6 md:px-10 py-16 md:py-24 border-t border-ink/10">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-serif font-light text-3xl md:text-4xl">
              More from {brand.name}
            </h2>
            <Link
              to="/brand/$slug"
              params={{ slug: brand.slug }}
              className="text-[11px] tracking-[0.3em] uppercase border-b border-ink pb-1 hover:border-gold hover:text-gold transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {relatedFromBrand.map((p) => (
              <Link
                key={p.slug}
                to="/brand/$slug/product/$productSlug"
                params={{ slug: brand.slug, productSlug: p.slug }}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={getProductImage(p)}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="pt-3">
                  <h4 className="font-serif text-base md:text-lg group-hover:italic transition-all">
                    {p.name}
                  </h4>
                  <span className="font-serif text-sm text-muted-foreground">{p.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related by category */}
      {relatedByCategory.length > 0 && (
        <section className="px-6 md:px-10 py-16 md:py-24 border-t border-ink/10 bg-sand/30">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-serif font-light text-3xl md:text-4xl">
              More {product.category}
            </h2>
            <Link
              to="/category/$slug"
              params={{ slug: product.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") }}
              className="text-[11px] tracking-[0.3em] uppercase border-b border-ink pb-1 hover:border-gold hover:text-gold transition-colors"
            >
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
            {relatedByCategory.map((p) => (
              <Link
                key={`${p.brandSlug}-${p.slug}`}
                to="/brand/$slug/product/$productSlug"
                params={{ slug: p.brandSlug, productSlug: p.slug }}
                className="group"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                  <img
                    src={getProductImage(p)}
                    alt={p.name}
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                <div className="pt-3">
                  <p className="text-[9px] tracking-[0.25em] uppercase text-muted-foreground">
                    {p.brand}
                  </p>
                  <h4 className="font-serif text-base md:text-lg group-hover:italic transition-all">
                    {p.name}
                  </h4>
                  <span className="font-serif text-sm text-muted-foreground">{p.price}</span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-cream text-ink px-6 md:px-10 pt-16 pb-8 border-t border-ink/15">
        <div className="flex flex-col md:flex-row justify-between gap-4 text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
          <p>© 2026 Wawa La Beauty. All rights reserved.</p>
          <p>Springs · Kwa-Thema · South Africa</p>
        </div>
      </footer>

      {/* SIZES slide-in panel */}
      <div
        className={`fixed inset-0 z-50 transition-opacity duration-300 ${
          sizeOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        aria-hidden={!sizeOpen}
      >
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={() => setSizeOpen(false)}
        />
        <aside
          className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl overflow-y-auto transition-transform duration-300 ease-out ${
            sizeOpen ? "translate-x-0" : "translate-x-full"
          }`}
        >
          <div className="flex justify-end p-5">
            <button
              onClick={() => setSizeOpen(false)}
              aria-label="Close"
              className="w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center hover:bg-ink/90 transition-colors"
            >
              ✕
            </button>
          </div>
          <div className="px-8 pb-16">
            <h2 className="font-serif text-3xl mb-8">SIZES</h2>
            <p className="text-sm font-medium mb-2">Size Guide</p>
            <ul>
              {sizes.map((s) => {
                const isSelected = selectedSize === s.label;
                return (
                  <li key={s.label} className="border-b border-ink/10">
                    <button
                      disabled={!s.inStock}
                      onClick={() => {
                        setSelectedSize(s.label);
                        setSizeOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 py-3.5 text-left text-sm transition-colors ${
                        s.inStock
                          ? "hover:text-gold cursor-pointer"
                          : "text-ink/35 line-through cursor-not-allowed"
                      }`}
                    >
                      <span className="w-4 inline-flex justify-center">
                        {isSelected && s.inStock ? "✓" : ""}
                      </span>
                      <span>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}
