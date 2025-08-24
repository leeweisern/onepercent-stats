#!/usr/bin/env bun
import { execSync } from "node:child_process";

function formatActivityDate(dateStr: string): string {
	// If it's already in DD/MM/YYYY format, return as is
	if (dateStr?.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
		return dateStr;
	}

	// If it's a timestamp like "2025-07-31 14:22:40", convert to DD/MM/YYYY
	if (dateStr?.match(/^\d{4}-\d{2}-\d{2}/)) {
		const datePart = dateStr.split(" ")[0];
		const [year, month, day] = datePart.split("-");
		return `${day}/${month}/${year}`;
	}

	return dateStr || "";
}

async function fixActivityDates(isRemote: boolean = false) {
	const target = isRemote ? "REMOTE" : "LOCAL";
	const flag = isRemote ? "--remote" : "--local";

	console.log(`🚀 Fixing last activity dates in ${target} database...`);

	// Get all leads with their dates
	const leadsResult = execSync(
		`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT id, date, closed_date, last_activity_date, created_at, status FROM leads" --json`,
		{ encoding: "utf-8" },
	);
	const leads = JSON.parse(leadsResult)[0].results;

	console.log(`📊 Found ${leads.length} leads to process`);

	let updateCount = 0;
	const batchSize = 50;

	for (let i = 0; i < leads.length; i += batchSize) {
		const batch = leads.slice(i, Math.min(i + batchSize, leads.length));

		for (const lead of batch) {
			let newActivityDate = "";

			// Determine the appropriate activity date based on status
			if (lead.status === "Closed Won" || lead.status === "Closed Lost") {
				// For closed leads, use closed_date if available, otherwise use date
				if (lead.closed_date?.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
					newActivityDate = lead.closed_date;
				} else if (lead.date?.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
					newActivityDate = lead.date;
				} else if (lead.created_at) {
					newActivityDate = formatActivityDate(lead.created_at);
				}
			} else {
				// For open leads, use the lead date or formatted created_at
				if (lead.date?.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
					newActivityDate = lead.date;
				} else if (lead.created_at) {
					newActivityDate = formatActivityDate(lead.created_at);
				}
			}

			// Only update if we have a valid date and it's different from current
			if (newActivityDate && newActivityDate !== lead.last_activity_date) {
				const updateSQL = `UPDATE leads SET last_activity_date = '${newActivityDate}' WHERE id = ${lead.id}`;
				try {
					execSync(`wrangler d1 execute onepercent-stats-new ${flag} --command "${updateSQL}"`, {
						stdio: "pipe",
					});
					updateCount++;
				} catch (error: any) {
					console.error(`   ✗ Failed to update lead ${lead.id}:`, error.message);
				}
			}
		}

		console.log(
			`   ✓ Processed batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(leads.length / batchSize)}`,
		);
	}

	console.log(`\n✅ Updated ${updateCount} activity dates`);

	// Show sample of updated data
	const samplesResult = execSync(
		`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT id, name, status, last_activity_date FROM leads ORDER BY id DESC LIMIT 10" --json`,
		{ encoding: "utf-8" },
	);
	const samples = JSON.parse(samplesResult)[0].results;

	console.log("\n🔍 Sample updated activity dates:");
	samples.forEach((lead: any) => {
		console.log(`   ID ${lead.id}: ${lead.name} - Activity: ${lead.last_activity_date || "N/A"}`);
	});

	// Show distribution of activity date formats
	const formatCheckResult = execSync(
		`wrangler d1 execute onepercent-stats-new ${flag} --command "SELECT COUNT(*) as count, CASE WHEN last_activity_date LIKE '__/__/____' THEN 'DD/MM/YYYY' WHEN last_activity_date LIKE '____-__-__%' THEN 'Timestamp' WHEN last_activity_date IS NULL OR last_activity_date = '' THEN 'Empty' ELSE 'Other' END as format FROM leads GROUP BY format" --json`,
		{ encoding: "utf-8" },
	);
	const formats = JSON.parse(formatCheckResult)[0].results;

	console.log("\n📊 Activity date format distribution:");
	formats.forEach((f: any) => {
		console.log(`   ${f.format}: ${f.count} leads`);
	});
}

// Main execution
const isRemote = process.argv.includes("--remote");

fixActivityDates(isRemote)
	.then(() => {
		console.log("\n🎉 Activity date fix completed!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\n❌ Fix failed:", error);
		process.exit(1);
	});
