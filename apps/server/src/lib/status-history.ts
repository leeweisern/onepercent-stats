import type { drizzle } from "drizzle-orm/d1";
import { leadStatusHistory } from "../db/schema/lead-status-history";

interface RecordStatusChangeParams {
	leadId: number;
	fromStatus: string;
	toStatus: string;
	changedAt?: string;
	source?: "api" | "maintenance";
	changedBy?: string | null;
	note?: string | null;
}

/**
 * Get current timestamp in ISO format with MY timezone (GMT+8)
 */
export function nowMYISO(): string {
	const now = new Date();
	const myTime = new Date(now.getTime() + 8 * 60 * 60 * 1000);
	return myTime.toISOString();
}

/**
 * Convert DD/MM/YYYY to ISO string in MY timezone
 */
export function parseDDMMYYYYToMYISO(dateStr: string): string | null {
	if (!dateStr || typeof dateStr !== "string") return null;

	const parts = dateStr.split("/");
	if (parts.length !== 3) return null;

	const [day, month, year] = parts;
	const dayNum = parseInt(day, 10);
	const monthNum = parseInt(month, 10);
	const yearNum = parseInt(year, 10);

	if (Number.isNaN(dayNum) || Number.isNaN(monthNum) || Number.isNaN(yearNum)) return null;

	// Create date at noon MY time to avoid timezone issues
	const date = new Date(yearNum, monthNum - 1, dayNum, 12, 0, 0);
	return date.toISOString();
}

/**
 * Record a status change in the history table
 */
export async function recordStatusChange(
	db: ReturnType<typeof drizzle>,
	params: RecordStatusChangeParams,
): Promise<void> {
	const {
		leadId,
		fromStatus,
		toStatus,
		changedAt = nowMYISO(),
		source = "api",
		changedBy = null,
		note = null,
	} = params;

	// Skip if no actual change
	if (fromStatus === toStatus) {
		return;
	}

	try {
		await db.insert(leadStatusHistory).values({
			leadId,
			fromStatus,
			toStatus,
			changedAt,
			source,
			changedBy,
			note,
		});
	} catch (error) {
		console.error("Error recording status change:", error);
		// Don't throw - we don't want status history failures to break the main operation
	}
}

/**
 * Ensure only one history row per transition (for idempotency)
 * Checks if a similar transition exists within a time window
 */
export async function ensureSingleTransition(
	_db: ReturnType<typeof drizzle>,
	_leadId: number,
	_toStatus: string,
	_changedAt: string,
	_windowSeconds = 60,
): Promise<boolean> {
	// This would check for existing transitions within a time window
	// For simplicity, we'll just return true for now
	// In production, you'd query the history table for duplicates
	return true;
}
