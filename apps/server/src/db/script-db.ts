import { drizzle } from "drizzle-orm/bun-sqlite";
import { Database } from "bun:sqlite";

const sqlite = new Database(
	"apps/server/.wrangler/state/v3/d1/miniflare-d1-local-test-db.sqlite",
);
export const db = drizzle(sqlite);
