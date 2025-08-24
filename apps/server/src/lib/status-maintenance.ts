import { and, eq, gt, isNull, lt, ne } from "drizzle-orm";
import type { DrizzleD1Database } from "drizzle-orm/d1";
import { leads } from "../db/schema/leads";
import { isWonStatus, normalizeStatus } from "./status";

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
export async function runStatusMaintenance(db: DrizzleD1Database): Promise<{
	promotedToFollowUp: number;
	syncedSalesStatus: number;
	updatedActivityDates: number;
	executionTime: number;
}> {
	const startTime = Date.now();

	try {
		// Run maintenance tasks in parallel for better performance
		const [promotedCount, syncedCount, activityCount] = await Promise.all([
			promoteStaleContactedLeads(db),
			syncSalesWithStatus(db),
			updateActivityDates(db),
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
async function promoteStaleContactedLeads(db: DrizzleD1Database): Promise<number> {
	const followUpDays = Number(process.env.FOLLOW_UP_DAYS || 3);
	const cutoffDate = new Date();
	cutoffDate.setDate(cutoffDate.getDate() - followUpDays);
	const cutoffDateStr = cutoffDate.toISOString();

	try {
		// Find contacted leads older than configured days without recent activity
		const staleLeads = await db
			.select({ id: leads.id })
			.from(leads)
			.where(and(eq(leads.status, "Contacted"), lt(leads.lastActivityDate, cutoffDateStr)));

		if (staleLeads.length === 0) {
			return 0;
		}

		// Update status and set next follow-up date
		const nextFollowUp = new Date();
		nextFollowUp.setDate(nextFollowUp.getDate() + 2); // 2 days from now

		const leadIds = staleLeads.map((lead) => lead.id);

		// Update in batches to avoid query size limits
		let updatedCount = 0;
		const batchSize = 50;

		for (let i = 0; i < leadIds.length; i += batchSize) {
			const batch = leadIds.slice(i, i + batchSize);

			for (const leadId of batch) {
				await db
					.update(leads)
					.set({
						status: "Follow Up",
						lastActivityDate: new Date().toISOString(),
						nextFollowUpDate: nextFollowUp.toISOString(),
						updatedAt: new Date().toISOString(),
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
		const now = new Date().toISOString();

		for (const lead of leadsToUpdate) {
			await db
				.update(leads)
				.set({
					status: "Closed Won",
					lastActivityDate: now,
					closedDate: now,
					closedMonth: new Date().toLocaleString("default", { month: "long" }),
					closedYear: new Date().getFullYear().toString(),
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
 */
async function updateActivityDates(db: DrizzleD1Database): Promise<number> {
	try {
		// Find leads without lastActivityDate set
		const leadsNeedingActivity = await db
			.select({
				id: leads.id,
				status: leads.status,
				createdAt: leads.createdAt,
				lastActivityDate: leads.lastActivityDate,
			})
			.from(leads)
			.where(isNull(leads.lastActivityDate));

		if (leadsNeedingActivity.length === 0) {
			return 0;
		}

		let updatedCount = 0;

		for (const lead of leadsNeedingActivity) {
			const normalizedStatus = normalizeStatus(lead.status);
			const now = new Date().toISOString();

			// Set lastActivityDate to createdAt if not set
			const lastActivity = lead.lastActivityDate || lead.createdAt || now;

			// Calculate next follow-up based on status
			let nextFollowUp: string | null = null;

			if (!isWonStatus(normalizedStatus) && normalizedStatus !== "Closed Lost") {
				const followUpDate = new Date();

				switch (normalizedStatus) {
					case "New":
						followUpDate.setDate(followUpDate.getDate() + 1); // Follow up next day
						break;
					case "Contacted": {
						const followUpDays = Number(process.env.FOLLOW_UP_DAYS || 3);
						followUpDate.setDate(followUpDate.getDate() + followUpDays); // Follow up in configured days
						break;
					}
					case "Follow Up":
						followUpDate.setDate(followUpDate.getDate() + 2); // Follow up in 2 days
						break;
					case "Consulted":
						followUpDate.setDate(followUpDate.getDate() + 1); // Follow up next day
						break;
				}

				nextFollowUp = followUpDate.toISOString();
			}

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

		return updatedCount;
	} catch (error) {
		console.error("Failed to update activity dates:", error);
		return 0;
	}
}

/**
 * Utility function to get maintenance statistics
 */
export async function getMaintenanceStats(db: DrizzleD1Database): Promise<{
	staleContactedLeads: number;
	leadsWithSalesNotWon: number;
	leadsWithoutActivityDate: number;
}> {
	try {
		const followUpDays = Number(process.env.FOLLOW_UP_DAYS || 3);
		const cutoffDate = new Date();
		cutoffDate.setDate(cutoffDate.getDate() - followUpDays);

		const [staleContacted, salesNotWon, noActivity] = await Promise.all([
			// Stale contacted leads
			db
				.select({ count: leads.id })
				.from(leads)
				.where(
					and(eq(leads.status, "Contacted"), lt(leads.lastActivityDate, cutoffDate.toISOString())),
				),

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
