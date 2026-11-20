import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { fetchStorefront, type SiteSettings } from "@/lib/api";
import { BRANDS, type Brand, type Product } from "@/lib/products";

// Loads the catalogue from the backend API. The bundled static catalogue is
// used as initial data so the UI renders instantly (and during SSR), then the
// query refetches the live data — including anything added via the dashboard.
export function useStorefront() {
  const query = useQuery({
    queryKey: ["storefront"],
    queryFn: fetchStorefront,
    initialData: { brands: BRANDS, settings: {} },
    // Treat the static initial data as stale so the client refetches live data.
    initialDataUpdatedAt: 0,
    staleTime: 30_000,
  });

  const brands: Brand[] = query.data?.brands ?? BRANDS;
  const settings: SiteSettings = query.data?.settings ?? {};

  const allProducts: Product[] = useMemo(
    () => brands.flatMap((b) => b.groups.flatMap((g) => g.items)),
    [brands],
  );

  const featured: Product[] = useMemo(
    () => allProducts.filter((p) => p.featured),
    [allProducts],
  );

  const newArrivals: Product[] = useMemo(
    () => allProducts.filter((p) => p.newArrival),
    [allProducts],
  );

  const helpers = useMemo(
    () => ({
      getBrandBySlug: (slug: string): Brand | undefined =>
        brands.find((b) => b.slug === slug),

      getProductBySlug: (brandSlug: string, productSlug: string): Product | undefined => {
        const brand = brands.find((b) => b.slug === brandSlug);
        if (!brand) return undefined;
        return brand.groups.flatMap((g) => g.items).find((p) => p.slug === productSlug);
      },

      getProductsByCategory: (category: string): Product[] =>
        allProducts.filter((p) => p.category.toLowerCase() === category.toLowerCase()),
    }),
    [brands, allProducts],
  );

  return {
    brands,
    settings,
    allProducts,
    featured,
    newArrivals,
    isLoading: query.isLoading,
    isError: query.isError,
    ...helpers,
  };
}
