import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { useCartStore, type CartItem } from "@/stores/cart-store";
import { getProductImage } from "@/lib/products";

export function CartDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const clearCart = useCartStore((s) => s.clearCart);
  const totalItems = useCartStore((s) => s.totalItems);

  // Parse price string like "€6,200" or "$1,200" into a number
  const parsePrice = (price: string): number => {
    return parseFloat(price.replace(/[^0-9.]/g, "").replace(",", "")) || 0;
  };

  const currency = items.length > 0 ? items[0].price.replace(/[0-9,. ]/g, "") : "€";
  const subtotal = items.reduce(
    (sum, item) => sum + parsePrice(item.price) * item.quantity,
    0,
  );

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-300 ${
        open ? "opacity-100" : "opacity-0 pointer-events-none"
      }`}
      aria-hidden={!open}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside
        className={`absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-ink/10">
          <h2 className="font-serif text-2xl">
            Your Bag{" "}
            <span className="text-sm text-muted-foreground font-sans">
              ({totalItems()})
            </span>
          </h2>
          <button
            onClick={onClose}
            aria-label="Close bag"
            className="w-9 h-9 rounded-full bg-ink text-cream flex items-center justify-center hover:bg-ink/90 transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-6 py-6">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="48"
                height="48"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="text-ink/20 mb-6"
              >
                <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 01-8 0" />
              </svg>
              <p className="font-serif text-xl mb-2">Your bag is empty</p>
              <p className="text-sm text-muted-foreground mb-6">
                Explore our collections and add something beautiful.
              </p>
              <button
                onClick={onClose}
                className="text-[11px] tracking-[0.3em] uppercase border-b border-ink pb-1 hover:border-gold hover:text-gold transition-colors"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <ul className="space-y-6">
              {items.map((item) => (
                <CartItemRow
                  key={`${item.productSlug}-${item.size ?? "default"}`}
                  item={item}
                  onRemove={() => removeItem(item.productSlug, item.size)}
                  onUpdateQuantity={(qty) =>
                    updateQuantity(item.productSlug, item.size, qty)
                  }
                />
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-ink/10 px-6 py-6 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Subtotal</span>
              <span className="font-serif text-xl">
                {currency}
                {subtotal.toLocaleString()}
              </span>
            </div>
            <p className="text-[10px] text-muted-foreground tracking-wide">
              Shipping and taxes calculated at checkout.
            </p>
            <button className="w-full bg-ink text-cream py-4 text-[11px] tracking-[0.3em] uppercase hover:bg-ink/90 transition-colors">
              Proceed to Checkout
            </button>
            <button
              onClick={clearCart}
              className="w-full text-[11px] tracking-[0.2em] uppercase text-muted-foreground hover:text-ink transition-colors py-2"
            >
              Clear Bag
            </button>
          </div>
        )}
      </aside>
    </div>
  );
}

function CartItemRow({
  item,
  onRemove,
  onUpdateQuantity,
}: {
  item: CartItem;
  onRemove: () => void;
  onUpdateQuantity: (qty: number) => void;
}) {
  const imageUrl = item.image
    ? item.image.startsWith("http")
      ? item.image
      : `${import.meta.env.VITE_API_URL || "http://localhost:4000"}${item.image}`
    : undefined;

  return (
    <li className="flex gap-4">
      {/* Thumbnail */}
      <Link
        to="/brand/$slug/product/$productSlug"
        params={{ slug: item.brandSlug, productSlug: item.productSlug }}
        className="shrink-0 w-20 h-24 bg-muted overflow-hidden"
      >
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[9px] text-muted-foreground uppercase tracking-wider">
            No image
          </div>
        )}
      </Link>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <Link
          to="/brand/$slug/product/$productSlug"
          params={{ slug: item.brandSlug, productSlug: item.productSlug }}
          className="block"
        >
          <h4 className="font-serif text-sm leading-tight truncate hover:italic transition-all">
            {item.name}
          </h4>
        </Link>
        {item.size && (
          <p className="text-[10px] text-muted-foreground mt-0.5">
            Size: {item.size}
          </p>
        )}
        <p className="font-serif text-sm mt-1">{item.price}</p>

        {/* Quantity controls */}
        <div className="flex items-center gap-3 mt-2">
          <button
            onClick={() => onUpdateQuantity(item.quantity - 1)}
            className="w-6 h-6 border border-ink/20 flex items-center justify-center text-xs hover:border-ink transition-colors"
            aria-label="Decrease quantity"
          >
            −
          </button>
          <span className="text-sm w-4 text-center">{item.quantity}</span>
          <button
            onClick={() => onUpdateQuantity(item.quantity + 1)}
            className="w-6 h-6 border border-ink/20 flex items-center justify-center text-xs hover:border-ink transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Remove */}
      <button
        onClick={onRemove}
        aria-label={`Remove ${item.name}`}
        className="self-start text-muted-foreground hover:text-ink transition-colors"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </li>
  );
}
