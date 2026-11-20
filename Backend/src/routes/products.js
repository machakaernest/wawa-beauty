import { Router } from "express";
import { pool } from "../db.js";
import { slugify, parsePrice } from "../lib/format.js";
import { serializeProduct, normalizeSizes } from "../lib/serialize.js";

const router = Router();

const PRODUCT_SELECT = `
  SELECT p.*, b.name AS brand_name, b.slug AS brand_slug
  FROM products p
  JOIN brands b ON b.id = p.brand_id
`;

async function fetchProductById(id) {
  const [rows] = await pool.query(`${PRODUCT_SELECT} WHERE p.id = ?`, [id]);
  return rows[0] ? serializeProduct(rows[0]) : null;
}

// GET /api/products — flat list, optional ?category= / ?brandId= / ?search=
router.get("/", async (req, res, next) => {
  try {
    const clauses = [];
    const params = [];
    if (req.query.category) {
      clauses.push("p.category = ?");
      params.push(req.query.category);
    }
    if (req.query.brandId) {
      clauses.push("p.brand_id = ?");
      params.push(Number(req.query.brandId));
    }
    if (req.query.search) {
      clauses.push("p.name LIKE ?");
      params.push(`%${req.query.search}%`);
    }
    const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
    const [rows] = await pool.query(
      `${PRODUCT_SELECT} ${where} ORDER BY p.created_at DESC, p.id DESC`,
      params,
    );
    res.json(rows.map(serializeProduct));
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id
router.get("/:id", async (req, res, next) => {
  try {
    const product = await fetchProductById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  } catch (err) {
    next(err);
  }
});

function validateProductBody(body) {
  const errors = [];
  if (!body.name || !String(body.name).trim()) errors.push("name is required");
  if (!body.brandId) errors.push("brandId is required");
  if (!body.category || !String(body.category).trim()) errors.push("category is required");
  const amount = Number(body.priceAmount);
  if (Number.isNaN(amount) || amount < 0) errors.push("priceAmount must be a non-negative number");
  return errors;
}

// POST /api/products
router.post("/", async (req, res, next) => {
  try {
    const errors = validateProductBody(req.body);
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });

    const {
      name,
      brandId,
      category,
      groupLabel = "Collection",
      priceAmount,
      currency = "€",
      description = "",
      image = "",
      active = true,
      featured = false,
      newArrival = false,
      sizes = [],
    } = req.body;

    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);

    const [brandRows] = await pool.query("SELECT id FROM brands WHERE id = ?", [brandId]);
    if (!brandRows.length) return res.status(400).json({ error: "brandId does not exist" });

    const [result] = await pool.query(
      `INSERT INTO products
        (name, slug, brand_id, category, group_label, price, currency, description, image, active, featured, new_arrival, sizes)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name.trim(), slug, brandId, category, groupLabel, Number(priceAmount), currency, description, image, active ? 1 : 0, featured ? 1 : 0, newArrival ? 1 : 0, JSON.stringify(normalizeSizes(sizes))],
    );
    res.status(201).json(await fetchProductById(result.insertId));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "A product with this slug already exists for this brand" });
    }
    next(err);
  }
});

// PUT /api/products/:id
router.put("/:id", async (req, res, next) => {
  try {
    const existing = await fetchProductById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Product not found" });

    const errors = validateProductBody({ ...existing, ...req.body });
    if (errors.length) return res.status(400).json({ error: errors.join(", ") });

    const name = req.body.name ?? existing.name;
    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
    const brandId = req.body.brandId ?? existing.brandId;
    const category = req.body.category ?? existing.category;
    const groupLabel = req.body.groupLabel ?? existing.groupLabel;
    const priceAmount = req.body.priceAmount ?? existing.priceAmount;
    const currency = req.body.currency ?? existing.currency;
    const description = req.body.description ?? existing.description;
    const image = req.body.image ?? existing.image;
    const active = req.body.active ?? existing.active;
    const featured = req.body.featured ?? existing.featured;
    const newArrival = req.body.newArrival ?? existing.newArrival;
    const sizes = req.body.sizes ?? existing.sizes;

    await pool.query(
      `UPDATE products SET
        name = ?, slug = ?, brand_id = ?, category = ?, group_label = ?,
        price = ?, currency = ?, description = ?, image = ?, active = ?,
        featured = ?, new_arrival = ?, sizes = ?
       WHERE id = ?`,
      [name.trim(), slug, brandId, category, groupLabel, Number(priceAmount), currency, description, image, active ? 1 : 0, featured ? 1 : 0, newArrival ? 1 : 0, JSON.stringify(normalizeSizes(sizes)), req.params.id],
    );
    res.json(await fetchProductById(req.params.id));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "A product with this slug already exists for this brand" });
    }
    next(err);
  }
});

// DELETE /api/products/:id
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM products WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Product not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
