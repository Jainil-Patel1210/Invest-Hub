import "dotenv/config";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pool } from "./pool";

async function migrate() {
  const schemaPath = path.resolve(__dirname, "../../../db/schema.sql");
  const sql = readFileSync(schemaPath, "utf-8");

  await pool.query(sql);
  console.log("Schema applied successfully.");
}

migrate()
  .catch((err) => {
    console.error("Migration failed:", err);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
