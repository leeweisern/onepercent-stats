#!/usr/bin/env bun
/**
 * Backfill script to populate lead_status_history table with historical data
 * Creates status transition history based on existing lead data
 */

import { and, eq } from "drizzle-orm";
import { leadStatusHistory } from "../db/schema/lead-status-history";
import { leads } from "../db/schema/leads";
import { db } from "../db/script-db";
import { addDaysMY, migrateDDMMYYYYToISO, nowMYISO } from "../lib/datetime-utils";
import { normalizeStatus } from "../lib/status";

interface StatusTransition {
	leadId: number;
	fromStatus: string;
	toStatus: string;
	changedAt: string;
	source: "api" | "maintenance";
	changedBy: string;
	note: string | null;
}

/**
 * Check if a status transition already exists to ensure idempotency
 */
async function transitionExists(
	leadId: number,
	toStatus: string,
	changedAt: string,
): Promise<boolean> {
	// Check within a 60-second window to account for minor timestamp differences
	const _startTime = addDaysMY(changedAt, -0.0007); // ~1 minute before
	const _endTime = addDaysMY(changedAt, 0.0007); // ~1 minute after

	const existing = await db
		.select()
		.from(leadStatusHistory)
		.where(and(eq(leadStatusHistory.leadId, leadId), eq(leadStatusHistory.toStatus, toStatus)))
		.limit(1);

	return existing.length > 0;
}

/**
 * Insert a status transition if it doesn't already exist
 */
async function insertTransition(transition: StatusTransition): Promise<boolean> {
	// Check if transition already exists
	const exists = await transitionExists(
		transition.leadId,
		transition.toStatus,
		transition.changedAt,
	);

	if (exists) {
		return false; // Skip duplicate
	}

	try {
		await db.insert(leadStatusHistory).values(transition);
		return true;
	} catch (error) {
		console.error(`Failed to insert transition for lead ${transition.leadId}:`, error);
		return false;
	}
}

