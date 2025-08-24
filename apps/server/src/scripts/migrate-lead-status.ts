// @ts-expect-error - bun:sqlite is only available in Bun runtime
import { Database } from "bun:sqlite";
import path from "node:path";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { globSync } from "glob";
import { leads } from "../db/schema/leads";
import {
	getMonthFromDate,
	getYearFromDate,
	standardizeDate,
	todayDDMMYYYY,
} from "../lib/date-utils";
import { isClosedStatus, type LeadStatus, normalizeStatus } from "../lib/status";

// Get the sqlite database file path
const dbFile =
	globSync(
		path.join(
			process.cwd(),
			".wrangler",
			"state",
			"v3",
			"d1",
			"miniflare-D1DatabaseObject",
			"*.sqlite",
		),
	)[0] ||
	globSync(
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

const sqlite = new Database(dbFile);
const db = drizzle(sqlite);

interface MigrationStats {
	totalLeads: number;
	closedWonFromSales: number;
	closedLostFromSales: number;
	consultToConsulted: number;
	noReplyToContacted: number;
	nullToNew: number;
	alreadyMigrated: number;
	dateFieldsUpdated: number;
	errors: number;
}

/**
 * Determines the new status based on legacy isClosed field and sales value
 */
function determineNewStatus(
	currentStatus: string | null | undefined,
	sales: number | null,
	legacyIsClosed?: boolean | number | null,
): { status: LeadStatus; reason: string } {
	// Handle legacy isClosed field logic first (highest priority)
	const isClosedValue = legacyIsClosed === true || legacyIsClosed === 1;

	if (isClosedValue) {
		if (sales && sales > 0) {
			return { status: "Closed Won", reason: "closed_with_sales" };
		} else {
			return { status: "Closed Lost", reason: "closed_without_sales" };
		}
	}

	// First, try to normalize the existing status
	const normalizedStatus = normalizeStatus(currentStatus);

	// If we already have a valid modern status, keep it
	if (
		currentStatus &&
		["New", "Contacted", "Follow Up", "Consulted", "Closed Won", "Closed Lost"].includes(
			currentStatus.trim(),
		)
	) {
		return { status: normalizedStatus, reason: "already_migrated" };
	}

	// Handle legacy status values
	if (currentStatus) {
		const trimmed = currentStatus.trim();
		switch (trimmed) {
			case "Consult":
				return { status: "Consulted", reason: "consult_to_consulted" };
			case "No Reply":
				return { status: "Contacted", reason: "no_reply_to_contacted" };
			default:
				// Use the normalized status
				return {
					status: normalizedStatus,
					reason: normalizedStatus === "New" ? "unknown_to_new" : "normalized",
				};
		}
	}

	// Default case for null/empty status
	return { status: "New", reason: "null_to_new" };
}

/**
 * Sets appropriate date fields based on the new status
 * Only updates fields that exist in the current schema
 */
function setDateFieldsForStatus(
	status: LeadStatus,
	existingClosedDate: string | null,
): {
	closedDate?: string | null;
	closedMonth?: string | null;
	closedYear?: string | null;
} {
	const today = todayDDMMYYYY();
	const updates: any = {};

	if (isClosedStatus(status)) {
		// For closed statuses, ensure we have closed date fields
		if (!existingClosedDate) {
			// If no existing closed date, use today as default
			updates.closedDate = today;
			updates.closedMonth = getMonthFromDate(today);
			updates.closedYear = getYearFromDate(today);
		} else {
			// Standardize existing closed date
			const standardizedClosedDate = standardizeDate(existingClosedDate);
			if (standardizedClosedDate && standardizedClosedDate !== existingClosedDate) {
				updates.closedDate = standardizedClosedDate;
				updates.closedMonth = getMonthFromDate(standardizedClosedDate);
				updates.closedYear = getYearFromDate(standardizedClosedDate);
			}
		}
	}

	// Note: contacted_date field will be added in future schema migration
	// For now, we only update fields that exist in the current schema

	return updates;
}

export async function migrateLeadStatuses(dbInstance: any): Promise<MigrationStats> {
	console.log("Starting lead status migration...");

	const stats: MigrationStats = {
		totalLeads: 0,
		closedWonFromSales: 0,
		closedLostFromSales: 0,
		consultToConsulted: 0,
		noReplyToContacted: 0,
		nullToNew: 0,
		alreadyMigrated: 0,
		dateFieldsUpdated: 0,
		errors: 0,
	};

	try {
		// Get all leads using raw SQL to include the is_closed field
		const stmt = sqlite.prepare(`SELECT 
			id, month, date, name, phone_number, platform, status, sales, 
			is_closed, remark, trainer_handle, closed_date, closed_month, closed_year, created_at
		FROM leads`);
		const allLeads = stmt.all();
		stats.totalLeads = allLeads.length;

		console.log(`Found ${stats.totalLeads} leads to process`);

		for (const lead of allLeads) {
			try {
				const updates: any = {};
				let needsUpdate = false;

				// Determine new status (now with access to is_closed field)
				const { status: newStatus, reason } = determineNewStatus(
					lead.status,
					lead.sales,
					lead.is_closed,
				);

				// Update status if it changed
				if (newStatus !== lead.status) {
					updates.status = newStatus;
					needsUpdate = true;

					// Track statistics
					switch (reason) {
						case "closed_with_sales":
							stats.closedWonFromSales++;
							break;
						case "closed_without_sales":
							stats.closedLostFromSales++;
							break;
						case "consult_to_consulted":
							stats.consultToConsulted++;
							break;
						case "no_reply_to_contacted":
							stats.noReplyToContacted++;
							break;
						case "null_to_new":
						case "unknown_to_new":
							stats.nullToNew++;
							break;
						case "already_migrated":
							stats.alreadyMigrated++;
							break;
					}
				}

				// Set appropriate date fields
				const dateUpdates = setDateFieldsForStatus(newStatus, lead.closed_date);

				if (Object.keys(dateUpdates).length > 0) {
					Object.assign(updates, dateUpdates);
					needsUpdate = true;
					stats.dateFieldsUpdated++;
				}

				// Apply updates if needed
				if (needsUpdate) {
					await dbInstance.update(leads).set(updates).where(eq(leads.id, lead.id));

					console.log(`Updated lead ${lead.id}: ${lead.name || "Unnamed"}`);
					if (updates.status) {
						console.log(`  Status: ${lead.status || "null"} -> ${updates.status} (${reason})`);
					}
					if (Object.keys(dateUpdates).length > 0) {
						console.log(`  Date fields updated:`, dateUpdates);
					}
				}
			} catch (error) {
				console.error(`Error processing lead ${lead.id}:`, error);
				stats.errors++;
			}
		}

		console.log("\n=== Migration Statistics ===");
		console.log(`Total leads processed: ${stats.totalLeads}`);
		console.log(`Closed Won (from sales): ${stats.closedWonFromSales}`);
		console.log(`Closed Lost (from sales): ${stats.closedLostFromSales}`);
		console.log(`Consult -> Consulted: ${stats.consultToConsulted}`);
		console.log(`No Reply -> Contacted: ${stats.noReplyToContacted}`);
		console.log(`Null/Empty -> New: ${stats.nullToNew}`);
		console.log(`Already migrated: ${stats.alreadyMigrated}`);
		console.log(`Date fields updated: ${stats.dateFieldsUpdated}`);
		console.log(`Errors: ${stats.errors}`);

		return stats;
	} catch (error) {
		console.error("Migration failed:", error);
		throw error;
	}
}

// Script runner for local execution
if (import.meta.main) {
	try {
		const stats = await migrateLeadStatuses(db);

		if (stats.errors > 0) {
			console.error(`\nMigration completed with ${stats.errors} errors`);
			process.exit(1);
		} else {
			console.log("\nMigration completed successfully!");
		}
	} catch (error) {
		console.error("Error running migration:", error);
		process.exit(1);
	}
}
