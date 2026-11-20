import { Router } from "express";
import { pool } from "../db.js";
import { slugify } from "../lib/format.js";
import { serializeCategory } from "../lib/serialize.js";

const router = Router();

// GET /api/categories
router.get("/", async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    res.json(rows.map(serializeCategory));
  } catch (err) {
    next(err);
  }
});

// POST /api/categories — add a new category from the dashboard
router.post("/", async (req, res, next) => {
  try {
    const { name, heroImage = "" } = req.body;
    if (!name || !String(name).trim()) {
      return res.status(400).json({ error: "name is required" });
    }
    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
    const [result] = await pool.query(
      "INSERT INTO categories (name, slug, hero_image) VALUES (?, ?, ?)",
      [name.trim(), slug, heroImage],
    );
    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [result.insertId]);
    res.status(201).json(serializeCategory(rows[0]));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "A category with this name or slug already exists" });
    }
    next(err);
  }
});

// PUT /api/categories/:id — rename also updates products using the old name
router.put("/:id", async (req, res, next) => {
  try {
    const [existingRows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    if (!existingRows.length) return res.status(404).json({ error: "Category not found" });
    const existing = existingRows[0];

    const name = req.body.name ?? existing.name;
    if (!String(name).trim()) return res.status(400).json({ error: "name is required" });
    const slug = req.body.slug ? slugify(req.body.slug) : slugify(name);
    const heroImage = req.body.heroImage ?? existing.hero_image ?? "";

    await pool.query(
      "UPDATE categories SET name = ?, slug = ?, hero_image = ? WHERE id = ?",
      [name.trim(), slug, heroImage, req.params.id],
    );

    // Products store the category as a string, so keep them in sync on rename.
    if (name.trim() !== existing.name) {
      await pool.query("UPDATE products SET category = ? WHERE category = ?", [name.trim(), existing.name]);
    }

    const [rows] = await pool.query("SELECT * FROM categories WHERE id = ?", [req.params.id]);
    res.json(serializeCategory(rows[0]));
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "A category with this name or slug already exists" });
    }
    next(err);
  }
});

// DELETE /api/categories/:id — products keep their category string
router.delete("/:id", async (req, res, next) => {
  try {
    const [result] = await pool.query("DELETE FROM categories WHERE id = ?", [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: "Category not found" });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
