import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { BookingDrawer } from "@/components/booking-drawer";
import { getProductImage, type Product } from "@/lib/products";
import { useStorefront } from "@/hooks/use-storefront";

import banner1 from "@/assets/banner-1.png";
import banner3 from "@/assets/banner3.avif";
import banner2 from "@/assets/banner-2.png";

// Featured showcase images (frontend/src/assets/feature)
import featBoys from "@/assets/feature/Boy's.png";
import featBrowsLashes from "@/assets/feature/Brows & Lashes.png";
import featGirls from "@/assets/feature/Girl's.png";
import featMensHair from "@/assets/feature/Man's hair .png";
import featNails from "@/assets/feature/Nails.png";
import featTattoo from "@/assets/feature/Tattoo.png";
import featWomensHair from "@/assets/feature/Women's Hair.png";

// Each feature tile: image, display name, and the category it links to
// (null = no dedicated category page, tile is non-navigable).
const featureShowcase: { img: string; name: string; slug: string | null }[] = [
  { img: featWomensHair, name: "Women's Hair", slug: "womens-hair" },
  { img: featMensHair, name: "Men's Hair", slug: "mens-hair" },
  { img: featGirls, name: "Girl's Hair", slug: "womens-hair" },
  { img: featBoys, name: "Boy's Hair", slug: "mens-hair" },
  { img: featBrowsLashes, name: "Brows & Lashes", slug: "brows-lashes" },
  { img: featNails, name: "Nails", slug: "nails" },
  { img: featTattoo, name: "Tattoo", slug: null },
];

import mensHair1 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.45.16.png";
import mensHair2 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.45.56.png";
import mensHair3 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.46.10.png";
import mensHair4 from "@/assets/man's hair/Screenshot 2026-09-12 at 11.46.31.png";
import womensHair1 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.55.03.png";
import womensHair2 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.55.26.png";
import womensHair3 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.56.02.png";
import womensHair4 from "@/assets/women's hair/Screenshot 2026-09-12 at 11.56.40.png";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Wawa La Beauty — Skincare, Makeup & Wellness" },
      {
        name: "description",
        content:
          "Shop skincare, makeup, haircare and wellness products from top beauty brands. Discover your glow with Wawa La Beauty.",
      },
      { property: "og:title", content: "Wawa La Beauty — Your Beauty Destination" },
      { property: "og:description", content: "Skincare, makeup, haircare and wellness — curated from the best beauty brands." },
      { property: "og:image", content: banner1 },
    ],
  }),
  component: Index,
});

// Fallback marquee list used only when the live catalogue hasn't loaded yet.
const brands = [
  { label: "L'ORÉAL", slug: "loreal" },
  { label: "MAC", slug: "mac" },
  { label: "FENTY BEAUTY", slug: "fenty-beauty" },
  { label: "DIOR BEAUTY", slug: "dior-beauty" },
  { label: "CHANEL BEAUTY", slug: "chanel-beauty" },
  { label: "CLINIQUE", slug: "clinique" },
  { label: "ESTÉE LAUDER", slug: "estee-lauder" },
  { label: "NARS", slug: "nars" },
];

