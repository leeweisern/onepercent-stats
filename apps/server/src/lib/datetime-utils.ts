/**
 * GMT+8 Timezone-aware datetime utilities for Malaysian business operations
 * All datetime functions in this file operate in the Malaysia timezone (GMT+8)
 */

// Core timezone constants
export const MY_TIMEZONE = "Asia/Kuala_Lumpur";
export const MY_OFFSET = "+08:00";
export const MY_OFFSET_MS = 8 * 60 * 60 * 1000; // 8 hours in milliseconds

/**
 * Returns the current datetime in Malaysia timezone as ISO 8601 string with GMT+8 offset
 * Format: YYYY-MM-DDTHH:mm:ss+08:00
 */
export function nowMYISO(): string {
	const now = new Date();
	const myTime = new Date(now.getTime() + MY_OFFSET_MS);
	const isoString = myTime.toISOString().slice(0, -1); // Remove 'Z'
	return `${isoString}${MY_OFFSET}`;
}

/**
 * Converts a Date object to Malaysia timezone ISO 8601 string
 * @param date - JavaScript Date object
 * @returns ISO string with GMT+8 offset (YYYY-MM-DDTHH:mm:ss+08:00)
 */
export function toMYISO(date: Date): string {
	const myTime = new Date(date.getTime() + MY_OFFSET_MS);
	const isoString = myTime.toISOString().slice(0, -1); // Remove 'Z'
	return `${isoString}${MY_OFFSET}`;
}

/**
 * Parses a DD/MM/YYYY string to Malaysia timezone ISO 8601 string
 * @param ddmmyyyy - Date string in DD/MM/YYYY format
 * @param hour - Hour (0-23) in Malaysian time, defaults to 9 (business hours start)
 * @param minute - Minute (0-59), defaults to 0
 * @returns ISO string with GMT+8 offset
 */
export function parseDDMMYYYYToMYISO(ddmmyyyy: string, hour = 9, minute = 0): string | null {
	if (!ddmmyyyy || typeof ddmmyyyy !== "string") return null;

	const parts = ddmmyyyy.split("/");
	if (parts.length !== 3) return null;

	const [day, month, year] = parts.map((n) => parseInt(n, 10));
	if (!day || !month || !year) return null;

	// Validate date components
	if (day < 1 || day > 31) return null;
	if (month < 1 || month > 12) return null;
	if (year < 1900 || year > 2100) return null;

	// Create date in UTC, then adjust for Malaysia timezone
	const utcDate = new Date(Date.UTC(year, month - 1, day, hour - 8, minute, 0, 0));
	return toMYISO(utcDate);
}

/**
 * Converts ISO string (any timezone) to Malaysia timezone ISO string
 * @param isoString - ISO 8601 datetime string
 * @returns ISO string with GMT+8 offset
 */
export function convertToMYISO(isoString: string): string | null {
	if (!isoString) return null;

	try {
		const date = new Date(isoString);
		if (Number.isNaN(date.getTime())) return null;
		return toMYISO(date);
	} catch {
		return null;
	}
}

/**
 * Adds days to a Malaysia timezone ISO string
 * @param isoString - ISO string with GMT+8 offset
 * @param days - Number of days to add (can be negative)
 * @returns New ISO string with GMT+8 offset
 */
export function addDaysMY(isoString: string, days: number): string {
	const date = new Date(isoString);
	date.setDate(date.getDate() + days);
	return toMYISO(date);
}

/**
 * Adds business days (Mon-Fri) to a Malaysia timezone ISO string
 * @param isoString - ISO string with GMT+8 offset
 * @param businessDays - Number of business days to add
 * @returns New ISO string with GMT+8 offset
 */
export function addBusinessDaysMY(isoString: string, businessDays: number): string {
	const date = new Date(isoString);
	let daysAdded = 0;

	while (daysAdded < businessDays) {
		date.setDate(date.getDate() + 1);
		const dayOfWeek = date.getDay();
		// Skip weekends (0 = Sunday, 6 = Saturday)
		if (dayOfWeek !== 0 && dayOfWeek !== 6) {
			daysAdded++;
		}
	}

	return toMYISO(date);
}

/**
 * Compares two ISO datetime strings
 * @param a - First ISO datetime string
 * @param b - Second ISO datetime string
 * @returns -1 if a < b, 0 if a === b, 1 if a > b
 */
export function compareISOStrings(a: string, b: string): -1 | 0 | 1 {
	const dateA = new Date(a);
	const dateB = new Date(b);

	const timeA = dateA.getTime();
	const timeB = dateB.getTime();

	if (timeA < timeB) return -1;
	if (timeA > timeB) return 1;
	return 0;
}

