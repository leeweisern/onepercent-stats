#!/usr/bin/env bun

import { existsSync, readFileSync, unlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { spawn } from "bun";
import { count } from "drizzle-orm";
import * as authSchema from "../db/schema/auth";
import * as leadsSchema from "../db/schema/leads";
import { db } from "../db/script-db";

// Parse command line arguments
const args = process.argv.slice(2);
const noImport = args.includes("--no-import");
const keepFiles = args.includes("--keep");

// Environment variables
const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
const API_TOKEN = process.env.CLOUDFLARE_D1_TOKEN;
const DATABASE_NAME = "onepercent-stats-new";

if (!ACCOUNT_ID || !DATABASE_ID || !API_TOKEN) {
	console.error("❌ Missing required environment variables:");
	console.error("   CLOUDFLARE_ACCOUNT_ID, CLOUDFLARE_DATABASE_ID, CLOUDFLARE_D1_TOKEN");
	console.error("   Make sure your .env file is properly configured.");
	process.exit(1);
}

// File paths
const workDir = tmpdir();
const remoteExportPath = join(workDir, "remote-export.sql");
const remoteFixedPath = join(workDir, "remote-fixed.sql");

console.log("🔄 Starting database data sync...");
console.log("   (Schema migrations should be run separately with 'bun run db:migrate:local')");
console.log(`📁 Working directory: ${workDir}`);

async function runCommand(
	command: string,
	args: string[],
	env?: Record<string, string>,
): Promise<string> {
	const proc = spawn([command, ...args], {
		env: { ...process.env, ...env },
		stdout: "pipe",
		stderr: "pipe",
	});

	const result = await proc.exited;

	if (result !== 0) {
		const stderr = await new Response(proc.stderr).text();
		throw new Error(`Command failed: ${command} ${args.join(" ")}\n${stderr}`);
	}

	return await new Response(proc.stdout).text();
}

async function exportRemoteDatabase() {
	console.log("📤 Exporting remote D1 database...");

	try {
		await runCommand(
			"wrangler",
			["d1", "export", DATABASE_NAME, "--remote", `--output=${remoteExportPath}`],
			{
				CLOUDFLARE_API_TOKEN: API_TOKEN,
			},
		);

		console.log("✅ Remote database exported successfully");
	} catch (error) {
		console.error("❌ Failed to export remote database:", error);
		process.exit(1);
	}
}

function sanitizeSqlFile() {
	console.log("🔧 Sanitizing SQL file...");

	if (!existsSync(remoteExportPath)) {
		console.error("❌ Remote export file not found");
		process.exit(1);
	}

	let sqlContent = readFileSync(remoteExportPath, "utf-8");

	// Remove transaction statements and schema definitions
	sqlContent = sqlContent.replace(/^BEGIN TRANSACTION;?\s*$/gm, "").replace(/^COMMIT;?\s*$/gm, "");

	// Quote ISO timestamps (YYYY-MM-DDTHH:mm:ss.sssZ)
	sqlContent = sqlContent.replace(/(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z)/g, "'$1'");

	// Extract only INSERT statements
	const lines = sqlContent.split("\n");
	const insertLines = lines.filter(
		(line) =>
			line.trim().startsWith("INSERT INTO") &&
			!line.includes("__drizzle_migrations") &&
			!line.includes("d1_migrations") &&
			!line.includes("sqlite_sequence"),
	);

	const finalContent = insertLines.join("\n");

	writeFileSync(remoteFixedPath, finalContent);
	console.log(`✅ SQL file sanitized (${insertLines.length} INSERT statements extracted)`);
}

async function clearLocalData() {
	console.log("🗑️  Clearing existing local data...");
	try {
		await db.delete(leadsSchema.advertisingCosts);
		await db.delete(leadsSchema.leads);
		await db.delete(authSchema.session);
		await db.delete(authSchema.account);
		await db.delete(authSchema.verification);
		await db.delete(authSchema.user);
		console.log("✅ Local data cleared");
	} catch (error) {
		console.error("❌ Failed to clear local data:", error);
	}
}

async function importToLocalDatabase() {
	console.log("📥 Importing data to local database...");

	if (!existsSync(remoteFixedPath)) {
		console.error("❌ Sanitized SQL file not found");
		process.exit(1);
	}

	try {
		const sql = readFileSync(remoteFixedPath, "utf-8");
		const statements = sql.split(";").filter((s) => s.trim().length > 0);
		db.transaction(() => {
			for (const statement of statements) {
				db.run(`${statement};`);
			}
		});
		console.log("✅ Data imported to local database");
	} catch (error) {
		console.error("❌ Failed to import data:", error);
		console.error("   The sanitized SQL file is available at:", remoteFixedPath);
		process.exit(1);
	}
}

async function verifySync() {
	console.log("🔍 Verifying sync...");

	try {
		// Get local counts
		const localLeads = await db.select({ count: count() }).from(leadsSchema.leads);
		const localCosts = await db.select({ count: count() }).from(leadsSchema.advertisingCosts);
		const localUsers = await db.select({ count: count() }).from(authSchema.user);

		console.log("\n📊 Local Database Record Counts:");
		console.table([
			{ table: "leads", count: localLeads[0]?.count || 0 },
			{ table: "advertising_costs", count: localCosts[0]?.count || 0 },
			{ table: "user", count: localUsers[0]?.count || 0 },
		]);

		console.log("✅ Sync verification completed");
	} catch (error) {
		console.error("❌ Failed to verify sync:", error);
	}
}

function cleanup() {
	if (!keepFiles) {
		console.log("🧹 Cleaning up temporary files...");

		[remoteExportPath, remoteFixedPath].forEach((file) => {
			if (existsSync(file)) {
				unlinkSync(file);
			}
		});

		console.log("✅ Cleanup complete");
	} else {
		console.log("📁 Temporary files kept:");
		console.log(`   Raw export: ${remoteExportPath}`);
		console.log(`   Sanitized: ${remoteFixedPath}`);
	}
}

async function main() {
	try {
		await exportRemoteDatabase();
		sanitizeSqlFile();

		if (noImport) {
			console.log("✅ Export complete - no import performed");
			console.log(`📁 Sanitized SQL available at: ${remoteFixedPath}`);
			return;
		}

		await clearLocalData();
		await importToLocalDatabase();
		await verifySync();

		console.log("\n🎉 Database data sync completed successfully!");
	} catch (error) {
		console.error("💥 Sync failed:", error);
		process.exit(1);
	} finally {
		cleanup();
	}
}

// Handle process termination
process.on("SIGINT", () => {
	console.log("\n⚠️  Sync interrupted");
	cleanup();
	process.exit(1);
});

process.on("SIGTERM", () => {
	console.log("\n⚠️  Sync terminated");
	cleanup();
	process.exit(1);
});

main();
