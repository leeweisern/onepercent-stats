#!/usr/bin/env bun
import { readFileSync } from "node:fs";
import { createClient } from "@libsql/client";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/libsql";
import * as authSchema from "../db/schema/auth";
import * as schema from "../db/schema/leads";
import { standardizeDate } from "../lib/date-utils";

const { leads, advertisingCosts } = schema;

type LeadStatus = "New" | "Contacted" | "Follow Up" | "Consulted" | "Closed Won" | "Closed Lost";

function addDaysToDate(dateStr: string, days: number): string {
	if (!dateStr || !dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) return "";

	const [day, month, year] = dateStr.split("/").map(Number);
	const date = new Date(year, month - 1, day);
	date.setDate(date.getDate() + days);

	const newDay = String(date.getDate()).padStart(2, "0");
	const newMonth = String(date.getMonth() + 1).padStart(2, "0");
	const newYear = date.getFullYear();

	return `${newDay}/${newMonth}/${newYear}`;
}

function transformStatus(oldLead: any): LeadStatus {
	const _isClosed = oldLead.is_closed === 1;
	const sales = parseInt(oldLead.sales, 10) || 0;
	const status = (oldLead.status || "").trim();

	// Rule 2: sales > 0 always means "Closed Won"
	if (sales > 0) {
		return "Closed Won";
	}

	// Rule 1: "No Reply" becomes "Closed Lost"
	if (status === "No Reply") {
		return "Closed Lost";
	}

	// Rule 4: "Consult" becomes "Consulted"
	if (status === "Consult") {
		return "Consulted";
	}

	// Rule 4: Empty status becomes "New"
	if (!status || status === "") {
		return "New";
	}

	// Handle valid existing statuses
	const validStatuses: LeadStatus[] = [
		"New",
		"Contacted",
		"Follow Up",
		"Consulted",
		"Closed Won",
		"Closed Lost",
	];
	if (validStatuses.includes(status as LeadStatus)) {
		return status as LeadStatus;
	}

	// Default fallback
	return "New";
}

function parseOldLead(insertStatement: string): any {
	// Extract values from INSERT INTO leads VALUES(...)
	const match = insertStatement.match(/INSERT INTO leads VALUES\((.*)\);?$/);
	if (!match) return null;

	const values = match[1];
	const parts: string[] = [];
	let current = "";
	let inQuote = false;

	for (let i = 0; i < values.length; i++) {
		const char = values[i];
		if (char === "'" && values[i - 1] !== "\\") {
			inQuote = !inQuote;
		} else if (char === "," && !inQuote) {
			parts.push(current);
			current = "";
			continue;
		}
		current += char;
	}
	parts.push(current);

	// Parse each field
	const cleanValue = (val: string) => {
		val = val.trim();
		if (val === "NULL") return null;
		if (val.startsWith("'") && val.endsWith("'")) {
			return val.slice(1, -1).replace(/\\''/g, "'");
		}
		return val;
	};

	return {
		id: parseInt(parts[0], 10),
		month: cleanValue(parts[1]),
		date: cleanValue(parts[2]),
		name: cleanValue(parts[3]),
		phone_number: cleanValue(parts[4]),
		platform: cleanValue(parts[5]),
		is_closed: parseInt(parts[6], 10) || 0,
		status: cleanValue(parts[7]),
		sales: parts[8] === "NULL" ? null : parseInt(parts[8], 10) || 0,
		remark: cleanValue(parts[9]),
		trainer_handle: cleanValue(parts[10]),
		closed_date: cleanValue(parts[11]),
		closed_month: cleanValue(parts[12]),
		closed_year: cleanValue(parts[13]),
		created_at: cleanValue(parts[14]),
	};
}

