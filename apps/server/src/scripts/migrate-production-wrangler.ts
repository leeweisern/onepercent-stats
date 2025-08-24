#!/usr/bin/env bun
import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { standardizeDate } from "../lib/date-utils";

type LeadStatus = "New" | "Contacted" | "Follow Up" | "Consulted" | "Closed Won" | "Closed Lost";

function addDaysToDate(dateStr: string, days: number): string {
	if (!dateStr || !dateStr.match(/^\d{2}\/\d{2}\/\d{4}$/)) return "NULL";

	const [day, month, year] = dateStr.split("/").map(Number);
	const date = new Date(year, month - 1, day);
	date.setDate(date.getDate() + days);

	const newDay = String(date.getDate()).padStart(2, "0");
	const newMonth = String(date.getMonth() + 1).padStart(2, "0");
	const newYear = date.getFullYear();

	return `${newDay}/${newMonth}/${newYear}`;
}

function transformStatus(oldLead: any): LeadStatus {
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

function escapeSQL(value: any): string {
	if (value === null || value === undefined || value === "") return "NULL";
	if (typeof value === "number") return value.toString();
	// Escape single quotes by doubling them
	return `'${value.toString().replace(/'/g, "''")}'`;
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
	const target = isRemote ? "REMOTE" : "LOCAL";
	const flag = isRemote ? "--remote" : "--local";

	console.log(`🚀 Starting migration to ${target} database...`);

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
	try {
		execSync(`wrangler d1 execute onepercent-stats-new ${flag} --command "DELETE FROM leads"`, {
			stdio: "pipe",
		});
		execSync(
			`wrangler d1 execute onepercent-stats-new ${flag} --command "DELETE FROM advertising_costs"`,
			{ stdio: "pipe" },
		);
	} catch (_e) {
		console.log("⚠️  Tables might be empty, continuing...");
	}

	// Transform and insert leads
	console.log("🔄 Transforming and inserting leads...");
	const now = new Date().toISOString();
	const statusCounts: Record<string, number> = {};

	// Build batch insert statements (SQLite supports up to 500 values per insert)
	const batchSize = 50;
	for (let i = 0; i < leadInserts.length; i += batchSize) {
		const batch = leadInserts.slice(i, Math.min(i + batchSize, leadInserts.length));
		const values: string[] = [];

		for (const oldLead of batch) {
			const newStatus = transformStatus(oldLead);
			statusCounts[newStatus] = (statusCounts[newStatus] || 0) + 1;

			// Calculate new fields based on status
			let contactedDate = "NULL";
			let nextFollowUpDate = "NULL";
			let lastActivityDate = escapeSQL(oldLead.created_at || now);

			// Rule 5: Apply 3-day follow-up rule for "Contacted" status
			if (newStatus === "Contacted" && oldLead.date) {
				const standardized = standardizeDate(oldLead.date);
				if (standardized) {
					contactedDate = escapeSQL(standardized);
					const followUp = addDaysToDate(standardized, 3);
					nextFollowUpDate = escapeSQL(followUp);
					lastActivityDate = contactedDate;
				}
			}

			// Set activity date for closed leads
			if ((newStatus === "Closed Won" || newStatus === "Closed Lost") && oldLead.closed_date) {
				lastActivityDate = escapeSQL(oldLead.closed_date);
			}

			const value = `(${oldLead.id}, ${escapeSQL(oldLead.month)}, ${escapeSQL(standardizeDate(oldLead.date) || oldLead.date)}, ${escapeSQL(oldLead.name)}, ${escapeSQL(oldLead.phone_number)}, ${escapeSQL(oldLead.platform)}, ${escapeSQL(newStatus)}, ${oldLead.sales || "NULL"}, ${escapeSQL(oldLead.remark)}, ${escapeSQL(oldLead.trainer_handle)}, ${escapeSQL(standardizeDate(oldLead.closed_date) || oldLead.closed_date)}, ${escapeSQL(oldLead.closed_month)}, ${escapeSQL(oldLead.closed_year)}, ${contactedDate}, ${nextFollowUpDate}, ${lastActivityDate}, ${escapeSQL(oldLead.created_at || now)}, ${escapeSQL(now)})`;

			values.push(value);
		}

		const insertSQL = `INSERT INTO leads (id, month, date, name, phone_number, platform, status, sales, remark, trainer_handle, closed_date, closed_month, closed_year, contacted_date, next_follow_up_date, last_activity_date, created_at, updated_at) VALUES ${values.join(", ")}`;

		try {
			execSync(`wrangler d1 execute onepercent-stats-new ${flag} --command "${insertSQL}"`, {
				stdio: "pipe",
			});
			console.log(
				`   ✓ Inserted batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(leadInserts.length / batchSize)}`,
			);
		} catch (error: any) {
			console.error(`   ✗ Failed to insert batch ${Math.floor(i / batchSize) + 1}:`, error.message);
		}
	}

	// Insert advertising costs
	console.log("💰 Inserting advertising costs...");
	for (const cost of costInserts) {
		const insertSQL = `INSERT INTO advertising_costs (id, month, year, cost, currency, created_at, updated_at) VALUES (${cost.id}, ${cost.month}, ${cost.year}, ${cost.cost}, '${cost.currency}', '${cost.createdAt}', '${cost.updatedAt}')`;
		try {
			execSync(`wrangler d1 execute onepercent-stats-new ${flag} --command "${insertSQL}"`, {
				stdio: "pipe",
			});
		} catch (error: any) {
			console.error("   ✗ Failed to insert cost:", error.message);
		}
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
	const totalLeadsResult = execSync(
		`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT COUNT(*) as count FROM leads" --json`,
		{ encoding: "utf-8" },
	);
	const totalLeads = JSON.parse(totalLeadsResult)[0].results[0].count;

	const totalCostsResult = execSync(
		`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT COUNT(*) as count FROM advertising_costs" --json`,
		{ encoding: "utf-8" },
	);
	const totalCosts = JSON.parse(totalCostsResult)[0].results[0].count;

	console.log("\n📈 Final counts:");
	console.log(`   Total leads: ${totalLeads}`);
	console.log(`   Total advertising costs: ${totalCosts}`);

	// Show sample of transformed data
	const samplesResult = execSync(
		`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT id, name, status, sales FROM leads LIMIT 5" --json`,
		{ encoding: "utf-8" },
	);
	const samples = JSON.parse(samplesResult)[0].results;

	console.log("\n🔍 Sample transformed leads:");
	samples.forEach((lead: any) => {
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
