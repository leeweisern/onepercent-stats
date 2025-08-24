/**
 * Frontend datetime utilities for Malaysian timezone (GMT+8) display
 * Handles formatting of datetime strings for user interface
 */

/**
 * Formats an ISO datetime string for Malaysian display
 * @param isoString - ISO 8601 datetime string
 * @returns Formatted string "DD/MM/YYYY HH:mm" or empty string if invalid
 */
export function formatMY(isoString: string | null | undefined): string {
	if (!isoString) return "";

	try {
		const date = new Date(isoString);
		if (Number.isNaN(date.getTime())) return "";

		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();
		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");

		return `${day}/${month}/${year} ${hours}:${minutes}`;
	} catch {
		return "";
	}
}

/**
 * Formats an ISO datetime string to date only (DD/MM/YYYY)
 * @param isoString - ISO 8601 datetime string
 * @returns Formatted date string "DD/MM/YYYY"
 */
export function formatMYDate(isoString: string | null | undefined): string {
	if (!isoString) return "";

	try {
		const date = new Date(isoString);
		if (Number.isNaN(date.getTime())) return "";

		const day = date.getDate().toString().padStart(2, "0");
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const year = date.getFullYear();

		return `${day}/${month}/${year}`;
	} catch {
		return "";
	}
}

/**
 * Formats an ISO datetime string to time only (HH:mm)
 * @param isoString - ISO 8601 datetime string
 * @returns Formatted time string "HH:mm"
 */
export function formatMYTime(isoString: string | null | undefined): string {
	if (!isoString) return "";

	try {
		const date = new Date(isoString);
		if (Number.isNaN(date.getTime())) return "";

		const hours = date.getHours().toString().padStart(2, "0");
		const minutes = date.getMinutes().toString().padStart(2, "0");

		return `${hours}:${minutes}`;
	} catch {
		return "";
	}
}

/**
 * Formats a datetime as "time ago" (e.g., "2 hours ago", "3 days ago")
 * @param isoString - ISO 8601 datetime string
 * @returns Human-readable relative time string
 */
export function timeAgo(isoString: string | null | undefined): string {
	if (!isoString) return "";

	try {
		const date = new Date(isoString);
		if (Number.isNaN(date.getTime())) return "";

		const now = new Date();
		const diffMs = now.getTime() - date.getTime();
		const diffSeconds = Math.floor(diffMs / 1000);
		const diffMinutes = Math.floor(diffSeconds / 60);
		const diffHours = Math.floor(diffMinutes / 60);
		const diffDays = Math.floor(diffHours / 24);
		const diffWeeks = Math.floor(diffDays / 7);
		const diffMonths = Math.floor(diffDays / 30);

		if (diffSeconds < 60) {
			return "just now";
		} else if (diffMinutes < 60) {
			return `${diffMinutes} ${diffMinutes === 1 ? "minute" : "minutes"} ago`;
		} else if (diffHours < 24) {
			return `${diffHours} ${diffHours === 1 ? "hour" : "hours"} ago`;
		} else if (diffDays < 7) {
			return `${diffDays} ${diffDays === 1 ? "day" : "days"} ago`;
		} else if (diffWeeks < 4) {
			return `${diffWeeks} ${diffWeeks === 1 ? "week" : "weeks"} ago`;
		} else {
			return `${diffMonths} ${diffMonths === 1 ? "month" : "months"} ago`;
		}
	} catch {
		return "";
	}
}

/**
 * Checks if a datetime is overdue (in the past)
 * @param isoString - ISO 8601 datetime string
 * @returns True if the datetime is in the past
 */
export function isOverdue(isoString: string | null | undefined): boolean {
	if (!isoString) return false;

	try {
		const date = new Date(isoString);
		if (Number.isNaN(date.getTime())) return false;

		return date.getTime() < Date.now();
	} catch {
		return false;
	}
}

/**
 * Formats a follow-up date with overdue indication
 * @param isoString - ISO 8601 datetime string
 * @returns Object with formatted date and overdue status
 */
export function formatFollowUp(isoString: string | null | undefined): {
	text: string;
	isOverdue: boolean;
	daysUntil: number;
} {
	if (!isoString) {
		return { text: "Not scheduled", isOverdue: false, daysUntil: 0 };
	}

	try {
		const date = new Date(isoString);
		if (Number.isNaN(date.getTime())) {
			return { text: "Invalid date", isOverdue: false, daysUntil: 0 };
		}

		const now = new Date();
		const diffMs = date.getTime() - now.getTime();
		const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

		let text = formatMYDate(isoString);
		if (diffDays === 0) {
			text = `Today at ${formatMYTime(isoString)}`;
		} else if (diffDays === 1) {
			text = `Tomorrow at ${formatMYTime(isoString)}`;
		} else if (diffDays === -1) {
			text = `Yesterday at ${formatMYTime(isoString)}`;
		} else if (diffDays > 0 && diffDays <= 7) {
			text = `In ${diffDays} days`;
		} else if (diffDays < 0) {
			text = `${Math.abs(diffDays)} days overdue`;
		}

		return {
			text,
			isOverdue: diffDays < 0,
			daysUntil: diffDays,
		};
	} catch {
		return { text: "Invalid date", isOverdue: false, daysUntil: 0 };
	}
}

/**
 * Gets the Malaysian timezone offset string
 * @returns "+08:00"
 */
export function getMYOffset(): string {
	return "+08:00";
}

/**
 * Converts a date input value (YYYY-MM-DD) to ISO with GMT+8
 * @param dateInputValue - HTML date input value (YYYY-MM-DD)
 * @param hour - Hour (0-23) in Malaysian time, defaults to 9
 * @param minute - Minute (0-59), defaults to 0
 * @returns ISO string with GMT+8 offset
 */
export function dateInputToMYISO(dateInputValue: string, hour = 9, minute = 0): string | null {
	if (!dateInputValue) return null;

	try {
		const [year, month, day] = dateInputValue.split("-").map(Number);
		if (!year || !month || !day) return null;

		// Create date in Malaysian timezone
		const date = new Date(year, month - 1, day, hour, minute, 0, 0);

		// Format to ISO with GMT+8 offset
		const isoDate = date.toISOString().slice(0, -5); // Remove milliseconds and Z
		return `${isoDate}${getMYOffset()}`;
	} catch {
		return null;
	}
}

/**
 * Extracts date part (YYYY-MM-DD) from ISO string for date inputs
 * @param isoString - ISO 8601 datetime string
 * @returns Date string in YYYY-MM-DD format for HTML date inputs
 */
export function isoToDateInput(isoString: string | null | undefined): string {
	if (!isoString) return "";

	try {
		const date = new Date(isoString);
		if (Number.isNaN(date.getTime())) return "";

		const year = date.getFullYear();
		const month = (date.getMonth() + 1).toString().padStart(2, "0");
		const day = date.getDate().toString().padStart(2, "0");

		return `${year}-${month}-${day}`;
	} catch {
		return "";
	}
}

/**
 * Compatibility function: handles both DD/MM/YYYY and ISO formats
 * @param dateString - Date string in either DD/MM/YYYY or ISO format
 * @returns Formatted date string "DD/MM/YYYY"
 */
export function formatDateCompat(dateString: string | null | undefined): string {
	if (!dateString) return "";

	// Check if it's already in DD/MM/YYYY format
	if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateString)) {
		return dateString;
	}

	// Otherwise treat as ISO and convert
	return formatMYDate(dateString);
}
