import path from "node:path";
import { defineConfig } from "drizzle-kit";
import { globSync } from "glob";

// Dynamically find the local D1 database file used by `wrangler dev`
const dbFile = globSync(
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

export default defineConfig({
	schema: "./src/db/schema/*",
	out: "./src/db/migrations",
	dialect: "sqlite",
	driver: "libsql",
	dbCredentials: {
		url: dbFile,
	},
});