/**
 * Calculates days between two ISO datetime strings
 * @param from - Start ISO datetime string
 * @param to - End ISO datetime string
 * @returns Number of days (positive if to > from)
 */
export function daysBetweenISO(from: string, to: string): number {
	const fromDate = new Date(from);
	const toDate = new Date(to);

	const diffMs = toDate.getTime() - fromDate.getTime();
	return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/**
 * Formats a Malaysia timezone ISO string for display
 * @param isoString - ISO string with GMT+8 offset
 * @returns Formatted string "DD/MM/YYYY HH:mm"
 */
export function formatMYISOForDisplay(isoString: string): string {
	const date = new Date(isoString);

	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();
	const hours = date.getHours().toString().padStart(2, "0");
	const minutes = date.getMinutes().toString().padStart(2, "0");

	return `${day}/${month}/${year} ${hours}:${minutes}`;
}

/**
 * Extracts just the date portion in DD/MM/YYYY format from ISO string
 * @param isoString - ISO datetime string
 * @returns Date string in DD/MM/YYYY format
 */
export function extractDateFromISO(isoString: string): string {
	const date = new Date(isoString);

	const day = date.getDate().toString().padStart(2, "0");
	const month = (date.getMonth() + 1).toString().padStart(2, "0");
	const year = date.getFullYear();

	return `${day}/${month}/${year}`;
}

/**
 * Gets month name from ISO datetime string
 * @param isoString - ISO datetime string
 * @returns Month name (e.g., "January", "February")
 */
export function getMonthFromISO(isoString: string): string {
	const date = new Date(isoString);
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
 * Gets year from ISO datetime string
 * @param isoString - ISO datetime string
 * @returns Year as string
 */
export function getYearFromISO(isoString: string): string {
	const date = new Date(isoString);
	return date.getFullYear().toString();
}

/**
 * Checks if an ISO string represents today in Malaysia timezone
 * @param isoString - ISO datetime string
 * @returns True if the date is today in Malaysia
 */
export function isTodayMY(isoString: string): boolean {
	const inputDate = new Date(isoString);
	const nowMY = new Date(nowMYISO());

	return (
		inputDate.getFullYear() === nowMY.getFullYear() &&
		inputDate.getMonth() === nowMY.getMonth() &&
		inputDate.getDate() === nowMY.getDate()
	);
}

/**
 * Checks if an ISO string is in the past (Malaysia timezone)
 * @param isoString - ISO datetime string
 * @returns True if the datetime is in the past
 */
export function isPastMY(isoString: string): boolean {
	return compareISOStrings(isoString, nowMYISO()) === -1;
}

/**
 * Migration helper: Converts DD/MM/YYYY to ISO with GMT+8
 * Handles various edge cases for data migration
 * @param ddmmyyyy - Date string in DD/MM/YYYY format
 * @param defaultHour - Default hour if creating new datetime
 * @returns ISO string with GMT+8 offset or null if invalid
 */
export function migrateDDMMYYYYToISO(
	ddmmyyyy: string | null | undefined,
	defaultHour = 9,
): string | null {
	if (!ddmmyyyy || typeof ddmmyyyy !== "string") return null;

	// Clean up the input
	const cleaned = ddmmyyyy.trim();
	if (!cleaned) return null;

	// Check if already in ISO format
	if (cleaned.includes("T")) {
		return convertToMYISO(cleaned);
	}

	// Parse DD/MM/YYYY format
	return parseDDMMYYYYToMYISO(cleaned, defaultHour);
}

/**
 * Migration helper: Batch converts date fields to ISO format
 * @param record - Object with date fields
 * @param dateFields - Array of field names to convert
 * @returns Object with converted date fields
 */
export function migrateDateFields<T extends Record<string, any>>(
	record: T,
	dateFields: string[],
): T {
	const converted = { ...record } as any;

	for (const field of dateFields) {
		if (field in converted) {
			const value = converted[field];
			if (value && typeof value === "string") {
				// Determine default time based on field name
				let defaultHour = 9; // Default business start
				if (field.includes("closed") || field.includes("end")) {
					defaultHour = 18; // Business end for closed dates
				}

				converted[field] = migrateDDMMYYYYToISO(value, defaultHour) || null;
			}
		}
	}

	return converted as T;
}

// Re-export compatible functions from date-utils.ts for backward compatibility
export { isValidDateFormat, standardizeDate } from "./date-utils";
