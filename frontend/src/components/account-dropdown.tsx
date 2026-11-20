import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { Link } from "@tanstack/react-router";
import { useAuthStore } from "@/stores/auth-store";

export function AccountDropdown() {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Position the dropdown below the button
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (!open || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setPos({
      top: rect.bottom + 8,
      right: window.innerWidth - rect.right,
    });
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (
        buttonRef.current?.contains(e.target as Node) ||
        panelRef.current?.contains(e.target as Node)
      ) {
        return;
      }
      setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Close on escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open]);

  const menuLinkClass =
    "block px-6 py-3.5 text-[13px] tracking-[0.15em] uppercase font-medium hover:bg-ink/5 transition-colors";

  return (
    <>
      {/* Profile icon button (stays inside header) */}
      <button
        ref={buttonRef}
        onClick={() => setOpen((v) => !v)}
        className="flex items-center justify-center w-8 h-8 transition-opacity hover:opacity-70"
        aria-label="Account menu"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
          <circle cx="12" cy="7" r="4" />
        </svg>
      </button>

      {/* Dropdown portaled to body so it escapes mix-blend-difference */}
      {open &&
        createPortal(
          <div
            ref={panelRef}
            className="fixed w-72 bg-white rounded-2xl shadow-2xl py-5 z-[9999] text-ink"
            style={{ top: pos.top, right: pos.right }}
            role="menu"
          >
            {user ? (
              <>
                <div className="px-6 pb-3 mb-2 border-b border-ink/10">
                  <p className="text-sm font-medium">{user.name}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <Link to="/" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  MY ORDERS
                </Link>
                <Link to="/" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  ACCOUNT SETTINGS
                </Link>
                <Link to="/" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  ADDRESS BOOK
                </Link>
                <Link to="/" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  WALLET
                </Link>
                <Link to="/" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  SAVED ITEMS
                </Link>
                <Link to="/" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  MY APPOINTMENTS
                </Link>
                <div className="border-t border-ink/10 mt-2 pt-2">
                  <button
                    onClick={() => { logout(); setOpen(false); }}
                    className="block w-full text-left px-6 py-3.5 text-[13px] tracking-[0.15em] uppercase font-medium text-red-600 hover:bg-red-50 transition-colors"
                    role="menuitem"
                  >
                    SIGN OUT
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link to="/account/login" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  SIGN IN
                </Link>
                <Link to="/account/login" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  MY ORDERS
                </Link>
                <Link to="/account/login" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  ACCOUNT SETTINGS
                </Link>
                <Link to="/account/login" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  ADDRESS BOOK
                </Link>
                <Link to="/account/login" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  WALLET
                </Link>
                <Link to="/account/login" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  SAVED ITEMS
                </Link>
                <Link to="/account/login" onClick={() => setOpen(false)} className={menuLinkClass} role="menuitem">
                  MY APPOINTMENTS
                </Link>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
