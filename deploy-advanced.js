#!/usr/bin/env node

const { execSync } = require("child_process");
const path = require("path");
const fs = require("fs");

const SERVER_DIR = path.join(__dirname, "apps", "server");
const WEB_DIR = path.join(__dirname, "apps", "web");
const DB_NAME = "onepercent-stats-new";

// Parse command line arguments
const args = process.argv.slice(2);
const skipBuild = args.includes("--skip-build");
const skipMigrations = args.includes("--skip-migrations");
const dryRun = args.includes("--dry-run");
const verbose = args.includes("--verbose");

console.log("🚀 Starting full deployment process...");
if (dryRun) console.log("🔍 DRY RUN MODE - No actual deployment will occur");
console.log("");

function runCommand(command, options = {}) {
	if (dryRun) {
		console.log(`[DRY RUN] Would run: ${command}`);
		return;
	}

	if (verbose) {
		console.log(`Running: ${command}`);
	}

	return execSync(command, {
		stdio: verbose ? "inherit" : "pipe",
		...options,
	});
}

try {
	// Set environment
	const env = {
		...process.env,
		CLOUDFLARE_API_TOKEN:
			process.env.CLOUDFLARE_D1_TOKEN ||
			"63vUheWw64HXvXMRFt7aWluyzyqHdr9djzYk_gaI",
	};

	// Step 0: Pre-deployment checks
	console.log("🔍 Running pre-deployment checks...");

	// Check if required directories exist
	if (!fs.existsSync(SERVER_DIR)) {
		throw new Error("Server directory not found");
	}
	if (!fs.existsSync(WEB_DIR)) {
		throw new Error("Web directory not found");
	}

	// Check if wrangler is available
	try {
		runCommand("wrangler --version", { cwd: SERVER_DIR, env });
	} catch (error) {
		throw new Error("Wrangler CLI not found. Please install it first.");
	}

	// Check authentication
	try {
		runCommand("wrangler whoami", { cwd: SERVER_DIR, env });
	} catch (error) {
		throw new Error("Wrangler authentication failed. Check your API token.");
	}

	console.log("✅ Pre-deployment checks passed\n");

	// Step 1: Build web application
	if (!skipBuild) {
		console.log("📦 Building web application...");
		runCommand("bun run build", {
			cwd: WEB_DIR,
			env,
			stdio: "inherit",
		});
		console.log("✅ Web application built successfully\n");
	} else {
		console.log("⏭️  Skipping web build (--skip-build flag)\n");
	}

	// Step 2: Check for pending migrations
	if (!skipMigrations) {
		console.log("🔍 Checking for pending migrations...");
		try {
			const migrationDir = path.join(SERVER_DIR, "src", "db", "migrations");
			if (fs.existsSync(migrationDir)) {
				const migrationFiles = fs
					.readdirSync(migrationDir)
					.filter((file) => file.endsWith(".sql"))
					.sort();

				if (migrationFiles.length > 0) {
					console.log(`📋 Found ${migrationFiles.length} migration file(s):`);
					migrationFiles.forEach((file) => console.log(`   - ${file}`));

					console.log("🔄 Applying migrations to remote database...");
					runCommand(`wrangler d1 migrations apply ${DB_NAME} --remote`, {
						cwd: SERVER_DIR,
						env,
						stdio: "inherit",
					});
					console.log("✅ Migrations applied successfully\n");
				} else {
					console.log("ℹ️  No migration files found\n");
				}
			} else {
				console.log("ℹ️  No migrations directory found\n");
			}
		} catch (error) {
			console.log("⚠️  Could not check migrations:", error.message);
			console.log("   Continuing with deployment...\n");
		}
	} else {
		console.log("⏭️  Skipping migrations (--skip-migrations flag)\n");
	}

	// Step 3: Deploy Worker with static assets
	console.log("🌐 Deploying Worker with static assets...");
	runCommand("wrangler deploy", {
		cwd: SERVER_DIR,
		env,
		stdio: "inherit",
	});
	console.log("✅ Worker deployed successfully\n");

	// Step 4: Post-deployment verification
	if (!dryRun) {
		console.log("🔍 Verifying deployment...");

		// Wait a moment for deployment to propagate
		console.log("⏳ Waiting for deployment to propagate...");
		await new Promise((resolve) => setTimeout(resolve, 3000));

		// Test API endpoint
		try {
			const apiResponse = runCommand(
				'curl -s "https://onepercent-stats-server.leeweisern.workers.dev/api/analytics/leads/summary"',
			);
			const apiData = JSON.parse(apiResponse.toString());
			console.log("✅ API endpoint responding correctly");
			console.log(
				`   Total leads: ${apiData.totalLeads}, Total sales: ${apiData.totalSales}`,
			);
		} catch (error) {
			console.log("⚠️  Could not verify API endpoint:", error.message);
		}

		// Test frontend
		try {
			const frontendResponse = runCommand(
				'curl -s -I "https://onepercent-stats-server.leeweisern.workers.dev"',
			);
			if (frontendResponse.toString().includes("200 OK")) {
				console.log("✅ Frontend serving correctly");
			} else {
				console.log("⚠️  Frontend may not be serving correctly");
			}
		} catch (error) {
			console.log("⚠️  Could not verify frontend:", error.message);
		}

		// Test database connection
		try {
			const dbResponse = runCommand(
				`wrangler d1 execute ${DB_NAME} --command="SELECT COUNT(*) as count FROM leads;" --remote`,
				{
					cwd: SERVER_DIR,
					env,
				},
			);
			console.log("✅ Database connection verified");
		} catch (error) {
			console.log("⚠️  Could not verify database connection:", error.message);
		}
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

	if (dryRun) {
		console.log("\n🔍 This was a dry run. No actual deployment occurred.");
	}
} catch (error) {
	console.error("\n❌ Deployment failed:", error.message);
	console.error("\n🔧 Troubleshooting tips:");
	console.error("   1. Make sure CLOUDFLARE_API_TOKEN is set correctly");
	console.error("   2. Check that you have the necessary permissions");
	console.error("   3. Verify your wrangler configuration");
	console.error("   4. Run individual steps manually to isolate the issue");
	console.error("   5. Use --verbose flag for more detailed output");
	console.error("   6. Use --dry-run flag to test without deploying");
	console.error(
		"\n📖 Usage: bun run deploy [--skip-build] [--skip-migrations] [--dry-run] [--verbose]",
	);
	process.exit(1);
}
