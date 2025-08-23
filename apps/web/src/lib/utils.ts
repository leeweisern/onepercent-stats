import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}

export function getPageNumbers(currentPage: number, totalPages: number) {
	const delta = 2;
	const range = [];
	const rangeWithDots = [];

	// Calculate range
	for (
		let i = Math.max(2, currentPage - delta);
		i <= Math.min(totalPages - 1, currentPage + delta);
		i++
	) {
		range.push(i);
	}

	// Add first page
	if (currentPage - delta > 2) {
		rangeWithDots.push(1, "...");
	} else {
		rangeWithDots.push(1);
	}

	// Add middle range
	rangeWithDots.push(...range);

	// Add last page
	if (currentPage + delta < totalPages - 1) {
		rangeWithDots.push("...", totalPages);
	} else if (totalPages > 1) {
		rangeWithDots.push(totalPages);
	}

	return rangeWithDots;
}
