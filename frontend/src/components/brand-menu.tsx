import { create } from "zustand";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { Link, useNavigate } from "@tanstack/react-router";
import { getCategorySlug } from "@/lib/products";
import { useStorefront } from "@/hooks/use-storefront";

type MenuState = {
  open: boolean;
  setOpen: (v: boolean) => void;
  toggle: () => void;
};

export const useMenu = create<MenuState>((set) => ({
  open: false,
  setOpen: (v) => set({ open: v }),
  toggle: () => set((s) => ({ open: !s.open })),
}));

export function MenuTrigger() {
  const toggle = useMenu((s) => s.toggle);
  const open = useMenu((s) => s.open);
  return (
    <button
      onClick={toggle}
      aria-label="Open menu"
      className="flex items-center gap-3 text-[11px] tracking-[0.22em] uppercase"
    >
      <span className="relative h-3 w-5">
        <span
          className="absolute left-0 top-0 h-px w-5 bg-current transition-transform duration-300"
          style={{ transform: open ? "translateY(6px) rotate(45deg)" : "none" }}
        />
        <span
          className="absolute left-0 bottom-0 h-px w-5 bg-current transition-transform duration-300"
          style={{ transform: open ? "translateY(-6px) rotate(-45deg)" : "none" }}
        />
      </span>
      {open ? "Close" : "Menu"}
    </button>
  );
}

