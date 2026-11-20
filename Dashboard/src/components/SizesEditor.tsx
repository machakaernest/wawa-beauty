import { useState } from "react";
import type { ProductSize } from "../types";

type Props = {
  value: ProductSize[];
  onChange: (sizes: ProductSize[]) => void;
};

// Italian shoe sizing (matches the storefront size-guide format), 35–45 in
// half steps.
function shoeSizes(): ProductSize[] {
  const out: ProductSize[] = [];
  for (let n = 35; n <= 45; n += 0.5) {
    out.push({ label: `${n} = ${n} IT`, inStock: true });
  }
  return out;
}

const CLOTHING = ["XS", "S", "M", "L", "XL", "XXL"];

const PRESETS: { label: string; build: () => ProductSize[] }[] = [
  { label: "Shoes (IT)", build: shoeSizes },
  { label: "Clothing", build: () => CLOTHING.map((s) => ({ label: s, inStock: true })) },
  { label: "One size", build: () => [{ label: "One Size", inStock: true }] },
];

export function SizesEditor({ value, onChange }: Props) {
  const [custom, setCustom] = useState("");

  function toggleStock(index: number) {
    onChange(value.map((s, i) => (i === index ? { ...s, inStock: !s.inStock } : s)));
  }

  function remove(index: number) {
    onChange(value.filter((_, i) => i !== index));
  }

  function addCustom() {
    const label = custom.trim();
    if (!label) return;
    if (value.some((s) => s.label.toLowerCase() === label.toLowerCase())) {
      setCustom("");
      return;
    }
    onChange([...value, { label, inStock: true }]);
    setCustom("");
  }

  return (
    <div className="sizes-editor">
      <div className="sizes-presets">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" className="btn ghost small" onClick={() => onChange(p.build())}>
            {p.label}
          </button>
        ))}
        {value.length > 0 && (
          <button type="button" className="btn ghost small" onClick={() => onChange([])}>
            Clear
          </button>
        )}
      </div>

      {value.length > 0 && (
        <>
          <p className="hint">Click a size to toggle stock. Out-of-stock sizes show greyed on the storefront.</p>
          <div className="size-chips">
            {value.map((s, i) => (
              <span key={`${s.label}-${i}`} className={`size-chip ${s.inStock ? "" : "out"}`}>
                <button
                  type="button"
                  className="size-chip-label"
                  onClick={() => toggleStock(i)}
                  title={s.inStock ? "In stock — click to mark out of stock" : "Out of stock — click to mark in stock"}
                >
                  {s.label}
                </button>
                <button type="button" className="size-chip-remove" onClick={() => remove(i)} aria-label="Remove size">
                  ×
                </button>
              </span>
            ))}
          </div>
        </>
      )}

      <div className="sizes-add">
        <input
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addCustom();
            }
          }}
          placeholder="Add a custom size (e.g. 42, M, One Size)"
        />
        <button type="button" className="btn ghost" onClick={addCustom} disabled={!custom.trim()}>
          + Add
        </button>
      </div>
    </div>
  );
}
