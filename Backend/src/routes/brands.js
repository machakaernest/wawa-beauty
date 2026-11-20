import { Router } from "express";
import { pool } from "../db.js";
import { slugify } from "../lib/format.js";
import { serializeBrand } from "../lib/serialize.js";

const router = Router();

// GET /api/brands
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM brands ORDER BY name ASC");
    res.json(rows.map(serializeBrand));
  } catch (err) {
    next(err);
  }
});

// POST /api/brands — lets the store add a new house from the dashboard
router.post("/", async (req, res, next) => {
  try {
    const { name, tagline = "", description = "", heroImage = "" } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
    const [result] = await pool.query(
      "INSERT INTO brands (name, slug, tagline, description, hero_image) VALUES (?, ?, ?, ?, ?)",
      [name.trim(), slug, tagline, description, heroImage],
    );
    const [rows] = await pool.query("SELECT * FROM brands WHERE id = ?", [result.insertId]);
    res.status(201).json(serializeBrand(rows[0]));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "A brand with this slug already exists" });
    }
    next(err);
  }
});

// PUT /api/brands/:id — edit a brand (renames propagate via brand_id join)
router.put("/:id", async (req, res, next) => {
  try {
    const [existingRows] = await pool.query("SELECT * FROM brands WHERE id = ?", [req.params.id]);
    if (!existingRows.length) return res.status(404).json({ error: "Brand not found" });
    const existing = existingRows[0];

    const name = req.body.name ?? existing.name;
    if (!String(name).trim()) return res.status(400).json({ error: "name is required" });
    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
    const tagline = req.body.tagline ?? existing.tagline ?? "";
    const description = req.body.description ?? existing.description ?? "";
    const heroImage = req.body.heroImage ?? existing.hero_image ?? "";

    await pool.query(
      "UPDATE brands SET name = ?, slug = ?, tagline = ?, description = ?, hero_image = ? WHERE id = ?",
      [name.trim(), slug, tagline, description, heroImage, req.params.id],
    );
    const [rows] = await pool.query("SELECT * FROM brands WHERE id = ?", [req.params.id]);
    res.json(serializeBrand(rows[0]));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "A brand with this slug already exists" });
    }
    next(err);
  }
});

// DELETE /api/brands/:id — also removes the brand's products (FK cascade)
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM brands WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Brand not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
