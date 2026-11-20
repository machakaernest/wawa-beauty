import { useState } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { BookingDrawer } from "./booking-drawer";

export function SiteHeader() {
  const [bookingOpen, setBookingOpen] = useState(false);

  const routerState = useRouterState();
  const currentPath = routerState.location.pathname;

  const leftNavLinks = [
    { label: "Men's Hair",   slug: "mens-hair" },
    { label: "Women's Hair", slug: "womens-hair" },
  ];

  const rightNavLinks = [
    { label: "Brows & Lashes", slug: "brows-lashes" },
    { label: "Nails",          slug: "nails" },
  ];

  const CalendarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );

  return (
    <>
      <header className="fixed top-0 inset-x-0 z-40 bg-[#1a237e] border-b border-[#c9a84c]/30 shadow-md">
        <div className="grid grid-cols-3 items-center px-6 md:px-10 py-3 text-[#f8f6f0]">
          {/* Left — nav */}
          <div className="flex items-center gap-8">
            <nav className="hidden md:flex gap-8 text-[11px] tracking-[0.2em] uppercase">
              {leftNavLinks.map(({ label, slug }) => {
                const isActive = currentPath === `/category/${slug}`;
                return (
                  <Link
                    key={slug}
                    to="/category/$slug"
                    params={{ slug }}
                    className={`relative transition-colors pb-0.5 ${
                      isActive
                        ? "text-[#c9a84c] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[#c9a84c]"
                        : "text-[#c9a84c]/60 hover:text-[#c9a84c]"
                    }`}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Center — Wordmark */}
          <Link to="/" className="flex flex-col items-center leading-none group justify-self-center">
            <span className="font-serif text-xl md:text-2xl tracking-[0.35em] uppercase text-[#c9a84c] group-hover:opacity-80 transition-opacity">
              WAWA
            </span>
            <span className="font-serif text-[9px] md:text-[10px] tracking-[0.4em] italic text-[#c9a84c]/70 group-hover:opacity-60 transition-opacity">
              La
            </span>
            <span className="font-serif text-[10px] md:text-[11px] tracking-[0.3em] italic text-[#f8f6f0]/80 group-hover:opacity-60 transition-opacity">
              Beauty
            </span>
          </Link>

          <nav className="hidden md:flex items-center justify-self-end gap-6 text-[11px] tracking-[0.2em] uppercase">
            {rightNavLinks.map(({ label, slug }) => {
              const isActive = currentPath === `/category/${slug}`;
              return (
                <Link
                  key={slug}
                  to="/category/$slug"
                  params={{ slug }}
                  className={`relative transition-colors pb-0.5 ${
                    isActive
                      ? "text-[#c9a84c] after:absolute after:bottom-0 after:left-0 after:w-full after:h-px after:bg-[#c9a84c]"
                      : "text-[#c9a84c]/60 hover:text-[#c9a84c]"
                  }`}
                >
                  {label}
                </Link>
              );
            })}
            <button
              onClick={() => setBookingOpen(true)}
              className="text-[#c9a84c]/80 hover:text-[#c9a84c] transition-colors"
              aria-label="Book an appointment"
              title="Book an appointment"
            >
              <CalendarIcon />
            </button>
          </nav>

          {/* Mobile: calendar icon only */}
          <button
            className="md:hidden relative text-[#c9a84c] justify-self-end"
            onClick={() => setBookingOpen(true)}
            aria-label="Book an appointment"
          >
            <CalendarIcon />
          </button>
        </div>
      </header>
      <BookingDrawer open={bookingOpen} onClose={() => setBookingOpen(false)} />
    </>
  );
}
