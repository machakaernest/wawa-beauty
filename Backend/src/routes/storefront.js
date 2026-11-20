import { Router } from "express";
import { pool } from "../db.js";
import { serializeProduct, serializeCategory } from "../lib/serialize.js";
import { getAllSettings } from "./settings.js";

const router = Router();

// GET /api/storefront
// Returns the full catalogue in the nested shape the frontend renders:
//   { brands: [{ ...brand, groups: [{ label, items: [Product] }] }],
//     categories: [Category], products: [Product] }
router.get("/", async (req, res, next) => {
  try {
    const [brandRows] = await pool.query("SELECT * FROM brands ORDER BY id ASC");
    const [categoryRows] = await pool.query("SELECT * FROM categories ORDER BY id ASC");
    const [productRows] = await pool.query(
      `SELECT p.*, b.name AS brand_name, b.slug AS brand_slug
       FROM products p
       JOIN brands b ON b.id = p.brand_id
       WHERE p.active = 1
       ORDER BY p.id ASC`,
    );

    const products = productRows.map(serializeProduct);

    const brands = brandRows.map((brand) => {
      const brandProducts = products.filter((p) => p.brandId === brand.id);

      // Preserve insertion order of group labels.
      const groupOrder = [];
      const groupMap = new Map();
      for (const product of brandProducts) {
        const label = product.groupLabel || "Collection";
        if (!groupMap.has(label)) {
          groupMap.set(label, []);
          groupOrder.push(label);
        }
        groupMap.get(label).push(product);
      }

      return {
        id: brand.id,
        name: brand.name,
        slug: brand.slug,
        tagline: brand.tagline || "",
        description: brand.description || "",
        heroImage: brand.hero_image || "",
        groups: groupOrder.map((label) => ({ label, items: groupMap.get(label) })),
      };
    });

    res.json({
      brands,
      categories: categoryRows.map(serializeCategory),
      products,
      featured: products.filter((p) => p.featured),
      newArrivals: products.filter((p) => p.newArrival),
      settings: await getAllSettings(),
    });
  } catch (err) {
    next(err);
  }
});

export default router;
