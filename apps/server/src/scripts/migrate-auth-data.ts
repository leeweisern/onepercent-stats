#!/usr/bin/env bun
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

function escapeSQL(value: any): string {
	if (value === null || value === undefined || value === "") return "NULL";
	if (typeof value === "number") return value.toString();
	// Escape single quotes by doubling them
	return `'${value.toString().replace(/'/g, "''")}'`;
}

async function migrateAuthData(isRemote: boolean = false) {
	const target = isRemote ? "REMOTE" : "LOCAL";
	const flag = isRemote ? "--remote" : "--local";

	console.log(`🚀 Starting auth data migration to ${target} database...`);

	// Read backup file
	const backupPath = "./archives/migration-phase6/remote-backup-20250824.sql";
	console.log("📖 Reading backup file for auth data...");
	const sqlContent = readFileSync(backupPath, "utf-8");

	// Extract user data
	const userInsert = sqlContent
		.split("\n")
		.find((line) => line.startsWith("INSERT INTO user VALUES"));

	if (userInsert) {
		console.log("👤 Migrating user data...");
		// Parse the user insert - it has special timestamp format
		const match = userInsert.match(
			/VALUES\('([^']+)','([^']+)','([^']+)',(\d+),([^,]+),([^,]+),([^,]+),'([^']+)'\)/,
		);
		if (match) {
			// Convert timestamps to proper format
			const createdAt = match[6].replace(/T/, " ").replace(/Z$/, "");
			const updatedAt = match[7].replace(/T/, " ").replace(/Z$/, "");
			const insertSQL = `INSERT INTO user (id, name, email, email_verified, image, created_at, updated_at, role) VALUES (${escapeSQL(match[1])}, ${escapeSQL(match[2])}, ${escapeSQL(match[3])}, ${match[4]}, ${match[5]}, '${createdAt}', '${updatedAt}', ${escapeSQL(match[8])})`;
			try {
				execSync(`wrangler d1 execute onepercent-stats-new ${flag} --command "${insertSQL}"`, {
					stdio: "pipe",
				});
				console.log("   ✓ User data migrated");
			} catch (error: any) {
				console.error("   ✗ Failed to migrate user:", error.message);
			}
		}
	}

	// Extract account data
	const accountInsert = sqlContent
		.split("\n")
		.find((line) => line.startsWith("INSERT INTO account VALUES"));

	if (accountInsert) {
		console.log("🔐 Migrating account data...");
		// Parse account insert - complex due to password hash
		const match = accountInsert.match(
			/VALUES\('([^']+)','([^']+)','([^']+)','([^']+)',([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),([^,]+),'([^']+)',([^,]+),([^)]+)\)/,
		);
		if (match) {
			// Convert timestamps to proper format
			const createdAt = match[12].replace(/T/, " ").replace(/Z$/, "");
			const updatedAt = match[13].replace(/T/, " ").replace(/Z$/, "");
			const insertSQL = `INSERT INTO account (id, account_id, provider_id, user_id, access_token, refresh_token, id_token, access_token_expires_at, refresh_token_expires_at, scope, password, created_at, updated_at) VALUES (${escapeSQL(match[1])}, ${escapeSQL(match[2])}, ${escapeSQL(match[3])}, ${escapeSQL(match[4])}, ${match[5]}, ${match[6]}, ${match[7]}, ${match[8]}, ${match[9]}, ${match[10]}, ${escapeSQL(match[11])}, '${createdAt}', '${updatedAt}')`;
			try {
				execSync(`wrangler d1 execute onepercent-stats-new ${flag} --command "${insertSQL}"`, {
					stdio: "pipe",
				});
				console.log("   ✓ Account data migrated");
			} catch (error: any) {
				console.error("   ✗ Failed to migrate account:", error.message);
			}
		}
	}

	// Extract session data
	const sessionInserts = sqlContent
		.split("\n")
		.filter((line) => line.startsWith("INSERT INTO session VALUES"));

	if (sessionInserts.length > 0) {
		console.log("🔑 Migrating session data...");
		let successCount = 0;
		for (const sessionInsert of sessionInserts) {
			const match = sessionInsert.match(
				/VALUES\('([^']+)',(\d+),'([^']+)',(\d+),(\d+),'([^']*)','([^']*)','([^']+)'\)/,
			);
			if (match) {
				const insertSQL = `INSERT INTO session (id, expires_at, token, created_at, updated_at, ip_address, user_agent, user_id) VALUES (${escapeSQL(match[1])}, ${match[2]}, ${escapeSQL(match[3])}, ${match[4]}, ${match[5]}, ${escapeSQL(match[6])}, ${escapeSQL(match[7])}, ${escapeSQL(match[8])})`;
				try {
					execSync(`wrangler d1 execute onepercent-stats-new ${flag} --command "${insertSQL}"`, {
						stdio: "pipe",
					});
					successCount++;
				} catch (_error: any) {
					// Sessions might be expired, that's ok
				}
			}
		}
		console.log(`   ✓ ${successCount}/${sessionInserts.length} sessions migrated`);
	}

	// Verify migration
	console.log("\n📊 Verifying auth data migration...");

	const userCountResult = execSync(
		`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT COUNT(*) as count FROM user" --json`,
		{ encoding: "utf-8" },
	);
	const userCount = JSON.parse(userCountResult)[0].results[0].count;

	const accountCountResult = execSync(
		`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT COUNT(*) as count FROM account" --json`,
		{ encoding: "utf-8" },
	);
	const accountCount = JSON.parse(accountCountResult)[0].results[0].count;

	const sessionCountResult = execSync(
		`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT COUNT(*) as count FROM session" --json`,
		{ encoding: "utf-8" },
	);
	const sessionCount = JSON.parse(sessionCountResult)[0].results[0].count;

	console.log(`   Users: ${userCount}`);
	console.log(`   Accounts: ${accountCount}`);
	console.log(`   Sessions: ${sessionCount}`);

	// Show user details
	if (userCount > 0) {
		const userResult = execSync(
			`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT email, role FROM user LIMIT 1" --json`,
			{ encoding: "utf-8" },
		);
		const user = JSON.parse(userResult)[0].results[0];
		console.log(`\n✅ Admin user: ${user.email} (role: ${user.role})`);
	}
}

// Main execution
const isRemote = process.argv.includes("--remote");

migrateAuthData(isRemote)
	.then(() => {
		console.log("\n🎉 Auth data migration completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n❌ Auth migration failed:", error);
		process.exit(1);
	});