const products = [
  { name: "Advanced Night Repair Serum", house: "Estée Lauder", price: "R1,450", img: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&h=1000&fit=crop&q=80&bri=-8", tag: "Skincare", brandSlug: "estee-lauder", productSlug: "advanced-night-repair-serum" },
  { name: "Ruby Woo Retro Matte Lipstick", house: "MAC Cosmetics", price: "R450", img: "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&h=1000&fit=crop&q=80", tag: "Makeup", brandSlug: "mac-cosmetics", productSlug: "ruby-woo-retro-matte-lipstick" },
  { name: "Pro Filt'r Soft Matte Foundation", house: "Fenty Beauty", price: "R780", img: "https://images.unsplash.com/photo-1596704017254-9b121068fb31?w=800&h=1000&fit=crop&q=80&bri=-5", tag: "Makeup", brandSlug: "fenty-beauty", productSlug: "pro-filtr-soft-matte-foundation" },
  { name: "Niacinamide 10% + Zinc 1%", house: "The Ordinary", price: "R159", img: "https://images.unsplash.com/photo-1608248597279-f99d160bfcbc?w=800&h=1000&fit=crop&q=80", tag: "Skincare", brandSlug: "the-ordinary", productSlug: "niacinamide-10-zinc-1" },
];

function Index() {
  const root = useRef<HTMLDivElement>(null);
  const heroImgRef = useRef<HTMLImageElement>(null);
  const [bookingOpen, setBookingOpen] = useState(false);

  const { newArrivals, settings, brands: storeBrands } = useStorefront();

  // Live open/closed status based on the salon's hours:
  // Mon–Sat 9am–6pm, Sunday 9am–2pm. Recomputed every minute.
  const getOpenStatus = () => {
    const now = new Date();
    const day = now.getDay(); // 0 = Sunday, 6 = Saturday
    const minutes = now.getHours() * 60 + now.getMinutes();
    const open = 9 * 60; // 9:00 am
    const close = day === 0 ? 14 * 60 : 18 * 60; // Sun 2pm, else 6pm
    return minutes >= open && minutes < close;
  };
  const [isOpen, setIsOpen] = useState(getOpenStatus);
  useEffect(() => {
    const id = setInterval(() => setIsOpen(getOpenStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  // Marquee shows the actual Wawa La Beauty brands from the live catalogue so
  // the names and links always stay in sync with the storefront.
  const marqueeBrands =
    storeBrands.length > 0
      ? storeBrands.map((b) => ({ label: b.name.toUpperCase(), slug: b.slug }))
      : brands;

  // Banner content is editable from the dashboard; fall back to bundled
  // assets / default copy when a setting is empty.
  const heroImage = settings.hero_image || banner1;
  const heroTagline = settings.hero_tagline || "Where Beauty Meets Confidence";
  const heroPrimaryLabel = settings.hero_cta_primary_label || "Women's Hair";
  const heroPrimarySlug = settings.hero_cta_primary_slug || "womens-hair";
  const heroSecondaryLabel = settings.hero_cta_secondary_label || "Men's Hair";
  const heroSecondarySlug = settings.hero_cta_secondary_slug || "mens-hair";
  const categoryImage = settings.category_image || banner3;
  const categoryHeading = settings.category_heading || "Explore Our Services";
  const categoryCtaLabel = settings.category_cta_label || "See All";
  const categoryCtaSlug = settings.category_cta_slug || "skincare";
  const editorialImage = settings.editorial_image || banner2;

  // Map a live catalogue product into the card shape this page renders.
  const toCard = (p: Product) => ({
    name: p.name,
    house: p.brand,
    price: p.price,
    img: getProductImage(p),
    tag: p.category,
    brandSlug: p.brandSlug,
    productSlug: p.slug,
  });

  // Use dashboard-managed selections when present; otherwise fall back to the
  // curated sample set so the homepage never looks empty.
  const newArrivalCards = newArrivals.length ? newArrivals.map(toCard) : products;

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);
    const ctx = gsap.context(() => {
      // Hero entrance — fade in the bottom text with luxury timing
      gsap.from(".hero-meta", { opacity: 0, y: 30, duration: 1.4, delay: 0.5, stagger: 0.2, ease: "power2.out" });

      // Slow Ken Burns on hero image
      if (heroImgRef.current) {
        gsap.fromTo(heroImgRef.current, { scale: 1 }, { scale: 1.08, duration: 20, ease: "none", repeat: -1, yoyo: true });
      }

      // Reveal headings
      gsap.utils.toArray<HTMLElement>(".reveal").forEach((el) => {
        gsap.from(el, {
          y: 60,
          opacity: 0,
          duration: 1.1,
          ease: "expo.out",
          scrollTrigger: { trigger: el, start: "top 85%" },
        });
      });

      // Product cards stagger
      gsap.utils.toArray<HTMLElement>(".product-card").forEach((el, i) => {
        gsap.from(el, {
          y: 80,
          opacity: 0,
          duration: 1,
          ease: "expo.out",
          delay: (i % 4) * 0.08,
          scrollTrigger: { trigger: el, start: "top 90%" },
        });
      });

      // Image parallax inside cards
      gsap.utils.toArray<HTMLElement>(".parallax-img").forEach((el) => {
        gsap.to(el, {
          yPercent: -12,
          ease: "none",
          scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
        });
      });

      // Horizontal scroll showcase
      const horiz = document.querySelector<HTMLElement>(".horiz-track");
      const horizSec = document.querySelector<HTMLElement>(".horiz-section");
      if (horiz && horizSec) {
        const distance = () => Math.max(0, horiz.scrollWidth - window.innerWidth);
        gsap.to(horiz, {
          x: () => -distance(),
          ease: "none",
          scrollTrigger: {
            trigger: horizSec,
            start: "top top",
            end: () => `+=${distance()}`,
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
          },
        });
      }

      // Big text scrub
      gsap.to(".big-word", {
        xPercent: -25,
        ease: "none",
        scrollTrigger: { trigger: ".big-word-wrap", start: "top bottom", end: "bottom top", scrub: true },
      });

      // Category banner: glide the CTA from the top of the banner down to the bottom as you scroll
      const catBanner = document.querySelector<HTMLElement>(".cat-banner");
      const catImg = catBanner?.querySelector<HTMLImageElement>("img");
      const catCta = catBanner?.querySelector<HTMLElement>(".cat-banner-cta");
      if (catBanner && catImg && catCta) {
        const pad = () => catImg.clientHeight * 0.08;
        gsap.fromTo(
          catCta,
          { y: () => pad() },
          {
            y: () => catImg.clientHeight - catCta.offsetHeight - pad(),
            ease: "none",
            scrollTrigger: {
              trigger: catBanner,
              start: "top bottom",
              end: "bottom top",
              scrub: true,
              invalidateOnRefresh: true,
            },
          },
        );

        // The banner image often isn't measured yet at init (height = 0), which
        // leaves the CTA with no distance to travel. Recompute once it loads.
        if (!catImg.complete) {
          catImg.addEventListener("load", () => ScrollTrigger.refresh(), { once: true });
        }
      }
    }, root);

    const onWindowLoad = () => ScrollTrigger.refresh();
    window.addEventListener("load", onWindowLoad);

    return () => {
      window.removeEventListener("load", onWindowLoad);
      ctx.revert();
    };
  }, []);

  // Live data arrives after the initial render; recompute pinned/scrub
  // ScrollTriggers once the card counts settle so layout stays correct.
  useEffect(() => {
    const id = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => cancelAnimationFrame(id);
  }, [newArrivalCards.length]);

  return (
    <div ref={root} className="bg-cream text-ink">

      {/* NAV — Wawa La Beauty */}
      <header className="fixed top-0 inset-x-0 z-40 bg-[#1a237e] border-b border-[#c9a84c]/30 shadow-md">
        <div className="grid grid-cols-3 items-center px-6 md:px-10 py-3 text-[#f8f6f0]">
          <div className="flex items-center gap-5">
            <nav className="hidden md:flex gap-7 text-[11px] tracking-[0.2em] uppercase">
              {/* Men's Hair with image dropdown */}
              <div className="relative group">
                <Link to="/category/$slug" params={{ slug: "mens-hair" }} className="text-[#c9a84c]/80 hover:text-[#c9a84c] transition-colors">Men's Hair</Link>
                <div className="absolute top-full left-0 mt-3 hidden group-hover:grid grid-cols-2 gap-2 bg-[#1a237e] border border-[#c9a84c]/30 p-3 shadow-xl z-50 w-64">
                  {[mensHair1, mensHair2, mensHair3, mensHair4].map((src, i) => (
                    <Link key={i} to="/category/$slug" params={{ slug: "mens-hair" }}>
                      <img src={src} alt={`Men's hair style ${i + 1}`} className="w-full h-24 object-cover hover:opacity-80 transition-opacity" />
                    </Link>
                  ))}
                  <Link to="/category/$slug" params={{ slug: "mens-hair" }} className="col-span-2 text-center text-[#c9a84c] text-[9px] tracking-[0.3em] uppercase pt-1 hover:text-[#c9a84c]/70 transition-colors">
                    View All →
                  </Link>
                </div>
              </div>
              {/* Women's Hair with image dropdown */}
              <div className="relative group">
                <Link to="/category/$slug" params={{ slug: "womens-hair" }} className="text-[#c9a84c]/80 hover:text-[#c9a84c] transition-colors">Women's Hair</Link>
                <div className="absolute top-full left-0 mt-3 hidden group-hover:grid grid-cols-2 gap-2 bg-[#1a237e] border border-[#c9a84c]/30 p-3 shadow-xl z-50 w-64">
                  {[womensHair1, womensHair2, womensHair3, womensHair4].map((src, i) => (
                    <Link key={i} to="/category/$slug" params={{ slug: "womens-hair" }}>
                      <img src={src} alt={`Women's hair style ${i + 1}`} className="w-full h-24 object-cover hover:opacity-80 transition-opacity" />
                    </Link>
                  ))}
                  <Link to="/category/$slug" params={{ slug: "womens-hair" }} className="col-span-2 text-center text-[#c9a84c] text-[9px] tracking-[0.3em] uppercase pt-1 hover:text-[#c9a84c]/70 transition-colors">
                    View All →
                  </Link>
                </div>
              </div>
              <Link to="/category/$slug" params={{ slug: "brows-lashes" }} className="text-[#c9a84c]/80 hover:text-[#c9a84c] transition-colors">Brows &amp; Lashes</Link>
              <Link to="/category/$slug" params={{ slug: "nails" }} className="text-[#c9a84c]/80 hover:text-[#c9a84c] transition-colors">Nails</Link>
            </nav>
          </div>
          {/* Logo */}
          <Link to="/" className="flex flex-col items-center leading-none group justify-self-center">
            <span className="font-serif text-2xl md:text-3xl tracking-[0.35em] uppercase text-[#c9a84c] group-hover:opacity-80 transition-opacity">
              WAWA
            </span>
            <span className="font-serif text-[9px] tracking-[0.4em] italic text-[#c9a84c]/70 group-hover:opacity-60 transition-opacity">
              La
            </span>
            <span className="font-serif text-[10px] tracking-[0.3em] italic text-[#f8f6f0]/80 group-hover:opacity-60 transition-opacity">
              Beauty
            </span>
          </Link>
          <nav className="flex items-center justify-self-end gap-5 text-[#f8f6f0]">
            <button
              aria-label="Book an appointment"
              title="Book an appointment"
              className="text-[#c9a84c]/80 hover:text-[#c9a84c] transition-colors"
              onClick={() => setBookingOpen(true)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </button>
          </nav>
        </div>
      </header>

      {/* HERO — Single banner with Ken Burns */}
      <section className="hero relative h-[100svh] w-full overflow-hidden">
        <img
          ref={heroImgRef}
          src={heroImage}
          alt="Wawa La Beauty campaign"
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        <div className="relative z-10 h-full flex flex-col items-center justify-end pb-10 md:pb-14 text-cream">
          <p className="hero-meta font-serif text-lg md:text-2xl tracking-wide mb-6">
            {heroTagline}
          </p>
          <div className="hero-meta flex gap-4">
            <Link
              to="/category/$slug"
              params={{ slug: heroPrimarySlug }}
              className="bg-white/10 backdrop-blur-md text-white border border-white/40 px-6 py-3 text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-white/25 hover:border-white/70 transition-all duration-300"
            >
              {heroPrimaryLabel}
            </Link>
            <Link
              to="/category/$slug"
              params={{ slug: heroSecondarySlug }}
              className="bg-white/10 backdrop-blur-md text-white border border-white/40 px-6 py-3 text-[11px] tracking-[0.25em] uppercase font-medium hover:bg-white/25 hover:border-white/70 transition-all duration-300"
            >
              {heroSecondaryLabel}
            </Link>
          </div>
        </div>
      </section>

      {/* MARQUEE OF BRANDS — Beauty houses */}
      <section className="relative overflow-hidden border-y border-black/10 bg-white/60 backdrop-blur-xl py-9 shadow-sm md:py-12">
        <p className="mb-7 text-center text-[10px] uppercase tracking-[0.5em] text-black/60 md:mb-9">
          The Beauty Brands
        </p>
        {/* soft edge fades for an editorial, framed feel */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-white to-transparent md:w-48" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-white to-transparent md:w-48" />
        <div className="marquee-track whitespace-nowrap font-serif text-xl md:text-3xl">
          {[...marqueeBrands, ...marqueeBrands].map((b, i) => (
            <Link
              key={i}
              to="/brand/$slug"
              params={{ slug: b.slug }}
              className="group mx-10 inline-flex items-center gap-10 md:mx-14 md:gap-14"
            >
              <span className="font-light tracking-[0.12em] text-black transition-all duration-500 ease-out group-hover:italic group-hover:tracking-[0.18em]">
                {b.label}
              </span>
              <span className="translate-y-[-0.1em] text-lg text-black transition-colors duration-500 md:text-xl">
                ✦
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* CATEGORY BANNER */}
      <section id="women" className="cat-banner relative w-full overflow-hidden">
        <img
          src={categoryImage}
          alt="Wawa La Beauty collection"
          className="w-full h-auto object-cover"
          onLoad={() => ScrollTrigger.refresh()}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-black/10 to-black/30 pointer-events-none" />
        {/* the button glides from the top of the banner to the bottom as you scroll past */}
        <div className="cat-banner-cta absolute inset-x-0 top-0 flex flex-col items-center px-6 text-center will-change-transform">
          <p className="font-serif text-xl md:text-3xl text-cream mb-6 drop-shadow-lg">
            {categoryHeading}
          </p>
          <Link
            to="/category/$slug"
            params={{ slug: categoryCtaSlug }}
            className="bg-white/15 text-white px-8 py-3 text-[11px] tracking-[0.25em] uppercase font-medium backdrop-blur-md border border-white/40 shadow-lg shadow-black/10 hover:bg-white/25 hover:border-white/60 transition-all duration-300"
          >
            {categoryCtaLabel}
          </Link>
        </div>
      </section>

      {/* HORIZONTAL PRODUCT SHOWCASE */}
      <section id="houses" className="horiz-section relative h-[100svh] overflow-hidden bg-white">
        <div className="absolute top-10 left-6 md:left-10 z-10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-ink/60">03 — Services</p>
          <h3 className="font-serif text-3xl md:text-5xl mt-2">Featured Beauty</h3>
        </div>
        <div className="horiz-track absolute top-0 left-0 h-full flex items-center gap-8 pl-[10vw] pr-[15vw] will-change-transform">
          {featureShowcase.map((item, i) => {
            const card = (
              <>
                <div className="relative h-[78%] overflow-hidden bg-cream">
                  <img
                    src={item.img}
                    alt={item.name}
                    width={1200}
                    height={1500}
                    loading="lazy"
                    className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                  />
                  <span className="absolute top-4 left-4 text-[10px] tracking-[0.25em] uppercase bg-cream/80 px-3 py-1">
                    {item.name}
                  </span>
                </div>
                <div className="flex items-baseline justify-between pt-5">
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase text-ink/60">Wawa La Beauty</p>
                    <h4 className="font-serif text-2xl md:text-3xl mt-1">{item.name}</h4>
                  </div>
                </div>
              </>
            );

            return item.slug ? (
              <Link
                key={i}
                to="/category/$slug"
                params={{ slug: item.slug }}
                className="product-card shrink-0 w-[70vw] md:w-[36vw] h-[70vh] group"
              >
                {card}
              </Link>
            ) : (
              <div
                key={i}
                className="product-card shrink-0 w-[70vw] md:w-[36vw] h-[70vh] group"
              >
                {card}
              </div>
            );
          })}
        </div>
      </section>

      {/* FULL-WIDTH BANNER */}
      <section className="w-full overflow-hidden">
        <img
          src={editorialImage}
          alt="Wawa La Beauty editorial"
          className="w-full h-auto object-cover"
          onLoad={() => ScrollTrigger.refresh()}
        />
      </section>

      {/* PRODUCT GRID */}
      <section className="px-6 md:px-10 py-24 md:py-36">
        <div className="flex items-end justify-between mb-16">
          <h3 className="reveal font-serif font-light text-4xl md:text-6xl max-w-2xl text-balance">
            New in at Wawa La Beauty.
          </h3>
          <p className="reveal hidden md:block text-[11px] tracking-[0.3em] uppercase text-muted-foreground">
            04 — New In
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
          {newArrivalCards.map((p, i) => (
            <Link
              key={i}
              to="/brand/$slug/product/$productSlug"
              params={{ slug: p.brandSlug, productSlug: p.productSlug }}
              className="product-card group"
            >
              <div className="relative aspect-[4/5] overflow-hidden bg-muted">
                <img
                  src={p.img}
                  alt={p.name}
                  width={1200}
                  height={1500}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-105"
                />
              </div>
              <div className="pt-4">
                <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground">{p.house}</p>
                <div className="flex items-baseline justify-between mt-1">
                  <h4 className="font-serif text-xl md:text-2xl">{p.name}</h4>
                  <span className="font-serif text-sm md:text-base">{p.price}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* BIG WORD SCRUB */}
      <section id="world" className="big-word-wrap relative overflow-hidden py-32 md:py-48 bg-ink text-cream">
        <h2 className="big-word font-serif font-light text-[22vw] md:text-[18vw] leading-[0.9] whitespace-nowrap pl-[10vw] text-gold">
          Wawa · Beauty · Glow · Radiance ·
        </h2>
        <div className="relative z-10 px-6 md:px-10 mt-16 grid md:grid-cols-2 gap-12">
          <p className="reveal font-serif text-3xl md:text-5xl leading-tight text-balance">
            One destination. Every beauty brand. Curated for those who live in their glow.
          </p>
          <div className="reveal flex flex-col gap-6 text-sm leading-relaxed opacity-80">
            <p>
              Everyday essentials for your daily routine. Premium skincare, makeup, and fragrance for the moments that matter. Luxury beauty for the ones that linger.
            </p>

          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-cream text-ink px-6 md:px-16 pt-20 pb-8">
        {/* Top CTA strip */}
        <div className="border-b border-ink/10 pb-16 mb-16 grid md:grid-cols-2 gap-10 items-end">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-ink/40 mb-4">Stay Connected</p>
            <p className="font-serif text-4xl md:text-5xl leading-[1] text-balance">
              Stay in your glow.
            </p>
          </div>
          <form className="flex items-center border-b border-ink/30 pb-3 max-w-sm md:ml-auto w-full">
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-ink/30"
            />
            <button className="text-[10px] tracking-[0.3em] uppercase text-ink/60 hover:text-ink transition-colors ml-4">
              Subscribe →
            </button>
          </form>
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 mb-16">

          {/* Brand + contact */}
          <div className="col-span-2 md:col-span-1 space-y-5">
            <div>
              <p className="font-serif text-xl tracking-wide">Wawa La Beauty</p>
              <p className="text-[11px] tracking-[0.25em] uppercase text-ink/40 mt-0.5">Beauty Salon · Springs</p>
            </div>
            <div className="space-y-2 text-sm text-ink/60 leading-relaxed">
              <p>1397 Lerutle St<br />Kwa-Thema, Springs, 1575</p>
              <a href="tel:0762165901" className="flex items-center gap-2 hover:text-ink transition-colors">
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.67A2 2 0 012 1h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 8.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z"/></svg>
                076 216 5901
              </a>
            </div>
            <a
              href="https://maps.google.com/?q=1397+Lerutle+St,+Kwa-Thema,+Springs,+1575"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-[10px] tracking-[0.25em] uppercase text-ink/50 hover:text-ink transition-colors border border-ink/20 hover:border-ink/50 rounded-full px-4 py-2"
            >
              <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
              Get Directions
            </a>
          </div>

          {/* Services links */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink/40 mb-5">Services</p>
            <ul className="space-y-3 text-sm text-ink/70">
              <li><Link to="/category/$slug" params={{ slug: "mens-hair" }} className="hover:text-ink transition-colors">Men's Hair</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "womens-hair" }} className="hover:text-ink transition-colors">Women's Hair</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "brows-lashes" }} className="hover:text-ink transition-colors">Brows & Lashes</Link></li>
              <li><Link to="/category/$slug" params={{ slug: "nails" }} className="hover:text-ink transition-colors">Nails</Link></li>
            </ul>
          </div>

          {/* Hours */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink/40 mb-5">Hours</p>
            <ul className="space-y-3 text-sm">
              <li className="flex justify-between gap-4">
                <span className="text-ink/40">Mon – Sat</span>
                <span className="text-ink/80">9 am – 6 pm</span>
              </li>
              <li className="flex justify-between gap-4">
                <span className="text-ink/40">Sunday</span>
                <span className="text-ink/80">9 am – 2 pm</span>
              </li>
            </ul>
            <div
              className={`mt-5 inline-flex items-center gap-1.5 text-[10px] ${
                isOpen ? "text-emerald-600" : "text-red-500"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isOpen ? "bg-emerald-500 animate-pulse" : "bg-red-500"
                }`}
              />
              {isOpen ? "Open now" : "Closed now"}
            </div>
          </div>

          {/* Reviews */}
          <div>
            <p className="text-[10px] tracking-[0.3em] uppercase text-ink/40 mb-5">Reputation</p>
            <div className="space-y-3">
              <div className="flex items-center gap-1 text-amber-500 text-base">
                {"★★★★★"}
              </div>
              <p className="text-ink/80 text-sm font-medium">4,729 Google reviews</p>
              <p className="text-ink/40 text-xs leading-relaxed">Rated one of the best beauty salons in Springs.</p>
              <a
                href="https://maps.google.com/?q=Wawa+La+Beauty+Springs"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block text-[10px] tracking-[0.2em] uppercase text-ink/40 hover:text-ink transition-colors underline underline-offset-4"
              >
                Read Reviews
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-ink/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] tracking-[0.2em] uppercase text-ink/30">
          <p>© 2026 Wawa La Beauty. All rights reserved.</p>
          <p>Springs · Kwa-Thema · South Africa</p>
        </div>
      </footer>

      <BookingDrawer open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </div>
  );
}
