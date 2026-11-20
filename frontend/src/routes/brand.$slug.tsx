import { createFileRoute, Link } from "@tanstack/react-router";
import { getProductImage } from "@/lib/products";
import { useStorefront } from "@/hooks/use-storefront";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/brand/$slug")({
  component: BrandPage,
  head: ({ params }) => {
    return {
      meta: [
        { title: `${params.slug} — WAWA LA BEAUTY` },
        { name: "description", content: "" },
      ],
    };
  },
});

function BrandPage() {
  const { slug } = Route.useParams();
  const { getBrandBySlug } = useStorefront();
  const brand = getBrandBySlug(slug);

  if (!brand) {
    return (
      <div className="min-h-screen bg-cream text-ink flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-serif text-5xl mb-4">Brand not found</h1>
          <Link to="/" className="text-[11px] tracking-[0.3em] uppercase border-b border-ink pb-1">
            Return Home
          </Link>
        </div>
      </div>
    );
  }

  const allProducts = brand.groups.flatMap((g) => g.items);

  return (
    <div className="bg-cream text-ink min-h-screen">
      <SiteHeader />

      {/* Hero */}
      <section className="relative pt-24 pb-20 md:pt-0 md:pb-0 md:h-[60vh] overflow-hidden">
        <img
          src={brand.heroImage}
          alt={`${brand.name} collection`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
        <div className="relative z-10 h-full flex flex-col justify-end px-6 md:px-10 py-12 md:py-16 text-cream">
          <p className="text-[11px] tracking-[0.3em] uppercase text-cream/70 mb-4">
            {brand.tagline}
          </p>
          <h1 className="font-serif font-light text-6xl md:text-8xl lg:text-9xl leading-[0.9] tracking-tight">
            {brand.name}
          </h1>
          <p className="mt-6 max-w-2xl text-sm md:text-base leading-relaxed text-cream/80">
            {brand.description}
          </p>
        </div>
      </section>

      {/* Product groups */}
      {brand.groups.map((group) => (
        <section key={group.label} className="px-6 md:px-10 py-16 md:py-24 border-b border-ink/10">
          <div className="flex items-end justify-between mb-12">
            <h2 className="font-serif font-light text-3xl md:text-5xl">{group.label}</h2>
            <span className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
              {group.items.length} {group.items.length === 1 ? "piece" : "pieces"}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
            {group.items.map((product) => (
              <Link
                key={product.slug}
                to="/brand/$slug/product/$productSlug"
                params={{ slug: brand.slug, productSlug: product.slug }}
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
                    {product.category}
                  </span>
                </div>
                <div className="pt-4">
                  <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                    {brand.name}
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
        </section>
      ))}

      {/* All products count */}
      <section className="px-6 md:px-10 py-16 text-center">
        <p className="text-muted-foreground text-sm">
          {allProducts.length} pieces from {brand.name}
        </p>
        <Link
          to="/"
          className="mt-4 inline-block text-[11px] tracking-[0.3em] uppercase border-b border-ink pb-1 hover:border-gold hover:text-gold transition-colors"
        >
          ← Back to Maison
        </Link>
      </section>

      {/* Footer */}
      <footer className="bg-cream text-ink px-6 md:px-10 pt-16 pb-8 border-t border-ink/15">
        <div className="flex flex-col md:flex-row justify-between gap-4 text-[11px] tracking-[0.25em] uppercase text-muted-foreground">
          <p>© 2026 Wawa La Beauty. All rights reserved.</p>
          <p>Springs · Kwa-Thema · South Africa</p>
        </div>
      </footer>
    </div>
  );
}
