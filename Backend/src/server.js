import express from "express";
import cors from "cors";
import "dotenv/config";

import { pool } from "./db.js";
import storefrontRouter from "./routes/storefront.js";
import productsRouter from "./routes/products.js";
import brandsRouter from "./routes/brands.js";
import categoriesRouter from "./routes/categories.js";
import uploadsRouter, { UPLOAD_DIR } from "./routes/uploads.js";
import settingsRouter from "./routes/settings.js";
import authRouter from "./routes/auth.js";

const app = express();
const PORT = Number(process.env.PORT) || 4000;

// CORS: allow the configured origins, or all origins if none are set.
const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : true,
  }),
);
app.use(express.json());

// Serve uploaded product images. Cross-origin <img> loads don't need CORS,
// but we set it so the assets are usable from fetch/canvas contexts too.
app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    setHeaders: (res) => res.set("Access-Control-Allow-Origin", "*"),
  }),
);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", db: "connected" });
  } catch (err) {
    res.status(500).json({ status: "error", db: "disconnected", message: err.message });
  }
});

app.use("/api/storefront", storefrontRouter);
app.use("/api/auth", authRouter);
app.use("/api/products", productsRouter);
app.use("/api/brands", brandsRouter);
app.use("/api/categories", categoriesRouter);
app.use("/api/uploads", uploadsRouter);
app.use("/api/settings", settingsRouter);

app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

// Central error handler.
app.use((err, req, res, _next) => {
  console.error(err);
  if (err.code === "ER_ACCESS_DENIED_ERROR" || err.code === "ECONNREFUSED") {
    return res.status(503).json({
      error: "Database unavailable. Check Backend/.env credentials and that MySQL is running.",
    });
  }
  res.status(500).json({ error: "Internal server error" });
});

app.listen(PORT, () => {
  console.log(`Store API running at http://localhost:${PORT}`);
  console.log(`  Health:     http://localhost:${PORT}/api/health`);
  console.log(`  Storefront: http://localhost:${PORT}/api/storefront`);
});
