import { useState } from "react";
import type { Category, CategoryInput } from "../types";
import { api } from "../api";

type Props = {
  initial?: Category | null;
  onSubmit: (input: CategoryInput) => Promise<void>;
  onCancel: () => void;
};

const emptyForm: CategoryInput = {
  name: "",
  heroImage: "",
};

export function CategoryForm({ initial, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<CategoryInput>(
    initial ? { name: initial.name, heroImage: initial.heroImage ?? "" } : emptyForm,
  );
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function update<K extends keyof CategoryInput>(key: K, value: CategoryInput[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) return setError("Category name is required.");

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
        <h2>{initial ? "Edit category" : "Add category"}</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Category name
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="e.g. School Bags"
              autoFocus
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
              <img src={form.heroImage} alt="Category hero preview" />
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

          {error && <p className="error">{error}</p>}

          <div className="actions">
            <button type="button" className="btn ghost" onClick={onCancel} disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn primary" disabled={saving || uploading}>
              {saving ? "Saving..." : initial ? "Save changes" : "Add category"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
