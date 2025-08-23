import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/d1";
import { leads } from "../db/schema/leads";
import { getMonthFromDate, getYearFromDate } from "../routers/analytics";

// This script should be run locally against the dev DB
// It backfills closedMonth and closedYear for existing leads that have closedDate but empty closedMonth/closedYear

export async function backfillClosedMonth(env: { DB: any }) {
	const db = drizzle(env.DB);

	// Select all leads that have closedDate but don't have closedMonth
	const leadsToUpdate = await db
		.select()
		.from(leads)
		.where(
			sql`${leads.closedDate} IS NOT NULL AND ${leads.closedDate} != '' AND (${leads.closedMonth} IS NULL OR ${leads.closedMonth} = '')`,
		);

	console.log(`Found ${leadsToUpdate.length} leads to update`);

	let updatedCount = 0;
	for (const lead of leadsToUpdate) {
		try {
			const closedMonth = getMonthFromDate(lead.closedDate || "");
			const closedYear = getYearFromDate(lead.closedDate || "");

			await db.update(leads).set({ closedMonth, closedYear }).where(eq(leads.id, lead.id));

			updatedCount++;
			console.log(`Updated lead ${lead.id}: closedMonth=${closedMonth}, closedYear=${closedYear}`);
		} catch (error) {
			console.error(`Error updating lead ${lead.id}:`, error);
		}
	}

	console.log(`Successfully updated ${updatedCount} leads`);
	return { success: true, updatedCount };
}
