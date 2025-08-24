// Lead status management constants and utilities

export const LEAD_STATUSES = [
	"New",
	"Contacted",
	"Follow Up",
	"Consulted",
	"Closed Won",
	"Closed Lost",
] as const;

export type LeadStatus = (typeof LEAD_STATUSES)[number];

// Status order for sorting (lower number = earlier in pipeline)
export const STATUS_ORDER: Record<LeadStatus, number> = {
	New: 1,
	Contacted: 2,
	"Follow Up": 3,
	Consulted: 4,
	"Closed Won": 5,
	"Closed Lost": 6,
};

/**
 * Normalizes legacy status values to canonical statuses
 * Used during data migration and for backward compatibility
 */
export function normalizeStatus(dbStatus: string | null | undefined): LeadStatus {
	if (!dbStatus || dbStatus.trim() === "") {
		return "New";
	}

	const trimmed = dbStatus.trim();

	switch (trimmed) {
		case "Consult":
			return "Consulted";
		case "No Reply":
			return "Contacted";
		case "New":
		case "Contacted":
		case "Follow Up":
		case "Consulted":
		case "Closed Won":
		case "Closed Lost":
			return trimmed as LeadStatus;
		default:
			// For any unknown status, default to "New"
			return "New";
	}
}

/**
 * Checks if a status represents a closed lead
 */
export function isClosedStatus(status: LeadStatus): boolean {
	return status === "Closed Won" || status === "Closed Lost";
}

/**
 * Checks if a status represents a won lead
 */
export function isWonStatus(status: LeadStatus): boolean {
	return status === "Closed Won";
}

/**
 * Gets the next logical status in the pipeline
 */
export function getNextStatus(currentStatus: LeadStatus): LeadStatus | null {
	switch (currentStatus) {
		case "New":
			return "Contacted";
		case "Contacted":
			return "Follow Up";
		case "Follow Up":
			return "Consulted";
		case "Consulted":
			return "Closed Won"; // Default to won, can be manually changed to lost
		default:
			return null; // Already in final state
	}
}
