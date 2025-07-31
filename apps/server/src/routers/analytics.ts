import { Hono } from "hono";
import { db } from "../db";
import { leads } from "../db/schema/leads";
import { desc, count, sum, eq, sql } from "drizzle-orm";

const app = new Hono();

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
		query = query.where(eq(leads.month, month));
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
		.select({ month: leads.month })
		.from(leads)
		.groupBy(leads.month)
		.orderBy(desc(leads.month));

	return c.json(months.map((m) => m.month).filter(Boolean));
});

export default app;
