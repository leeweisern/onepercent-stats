import { Database } from "bun:sqlite";
import { drizzle } from "drizzle-orm/bun-sqlite";

const sqlite = new Database(
	".wrangler/state/v3/d1/miniflare-D1DatabaseObject/f26dd3b4af2b86035a68fbb491403d4b54d63dee4c1e42d18d4ad58dc6978866.sqlite",
);
export const db = drizzle(sqlite);
