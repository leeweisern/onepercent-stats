import { Hono } from "hono";
import { db } from "../db";
import { leads } from "../db/schema/leads";
import { desc, count, sum, eq } from "drizzle-orm";

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
			count: count(leads.platform),
		})
		.from(leads)
		.groupBy(leads.platform);

	return c.json(leadsByPlatform);
});

export default app;
