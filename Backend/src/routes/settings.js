import { Router } from "express";
import { pool } from "../db.js";

// Keys the dashboard is allowed to write. Anything else is ignored so the
// settings store can't be used as an arbitrary key/value dump.
export const ALLOWED_SETTING_KEYS = [
  "hero_image",
  "hero_tagline",
  "hero_cta_primary_label",
  "hero_cta_primary_slug",
  "hero_cta_secondary_label",
  "hero_cta_secondary_slug",
  "category_image",
  "category_heading",
  "category_cta_label",
  "category_cta_slug",
  "editorial_image",
];

// Reads all settings rows into a plain { key: value } object.
export async function getAllSettings() {
  const [rows] = await pool.query("SELECT setting_key, setting_value FROM settings");
  const out = {};
  for (const row of rows) out[row.setting_key] = row.setting_value ?? "";
  return out;
}

const router = Router();

// GET /api/settings
router.get("/", async (req, res, next) => {
  try {
    res.json(await getAllSettings());
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings — upsert a partial map of { key: value }.
router.put("/", async (req, res, next) => {
  try {
    const body = req.body && typeof req.body === "object" ? req.body : {};
    const entries = Object.entries(body).filter(([key]) => ALLOWED_SETTING_KEYS.includes(key));

    if (!entries.length) {
      return res.status(400).json({ error: "No valid settings provided." });
    }

    for (const [key, value] of entries) {
      await pool.query(
        `INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)
         ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)`,
        [key, value == null ? "" : String(value)],
      );
    }

    res.json(await getAllSettings());
  } catch (err) {
    next(err);
  }
});

export default router;
