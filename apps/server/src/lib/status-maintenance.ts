import { and, eq, gt, isNull, lt, ne, or } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { leads } from "../db/schema/leads";
import {
	addBusinessDaysMY,
	addDaysMY,
	getMonthFromISO,
	getYearFromISO,
	nowMYISO,
} from "./datetime-utils";
import { isWonStatus, normalizeStatus } from "./status";
import { recordStatusChange } from "./status-history";

/**
 * Status maintenance utilities for automatic lead status updates
 * Ensures data consistency and automates routine status transitions
 */

/**
 * Runs comprehensive status maintenance tasks on the leads database
 * Should be called periodically or before analytics operations
 *
 * Performance target: < 100ms execution time
 */
export async function runStatusMaintenance(
	db: DrizzleD1Database,
	config?: { followUpDays?: number },
): Promise<{
	promotedToFollowUp: number;
	syncedSalesStatus: number;
	updatedActivityDates: number;
	executionTime: number;
}> {
	const startTime = Date.now();

	try {
		const followUpDays = config?.followUpDays || 3;

		// Run maintenance tasks in parallel for better performance
		const [promotedCount, syncedCount, activityCount] = await Promise.all([
			promoteStaleContactedLeads(db, followUpDays),
			syncSalesWithStatus(db),
			updateActivityDates(db, followUpDays),
		]);

		const executionTime = Date.now() - startTime;

		return {
			promotedToFollowUp: promotedCount,
			syncedSalesStatus: syncedCount,
			updatedActivityDates: activityCount,
			executionTime,
		};
	} catch (error) {
		console.error("Status maintenance failed:", error);
		throw new Error("Failed to complete status maintenance");
	}
}

/**
 * Auto-promotes stale "Contacted" leads to "Follow Up" after configured days
 */
async function promoteStaleContactedLeads(
	db: DrizzleD1Database,
	followUpDays: number,
): Promise<number> {
	const cutoffDateStr = addDaysMY(nowMYISO(), -followUpDays);

	try {
		// Find contacted leads older than configured days without recent activity
		const staleLeads = await db
			.select({ id: leads.id })
			.from(leads)
			.where(and(eq(leads.status, "Contacted"), lt(leads.lastActivityDate, cutoffDateStr)));

		if (staleLeads.length === 0) {
			return 0;
		}

		// Update status and set next follow-up date (2 business days from now)
		const nextFollowUp = addBusinessDaysMY(nowMYISO(), 2);

		const leadIds = staleLeads.map((lead) => lead.id);

		// Update in batches to avoid query size limits
		let updatedCount = 0;
		const batchSize = 50;

		for (let i = 0; i < leadIds.length; i += batchSize) {
			const batch = leadIds.slice(i, i + batchSize);

			for (const leadId of batch) {
				// Record status change before updating
				await recordStatusChange(db, {
					leadId,
					fromStatus: "Contacted",
					toStatus: "Follow Up",
					changedAt: nowMYISO(),
					source: "maintenance",
					changedBy: "system",
					note: `Auto-promoted after ${followUpDays} days of inactivity`,
				});

				await db
					.update(leads)
					.set({
						status: "Follow Up",
						lastActivityDate: nowMYISO(),
						nextFollowUpDate: nextFollowUp,
						updatedAt: nowMYISO(),
					})
					.where(eq(leads.id, leadId));

				updatedCount++;
			}
		}

		return updatedCount;
	} catch (error) {
		console.error("Failed to promote stale contacted leads:", error);
		return 0;
	}
}

/**
 * Syncs sales data with status: when sales > 0, ensure status is "Closed Won"
 */
async function syncSalesWithStatus(db: DrizzleD1Database): Promise<number> {
	try {
		// Find leads with sales but not marked as "Closed Won"
		const leadsToUpdate = await db
			.select({ id: leads.id, sales: leads.sales, status: leads.status })
			.from(leads)
			.where(and(gt(leads.sales, 0), ne(leads.status, "Closed Won")));

		if (leadsToUpdate.length === 0) {
			return 0;
		}

		let updatedCount = 0;
		const now = nowMYISO();

		for (const lead of leadsToUpdate) {
			// Record status change before updating
			await recordStatusChange(db, {
				leadId: lead.id,
				fromStatus: lead.status || "New",
				toStatus: "Closed Won",
				changedAt: now,
				source: "maintenance",
				changedBy: "system",
				note: `Auto-synced status due to sales > 0 (sales: ${lead.sales})`,
			});

			await db
				.update(leads)
				.set({
					status: "Closed Won",
					lastActivityDate: now,
					closedDate: now,
					closedMonth: getMonthFromISO(now),
					closedYear: getYearFromISO(now),
					updatedAt: now,
				})
				.where(eq(leads.id, lead.id));

			updatedCount++;
		}

		return updatedCount;
	} catch (error) {
		console.error("Failed to sync sales with status:", error);
		return 0;
	}
}

