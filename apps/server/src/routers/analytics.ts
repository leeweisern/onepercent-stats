import { Hono } from "hono";
import { db } from "../db";
import { leads, advertisingCosts } from "../db/schema/leads";
import { desc, count, sum, eq, sql, and } from "drizzle-orm";

const app = new Hono();

// Helper function to get month name from date string
const getMonthFromDate = (dateString: string): string => {
	if (!dateString) return "";

	// Handle DD/MM/YYYY format (database format)
	const parts = dateString.split("/");
	if (parts.length === 3) {
		const monthIndex = parseInt(parts[1]) - 1; // Month is the second part (0-indexed)
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

	// Handle YYYY-MM-DD format (ISO format)
	const date = new Date(dateString);
	if (!isNaN(date.getTime())) {
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
		return monthNames[date.getMonth()];
	}

	return "";
};

// Helper function to get year from date string
const getYearFromDate = (dateString: string): string => {
	if (!dateString) return "";

	// Handle DD/MM/YYYY format (database format)
	const parts = dateString.split("/");
	if (parts.length === 3) {
		return parts[2]; // Year is the third part
	}

	// Handle YYYY-MM-DD format (ISO format)
	const date = new Date(dateString);
	if (!isNaN(date.getTime())) {
		return date.getFullYear().toString();
	}

	return "";
};

app.get("/leads", async (c) => {
	const month = c.req.query("month");
	const year = c.req.query("year");
	const platform = c.req.query("platform");

	let query = db.select().from(leads);

	const conditions = [];
	if (month) {
		conditions.push(eq(leads.month, month));
	}
	if (year) {
		conditions.push(
			sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND substr(${leads.date}, -4) = ${year}`,
		);
	}
	if (platform) {
		conditions.push(eq(leads.platform, platform));
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const allLeads = await query.orderBy(desc(leads.createdAt));
	return c.json(allLeads);
});

app.get("/leads/summary", async (c) => {
	const totalLeads = await db.select({ value: count() }).from(leads);
	const totalClosed = await db
		.select({ value: count() })
		.from(leads)
		.where(eq(leads.isClosed, true));
	const totalSales = await db.select({ value: sum(leads.sales) }).from(leads);

	return c.json({
		totalLeads: totalLeads[0].value,
		totalClosed: totalClosed[0].value,
		totalSales: totalSales[0].value,
	});
});

app.get("/leads/by-platform", async (c) => {
	const leadsByPlatform = await db
		.select({
			platform: leads.platform,
			count: count(),
		})
		.from(leads)
		.groupBy(leads.platform);

	return c.json(leadsByPlatform);
});

app.get("/leads/platform-breakdown", async (c) => {
	const month = c.req.query("month");
	const year = c.req.query("year");

	let query = db
		.select({
			platform: leads.platform,
			totalLeads: count(),
			closedLeads: count(sql`CASE WHEN ${leads.isClosed} = 1 THEN 1 END`),
			notClosedLeads: count(
				sql`CASE WHEN ${leads.isClosed} = 0 OR ${leads.isClosed} IS NULL THEN 1 END`,
			),
			totalSales: sql<number>`CAST(COALESCE(SUM(CAST(${leads.sales} AS INTEGER)), 0) AS INTEGER)`,
		})
		.from(leads);

	const conditions = [];
	if (month) {
		conditions.push(eq(leads.month, month));
	}
	if (year) {
		conditions.push(
			sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND substr(${leads.date}, -4) = ${year}`,
		);
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const breakdown = await query.groupBy(leads.platform);

	// Calculate totals
	const totals = breakdown.reduce(
		(acc, row) => ({
			totalLeads: acc.totalLeads + (row.totalLeads || 0),
			closedLeads: acc.closedLeads + (row.closedLeads || 0),
			notClosedLeads: acc.notClosedLeads + (row.notClosedLeads || 0),
			totalSales: acc.totalSales + (row.totalSales || 0),
		}),
		{ totalLeads: 0, closedLeads: 0, notClosedLeads: 0, totalSales: 0 },
	);

	return c.json({
		breakdown: breakdown.map((row) => ({
			...row,
			closedLeads: row.closedLeads || 0,
			notClosedLeads: row.notClosedLeads || 0,
			totalSales: row.totalSales || 0,
		})),
		totals,
		month: month || "All months",
		year: year || "All years",
	});
});

app.get("/leads/months", async (c) => {
	const months = await db
		.select({ month: leads.month })
		.from(leads)
		.where(sql`${leads.month} IS NOT NULL AND ${leads.month} != ''`)
		.groupBy(leads.month)
		.orderBy(desc(leads.month));

	return c.json(months.map((m) => m.month).filter(Boolean));
});

app.get("/leads/funnel", async (c) => {
	const month = c.req.query("month");
	const year = c.req.query("year");
	const platform = c.req.query("platform");

	let query = db
		.select({
			status: leads.status,
			platform: leads.platform,
			count: count(),
			totalSales: sql<number>`CAST(COALESCE(SUM(CAST(${leads.sales} AS INTEGER)), 0) AS INTEGER)`,
		})
		.from(leads);

	const conditions = [];
	if (month) {
		conditions.push(eq(leads.month, month));
	}
	if (year) {
		conditions.push(
			sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND substr(${leads.date}, -4) = ${year}`,
		);
	}
	if (platform) {
		conditions.push(eq(leads.platform, platform));
	}

	if (conditions.length > 0) {
		query = query.where(and(...conditions));
	}

	const statusData = await query.groupBy(leads.status, leads.platform);

	// Group by status and aggregate across platforms
	const funnelData = statusData.reduce(
		(acc, row) => {
			const status = row.status || "Unknown";
			if (!acc[status]) {
				acc[status] = {
					status,
					count: 0,
					totalSales: 0,
					platforms: {},
				};
			}
			acc[status].count += row.count;
			acc[status].totalSales += row.totalSales || 0;

			const platformName = row.platform || "Unknown";
			if (!acc[status].platforms[platformName]) {
				acc[status].platforms[platformName] = {
					count: 0,
					totalSales: 0,
				};
			}
			acc[status].platforms[platformName].count += row.count;
			acc[status].platforms[platformName].totalSales += row.totalSales || 0;

			return acc;
		},
		{} as Record<string, any>,
	);

	// Convert to array and sort by typical funnel order
	const statusOrder = ["No reply", "Consulted", "Closed"];
	const sortedFunnel = Object.values(funnelData).sort((a: any, b: any) => {
		const aIndex = statusOrder.indexOf(a.status);
		const bIndex = statusOrder.indexOf(b.status);
		if (aIndex === -1 && bIndex === -1) return a.status.localeCompare(b.status);
		if (aIndex === -1) return 1;
		if (bIndex === -1) return -1;
		return aIndex - bIndex;
	});

	return c.json({
		funnel: sortedFunnel,
		month: month || "All months",
		year: year || "All years",
		platform: platform || "All platforms",
	});
});

app.get("/leads/options", async (c) => {
	const [statusOptions, platformOptions, monthOptions, trainerOptions] =
		await Promise.all([
			db.select({ value: leads.status }).from(leads).groupBy(leads.status),
			db.select({ value: leads.platform }).from(leads).groupBy(leads.platform),
			db
				.select({ value: leads.month })
				.from(leads)
				.where(sql`${leads.month} IS NOT NULL AND ${leads.month} != ''`)
				.groupBy(leads.month),
			db
				.select({ value: leads.trainerHandle })
				.from(leads)
				.groupBy(leads.trainerHandle),
		]);

	return c.json({
		status: statusOptions.map((s) => s.value).filter(Boolean),
		platform: platformOptions.map((p) => p.value).filter(Boolean),
		month: monthOptions.map((m) => m.value).filter(Boolean),
		trainerHandle: trainerOptions.map((t) => t.value).filter(Boolean),
		isClosed: [true, false],
	});
});

app.get("/leads/filter-options", async (c) => {
	const [
		statusOptions,
		platformOptions,
		monthOptions,
		trainerOptions,
		dateOptions,
	] = await Promise.all([
		db.select({ value: leads.status }).from(leads).groupBy(leads.status),
		db.select({ value: leads.platform }).from(leads).groupBy(leads.platform),
		db
			.select({ value: leads.month })
			.from(leads)
			.where(sql`${leads.month} IS NOT NULL AND ${leads.month} != ''`)
			.groupBy(leads.month),
		db
			.select({ value: leads.trainerHandle })
			.from(leads)
			.groupBy(leads.trainerHandle),
		db.select({ value: leads.date }).from(leads).groupBy(leads.date),
	]);

	// Extract unique years from dates
	const years = Array.from(
		new Set(
			dateOptions
				.map((d) => d.value)
				.filter(Boolean)
				.map((date) => getYearFromDate(date))
				.filter(Boolean), // Filter out empty strings
		),
	).sort((a, b) => b.localeCompare(a)); // Sort descending

	return c.json({
		months: monthOptions
			.map((m) => m.value)
			.filter(Boolean)
			.sort(),
		years: years,
		platforms: platformOptions
			.map((p) => p.value)
			.filter(Boolean)
			.sort(),
		statuses: statusOptions
			.map((s) => s.value)
			.filter(Boolean)
			.sort(),
		trainers: trainerOptions
			.map((t) => t.value)
			.filter(Boolean)
			.sort(),
	});
});

app.post("/leads", async (c) => {
	const body = await c.req.json();

	// Validate required fields
	if (!body.name) {
		return c.json({ error: "Name is required" }, 400);
	}

	// Prepare lead data with defaults
	const dateValue = body.date || "";
	const monthValue = body.month || getMonthFromDate(dateValue);
	const salesValue = body.sales || 0;

	// Auto-set closed date based on sales
	let closedDateValue = body.closedDate || "";
	if (salesValue > 0 && !closedDateValue && dateValue) {
		closedDateValue = dateValue; // Set closed date to same as date if sales > 0
	} else if (salesValue === 0) {
		closedDateValue = ""; // Clear closed date if no sales
	}

	const leadData = {
		name: body.name,
		phoneNumber: body.phoneNumber || "",
		platform: body.platform || "",
		status: body.status || "",
		isClosed: body.isClosed || false,
		sales: salesValue,
		date: dateValue,
		month: monthValue,
		followUp: body.followUp || "",
		appointment: body.appointment || "",
		remark: body.remark || "",
		trainerHandle: body.trainerHandle || "",
		closedDate: closedDateValue,
	};

	try {
		const newLead = await db.insert(leads).values(leadData).returning();
		return c.json(newLead[0], 201);
	} catch (error) {
		console.error("Error creating lead:", error);
		return c.json({ error: "Failed to create lead" }, 500);
	}
});

app.put("/leads/:id", async (c) => {
	const id = parseInt(c.req.param("id"));
	const body = await c.req.json();

	const updateData: any = {};

	// Only update fields that are provided
	if (body.name !== undefined) updateData.name = body.name;
	if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
	if (body.platform !== undefined) updateData.platform = body.platform;
	if (body.status !== undefined) updateData.status = body.status;
	if (body.isClosed !== undefined) updateData.isClosed = body.isClosed;
	if (body.sales !== undefined) {
		updateData.sales = body.sales;
		// Auto-update closed date based on sales
		if (body.closedDate === undefined) {
			if (body.sales > 0) {
				// If sales > 0 and no explicit closed date provided, use the lead's date
				const currentLead = await db
					.select()
					.from(leads)
					.where(eq(leads.id, id));
				if (currentLead.length > 0 && currentLead[0].date) {
					updateData.closedDate = currentLead[0].date;
				}
			} else {
				// If sales = 0, clear closed date
				updateData.closedDate = "";
			}
		}
	}
	if (body.date !== undefined) {
		updateData.date = body.date;
		// Auto-update month when date is provided (unless month is explicitly provided)
		if (body.month === undefined && body.date) {
			updateData.month = getMonthFromDate(body.date);
		}
	}
	if (body.month !== undefined) updateData.month = body.month;
	if (body.followUp !== undefined) updateData.followUp = body.followUp;
	if (body.appointment !== undefined) updateData.appointment = body.appointment;
	if (body.remark !== undefined) updateData.remark = body.remark;
	if (body.trainerHandle !== undefined)
		updateData.trainerHandle = body.trainerHandle;
	if (body.closedDate !== undefined) updateData.closedDate = body.closedDate;

	const updatedLead = await db
		.update(leads)
		.set(updateData)
		.where(eq(leads.id, id))
		.returning();

	return c.json(updatedLead[0]);
});

app.delete("/leads/:id", async (c) => {
	const id = parseInt(c.req.param("id"));

	if (isNaN(id)) {
		return c.json({ error: "Invalid lead ID" }, 400);
	}

	try {
		// Check if lead exists first
		const existingLead = await db.select().from(leads).where(eq(leads.id, id));

		if (existingLead.length === 0) {
			return c.json({ error: "Lead not found" }, 404);
		}

		// Delete the lead
		const deletedLead = await db
			.delete(leads)
			.where(eq(leads.id, id))
			.returning();

		return c.json({
			message: "Lead deleted successfully",
			deletedLead: deletedLead[0],
		});
	} catch (error) {
		console.error("Error deleting lead:", error);
		return c.json({ error: "Failed to delete lead" }, 500);
	}
});

// Advertising Costs CRUD endpoints

// GET all advertising costs
app.get("/advertising-costs", async (c) => {
	const costs = await db
		.select()
		.from(advertisingCosts)
		.orderBy(desc(advertisingCosts.year), desc(advertisingCosts.month));
	return c.json(costs);
});

// GET advertising cost by month and year
app.get("/advertising-costs/:year/:month", async (c) => {
	const year = parseInt(c.req.param("year"));
	const month = parseInt(c.req.param("month"));

	if (isNaN(year) || isNaN(month) || month < 1 || month > 12) {
		return c.json({ error: "Invalid year or month" }, 400);
	}

	const cost = await db
		.select()
		.from(advertisingCosts)
		.where(
			and(eq(advertisingCosts.year, year), eq(advertisingCosts.month, month)),
		);

	if (cost.length === 0) {
		return c.json({ error: "Advertising cost not found" }, 404);
	}

	return c.json(cost[0]);
});

// POST create new advertising cost
app.post("/advertising-costs", async (c) => {
	const body = await c.req.json();

	// Validate required fields
	if (!body.month || !body.year || body.cost === undefined) {
		return c.json({ error: "Month, year, and cost are required" }, 400);
	}

	const month = parseInt(body.month);
	const year = parseInt(body.year);
	const cost = parseFloat(body.cost);

	if (isNaN(month) || isNaN(year) || isNaN(cost) || month < 1 || month > 12) {
		return c.json({ error: "Invalid month, year, or cost value" }, 400);
	}

	// Check if entry already exists for this month/year
	const existing = await db
		.select()
		.from(advertisingCosts)
		.where(
			and(eq(advertisingCosts.year, year), eq(advertisingCosts.month, month)),
		);

	if (existing.length > 0) {
		return c.json(
			{ error: "Advertising cost already exists for this month and year" },
			409,
		);
	}

	const costData = {
		month,
		year,
		cost,
		currency: body.currency || "RM",
	};

	try {
		const newCost = await db
			.insert(advertisingCosts)
			.values(costData)
			.returning();
		return c.json(newCost[0], 201);
	} catch (error) {
		console.error("Error creating advertising cost:", error);
		return c.json({ error: "Failed to create advertising cost" }, 500);
	}
});

// PUT update advertising cost
app.put("/advertising-costs/:id", async (c) => {
	const id = parseInt(c.req.param("id"));
	const body = await c.req.json();

	if (isNaN(id)) {
		return c.json({ error: "Invalid advertising cost ID" }, 400);
	}

	const updateData: any = {
		updatedAt: sql`CURRENT_TIMESTAMP`,
	};

	// Only update fields that are provided
	if (body.month !== undefined) {
		const month = parseInt(body.month);
		if (isNaN(month) || month < 1 || month > 12) {
			return c.json({ error: "Invalid month value" }, 400);
		}
		updateData.month = month;
	}
	if (body.year !== undefined) {
		const year = parseInt(body.year);
		if (isNaN(year)) {
			return c.json({ error: "Invalid year value" }, 400);
		}
		updateData.year = year;
	}
	if (body.cost !== undefined) {
		const cost = parseFloat(body.cost);
		if (isNaN(cost)) {
			return c.json({ error: "Invalid cost value" }, 400);
		}
		updateData.cost = cost;
	}
	if (body.currency !== undefined) updateData.currency = body.currency;

	try {
		const updatedCost = await db
			.update(advertisingCosts)
			.set(updateData)
			.where(eq(advertisingCosts.id, id))
			.returning();

		if (updatedCost.length === 0) {
			return c.json({ error: "Advertising cost not found" }, 404);
		}

		return c.json(updatedCost[0]);
	} catch (error) {
		console.error("Error updating advertising cost:", error);
		return c.json({ error: "Failed to update advertising cost" }, 500);
	}
});

// DELETE advertising cost
app.delete("/advertising-costs/:id", async (c) => {
	const id = parseInt(c.req.param("id"));

	if (isNaN(id)) {
		return c.json({ error: "Invalid advertising cost ID" }, 400);
	}

	try {
		// Check if cost exists first
		const existingCost = await db
			.select()
			.from(advertisingCosts)
			.where(eq(advertisingCosts.id, id));

		if (existingCost.length === 0) {
			return c.json({ error: "Advertising cost not found" }, 404);
		}

		// Delete the cost
		const deletedCost = await db
			.delete(advertisingCosts)
			.where(eq(advertisingCosts.id, id))
			.returning();

		return c.json({
			message: "Advertising cost deleted successfully",
			deletedCost: deletedCost[0],
		});
	} catch (error) {
		console.error("Error deleting advertising cost:", error);
		return c.json({ error: "Failed to delete advertising cost" }, 500);
	}
});

// Helper function to convert month name to number
const getMonthNumber = (monthName: string): number => {
	if (!monthName) return 0;

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

	const index = monthNames.indexOf(monthName);
	return index >= 0 ? index + 1 : 0;
};

// ROAS calculation endpoint
app.get("/roas", async (c) => {
	try {
		const month = c.req.query("month");
		const year = c.req.query("year");
		const platform = c.req.query("platform");

		console.log("ROAS request params:", { month, year, platform });

		// Build conditions for leads query
		const leadConditions = [];
		if (month) {
			leadConditions.push(eq(leads.month, month));
		}
		if (year) {
			leadConditions.push(
				sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND substr(${leads.date}, -4) = ${year}`,
			);
		}
		if (platform) {
			leadConditions.push(eq(leads.platform, platform));
		}

		// Get total sales from leads
		let salesQuery = db
			.select({
				totalSales: sql<number>`CAST(COALESCE(SUM(CAST(${leads.sales} AS INTEGER)), 0) AS INTEGER)`,
				totalLeads: count(),
				closedLeads: count(sql`CASE WHEN ${leads.isClosed} = 1 THEN 1 END`),
			})
			.from(leads);

		if (leadConditions.length > 0) {
			salesQuery = salesQuery.where(and(...leadConditions));
		}

		const salesResult = await salesQuery;
		const totalSales = salesResult[0]?.totalSales || 0;
		const totalLeads = salesResult[0]?.totalLeads || 0;
		const closedLeads = salesResult[0]?.closedLeads || 0;

		console.log("Sales query result:", { totalSales, totalLeads, closedLeads });

		// Get advertising costs
		let totalAdCost = 0;
		if (month && year) {
			// Specific month and year
			const monthNumber = getMonthNumber(month);
			const yearNumber = parseInt(year);

			if (monthNumber > 0) {
				// Validate month number
				const costResult = await db
					.select({ cost: advertisingCosts.cost })
					.from(advertisingCosts)
					.where(
						and(
							eq(advertisingCosts.month, monthNumber),
							eq(advertisingCosts.year, yearNumber),
						),
					);

				totalAdCost = Number(costResult[0]?.cost) || 0;
			}
		} else if (year) {
			// All months in a specific year
			const yearNumber = parseInt(year);
			const costResult = await db
				.select({ totalCost: sum(advertisingCosts.cost) })
				.from(advertisingCosts)
				.where(eq(advertisingCosts.year, yearNumber));

			totalAdCost = Number(costResult[0]?.totalCost) || 0;
		} else if (month) {
			// Specific month across all years
			const monthNumber = getMonthNumber(month);
			if (monthNumber > 0) {
				// Validate month number
				const costResult = await db
					.select({ totalCost: sum(advertisingCosts.cost) })
					.from(advertisingCosts)
					.where(eq(advertisingCosts.month, monthNumber));

				totalAdCost = Number(costResult[0]?.totalCost) || 0;
			}
		} else {
			// All time
			const costResult = await db
				.select({ totalCost: sum(advertisingCosts.cost) })
				.from(advertisingCosts);

			totalAdCost = Number(costResult[0]?.totalCost) || 0;
		}

		console.log("Final totals:", {
			totalSales,
			totalAdCost,
			totalLeads,
			closedLeads,
		});

		// Calculate ROAS
		const roas = totalAdCost > 0 ? totalSales / totalAdCost : 0;
		const costPerLead = totalLeads > 0 ? totalAdCost / totalLeads : 0;
		const costPerAcquisition = closedLeads > 0 ? totalAdCost / closedLeads : 0;
		const conversionRate =
			totalLeads > 0 ? (closedLeads / totalLeads) * 100 : 0;

		return c.json({
			roas: Number(roas.toFixed(2)),
			totalSales,
			totalAdCost: Number(totalAdCost.toFixed(2)),
			totalLeads,
			closedLeads,
			costPerLead: Number(costPerLead.toFixed(2)),
			costPerAcquisition: Number(costPerAcquisition.toFixed(2)),
			conversionRate: Number(conversionRate.toFixed(2)),
			period: {
				month: month || "All months",
				year: year || "All years",
				platform: platform || "All platforms",
			},
		});
	} catch (error) {
		console.error("Error calculating ROAS:", error);
		console.error("Error details:", error.message, error.stack);
		return c.json(
			{ error: "Failed to calculate ROAS", details: error.message },
			500,
		);
	}
});

// Growth data endpoints
app.get("/leads/growth/monthly", async (c) => {
	try {
		const year = c.req.query("year");

		// Get monthly data for leads and sales
		let query = db
			.select({
				month: leads.month,
				date: leads.date,
				totalLeads: count(),
				closedLeads: count(sql`CASE WHEN ${leads.isClosed} = 1 THEN 1 END`),
				totalSales: sql<number>`CAST(COALESCE(SUM(CAST(${leads.sales} AS INTEGER)), 0) AS INTEGER)`,
			})
			.from(leads)
			.where(sql`${leads.month} IS NOT NULL AND ${leads.month} != ''`);

		if (year) {
			query = query.where(
				sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND substr(${leads.date}, -4) = ${year}`,
			);
		}

		const monthlyData = await query.groupBy(leads.month);

		// Sort by month order
		const monthOrder = [
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

		const sortedData = monthlyData.sort((a, b) => {
			const aIndex = monthOrder.indexOf(a.month || "");
			const bIndex = monthOrder.indexOf(b.month || "");
			return aIndex - bIndex;
		});

		return c.json({
			data: sortedData.map((item) => ({
				month: item.month,
				totalLeads: item.totalLeads || 0,
				closedLeads: item.closedLeads || 0,
				totalSales: item.totalSales || 0,
			})),
			year: year || "All years",
		});
	} catch (error) {
		console.error("Error fetching monthly growth data:", error);
		return c.json({ error: "Failed to fetch monthly growth data" }, 500);
	}
});

app.get("/leads/growth/yearly", async (c) => {
	try {
		// Get all leads with dates
		const allLeads = await db
			.select({
				date: leads.date,
				isClosed: leads.isClosed,
				sales: leads.sales,
			})
			.from(leads)
			.where(sql`${leads.date} IS NOT NULL AND ${leads.date} != ''`);

		// Group by year
		const yearlyData: Record<
			string,
			{ totalLeads: number; closedLeads: number; totalSales: number }
		> = {};

		for (const lead of allLeads) {
			const year = getYearFromDate(lead.date || "");
			if (!year) continue;

			if (!yearlyData[year]) {
				yearlyData[year] = { totalLeads: 0, closedLeads: 0, totalSales: 0 };
			}

			yearlyData[year].totalLeads++;
			if (lead.isClosed) {
				yearlyData[year].closedLeads++;
			}
			yearlyData[year].totalSales += Number(lead.sales) || 0;
		}

		// Convert to array and sort by year
		const sortedData = Object.entries(yearlyData)
			.map(([year, data]) => ({
				year,
				...data,
			}))
			.sort((a, b) => a.year.localeCompare(b.year));

		return c.json({
			data: sortedData,
		});
	} catch (error) {
		console.error("Error fetching yearly growth data:", error);
		return c.json({ error: "Failed to fetch yearly growth data" }, 500);
	}
});

export default app;
