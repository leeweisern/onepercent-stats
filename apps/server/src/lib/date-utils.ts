/**
 * Standardizes date format to DD/MM/YYYY
 * Accepts various input formats and converts them to consistent DD/MM/YYYY
 */
export function standardizeDate(dateStr: string | null | undefined): string | null {
	if (!dateStr || typeof dateStr !== "string") return null;

	// Remove any extra whitespace
	dateStr = dateStr.trim();

	// If already in DD/MM/YYYY format, validate and return
	if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) {
		return dateStr;
	}

	// Handle various formats: D/M/YYYY, DD/M/YYYY, D/MM/YYYY
	const parts = dateStr.split("/");
	if (parts.length !== 3) return null;

	const [day, month, year] = parts;

	// Validate numeric values
	const dayNum = parseInt(day, 10);
	const monthNum = parseInt(month, 10);
	const yearNum = parseInt(year, 10);

	if (Number.isNaN(dayNum) || Number.isNaN(monthNum) || Number.isNaN(yearNum)) return null;
	if (dayNum < 1 || dayNum > 31) return null;
	if (monthNum < 1 || monthNum > 12) return null;
	if (yearNum < 1900 || yearNum > 2100) return null;

	// Pad day and month with leading zeros
	const paddedDay = day.padStart(2, "0");
	const paddedMonth = month.padStart(2, "0");

	return `${paddedDay}/${paddedMonth}/${year}`;
}

/**
 * Validates if a date string is in the correct DD/MM/YYYY format
 */
export function isValidDateFormat(dateStr: string | null | undefined): boolean {
	if (!dateStr) return false;
	return /^\d{2}\/\d{2}\/\d{4}$/.test(dateStr.trim());
}

/**
 * Converts a Date object to DD/MM/YYYY format
 */
export function formatDateToDDMMYYYY(date: Date): string {
	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear().toString();

	return `${day}/${month}/${year}`;
}

/**
 * Parses DD/MM/YYYY format to Date object
 */
export function parseDDMMYYYY(dateStr: string): Date | null {
	if (!isValidDateFormat(dateStr)) return null;

	const [day, month, year] = dateStr.split("/").map((num) => parseInt(num, 10));
	return new Date(year, month - 1, day);
}

/**
 * Extracts the month name from a date string.
 * Handles DD/MM/YYYY and YYYY-MM-DD formats.
 */
export const getMonthFromDate = (dateString: string): string => {
	if (!dateString) return "";

	// Handle DD/MM/YYYY format
	const parts = dateString.split("/");
	if (parts.length === 3) {
		const monthIndex = Number.parseInt(parts[1] || "0", 10) - 1;
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
		return monthNames[monthIndex] || "";
	}

	// Handle YYYY-MM-DD format
	const date = new Date(dateString);
	if (!Number.isNaN(date.getTime())) {
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

	return "";
};

/**
 * Extracts the year from a date string.
 * Handles DD/MM/YYYY and YYYY-MM-DD formats.
 */
export const getYearFromDate = (dateString: string): string => {
	if (!dateString) return "";

	// Handle DD/MM/YYYY format
	const parts = dateString.split("/");
	if (parts.length === 3) {
		return parts[2] || "";
	}

	// Handle YYYY-MM-DD format
	const date = new Date(dateString);
	if (!Number.isNaN(date.getTime())) {
		return date.getFullYear().toString();
	}

	return "";
};
