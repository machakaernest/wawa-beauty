import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { api } from "./api";
import type { Brand, Category, Product, ProductInput, BrandInput, CategoryInput } from "./types";
import { ProductForm } from "./components/ProductForm";
import { BrandForm } from "./components/BrandForm";
import { CategoryForm } from "./components/CategoryForm";
import { SectionManager } from "./components/SectionManager";
import { BannerSettings } from "./components/BannerSettings";
import { Toasts, type Toast } from "./components/Toasts";

type Tab = "catalogue" | "storefront" | "manage";

export default function App() {
  const [products, setProducts] = useState<Product[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [tab, setTab] = useState<Tab>("catalogue");
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [showBrandForm, setShowBrandForm] = useState(false);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [showBanners, setShowBanners] = useState(false);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");

  // --- Toasts -------------------------------------------------------------
  const [toasts, setToasts] = useState<Toast[]>([]);
  const toastId = useRef(0);
  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);
  const notify = useCallback(
    (type: Toast["type"], message: string) => {
      const id = ++toastId.current;
      setToasts((prev) => [...prev, { id, type, message }]);
      setTimeout(() => dismissToast(id), 3500);
    },
    [dismissToast],
  );

  // --- Data ---------------------------------------------------------------
  async function loadAll() {
    setLoading(true);
    setError(null);
    try {
      const [p, b, c] = await Promise.all([
        api.getProducts(),
        api.getBrands(),
        api.getCategories(),
      ]);
      setProducts(p);
      setBrands(b);
      setCategories(c);
    } catch (err) {
      setError(
        err instanceof Error
          ? `${err.message} — is the backend running on ${import.meta.env.VITE_API_URL || "http://localhost:4000"}?`
          : "Failed to load data.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.brand.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const featured = useMemo(() => products.filter((p) => p.featured), [products]);
  const newArrivals = useMemo(() => products.filter((p) => p.newArrival), [products]);

  // --- Actions ------------------------------------------------------------
  function openCreate() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(product: Product) {
    setEditing(product);
    setShowForm(true);
  }

  async function handleSubmit(input: ProductInput) {
    const isEdit = Boolean(editing);
    if (editing) {
      await api.updateProduct(editing.id, input);
    } else {
      await api.createProduct(input);
    }
    setShowForm(false);
    setEditing(null);
    await loadAll();
    notify("success", isEdit ? `Updated "${input.name}"` : `Added "${input.name}"`);
  }

  async function handleDelete(product: Product) {
    if (!confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await api.deleteProduct(product.id);
      await loadAll();
      notify("success", `Deleted "${product.name}"`);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed to delete.");
    }
  }

  async function handleCreateBrand(input: BrandInput) {
    await api.createBrand(input);
    setShowBrandForm(false);
    await loadAll();
    notify("success", `Added brand "${input.name}"`);
  }

  async function handleCreateCategory(input: CategoryInput) {
    await api.createCategory(input);
    setShowCategoryForm(false);
    await loadAll();
    notify("success", `Added category "${input.name}"`);
  }

  async function handleUpdateBrand(id: number, input: BrandInput) {
    await api.updateBrand(id, input);
    setEditingBrand(null);
    await loadAll();
    notify("success", `Updated brand "${input.name}"`);
  }

  async function handleDeleteBrand(brand: Brand) {
    const count = products.filter((p) => p.brandId === brand.id).length;
    const warning = count
      ? `Delete "${brand.name}"? This also deletes its ${count} product${count === 1 ? "" : "s"}. This cannot be undone.`
      : `Delete "${brand.name}"? This cannot be undone.`;
    if (!confirm(warning)) return;
    try {
      await api.deleteBrand(brand.id);
      await loadAll();
      notify("success", `Deleted brand "${brand.name}"`);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed to delete brand.");
    }
  }

  async function handleUpdateCategory(id: number, input: CategoryInput) {
    await api.updateCategory(id, input);
    setEditingCategory(null);
    await loadAll();
    notify("success", `Updated category "${input.name}"`);
  }

  async function handleDeleteCategory(category: Category) {
    const count = products.filter((p) => p.category === category.name).length;
    const warning = count
      ? `Delete category "${category.name}"? ${count} product${count === 1 ? "" : "s"} use it and will keep the label but lose the filter. Continue?`
      : `Delete category "${category.name}"? This cannot be undone.`;
    if (!confirm(warning)) return;
    try {
      await api.deleteCategory(category.id);
      await loadAll();
      notify("success", `Deleted category "${category.name}"`);
    } catch (err) {
      notify("error", err instanceof Error ? err.message : "Failed to delete category.");
    }
  }

  async function setFlag(id: number, flag: "featured" | "newArrival", value: boolean) {
    const product = products.find((p) => p.id === id);
    // Optimistic update so the panels feel instant.
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, [flag]: value } : p)));
    try {
      await api.setProductFlags(id, { [flag]: value });
      const label = flag === "featured" ? "Featured Pieces" : "New Arrivals";
      notify("success", `${value ? "Added to" : "Removed from"} ${label}: "${product?.name ?? "product"}"`);
    } catch (err) {
      await loadAll(); // revert to server truth on failure
      notify("error", err instanceof Error ? err.message : "Failed to update.");
    }
  }

  const stats = [
    { label: "Products", value: products.length },
    { label: "Brands", value: brands.length },
    { label: "Categories", value: categories.length },
    { label: "Featured", value: featured.length },
    { label: "New Arrivals", value: newArrivals.length },
  ];

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Maison Lumière</h1>
          <p className="subtitle">Store Dashboard</p>
        </div>
        <div className="header-actions">
          <button className="btn ghost" onClick={loadAll} disabled={loading} title="Reload data">
            ↻ Refresh
          </button>
          <button className="btn primary" onClick={openCreate} disabled={brands.length === 0}>
            + Add product
          </button>
        </div>
      </header>

      <nav className="tabs">
        <button
          className={`tab ${tab === "catalogue" ? "active" : ""}`}
          onClick={() => setTab("catalogue")}
        >
          Catalogue
        </button>
        <button
          className={`tab ${tab === "storefront" ? "active" : ""}`}
          onClick={() => setTab("storefront")}
        >
          Storefront
        </button>
        <button
          className={`tab ${tab === "manage" ? "active" : ""}`}
          onClick={() => setTab("manage")}
        >
          Brands &amp; Categories
        </button>
      </nav>

      <section className="stats">
        {stats.map((s) => (
          <div key={s.label} className="stat">
            <span className="stat-value">{s.value}</span>
            <span className="stat-label">{s.label}</span>
          </div>
        ))}
      </section>

      {error && (
        <div className="banner error">
          {error}
          <button className="btn ghost small" onClick={loadAll}>
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="loading-state">
          <span className="spinner" />
          <p className="muted">Loading your catalogue…</p>
        </div>
      ) : tab === "catalogue" ? (
        <>
          <section className="toolbar">
            <input
              className="search"
              placeholder="Search products or brands..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="">All categories</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="count">
              {filtered.length} of {products.length}
            </span>
            <button className="btn ghost" onClick={() => setShowBrandForm(true)}>
              + Brand
            </button>
            <button className="btn ghost" onClick={() => setShowCategoryForm(true)}>
              + Category
            </button>
          </section>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th></th>
                  <th>Name</th>
                  <th>Brand</th>
                  <th>Category</th>
                  <th>Price</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((p) => (
                  <tr key={p.id}>
                    <td className="thumb-cell">
                      {p.image ? (
                        <img className="thumb" src={p.image} alt={p.name} loading="lazy" />
                      ) : (
                        <div className="thumb placeholder" />
                      )}
                    </td>
                    <td className="name-cell">{p.name}</td>
                    <td>{p.brand}</td>
                    <td>{p.category}</td>
                    <td className="price">{p.price}</td>
                    <td>
                      <span className={`pill ${p.active ? "on" : "off"}`}>
                        {p.active ? "Live" : "Hidden"}
                      </span>
                      {p.featured && <span className="pill tag-featured">Featured</span>}
                      {p.newArrival && <span className="pill tag-new">New</span>}
                    </td>
                    <td className="row-actions">
                      <button className="btn ghost small" onClick={() => openEdit(p)}>
                        Edit
                      </button>
                      <button className="btn danger small" onClick={() => handleDelete(p)}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {filtered.length === 0 && (
                  <tr>
                    <td colSpan={7} className="muted center">
                      {products.length === 0
                        ? 'No products yet. Click "Add product" to create one.'
                        : "No products match your search."}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      ) : tab === "storefront" ? (
        <section className="sections-wrap">
          <div className="sections-head">
            <div>
              <h2 className="sections-title">Storefront sections</h2>
              <p className="muted">Curate what appears on the homepage.</p>
            </div>
            <button className="btn ghost" onClick={() => setShowBanners(true)}>
              Edit homepage banners
            </button>
          </div>
          <div className="sections-grid">
            <SectionManager
              title="Featured Pieces"
              subtitle="Shown in the homepage showcase"
              accent="featured"
              items={featured}
              candidates={products.filter((p) => !p.featured)}
              onAdd={(id) => setFlag(id, "featured", true)}
              onRemove={(id) => setFlag(id, "featured", false)}
            />
            <SectionManager
              title="New Arrivals"
              subtitle="Shown in the homepage arrivals grid"
              accent="new"
              items={newArrivals}
              candidates={products.filter((p) => !p.newArrival)}
              onAdd={(id) => setFlag(id, "newArrival", true)}
              onRemove={(id) => setFlag(id, "newArrival", false)}
            />
          </div>
        </section>
      ) : (
        <section className="sections-wrap">
          <div className="sections-head">
            <div>
              <h2 className="sections-title">Brands &amp; Categories</h2>
              <p className="muted">Manage the houses and categories used across the store.</p>
            </div>
          </div>
          <div className="sections-grid">
            <div className="section-card accent-featured">
              <div className="section-card-head">
                <div>
                  <h3>Brands</h3>
                  <p className="muted">Houses products belong to</p>
                </div>
                <button className="btn primary small" onClick={() => setShowBrandForm(true)}>
                  + Add
                </button>
              </div>
              {brands.length === 0 ? (
                <p className="muted center section-empty">No brands yet.</p>
              ) : (
                <ul className="section-list">
                  {brands.map((b) => (
                    <li key={b.id} className="section-item">
                      {b.heroImage ? (
                        <img className="section-thumb" src={b.heroImage} alt={b.name} loading="lazy" />
                      ) : (
                        <div className="section-thumb placeholder" />
                      )}
                      <div className="section-item-meta">
                        <span className="section-item-name">{b.name}</span>
                        <span className="muted">
                          {products.filter((p) => p.brandId === b.id).length} products
                        </span>
                      </div>
                      <button className="btn ghost small" onClick={() => setEditingBrand(b)}>
                        Edit
                      </button>
                      <button className="btn danger small" onClick={() => handleDeleteBrand(b)}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="section-card accent-new">
              <div className="section-card-head">
                <div>
                  <h3>Categories</h3>
                  <p className="muted">Used for filtering and category pages</p>
                </div>
                <button className="btn primary small" onClick={() => setShowCategoryForm(true)}>
                  + Add
                </button>
              </div>
              {categories.length === 0 ? (
                <p className="muted center section-empty">No categories yet.</p>
              ) : (
                <ul className="section-list">
                  {categories.map((c) => (
                    <li key={c.id} className="section-item">
                      {c.heroImage ? (
                        <img className="section-thumb" src={c.heroImage} alt={c.name} loading="lazy" />
                      ) : (
                        <div className="section-thumb placeholder" />
                      )}
                      <div className="section-item-meta">
                        <span className="section-item-name">{c.name}</span>
                        <span className="muted">
                          {products.filter((p) => p.category === c.name).length} products
                        </span>
                      </div>
                      <button className="btn ghost small" onClick={() => setEditingCategory(c)}>
                        Edit
                      </button>
                      <button className="btn danger small" onClick={() => handleDeleteCategory(c)}>
                        Delete
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      )}

      {showForm && (
        <ProductForm
          brands={brands}
          categories={categories}
          initial={editing}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}

      {showBrandForm && (
        <BrandForm onSubmit={handleCreateBrand} onCancel={() => setShowBrandForm(false)} />
      )}

      {editingBrand && (
        <BrandForm
          initial={editingBrand}
          onSubmit={(input) => handleUpdateBrand(editingBrand.id, input)}
          onCancel={() => setEditingBrand(null)}
        />
      )}

      {showCategoryForm && (
        <CategoryForm onSubmit={handleCreateCategory} onCancel={() => setShowCategoryForm(false)} />
      )}

      {editingCategory && (
        <CategoryForm
          initial={editingCategory}
          onSubmit={(input) => handleUpdateCategory(editingCategory.id, input)}
          onCancel={() => setEditingCategory(null)}
        />
      )}

      {showBanners && (
        <BannerSettings
          onClose={() => setShowBanners(false)}
          onSaved={() => {
            setShowBanners(false);
            notify("success", "Homepage banners saved");
          }}
        />
      )}

      <Toasts toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