async function migrateData(isRemote: boolean = false) {
	console.log(`🚀 Starting migration to ${isRemote ? "REMOTE" : "LOCAL"} database...`);

	// Setup database connection
	let db;
	if (isRemote) {
		// For remote, we'll use wrangler d1 execute commands instead
		throw new Error("Remote migration should be done via wrangler d1 execute commands");
	} else {
		// Find the local database file
		const { execSync } = require("node:child_process");
		const _dbList = execSync("ls -la .wrangler/state/v3/d1/", { encoding: "utf-8" });
		console.log("📁 Looking for local database file...");

		// Get the most recent SQLite file
		const files = execSync("find .wrangler/state/v3/d1 -name '*.sqlite' -type f", {
			encoding: "utf-8",
		})
			.trim()
			.split("\n")
			.filter(Boolean);

		if (files.length === 0) {
			throw new Error("No local database file found. Run 'bun run db:migrate:local' first.");
		}

		const dbPath = files[0];
		console.log(`📂 Using database: ${dbPath}`);

		const client = createClient({
			url: `file:${dbPath}`,
			authToken: "",
		});
		db = drizzle(client, { schema: { ...schema, ...authSchema } });
	}

	// Read backup file
	const backupPath = "./archives/migration-phase6/remote-backup-20250824.sql";
	console.log("📖 Reading backup file...");
	const sqlContent = readFileSync(backupPath, "utf-8");

	// Parse leads from backup
	const leadInserts = sqlContent
		.split("\n")
		.filter((line) => line.startsWith("INSERT INTO leads VALUES"))
		.map(parseOldLead)
		.filter(Boolean);

	console.log(`📊 Found ${leadInserts.length} leads to migrate`);

	// Parse advertising costs
	const costInserts = sqlContent
		.split("\n")
		.filter((line) => line.startsWith("INSERT INTO advertising_costs VALUES"))
		.map((line) => {
			const match = line.match(/VALUES\((\d+),(\d+),(\d+),([\d.]+),'(\w+)','([^']+)','([^']+)'\)/);
			if (!match) return null;
			return {
				id: parseInt(match[1], 10),
				month: parseInt(match[2], 10),
				year: parseInt(match[3], 10),
				cost: parseFloat(match[4]),
				currency: match[5],
				createdAt: match[6],
				updatedAt: match[7],
			};
		})
		.filter(Boolean);

	console.log(`📊 Found ${costInserts.length} advertising cost records`);

	// Clear existing data
	console.log("🗑️  Clearing existing data...");
	await db.delete(leads);
	await db.delete(advertisingCosts);

	// Transform and insert leads
	console.log("🔄 Transforming and inserting leads...");
	const now = new Date().toISOString();
	const statusCounts: Record<string, number> = {};

	for (const oldLead of leadInserts) {
		const newStatus = transformStatus(oldLead);
		statusCounts[newStatus] = (statusCounts[newStatus] || 0) + 1;

		// Calculate new fields based on status
		let contactedDate = null;
		let nextFollowUpDate = null;
		let lastActivityDate = oldLead.created_at || now;

		// Rule 5: Apply 3-day follow-up rule for "Contacted" status
		if (newStatus === "Contacted" && oldLead.date) {
			contactedDate = standardizeDate(oldLead.date);
			nextFollowUpDate = addDaysToDate(contactedDate!, 3);
			lastActivityDate = contactedDate || lastActivityDate;
		}

		// Set activity date for closed leads
		if ((newStatus === "Closed Won" || newStatus === "Closed Lost") && oldLead.closed_date) {
			lastActivityDate = oldLead.closed_date;
		}

		const transformedLead = {
			id: oldLead.id,
			month: oldLead.month,
			date: standardizeDate(oldLead.date) || oldLead.date,
			name: oldLead.name,
			phoneNumber: oldLead.phone_number,
			platform: oldLead.platform,
			status: newStatus,
			sales: oldLead.sales,
			remark: oldLead.remark,
			trainerHandle: oldLead.trainer_handle,
			closedDate: standardizeDate(oldLead.closed_date) || oldLead.closed_date,
			closedMonth: oldLead.closed_month,
			closedYear: oldLead.closed_year,
			contactedDate,
			nextFollowUpDate,
			lastActivityDate,
			createdAt: oldLead.created_at || now,
			updatedAt: now,
		};

		await db.insert(leads).values(transformedLead);
	}

	// Insert advertising costs
	console.log("💰 Inserting advertising costs...");
	for (const cost of costInserts) {
		await db.insert(advertisingCosts).values(cost);
	}

	// Print summary
	console.log("\n✅ Migration completed successfully!");
	console.log("\n📊 Status transformation summary:");
	Object.entries(statusCounts)
		.sort()
		.forEach(([status, count]) => {
			console.log(`   ${status}: ${count} leads`);
		});

	// Verify data
	const totalLeads = await db.select({ count: sql<number>`count(*)` }).from(leads);
	const totalCosts = await db.select({ count: sql<number>`count(*)` }).from(advertisingCosts);

	console.log("\n📈 Final counts:");
	console.log(`   Total leads: ${totalLeads[0].count}`);
	console.log(`   Total advertising costs: ${totalCosts[0].count}`);

	// Show sample of transformed data
	const samples = await db.select().from(leads).limit(5);
	console.log("\n🔍 Sample transformed leads:");
	samples.forEach((lead) => {
		console.log(
			`   ID ${lead.id}: ${lead.name} - Status: ${lead.status}${lead.sales ? ` (Sales: RM${lead.sales})` : ""}`,
		);
	});
}

// Main execution
const isRemote = process.argv.includes("--remote");

migrateData(isRemote)
	.then(() => {
		console.log("\n🎉 Migration process completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n❌ Migration failed:", error);
		process.exit(1);
	});
