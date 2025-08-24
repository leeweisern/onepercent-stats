// This file is only used for local scripts, not in the Cloudflare Workers environment
// @ts-expect-error - bun:sqlite is only available in Bun runtime
import { Database } from "bun:sqlite";
import path from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { globSync } from "glob";

// Dynamically find the local D1 database file to avoid hardcoding the hash.
// This makes the script more robust against changes in wrangler's internal file structure.
const dbFile =
	globSync(
		path.join(
			process.cwd(),
			".wrangler",
			"state",
			"v3",
			"d1",
			"miniflare-D1DatabaseObject",
			"*.sqlite",
		),
	)[0] ||
	globSync(
		path.join(
			process.cwd(),
			"apps",
			"server",
			".wrangler",
			"state",
			"v3",
			"d1",
			"miniflare-D1DatabaseObject",
			"*.sqlite",
		),
	)[0];

if (!dbFile) {
	throw new Error(
		"Local D1 database file not found. Please run 'bun run dev:server' once to ensure it's created.",
	);
}

const sqlite = new Database(dbFile);
export const db = drizzle(sqlite);
