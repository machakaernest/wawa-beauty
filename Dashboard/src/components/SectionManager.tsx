import { useState } from "react";
import type { Product } from "../types";

type Props = {
  title: string;
  subtitle: string;
  accent: "featured" | "new";
  items: Product[];
  candidates: Product[];
  onAdd: (id: number) => Promise<void>;
  onRemove: (id: number) => Promise<void>;
};

export function SectionManager({ title, subtitle, accent, items, candidates, onAdd, onRemove }: Props) {
  const [selected, setSelected] = useState<number>(0);
  const [busyId, setBusyId] = useState<number | null>(null);

  async function handleAdd() {
    if (!selected) return;
    setBusyId(selected);
    try {
      await onAdd(selected);
      setSelected(0);
    } finally {
      setBusyId(null);
    }
  }

  async function handleRemove(id: number) {
    setBusyId(id);
    try {
      await onRemove(id);
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className={`section-card accent-${accent}`}>
      <div className="section-card-head">
        <div>
          <h3>{title}</h3>
          <p className="muted">{subtitle}</p>
        </div>
        <span className="count">{items.length} selected</span>
      </div>

      <div className="section-add">
        <select value={selected} onChange={(e) => setSelected(Number(e.target.value))}>
          <option value={0}>
            {candidates.length ? "Add a product…" : "All products already added"}
          </option>
          {candidates.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name} — {p.brand}
            </option>
          ))}
        </select>
        <button
          className="btn primary"
          onClick={handleAdd}
          disabled={!selected || busyId !== null}
        >
          + Add
        </button>
      </div>

      {items.length === 0 ? (
        <p className="muted center section-empty">
          Nothing here yet. Add a product above to feature it on the storefront.
        </p>
      ) : (
        <ul className="section-list">
          {items.map((p) => (
            <li key={p.id} className="section-item">
              {p.image ? (
                <img className="section-thumb" src={p.image} alt={p.name} loading="lazy" />
              ) : (
                <div className="section-thumb placeholder" />
              )}
              <div className="section-item-meta">
                <span className="section-item-name">{p.name}</span>
                <span className="muted">
                  {p.brand} · {p.price}
                </span>
              </div>
              <button
                className="btn danger small"
                onClick={() => handleRemove(p.id)}
                disabled={busyId !== null}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
