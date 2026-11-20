// Seeds the database with the original storefront catalogue.
// Run with: npm run db:seed   (run db:setup first)
import { pool } from "./db.js";
import { parsePrice } from "./lib/format.js";
import {
  RAW_BRANDS,
  CATEGORIES,
  CATEGORY_HERO_IMAGES,
  inferCategory,
  generateDescription,
  resolveProductImage,
  slugify,
} from "./seed-data.js";

async function main() {
  const conn = await pool.getConnection();
  try {
    console.log("Clearing existing data...");
    await conn.query("SET FOREIGN_KEY_CHECKS = 0");
    await conn.query("TRUNCATE TABLE products");
    await conn.query("TRUNCATE TABLE brands");
    await conn.query("TRUNCATE TABLE categories");
    await conn.query("SET FOREIGN_KEY_CHECKS = 1");

    console.log("Seeding categories...");
    for (const name of CATEGORIES) {
      await conn.query(
        "INSERT INTO categories (name, slug, hero_image) VALUES (?, ?, ?)",
        [name, slugify(name), CATEGORY_HERO_IMAGES[name] || null],
      );
    }

    console.log("Seeding brands & products...");
    let productCount = 0;
    for (const brand of RAW_BRANDS) {
      const brandSlug = slugify(brand.name);
      const [res] = await conn.query(
        "INSERT INTO brands (name, slug, tagline, description, hero_image) VALUES (?, ?, ?, ?, ?)",
        [brand.name, brandSlug, brand.tagline, brand.description, brand.heroImage],
      );
      const brandId = res.insertId;

      for (const group of brand.groups) {
        for (const item of group.items) {
          const slug = slugify(item.name);
          const category = inferCategory(group.label, item.name);
          const { amount, currency } = parsePrice(item.price);
          const description = generateDescription(item.name, brand.name, category);
          const image = resolveProductImage(slug, category);

          await conn.query(
            `INSERT INTO products
              (name, slug, brand_id, category, group_label, price, currency, description, image)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [item.name, slug, brandId, category, group.label, amount, currency, description, image],
          );
          productCount += 1;
        }
      }
    }

    console.log(
      `Done. Seeded ${RAW_BRANDS.length} brands, ${CATEGORIES.length} categories, ${productCount} products.`,
    );
  } finally {
    conn.release();
    await pool.end();
  }
}

main().catch((err) => {
  console.error("Seeding failed:", err.message);
  process.exit(1);
});
