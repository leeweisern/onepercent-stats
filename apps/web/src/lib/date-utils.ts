/**
 * Date utility functions for consistent date handling across the frontend
 */

/**
 * Converts from HTML date input format (YYYY-MM-DD) to database format (DD/MM/YYYY)
 */
export function convertFromDateInputFormat(dateString: string): string {
	if (!dateString) return "";

	// Parse YYYY-MM-DD format and convert to DD/MM/YYYY
	const parts = dateString.split("-");
	if (parts.length === 3) {
		const year = parts[0];
		const month = parts[1].padStart(2, "0"); // Ensure 2 digits
		const day = parts[2].padStart(2, "0"); // Ensure 2 digits
		return `${day}/${month}/${year}`;
	}

	return dateString;
}

/**
 * Converts from database format (DD/MM/YYYY) to HTML date input format (YYYY-MM-DD)
 */
export function convertToDateInputFormat(dateString: string | null): string {
	if (!dateString) return "";

	// Parse DD/MM/YYYY format and convert to YYYY-MM-DD
	const parts = dateString.split("/");
	if (parts.length === 3) {
		const day = parts[0].padStart(2, "0");
		const month = parts[1].padStart(2, "0");
		const year = parts[2];
		return `${year}-${month}-${day}`;
	}

	return dateString;
}

/**
 * Gets month name from a date string (supports both YYYY-MM-DD and DD/MM/YYYY formats)
 */
export function getMonthFromDate(dateString: string): string {
	if (!dateString) return "";

	// Try parsing as YYYY-MM-DD first (HTML date input format)
	let date = new Date(dateString);

	// If that fails, try parsing DD/MM/YYYY format
	if (Number.isNaN(date.getTime())) {
		const parts = dateString.split("/");
		if (parts.length === 3) {
			const day = parseInt(parts[0], 10);
			const month = parseInt(parts[1], 10) - 1; // Month is 0-indexed
			const year = parseInt(parts[2], 10);
			date = new Date(year, month, day);
		}
	}

	if (Number.isNaN(date.getTime())) return "";

	const monthNames = [
		"January",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];

	return monthNames[date.getMonth()] || "";
}

/**
 * Formats a Date object to DD/MM/YYYY format
 */
export function formatDateToDDMMYYYY(date: Date): string {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear().toString();

	return `${day}/${month}/${year}`;
}

/**
 * Gets today's date in DD/MM/YYYY format
 */
export function getTodayDDMMYYYY(): string {
	return formatDateToDDMMYYYY(new Date());
}

/**
 * Gets today's date in YYYY-MM-DD format (for HTML date inputs)
 */
export function getTodayYYYYMMDD(): string {
	const today = new Date();
	const year = today.getFullYear();
	const month = String(today.getMonth() + 1).padStart(2, "0");
	const day = String(today.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

/**
 * Validates if a date string is in DD/MM/YYYY format
 */
export function isValidDDMMYYYYFormat(
	dateStr: string | null | undefined,
): boolean {
	if (!dateStr) return false;
	return /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr.trim());
}
