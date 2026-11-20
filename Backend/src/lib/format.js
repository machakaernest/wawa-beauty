// Shared helpers for slugs and price formatting.

export function slugify(str) {
  return String(str)
    .toLowerCase()
    .replace(/['’]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// Format a numeric amount + currency symbol into the display string the
// frontend expects, e.g. (6200, "€") -> "€6,200".
export function formatPrice(amount, currency = "€") {
  const n = Number(amount) || 0;
  const hasCents = !Number.isInteger(n);
  const formatted = n.toLocaleString("en-US", {
    minimumFractionDigits: hasCents ? 2 : 0,
    maximumFractionDigits: 2,
  });
  return `${currency}${formatted}`;
}

// Parse a display price string like "€6,200" or "$1,090.50" into
// { amount, currency }.
export function parsePrice(value) {
  if (typeof value === "number") return { amount: value, currency: "€" };
  const str = String(value).trim();
  const currencyMatch = str.match(/^[^\d.,\s-]+/);
  const currency = currencyMatch ? currencyMatch[0] : "€";
  const numeric = str.replace(/[^\d.]/g, "");
  const amount = numeric ? parseFloat(numeric) : 0;
  return { amount, currency };
}
