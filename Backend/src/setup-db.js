// Creates the database (if missing) and all tables from schema.sql.
// Run with: npm run db:setup
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createServerConnection, dbConfig } from "./db.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

async function main() {
  console.log(`Connecting to MySQL at ${dbConfig.host}:${dbConfig.port} as "${dbConfig.user}"...`);
  const conn = await createServerConnection();

  try {
    await conn.query(
      `CREATE DATABASE IF NOT EXISTS \`${dbConfig.database}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`,
    );
    console.log(`Database "${dbConfig.database}" is ready.`);

    await conn.changeUser({ database: dbConfig.database });

    const schema = await readFile(join(__dirname, "schema.sql"), "utf8");
    await conn.query(schema);
    console.log("Tables created.");
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error("\nDatabase setup failed:", err.message);
  if (err.code === "ER_ACCESS_DENIED_ERROR") {
    console.error(
      "\nCheck DB_USER / DB_PASSWORD in Backend/.env. The MySQL user must be able to create databases.",
    );
  } else if (err.code === "ECONNREFUSED") {
    console.error("\nIs MySQL running? Try: brew services start mysql");
  }
  process.exit(1);
});