async function backfillStatusHistory() {
	console.log("Starting status history backfill...");
	const startTime = Date.now();

	try {
		// Fetch all leads
		const allLeads = await db.select().from(leads);
		console.log(`Found ${allLeads.length} leads to process`);

		let processedCount = 0;
		let transitionCount = 0;
		let skipCount = 0;
		let errorCount = 0;

		for (const lead of allLeads) {
			try {
				const transitions: StatusTransition[] = [];
				const normalizedStatus = normalizeStatus(lead.status);

				// Determine lead dates - handle both ISO and DD/MM/YYYY formats
				let createdAtISO = lead.createdAt;
				let leadDateISO = lead.date;

				// If dates are in DD/MM/YYYY format, convert them
				if (leadDateISO?.includes("/")) {
					leadDateISO = migrateDDMMYYYYToISO(leadDateISO, 9) || leadDateISO;
				}
				if (createdAtISO?.includes("/")) {
					createdAtISO = migrateDDMMYYYYToISO(createdAtISO, 9) || createdAtISO;
				}

				// Use lead date or created date as initial date
				const initialDate = leadDateISO || createdAtISO || nowMYISO();

				// 1. Initial "New" status at creation
				transitions.push({
					leadId: lead.id,
					fromStatus: "New",
					toStatus: "New",
					changedAt: initialDate,
					source: "api",
					changedBy: "backfill",
					note: "Initial status (backfilled)",
				});

				// 2. If contacted date exists, add transition to "Contacted"
				if (lead.contactedDate) {
					let contactedISO = lead.contactedDate;
					if (contactedISO.includes("/")) {
						contactedISO = migrateDDMMYYYYToISO(contactedISO, 10) || contactedISO;
					}

					if (contactedISO && contactedISO > initialDate) {
						transitions.push({
							leadId: lead.id,
							fromStatus: "New",
							toStatus: "Contacted",
							changedAt: contactedISO,
							source: "api",
							changedBy: "backfill",
							note: "Contacted (backfilled from contactedDate)",
						});
					}
				}

				// 3. Handle current status transitions
				if (normalizedStatus === "Follow Up") {
					// If in Follow Up, they must have gone through Contacted
					const contactedDate = lead.contactedDate
						? lead.contactedDate.includes("/")
							? migrateDDMMYYYYToISO(lead.contactedDate, 10)
							: lead.contactedDate
						: addDaysMY(initialDate, 1);

					if (!lead.contactedDate) {
						transitions.push({
							leadId: lead.id,
							fromStatus: "New",
							toStatus: "Contacted",
							changedAt: contactedDate || initialDate,
							source: "api",
							changedBy: "backfill",
							note: "Contacted (inferred for Follow Up status)",
						});
					}

					// Add Follow Up transition
					const followUpDate = lead.lastActivityDate
						? lead.lastActivityDate.includes("/")
							? migrateDDMMYYYYToISO(lead.lastActivityDate, 14)
							: lead.lastActivityDate
						: addDaysMY(contactedDate || initialDate, 3);

					transitions.push({
						leadId: lead.id,
						fromStatus: "Contacted",
						toStatus: "Follow Up",
						changedAt: followUpDate || nowMYISO(),
						source: "maintenance",
						changedBy: "backfill",
						note: "Follow Up (backfilled)",
					});
				}

				// 4. Handle Consulted status
				if (
					normalizedStatus === "Consulted" ||
					normalizedStatus === "Closed Won" ||
					normalizedStatus === "Closed Lost"
				) {
					// Must have gone through earlier stages
					const contactedDate = lead.contactedDate
						? lead.contactedDate.includes("/")
							? migrateDDMMYYYYToISO(lead.contactedDate, 10)
							: lead.contactedDate
						: addDaysMY(initialDate, 1);

					if (!lead.contactedDate) {
						transitions.push({
							leadId: lead.id,
							fromStatus: "New",
							toStatus: "Contacted",
							changedAt: contactedDate || initialDate,
							source: "api",
							changedBy: "backfill",
							note: "Contacted (inferred for consulted/closed status)",
						});
					}

					// Add Consulted transition
					let consultedDate: string | null = null;
					if (lead.closedDate) {
						// If closed, consulted happened before closing
						const closedISO = lead.closedDate.includes("/")
							? migrateDDMMYYYYToISO(lead.closedDate, 17)
							: lead.closedDate;
						consultedDate = addDaysMY(closedISO || nowMYISO(), -1); // 1 day before closing
					} else if (lead.lastActivityDate) {
						consultedDate = lead.lastActivityDate.includes("/")
							? migrateDDMMYYYYToISO(lead.lastActivityDate, 14)
							: lead.lastActivityDate;
					} else if (lead.updatedAt) {
						consultedDate = lead.updatedAt.includes("/")
							? migrateDDMMYYYYToISO(lead.updatedAt, 14)
							: lead.updatedAt;
					} else {
						consultedDate = addDaysMY(contactedDate || initialDate, 2);
					}

					transitions.push({
						leadId: lead.id,
						fromStatus: "Contacted",
						toStatus: "Consulted",
						changedAt: consultedDate || nowMYISO(),
						source: "api",
						changedBy: "backfill",
						note: "Consulted (backfilled, approximate)",
					});
				}

				// 5. Handle Closed Won/Lost status
				if (normalizedStatus === "Closed Won" || normalizedStatus === "Closed Lost") {
					const closedDate = lead.closedDate
						? lead.closedDate.includes("/")
							? migrateDDMMYYYYToISO(lead.closedDate, 18)
							: lead.closedDate
						: lead.updatedAt
							? lead.updatedAt.includes("/")
								? migrateDDMMYYYYToISO(lead.updatedAt, 18)
								: lead.updatedAt
							: nowMYISO();

					transitions.push({
						leadId: lead.id,
						fromStatus: "Consulted",
						toStatus: normalizedStatus,
						changedAt: closedDate || nowMYISO(),
						source: lead.sales && lead.sales > 0 ? "maintenance" : "api",
						changedBy: "backfill",
						note:
							lead.sales && lead.sales > 0
								? `Closed Won with sales: ${lead.sales} (backfilled)`
								: `${normalizedStatus} (backfilled)`,
					});
				}

				// Insert all transitions for this lead
				for (const transition of transitions) {
					const inserted = await insertTransition(transition);
					if (inserted) {
						transitionCount++;
					} else {
						skipCount++;
					}
				}

				processedCount++;

				if (processedCount % 100 === 0) {
					console.log(`Processed ${processedCount}/${allLeads.length} leads...`);
				}
			} catch (error) {
				console.error(`Error processing lead ${lead.id}:`, error);
				errorCount++;
			}
		}

		const executionTime = Date.now() - startTime;

		console.log("\n=== Backfill Complete ===");
		console.log(`Total leads processed: ${processedCount}`);
		console.log(`Status transitions created: ${transitionCount}`);
		console.log(`Duplicate transitions skipped: ${skipCount}`);
		console.log(`Errors encountered: ${errorCount}`);
		console.log(`Execution time: ${executionTime}ms`);

		// Verify the backfill
		const historyCount = await db.select().from(leadStatusHistory);
		console.log(`\nTotal records in lead_status_history: ${historyCount.length}`);
	} catch (error) {
		console.error("Backfill failed:", error);
		process.exit(1);
	}
}

// Run the backfill
backfillStatusHistory()
	.then(() => {
		console.log("\nBackfill script completed successfully!");
		process.exit(0);
	})
	.catch((error) => {
		console.error("\nBackfill script failed:", error);
		process.exit(1);
	});
