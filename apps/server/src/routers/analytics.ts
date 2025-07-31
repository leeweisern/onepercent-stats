import { Hono } from "hono";
import { db } from "../db";
import { leads } from "../db/schema/leads";
import { desc, count, sum, eq, sql } from "drizzle-orm";

const app = new Hono();

// Helper function to extract YYYY-MM from MM/DD/YYYY format (database stores MM/DD/YYYY)
const extractYearMonth = (dateField: any) => sql<string>`
  CASE 
    WHEN instr(${dateField}, '/') > 0 THEN
      substr(${dateField}, -4) || '-' || printf('%02d', 
        CAST(substr(${dateField}, 1, instr(${dateField}, '/') - 1) AS INTEGER)
      )
    ELSE '1900-01'
  END
`;

app.get("/leads", async (c) => {
	const allLeads = await db.select().from(leads).orderBy(desc(leads.createdAt));
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

	if (month) {
		query = query.where(sql`${extractYearMonth(leads.date)} = ${month}`);
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
	});
});

app.get("/leads/months", async (c) => {
	const months = await db
		.select({ month: extractYearMonth(leads.date) })
		.from(leads)
		.where(
			sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND instr(${leads.date}, '/') > 0`,
		)
		.groupBy(extractYearMonth(leads.date))
		.orderBy(desc(extractYearMonth(leads.date)));

	return c.json(months.map((m) => m.month).filter(Boolean));
});

app.get("/leads/funnel", async (c) => {
	const month = c.req.query("month");
	const platform = c.req.query("platform");

	let query = db
		.select({
			status: leads.status,
			platform: leads.platform,
			count: count(),
			totalSales: sql<number>`CAST(COALESCE(SUM(CAST(${leads.sales} AS INTEGER)), 0) AS INTEGER)`,
		})
		.from(leads);

	if (month) {
		query = query.where(sql`${extractYearMonth(leads.date)} = ${month}`);
	}

	if (platform) {
		query = query.where(eq(leads.platform, platform));
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
		platform: platform || "All platforms",
	});
});

app.get("/leads/options", async (c) => {
	const [statusOptions, platformOptions, monthOptions, trainerOptions] =
		await Promise.all([
			db.select({ value: leads.status }).from(leads).groupBy(leads.status),
			db.select({ value: leads.platform }).from(leads).groupBy(leads.platform),
			db
				.select({ value: extractYearMonth(leads.date) })
				.from(leads)
				.where(
					sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND instr(${leads.date}, '/') > 0`,
				)
				.groupBy(extractYearMonth(leads.date)),
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
			.select({ value: extractYearMonth(leads.date) })
			.from(leads)
			.where(
				sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND instr(${leads.date}, '/') > 0`,
			)
			.groupBy(extractYearMonth(leads.date)),
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
				.map((date) => new Date(date).getFullYear().toString()),
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
	const leadData = {
		name: body.name,
		phoneNumber: body.phoneNumber || "",
		platform: body.platform || "",
		status: body.status || "",
		isClosed: body.isClosed || false,
		sales: body.sales || 0,
		date: body.date || "",
		followUp: body.followUp || "",
		appointment: body.appointment || "",
		remark: body.remark || "",
		trainerHandle: body.trainerHandle || "",
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
	if (body.sales !== undefined) updateData.sales = body.sales;
	if (body.date !== undefined) updateData.date = body.date;
	if (body.followUp !== undefined) updateData.followUp = body.followUp;
	if (body.appointment !== undefined) updateData.appointment = body.appointment;
	if (body.remark !== undefined) updateData.remark = body.remark;
	if (body.trainerHandle !== undefined)
		updateData.trainerHandle = body.trainerHandle;

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

export default app;
