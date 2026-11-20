import { useEffect, useState } from "react";
import type { SiteSettings } from "../types";
import { api } from "../api";

type Props = {
  onClose: () => void;
  onSaved: (settings: SiteSettings) => void;
};

// Default overlay text shown as placeholders so the editor mirrors the live
// homepage defaults (these match the frontend's bundled fallbacks).
const DEFAULTS: Record<string, string> = {
  hero_tagline: "Curated Luxury, Every Season",
  hero_cta_primary_label: "For Her",
  hero_cta_primary_slug: "heels",
  hero_cta_secondary_label: "For Him",
  hero_cta_secondary_slug: "sneakers",
  category_heading: "Explore the Collection",
  category_cta_label: "See All",
  category_cta_slug: "bags",
};

function ImageField({
  label,
  value,
  onChange,
  onError,
}: {
  label: string;
  value: string;
  onChange: (url: string) => void;
  onError: (msg: string | null) => void;
}) {
  const [uploading, setUploading] = useState(false);

  return (
    <div className="banner-image-field">
      <label>
        {label}
        <input
          type="file"
          accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
          disabled={uploading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            onError(null);
            setUploading(true);
            try {
              const { url } = await api.uploadImage(file);
              onChange(url);
            } catch (err) {
              onError(err instanceof Error ? err.message : "Image upload failed.");
            } finally {
              setUploading(false);
              e.target.value = "";
            }
          }}
        />
      </label>
      {uploading && <p className="hint">Uploading image…</p>}
      <label>
        Image URL
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or upload above (blank = bundled default)"
        />
      </label>
      {value ? (
        <div className="banner-preview">
          <img src={value} alt={`${label} preview`} />
          <button type="button" className="btn ghost small" onClick={() => onChange("")}>
            Use default
          </button>
        </div>
      ) : (
        <p className="hint">Using the bundled default image.</p>
      )}
    </div>
  );
}

export function BannerSettings({ onClose, onSaved }: Props) {
  const [form, setForm] = useState<SiteSettings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api
      .getSettings()
      .then(setForm)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load settings."))
      .finally(() => setLoading(false));
  }, []);

  function set<K extends keyof SiteSettings>(key: K, value: string) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const saved = await api.updateSettings(form);
      onSaved(saved);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal modal-wide" onClick={(e) => e.stopPropagation()}>
        <h2>Homepage banners</h2>

        {loading ? (
          <p className="muted">Loading…</p>
        ) : (
          <div className="banner-groups">
            {/* HERO */}
            <fieldset className="banner-group">
              <legend>Hero banner</legend>
              <ImageField
                label="Background image"
                value={form.hero_image ?? ""}
                onChange={(v) => set("hero_image", v)}
                onError={setError}
              />
              <label>
                Tagline
                <input
                  value={form.hero_tagline ?? ""}
                  onChange={(e) => set("hero_tagline", e.target.value)}
                  placeholder={DEFAULTS.hero_tagline}
                />
              </label>
              <div className="modal-row">
                <label>
                  Left button label
                  <input
                    value={form.hero_cta_primary_label ?? ""}
                    onChange={(e) => set("hero_cta_primary_label", e.target.value)}
                    placeholder={DEFAULTS.hero_cta_primary_label}
                  />
                </label>
                <label>
                  Left button → category slug
                  <input
                    value={form.hero_cta_primary_slug ?? ""}
                    onChange={(e) => set("hero_cta_primary_slug", e.target.value)}
                    placeholder={DEFAULTS.hero_cta_primary_slug}
                  />
                </label>
              </div>
              <div className="modal-row">
                <label>
                  Right button label
                  <input
                    value={form.hero_cta_secondary_label ?? ""}
                    onChange={(e) => set("hero_cta_secondary_label", e.target.value)}
                    placeholder={DEFAULTS.hero_cta_secondary_label}
                  />
                </label>
                <label>
                  Right button → category slug
                  <input
                    value={form.hero_cta_secondary_slug ?? ""}
                    onChange={(e) => set("hero_cta_secondary_slug", e.target.value)}
                    placeholder={DEFAULTS.hero_cta_secondary_slug}
                  />
                </label>
              </div>
            </fieldset>

            {/* CATEGORY BANNER */}
            <fieldset className="banner-group">
              <legend>Category banner</legend>
              <ImageField
                label="Background image"
                value={form.category_image ?? ""}
                onChange={(v) => set("category_image", v)}
                onError={setError}
              />
              <label>
                Heading
                <input
                  value={form.category_heading ?? ""}
                  onChange={(e) => set("category_heading", e.target.value)}
                  placeholder={DEFAULTS.category_heading}
                />
              </label>
              <div className="modal-row">
                <label>
                  Button label
                  <input
                    value={form.category_cta_label ?? ""}
                    onChange={(e) => set("category_cta_label", e.target.value)}
                    placeholder={DEFAULTS.category_cta_label}
                  />
                </label>
                <label>
                  Button → category slug
                  <input
                    value={form.category_cta_slug ?? ""}
                    onChange={(e) => set("category_cta_slug", e.target.value)}
                    placeholder={DEFAULTS.category_cta_slug}
                  />
                </label>
              </div>
            </fieldset>

            {/* EDITORIAL BANNER */}
            <fieldset className="banner-group">
              <legend>Editorial banner (full width)</legend>
              <ImageField
                label="Image"
                value={form.editorial_image ?? ""}
                onChange={(v) => set("editorial_image", v)}
                onError={setError}
              />
            </fieldset>
          </div>
        )}

        {error && <p className="error">{error}</p>}

        <div className="actions">
          <button type="button" className="btn ghost" onClick={onClose} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="btn primary" onClick={handleSave} disabled={saving || loading}>
            {saving ? "Saving…" : "Save banners"}
          </button>
        </div>
      </div>
    </div>
  );
}
