// This script is only used locally, not in Cloudflare Workers
// @ts-expect-error - bun:sqlite is only available in Bun runtime
import { Database } from "bun:sqlite";
import fs from "node:fs";

const dbFilePath = "apps/server/.wrangler/state/v3/d1/miniflare-d1-local-test-db.sqlite";
const sqlFilePath = "apps/server/.wrangler/state/v3/d1/miniflare-d1-local-test-db.sql";

// Rename the exported file to .sql
fs.renameSync(dbFilePath, sqlFilePath);

const sqlite = new Database(dbFilePath);
const sql = fs.readFileSync(sqlFilePath, "utf8");

sqlite.exec(sql);

console.log("Database created successfully from SQL file.");
