import { eq } from "drizzle-orm";
import { leads } from "../db/schema/leads";

// Function to standardize date format to DD/MM/YYYY
function standardizeDate(dateStr: string | null): string | null {
	if (!dateStr) return null;

	// Split by '/' to get parts
	const parts = dateStr.split("/");
	if (parts.length !== 3) return dateStr; // Return original if not in expected format

	const [day, month, year] = parts;

	// Pad day and month with leading zeros if needed
	const paddedDay = day.padStart(2, "0");
	const paddedMonth = month.padStart(2, "0");

	return `${paddedDay}/${paddedMonth}/${year}`;
}

export async function standardizeDatesInDatabase(db: any) {
	console.log("Starting date standardization...");

	// Get all leads with their current dates
	const allLeads = await db.select().from(leads);

	let updatedCount = 0;

	for (const lead of allLeads) {
		const updates: any = {};
		let needsUpdate = false;

		// Check and standardize main date
		if (lead.date) {
			const standardizedDate = standardizeDate(lead.date);
			if (standardizedDate !== lead.date) {
				updates.date = standardizedDate;
				needsUpdate = true;
			}
		}

		// Check and standardize closed_date
		if (lead.closedDate) {
			const standardizedClosedDate = standardizeDate(lead.closedDate);
			if (standardizedClosedDate !== lead.closedDate) {
				updates.closedDate = standardizedClosedDate;
				needsUpdate = true;
			}
		}

		// Update if needed
		if (needsUpdate) {
			await db.update(leads).set(updates).where(eq(leads.id, lead.id));

			updatedCount++;
			console.log(`Updated lead ${lead.id}: ${lead.name}`);
			if (updates.date) {
				console.log(`  Date: ${lead.date} -> ${updates.date}`);
			}
			if (updates.closedDate) {
				console.log(`  Closed Date: ${lead.closedDate} -> ${updates.closedDate}`);
			}
		}
	}

	console.log(`Date standardization complete. Updated ${updatedCount} leads.`);
	return updatedCount;
}

// Script runner for local execution
if (import.meta.main) {
	const { db } = await import("../db/script-db");

	try {
		await standardizeDatesInDatabase(db);
		console.log("Script completed successfully");
	} catch (error) {
		console.error("Error running script:", error);
		process.exit(1);
	}
}