/**
 * Updates lastActivityDate and nextFollowUpDate based on current status
 * CRITICAL FIX: This function now properly sets follow-up dates for ALL active leads
 */
async function updateActivityDates(db: DrizzleD1Database, followUpDays: number): Promise<number> {
	try {
		// Find leads that need activity date or follow-up date updates
		// This includes leads without lastActivityDate OR without proper follow-up dates
		const leadsNeedingUpdate = await db
			.select({
				id: leads.id,
				status: leads.status,
				createdAt: leads.createdAt,
				lastActivityDate: leads.lastActivityDate,
				nextFollowUpDate: leads.nextFollowUpDate,
				date: leads.date,
			})
			.from(leads)
			.where(or(isNull(leads.lastActivityDate), isNull(leads.nextFollowUpDate)));

		if (leadsNeedingUpdate.length === 0) {
			return 0;
		}

		let updatedCount = 0;
		const now = nowMYISO();

		for (const lead of leadsNeedingUpdate) {
			const normalizedStatus = normalizeStatus(lead.status);

			// Set lastActivityDate to lead date, createdAt, or now if not set
			const lastActivity = lead.lastActivityDate || lead.date || lead.createdAt || now;

			// Calculate next follow-up based on status
			// CRITICAL: Only update if not already set OR if status requires it
			let nextFollowUp: string | null = lead.nextFollowUpDate;

			if (!nextFollowUp && !isWonStatus(normalizedStatus) && normalizedStatus !== "Closed Lost") {
				// Use lastActivity as base for calculating follow-up
				const baseDate = lastActivity;

				switch (normalizedStatus) {
					case "New":
						nextFollowUp = addBusinessDaysMY(baseDate, 1); // Follow up next business day
						break;
					case "Contacted":
						nextFollowUp = addDaysMY(baseDate, followUpDays); // Follow up in configured days
						break;
					case "Follow Up":
						nextFollowUp = addBusinessDaysMY(baseDate, 2); // Follow up in 2 business days
						break;
					case "Consulted":
						nextFollowUp = addBusinessDaysMY(baseDate, 1); // Follow up next business day
						break;
				}
			} else if (isWonStatus(normalizedStatus) || normalizedStatus === "Closed Lost") {
				// Clear follow-up date for closed leads
				nextFollowUp = null;
			}

			// Only update if there's a change needed
			if (
				!lead.lastActivityDate ||
				!lead.nextFollowUpDate ||
				lead.nextFollowUpDate !== nextFollowUp
			) {
				await db
					.update(leads)
					.set({
						lastActivityDate: lastActivity,
						nextFollowUpDate: nextFollowUp,
						updatedAt: now,
					})
					.where(eq(leads.id, lead.id));

				updatedCount++;
			}
		}

		return updatedCount;
	} catch (error) {
		console.error("Failed to update activity dates:", error);
		return 0;
	}
}

/**
 * Utility function to get maintenance statistics
 */
export async function getMaintenanceStats(
	db: DrizzleD1Database,
	config?: { followUpDays?: number },
): Promise<{
	staleContactedLeads: number;
	leadsWithSalesNotWon: number;
	leadsWithoutActivityDate: number;
}> {
	try {
		const followUpDays = config?.followUpDays || 3;
		const cutoffDate = addDaysMY(nowMYISO(), -followUpDays);

		const [staleContacted, salesNotWon, noActivity] = await Promise.all([
			// Stale contacted leads
			db
				.select({ count: leads.id })
				.from(leads)
				.where(and(eq(leads.status, "Contacted"), lt(leads.lastActivityDate, cutoffDate))),

			// Leads with sales but not won
			db
				.select({ id: leads.id, status: leads.status })
				.from(leads)
				.where(gt(leads.sales, 0))
				.then((results) => results.filter((lead) => normalizeStatus(lead.status) !== "Closed Won")),

			// Leads without activity date
			db
				.select({ count: leads.id })
				.from(leads)
				.where(isNull(leads.lastActivityDate)),
		]);

		return {
			staleContactedLeads: staleContacted.length,
			leadsWithSalesNotWon: salesNotWon.length,
			leadsWithoutActivityDate: noActivity.length,
		};
	} catch (error) {
		console.error("Failed to get maintenance stats:", error);
		return {
			staleContactedLeads: 0,
			leadsWithSalesNotWon: 0,
			leadsWithoutActivityDate: 0,
		};
	}
}
