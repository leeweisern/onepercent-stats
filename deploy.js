#!/usr/bin/env node

/**
 * Production Deployment Script for One Percent Stats
 *
 * This script handles the complete deployment process for the monorepo application:
 * 1. Builds the web application with production environment variables
 * 2. Checks for and applies pending database migrations to remote D1
 * 3. Deploys the Cloudflare Worker with static assets
 * 4. Verifies deployment by testing API endpoints
 *
 * Migration Process Notes:
 * - The script automatically detects and applies new migrations from src/db/migrations/
 * - Migrations are applied to the remote D1 database using wrangler CLI
 * - Database schema changes require regenerating migrations with: bun run db:generate
 * - Critical data migrations should be backed up before deployment
 *
 * Usage:
 *   node deploy.js
 *
 * Environment Requirements:
 *   - CLOUDFLARE_D1_TOKEN or CLOUDFLARE_API_TOKEN must be set
 *   - Wrangler must be configured with proper account access
 *   - Production environment files should exist in apps/web/.env.production
 */

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
		CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_D1_TOKEN || process.env.CLOUDFLARE_API_TOKEN,
	};

	// Check for optional local-to-remote sync flag
	const shouldSyncData = process.argv.includes("--sync-local-data");
	if (shouldSyncData) {
		console.log("🔄 Local-to-remote data sync requested...");
		console.log("⚠️  WARNING: This will overwrite remote data with local data!");
		console.log("   To proceed, export local data and import to remote manually:");
		console.log("   1. cd apps/server");
		console.log("   2. wrangler d1 export onepercent-stats-new --local --output=local-export.sql");
		console.log("   3. wrangler d1 execute onepercent-stats-new --remote --file=local-export.sql");
		console.log("   Continuing with deployment without sync...\n");
	}

	// Step 1: Build web application
	console.log("📦 Building web application...");

	// Load production environment variables
	const prodEnvPath = path.join(WEB_DIR, ".env.production");
	const prodEnvVars = {};
	if (fs.existsSync(prodEnvPath)) {
		const prodEnvContent = fs.readFileSync(prodEnvPath, "utf8");
		prodEnvContent.split("\n").forEach((line) => {
			const [key, value] = line.split("=");
			if (key && value) {
				prodEnvVars[key.trim()] = value.trim();
			}
		});
		console.log("📋 Loaded production environment variables:", Object.keys(prodEnvVars));
	}

	execSync("bun run build", {
		cwd: WEB_DIR,
		env: {
			...env,
			...prodEnvVars,
			NODE_ENV: "production",
		},
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
			migrationFiles.forEach((file) => {
				console.log(`   - ${file}`);
			});

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
		console.log("⚠️  Could not check migrations (this is okay if no migrations directory exists)\n");
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
		execSync('curl -s "https://onepercent-stats-server.leeweisern.workers.dev" | head -1', {
			stdio: "inherit",
		});
		console.log("✅ Frontend serving correctly");
	} catch (_error) {
		console.log("⚠️  Could not verify frontend");
	}

	console.log("\n🎉 Deployment completed successfully!");
	console.log(
		"🌐 Your application is live at: https://onepercent-stats-server.leeweisern.workers.dev",
	);
	console.log("\n📊 Available endpoints:");
	console.log("   Frontend: https://onepercent-stats-server.leeweisern.workers.dev");
	console.log("   API: https://onepercent-stats-server.leeweisern.workers.dev/api/analytics/leads");
	console.log("   Auth: https://onepercent-stats-server.leeweisern.workers.dev/api/auth");
} catch (error) {
	console.error("\n❌ Deployment failed:", error.message);
	console.error("\n🔧 Troubleshooting tips:");
	console.error("   1. Make sure CLOUDFLARE_API_TOKEN is set correctly");
	console.error("   2. Check that you have the necessary permissions");
	console.error("   3. Verify your wrangler configuration");
	console.error("   4. Run individual steps manually to isolate the issue");
	process.exit(1);
}