export function BrandMenu() {
  const open = useMenu((s) => s.open);
  const setOpen = useMenu((s) => s.setOpen);
  const { brands } = useStorefront();
  const panelRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  useEffect(() => {
    if (!panelRef.current || !overlayRef.current) return;
    if (open) {
      gsap.set(panelRef.current, { display: "grid" });
      gsap.set(overlayRef.current, { display: "block" });
      gsap.fromTo(
        overlayRef.current,
        { opacity: 0 },
        { opacity: 1, duration: 0.4, ease: "power2.out" },
      );
      gsap.fromTo(
        panelRef.current,
        { xPercent: -100 },
        { xPercent: 0, duration: 0.8, ease: "expo.out" },
      );
      gsap.from(panelRef.current.querySelectorAll(".menu-brand"), {
        y: 24,
        opacity: 0,
        duration: 0.7,
        stagger: 0.04,
        delay: 0.25,
        ease: "expo.out",
      });
    } else {
      gsap.to(panelRef.current, {
        xPercent: -100,
        duration: 0.6,
        ease: "expo.inOut",
        onComplete: () => {
          if (panelRef.current) panelRef.current.style.display = "none";
        },
      });
      gsap.to(overlayRef.current, {
        opacity: 0,
        duration: 0.4,
        onComplete: () => {
          if (overlayRef.current) overlayRef.current.style.display = "none";
        },
      });
    }
  }, [open]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [setOpen]);

  const handleNavigation = (to: string) => {
    setOpen(false);
    // Small delay to let the menu animate out before navigation
    setTimeout(() => {
      navigate({ to });
    }, 100);
  };

  const sidebarLinks = [
    { label: "Women", slug: "heels" },
    { label: "Men", slug: "sneakers" },
    { label: "Children", slug: "school-bags" },
    { label: "Gifts", slug: "bags" },
  ];

  return (
    <>
      <div
        ref={overlayRef}
        onClick={() => setOpen(false)}
        className="fixed inset-0 z-40 bg-ink/40 backdrop-blur-sm"
        style={{ display: "none" }}
      />
      <div
        ref={panelRef}
        className="fixed inset-y-0 left-0 z-50 w-full md:w-[90vw] lg:w-[78vw] bg-[#f8f6f0] text-[#1a237e] grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] overflow-hidden"
        style={{ display: "none" }}
      >
        {/* Sticky panel header with close */}
        <div className="absolute top-0 inset-x-0 z-10 flex items-center justify-between px-6 md:px-12 py-5 bg-[#f8f6f0]/95 backdrop-blur border-b border-[#c9a84c]/30">
          <Link
            to="/"
            onClick={() => setOpen(false)}
            className="flex flex-col leading-none group"
          >
            <span className="font-serif text-lg md:text-xl tracking-[0.3em] uppercase text-[#1a237e] group-hover:text-[#c9a84c] transition-colors">WAWA</span>
            <span className="font-serif text-[7px] tracking-[0.4em] italic text-[#c9a84c] mt-0.5">La</span>
            <span className="font-serif text-[8px] tracking-[0.35em] italic text-[#c9a84c] mt-0.5">Beauty</span>
          </Link>
          <button
            onClick={() => setOpen(false)}
            className="text-[11px] tracking-[0.3em] uppercase flex items-center gap-2 text-[#1a237e] hover:text-[#c9a84c] transition-colors"
            aria-label="Close menu"
          >
            <span className="relative h-3 w-4">
              <span className="absolute left-0 top-1/2 h-px w-4 bg-[#1a237e] rotate-45" />
              <span className="absolute left-0 top-1/2 h-px w-4 bg-[#1a237e] -rotate-45" />
            </span>
            Close
          </button>
        </div>

        {/* Left: brand list */}
        <div className="overflow-y-auto px-6 md:px-12 pt-24 pb-16 border-r border-ink/10">
          <p className="text-[11px] tracking-[0.3em] uppercase text-muted-foreground mb-8">
            Our Brands
          </p>
          <ul className="divide-y divide-ink/10">
            {brands.map((b) => (
              <li key={b.name} className="menu-brand py-5">
                <details className="group/details">
                  <summary className="flex items-baseline justify-between cursor-pointer list-none hover:[&_.brand-name]:italic">
                    <span className="flex items-baseline gap-4">
                      <span
                        className="brand-name font-serif text-3xl md:text-5xl transition-all cursor-pointer"
                        onClick={(e) => {
                          e.preventDefault();
                          handleNavigation(`/brand/${b.slug}`);
                        }}
                      >
                        {b.name}
                      </span>
                      <span className="hidden md:inline text-[10px] tracking-[0.3em] uppercase text-muted-foreground">
                        {b.tagline}
                      </span>
                    </span>
                    <span className="text-2xl text-gold transition-transform group-open/details:rotate-45 shrink-0 ml-4">
                      +
                    </span>
                  </summary>

                  <div className="mt-6 space-y-6 pb-2 animate-fade-in">
                    {b.groups.map((g) => (
                      <div key={g.label}>
                        <p className="text-[10px] tracking-[0.3em] uppercase text-muted-foreground mb-3">
                          {g.label}
                        </p>
                        <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                          {g.items.map((item) => (
                            <li key={item.name}>
                              <Link
                                to="/brand/$slug/product/$productSlug"
                                params={{ slug: b.slug, productSlug: item.slug }}
                                onClick={() => setOpen(false)}
                                className="flex items-baseline justify-between gap-4 py-2 border-b border-ink/5 text-sm text-ink/80 hover:text-ink hover:border-ink/30 transition-colors"
                              >
                                <span>{item.name}</span>
                                <span className="font-serif text-ink/60 hover:text-gold">
                                  {item.price}
                                </span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                    {/* View all link for the brand */}
                    <Link
                      to="/brand/$slug"
                      params={{ slug: b.slug }}
                      onClick={() => setOpen(false)}
                      className="inline-block text-[10px] tracking-[0.3em] uppercase border-b border-ink/30 pb-1 hover:border-gold hover:text-gold transition-colors mt-2"
                    >
                      View all {b.name} →
                    </Link>
                  </div>
                </details>
              </li>
            ))}
          </ul>
        </div>

        {/* Right: featured panel */}
        <aside className="hidden lg:flex flex-col justify-between bg-[#1a237e] text-[#f8f6f0] p-12 pt-24">
          <div>
            <p className="text-[11px] tracking-[0.3em] uppercase text-[#c9a84c] mb-6">Wawa La Beauty</p>
            <h3 className="font-serif text-5xl xl:text-6xl leading-[1.05] text-balance text-[#c9a84c]">
              Glow up.<br />Feel yourself.
            </h3>
            <p className="mt-8 max-w-sm text-sm text-[#f8f6f0]/70 leading-relaxed">
              Skincare, makeup, haircare and wellness — curated from the brands
              that know beauty inside and out.
            </p>
          </div>
          <div className="space-y-3">
            {sidebarLinks.map((l) => (
              <Link
                key={l.label}
                to="/category/$slug"
                params={{ slug: getCategorySlug(l.slug === "heels" ? "Heels" : l.slug === "sneakers" ? "Sneakers" : l.slug === "school-bags" ? "School Bags" : "Bags") }}
                onClick={() => setOpen(false)}
                className="block text-[11px] tracking-[0.3em] uppercase border-b border-[#c9a84c]/20 pb-3 text-[#f8f6f0]/70 hover:text-[#c9a84c] transition-colors"
              >
                {l.label} →
              </Link>
            ))}
            <Link
              to="/category/$slug"
              params={{ slug: "caps-hats" }}
              onClick={() => setOpen(false)}
              className="block text-[11px] tracking-[0.3em] uppercase border-b border-[#c9a84c]/20 pb-3 text-[#f8f6f0]/70 hover:text-[#c9a84c] transition-colors"
            >
              The Journal →
            </Link>
            <Link
              to="/"
              onClick={() => setOpen(false)}
              className="block text-[11px] tracking-[0.3em] uppercase border-b border-[#c9a84c]/20 pb-3 text-[#f8f6f0]/70 hover:text-[#c9a84c] transition-colors"
            >
              Client Services →
            </Link>
          </div>
        </aside>
      </div>
    </>
  );
}
