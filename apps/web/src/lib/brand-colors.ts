/**
 * One Percent Fitness Brand Colors
 *
 * Primary brand colors for consistent theming across the application.
 * These colors are also defined as CSS variables in index.css.
 */

export const BRAND_COLORS = {
	// Primary brand red
	PRIMARY_RED: "#e41e26",

	// Black
	BLACK: "#000000",

	// White (for contrast)
	WHITE: "#ffffff",

	// Variants for different use cases
	RED_HOVER: "#cc1a22", // Darker red for hover states
	RED_LIGHT: "#f2424a", // Lighter red for backgrounds
	RED_DISABLED: "#e41e2680", // Semi-transparent red for disabled states

	// Gray scales that work with the red/black theme
	GRAY_50: "#fafafa",
	GRAY_100: "#f5f5f5",
	GRAY_200: "#e5e5e5",
	GRAY_300: "#d4d4d4",
	GRAY_400: "#a3a3a3",
	GRAY_500: "#737373",
	GRAY_600: "#525252",
	GRAY_700: "#404040",
	GRAY_800: "#262626",
	GRAY_900: "#171717",
} as const;

/**
 * Chart colors using brand theme
 */
export const CHART_COLORS = {
	PRIMARY: BRAND_COLORS.PRIMARY_RED,
	SECONDARY: BRAND_COLORS.GRAY_700,
	TERTIARY: BRAND_COLORS.RED_LIGHT,
	QUATERNARY: BRAND_COLORS.GRAY_500,
	QUINARY: BRAND_COLORS.RED_HOVER,
} as const;

/**
 * Status colors that align with brand theme
 */
export const STATUS_COLORS = {
	SUCCESS: BRAND_COLORS.PRIMARY_RED, // Use brand red for success
	ERROR: BRAND_COLORS.PRIMARY_RED, // Use brand red for errors
	WARNING: "#f59e0b", // Orange for warnings
	INFO: BRAND_COLORS.GRAY_600, // Dark gray for info
} as const;
