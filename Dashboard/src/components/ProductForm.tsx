import { useEffect, useState } from "react";
import type { Brand, Category, Product, ProductInput } from "../types";
import { api } from "../api";
import { SizesEditor } from "./SizesEditor";

type Props = {
  brands: Brand[];
  categories: Category[];
  initial?: Product | null;
  onSubmit: (input: ProductInput) => Promise<void>;
  onCancel: () => void;
};

const emptyForm: ProductInput = {
  name: "",
  brandId: 0,
  category: "",
  groupLabel: "Collection",
  priceAmount: 0,
  currency: "€",
  description: "",
  image: "",
  active: true,
  featured: false,
  newArrival: false,
  sizes: [],
};

export function ProductForm({ brands, categories, initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ProductInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        brandId: initial.brandId,
        category: initial.category,
        groupLabel: initial.groupLabel || "Collection",
        priceAmount: initial.priceAmount,
        currency: initial.currency || "€",
        description: initial.description || "",
        image: initial.image || "",
        active: initial.active,
        featured: initial.featured,
        newArrival: initial.newArrival,
        sizes: initial.sizes ?? [],
      });
    } else {
      setForm({
        ...emptyForm,
        brandId: brands[0]?.id ?? 0,
        category: categories[0]?.name ?? "",
      });
    }
  }, [initial, brands, categories]);

  function update<K extends keyof ProductInput>(key: K, value: ProductInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!form.name.trim()) return setError("Name is required.");
    if (!form.brandId) return setError("Please choose a brand.");
    if (!form.category) return setError("Please choose a category.");
    if (Number.isNaN(form.priceAmount) || form.priceAmount < 0)
      return setError("Price must be a non-negative number.");

    setSaving(true);
    try {
      await onSubmit({ ...form, priceAmount: Number(form.priceAmount) });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? "Edit product" : "Add product"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Product name
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Capucines MM"
              autoFocus
            />
          </label>

          <div className="row">
            <label>
              Brand
              <select
                value={form.brandId}
                onChange={(e) => update("brandId", Number(e.target.value))}
              >
                <option value={0} disabled>
                  Select a brand
                </option>
                {brands.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              Category
              <select
                value={form.category}
                onChange={(e) => update("category", e.target.value)}
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="row">
            <label>
              Price
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.priceAmount}
                onChange={(e) => update("priceAmount", e.target.valueAsNumber || 0)}
              />
            </label>
            <label className="currency-field">
              Currency
              <input
                value={form.currency}
                onChange={(e) => update("currency", e.target.value)}
                maxLength={4}
              />
            </label>
            <label>
              Group label
              <input
                value={form.groupLabel}
                onChange={(e) => update("groupLabel", e.target.value)}
                placeholder="e.g. Bags"
              />
            </label>
          </div>

          <label>
            Product image
            <input
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setError(null);
                setUploading(true);
                try {
                  const { url } = await api.uploadImage(file);
                  update("image", url);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Image upload failed.");
                } finally {
                  setUploading(false);
                  e.target.value = ""; // allow re-selecting the same file
                }
              }}
            />
          </label>

          {uploading && <p className="hint">Uploading image…</p>}

          {form.image && (
            <div className="image-preview">
              <img src={form.image} alt="Product preview" />
              <button type="button" className="btn ghost" onClick={() => update("image", "")}>
                Remove image
              </button>
            </div>
          )}

          <label>
            Image URL
            <input
              value={form.image}
              onChange={(e) => update("image", e.target.value)}
              placeholder="https://... or upload a file above"
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              placeholder="Short product description shown on the storefront"
            />
          </label>

          <div className="sizes-field">
            <span className="sizes-field-label">Sizes</span>
            <SizesEditor value={form.sizes} onChange={(sizes) => update("sizes", sizes)} />
          </div>

          <label className="checkbox">
            <input
              type="checkbox"
              checked={form.active}
              onChange={(e) => update("active", e.target.checked)}
            />
            Visible on storefront
          </label>

          <div className="row toggles">
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.featured}
                onChange={(e) => update("featured", e.target.checked)}
              />
              Featured Piece
            </label>
            <label className="checkbox">
              <input
                type="checkbox"
                checked={form.newArrival}
                onChange={(e) => update("newArrival", e.target.checked)}
              />
              New Arrival
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving || uploading}>
              {saving ? "Saving..." : initial ? "Save changes" : "Add product"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
