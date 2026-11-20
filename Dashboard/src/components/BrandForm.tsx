import { useState } from "react";
import type { Brand, BrandInput } from "../types";
import { api } from "../api";

type Props = {
  initial?: Brand | null;
  onSubmit: (input: BrandInput) => Promise<void>;
  onCancel: () => void;
};

const emptyForm: BrandInput = {
  name: "",
  tagline: "",
  description: "",
  heroImage: "",
};

export function BrandForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<BrandInput>(
    initial
      ? {
          name: initial.name,
          tagline: initial.tagline ?? "",
          description: initial.description ?? "",
          heroImage: initial.heroImage ?? "",
        }
      : emptyForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof BrandInput>(key: K, value: BrandInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Brand name is required.");

    setSaving(true);
    try {
      await onSubmit({ ...form, name: form.name.trim() });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? "Edit brand" : "Add brand"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Brand name
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. Balenciaga"
              autoFocus
            />
          </label>

          <label>
            Tagline
            <input
              value={form.tagline}
              onChange={(e) => update("tagline", e.target.value)}
              placeholder="Short brand tagline"
            />
          </label>

          <label>
            Hero image
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
                  update("heroImage", url);
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Image upload failed.");
                } finally {
                  setUploading(false);
                  e.target.value = "";
                }
              }}
            />
          </label>

          {uploading && <p className="hint">Uploading image…</p>}

          {form.heroImage && (
            <div className="image-preview">
              <img src={form.heroImage} alt="Brand hero preview" />
              <button type="button" className="btn ghost" onClick={() => update("heroImage", "")}>
                Remove image
              </button>
            </div>
          )}

          <label>
            Hero image URL
            <input
              value={form.heroImage}
              onChange={(e) => update("heroImage", e.target.value)}
              placeholder="https://... or upload a file above"
            />
          </label>

          <label>
            Description
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={3}
              placeholder="Short brand description"
            />
          </label>

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving || uploading}>
              {saving ? "Saving..." : initial ? "Save changes" : "Add brand"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
