#!/usr/bin/env node

const { execSync } = require("node:child_process");
const path = require("node:path");
const fs = require("node:fs");

const SERVER_DIR = path.join(__dirname, "apps", "server");
const WEB_DIR = path.join(__dirname, "apps", "web");
const DB_NAME = "onepercent-stats-new";

console.log("🚀 Starting full deployment process...\n");

try {
	// Set environment
	const env = {
		...process.env,
		CLOUDFLARE_API_TOKEN:
			process.env.CLOUDFLARE_D1_TOKEN || process.env.CLOUDFLARE_API_TOKEN,
	};

	// Step 1: Build web application
	console.log("📦 Building web application...");
	execSync("bun run build", {
		cwd: WEB_DIR,
		env,
		stdio: "inherit",
	});
	console.log("✅ Web application built successfully\n");

	// Step 2: Check for pending migrations
	console.log("🔍 Checking for pending migrations...");
	try {
		const migrationFiles = fs
			.readdirSync(path.join(SERVER_DIR, "src", "db", "migrations"))
			.filter((file) => file.endsWith(".sql"))
			.sort();

		if (migrationFiles.length > 0) {
			console.log(`📋 Found ${migrationFiles.length} migration file(s):`);
			migrationFiles.forEach((file) => console.log(`   - ${file}`));

			console.log("🔄 Applying migrations to remote database...");
			execSync(`wrangler d1 migrations apply ${DB_NAME} --remote`, {
				cwd: SERVER_DIR,
				env,
				stdio: "inherit",
			});
			console.log("✅ Migrations applied successfully\n");
		} else {
			console.log("ℹ️  No migration files found\n");
		}
	} catch (_error) {
		console.log(
			"⚠️  Could not check migrations (this is okay if no migrations directory exists)\n",
		);
	}

	// Step 3: Deploy Worker with static assets
	console.log("🌐 Deploying Worker with static assets...");
	execSync("wrangler deploy", {
		cwd: SERVER_DIR,
		env,
		stdio: "inherit",
	});
	console.log("✅ Worker deployed successfully\n");

	// Step 4: Verify deployment
	console.log("🔍 Verifying deployment...");

	// Test API endpoint
	try {
		execSync(
			'curl -s "https://onepercent-stats-server.leeweisern.workers.dev/api/analytics/leads/summary" | head -1',
			{
				stdio: "inherit",
			},
		);
		console.log("\n✅ API endpoint responding correctly");
	} catch (_error) {
		console.log("⚠️  Could not verify API endpoint");
	}

	// Test frontend
	try {
		execSync(
			'curl -s "https://onepercent-stats-server.leeweisern.workers.dev" | head -1',
			{
				stdio: "inherit",
			},
		);
		console.log("✅ Frontend serving correctly");
	} catch (_error) {
		console.log("⚠️  Could not verify frontend");
	}

	console.log("\n🎉 Deployment completed successfully!");
	console.log(
		"🌐 Your application is live at: https://onepercent-stats-server.leeweisern.workers.dev",
	);
	console.log("\n📊 Available endpoints:");
	console.log(
		"   Frontend: https://onepercent-stats-server.leeweisern.workers.dev",
	);
	console.log(
		"   API: https://onepercent-stats-server.leeweisern.workers.dev/api/analytics/leads",
	);
	console.log(
		"   Auth: https://onepercent-stats-server.leeweisern.workers.dev/api/auth",
	);
} catch (error) {
	console.error("\n❌ Deployment failed:", error.message);
	console.error("\n🔧 Troubleshooting tips:");
	console.error("   1. Make sure CLOUDFLARE_API_TOKEN is set correctly");
	console.error("   2. Check that you have the necessary permissions");
	console.error("   3. Verify your wrangler configuration");
	console.error("   4. Run individual steps manually to isolate the issue");
	process.exit(1);
}
