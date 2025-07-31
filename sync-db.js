#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");

const SERVER_DIR = path.join(__dirname, "apps", "server");
const DB_NAME = "onepercent-stats-new";

console.log("🔄 Starting database sync: Local → Remote");

try {
	// Set environment
	const env = {
		...process.env,
		CLOUDFLARE_API_TOKEN:
			process.env.CLOUDFLARE_D1_TOKEN ||
			"63vUheWw64HXvXMRFt7aWluyzyqHdr9djzYk_gaI",
	};

	console.log("📤 Exporting local database...");
	execSync(
		`wrangler d1 export ${DB_NAME} --local --output=sync-export.sql --no-schema`,
		{
			cwd: SERVER_DIR,
			env,
			stdio: "inherit",
		},
	);

	console.log("🗑️  Clearing remote database...");
	execSync(
		`wrangler d1 execute ${DB_NAME} --command="DELETE FROM leads;" --remote`,
		{
			cwd: SERVER_DIR,
			env,
			stdio: "inherit",
		},
	);

	console.log("📥 Importing to remote database...");
	// Extract only INSERT statements for leads table
	const fs = require("fs");
	const exportPath = path.join(SERVER_DIR, "sync-export.sql");
	const exportContent = fs.readFileSync(exportPath, "utf8");

	// Filter only INSERT statements for leads table
	const leadsInserts = exportContent
		.split("\n")
		.filter((line) => line.trim().startsWith('INSERT INTO "leads"'))
		.join("\n");

	const leadsOnlyPath = path.join(SERVER_DIR, "sync-leads-only.sql");
	fs.writeFileSync(leadsOnlyPath, leadsInserts);

	execSync(
		`wrangler d1 execute ${DB_NAME} --file=sync-leads-only.sql --remote`,
		{
			cwd: SERVER_DIR,
			env,
			stdio: "inherit",
		},
	);

	console.log("🧹 Cleaning up temporary files...");
	fs.unlinkSync(exportPath);
	fs.unlinkSync(leadsOnlyPath);

	console.log("✅ Database sync completed successfully!");

	// Verify sync
	console.log("🔍 Verifying sync...");
	execSync(
		`wrangler d1 execute ${DB_NAME} --command="SELECT COUNT(*) as count FROM leads;" --remote`,
		{
			cwd: SERVER_DIR,
			env,
			stdio: "inherit",
		},
	);
} catch (error) {
	console.error("❌ Sync failed:", error.message);
	process.exit(1);
}
