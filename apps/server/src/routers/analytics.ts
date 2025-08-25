import { and, count, desc, eq, sql, sum } from "drizzle-orm";
import { Hono } from "hono";
import { db } from "../db";
import { advertisingCosts, leads } from "../db/schema/leads";
import { platforms } from "../db/schema/platforms";
import { trainers } from "../db/schema/trainers";
import { getYearFromDate, standardizeDate } from "../lib/date-utils";
import {
	addBusinessDaysMY,
	addDaysMY,
	getMonthFromISO,
	getYearFromISO,
	nowMYISO,
	parseDDMMYYYYToMYISO,
} from "../lib/datetime-utils";
import { LEAD_STATUSES, normalizeStatus } from "../lib/status";
import { recordStatusChange } from "../lib/status-history";
import { runStatusMaintenance } from "../lib/status-maintenance";

const app = new Hono();

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
		// Handle both DD/MM/YYYY and ISO format
		conditions.push(
			sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND 
				(substr(${leads.date}, -4) = ${year} OR substr(${leads.date}, 1, 4) = ${year})`,
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
	try {
		// Run status maintenance with config from environment
		const followUpDays = Number((c.env as any)?.FOLLOW_UP_DAYS || 3);
		await runStatusMaintenance(db, { followUpDays });

		const dateType = c.req.query("dateType") || "lead";
		const month = c.req.query("month");
		const year = c.req.query("year");
		const platform = c.req.query("platform");

		// Build conditions based on dateType
		const conditions = [];
		if (dateType === "closed") {
			if (month) conditions.push(eq(leads.closedMonth, month));
			if (year) conditions.push(eq(leads.closedYear, year));
		} else {
			if (month) conditions.push(eq(leads.month, month));
			if (year) {
				// Handle both DD/MM/YYYY and ISO format
				conditions.push(
					sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND 
						(substr(${leads.date}, -4) = ${year} OR substr(${leads.date}, 1, 4) = ${year})`,
				);
			}
		}
		if (platform) conditions.push(eq(leads.platform, platform));

		let query = db.select().from(leads);
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		const allLeads = await query;

		// Calculate metrics using normalized statuses
		const totalLeads = allLeads.length;
		const totalConsults = allLeads.filter(
			(lead) => normalizeStatus(lead.status) === "Consulted",
		).length;
		const totalClosed = allLeads.filter(
			(lead) => normalizeStatus(lead.status) === "Closed Won",
		).length;
		const totalSales = allLeads.reduce((sum, lead) => sum + (Number(lead.sales) || 0), 0);

		return c.json({
			totalLeads,
			totalConsults,
			totalClosed,
			totalSales,
			period: {
				dateType,
				month: month || "All months",
				year: year || "All years",
				platform: platform || "All platforms",
			},
		});
	} catch (error) {
		console.error("Error in leads summary:", error);
		return c.json({ error: "Failed to fetch leads summary" }, 500);
	}
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
	try {
		// Run status maintenance with config from environment
		const followUpDays = Number((c.env as any)?.FOLLOW_UP_DAYS || 3);
		await runStatusMaintenance(db, { followUpDays });

		const dateType = c.req.query("dateType") || "lead";
		const month = c.req.query("month");
		const year = c.req.query("year");
		const platform = c.req.query("platform");

		// Build conditions based on dateType
		const conditions = [];
		if (dateType === "closed") {
			if (month) conditions.push(eq(leads.closedMonth, month));
			if (year) conditions.push(eq(leads.closedYear, year));
		} else {
			if (month) conditions.push(eq(leads.month, month));
			if (year) {
				// Handle both DD/MM/YYYY and ISO format
				conditions.push(
					sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND 
						(substr(${leads.date}, -4) = ${year} OR substr(${leads.date}, 1, 4) = ${year})`,
				);
			}
		}
		if (platform) conditions.push(eq(leads.platform, platform));

		let query = db.select().from(leads);
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		const allLeads = await query;

		// Group by platform and calculate metrics using normalized statuses
		const platformData: Record<string, any> = {};

		for (const lead of allLeads) {
			const platformName = lead.platform || "Unknown";
			const normalizedStatus = normalizeStatus(lead.status);

			if (!platformData[platformName]) {
				platformData[platformName] = {
					platform: platformName,
					totalLeads: 0,
					closedWonLeads: 0,
					closedLostLeads: 0,
					totalSales: 0,
				};
			}

			platformData[platformName].totalLeads++;
			platformData[platformName].totalSales += Number(lead.sales) || 0;

			if (normalizedStatus === "Closed Won") {
				platformData[platformName].closedWonLeads++;
			} else if (normalizedStatus === "Closed Lost") {
				platformData[platformName].closedLostLeads++;
			}
		}

		const breakdown = Object.values(platformData);

		// Calculate totals
		const totals = breakdown.reduce(
			(acc, row: any) => ({
				totalLeads: acc.totalLeads + row.totalLeads,
				closedWonLeads: acc.closedWonLeads + row.closedWonLeads,
				closedLostLeads: acc.closedLostLeads + row.closedLostLeads,
				totalSales: acc.totalSales + row.totalSales,
			}),
			{ totalLeads: 0, closedWonLeads: 0, closedLostLeads: 0, totalSales: 0 },
		);

		return c.json({
			breakdown,
			totals,
			period: {
				dateType,
				month: month || "All months",
				year: year || "All years",
				platform: platform || "All platforms",
			},
		});
	} catch (error) {
		console.error("Error in platform breakdown:", error);
		return c.json({ error: "Failed to fetch platform breakdown" }, 500);
	}
});

app.get("/leads/months", async (c) => {
	try {
		const dateType = c.req.query("dateType") || "lead";

		let months;
		if (dateType === "closed") {
			months = await db
				.select({ month: leads.closedMonth })
				.from(leads)
				.where(
					and(
						sql`${leads.closedMonth} IS NOT NULL AND ${leads.closedMonth} != ''`,
						eq(leads.status, "Closed Won"),
					),
				)
				.groupBy(leads.closedMonth)
				.orderBy(desc(leads.closedMonth));
		} else {
			months = await db
				.select({ month: leads.month })
				.from(leads)
				.where(sql`${leads.month} IS NOT NULL AND ${leads.month} != ''`)
				.groupBy(leads.month)
				.orderBy(desc(leads.month));
		}

		return c.json({
			months: months.map((m) => m.month).filter(Boolean),
			dateType,
		});
	} catch (error) {
		console.error("Error fetching months:", error);
		return c.json({ error: "Failed to fetch months" }, 500);
	}
});

app.get("/leads/funnel/v2", async (c) => {
	try {
		// Run status maintenance with config from environment
		const followUpDays = Number((c.env as any)?.FOLLOW_UP_DAYS || 3);
		await runStatusMaintenance(db, { followUpDays });

		const dateType = c.req.query("dateType") || "stage";
		const month = c.req.query("month");
		const year = c.req.query("year");
		const platform = c.req.query("platform");
		const _mode = c.req.query("mode") || "cumulative_to_date";

		// Import lead status history table
		const { leadStatusHistory } = await import("../db/schema/lead-status-history");

		// Build the base query for leads with platform filter
		let leadsQuery = db.select().from(leads);
		const leadsConditions = [];

		if (platform) {
			leadsConditions.push(eq(leads.platform, platform));
		}

		// Apply date filters based on dateType
		if (dateType === "lead") {
			// Filter by lead creation date
			if (month) leadsConditions.push(eq(leads.month, month));
			if (year) {
				leadsConditions.push(
					sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND 
						(substr(${leads.date}, -4) = ${year} OR substr(${leads.date}, 1, 4) = ${year})`,
				);
			}
		} else if (dateType === "closed") {
			// Filter by closed date
			if (month) leadsConditions.push(eq(leads.closedMonth, month));
			if (year) leadsConditions.push(eq(leads.closedYear, year));
		}

		if (leadsConditions.length > 0) {
			leadsQuery = leadsQuery.where(and(...leadsConditions));
		}

		const filteredLeads = await leadsQuery;
		const leadIds = filteredLeads.map((l) => l.id);

		if (leadIds.length === 0) {
			return c.json({
				funnel: LEAD_STATUSES.map((status) => ({
					stage: status,
					reachedCount: 0,
					currentCount: 0,
					totalSales: 0,
					conversionFromPrevious: 0,
				})),
				period: {
					dateType,
					month: month || "All months",
					year: year || "All years",
					platform: platform || "All platforms",
				},
			});
		}

		// Get status history for filtered leads (batched to avoid SQLite var limit)
		// Use smaller batch size to account for additional filter parameters
		const batchSize = 90;
		const history: Array<{ leadId: number; toStatus: string; changedAt: string }> = [];

		for (let i = 0; i < leadIds.length; i += batchSize) {
			const batch = leadIds.slice(i, i + batchSize);

			// Build conditions for this batch
			const batchConditions = [sql`${leadStatusHistory.leadId} IN (${sql.join(batch, sql`, `)})`];

			// Add stage date filter if applicable
			if (dateType === "stage" && (month || year)) {
				if (month && year) {
					const monthNum = new Date(Date.parse(`${month} 1, 2000`)).getMonth() + 1;
					const mm = monthNum.toString().padStart(2, "0");
					batchConditions.push(sql`strftime('%m', ${leadStatusHistory.changedAt}) = ${mm}`);
					batchConditions.push(sql`strftime('%Y', ${leadStatusHistory.changedAt}) = ${year}`);
				} else if (year) {
					batchConditions.push(sql`strftime('%Y', ${leadStatusHistory.changedAt}) = ${year}`);
				}
			}

			const rows = await db
				.select({
					leadId: leadStatusHistory.leadId,
					toStatus: leadStatusHistory.toStatus,
					changedAt: leadStatusHistory.changedAt,
				})
				.from(leadStatusHistory)
				.where(and(...batchConditions));

			history.push(...rows);
		}

		// Calculate reached counts for each stage
		const stageReached = new Map<string, Set<number>>();
		const currentStatus = new Map<number, string>();

		// Initialize all stages
		for (const status of LEAD_STATUSES) {
			stageReached.set(status, new Set());
		}

		// Process history to find leads that reached each stage
		for (const record of history) {
			const normalizedStatus = normalizeStatus(record.toStatus);
			if (!stageReached.has(normalizedStatus)) {
				stageReached.set(normalizedStatus, new Set());
			}
			stageReached.get(normalizedStatus)?.add(record.leadId);
		}

		// Also count current status for comparison
		for (const lead of filteredLeads) {
			const normalizedStatus = normalizeStatus(lead.status);
			currentStatus.set(lead.id, normalizedStatus);

			// Ensure current status is counted in reached
			if (!stageReached.has(normalizedStatus)) {
				stageReached.set(normalizedStatus, new Set());
			}
			stageReached.get(normalizedStatus)?.add(lead.id);
		}

		// Calculate sales for Closed Won leads
		let totalClosedWonSales = 0;
		const closedWonLeads = stageReached.get("Closed Won") || new Set();
		for (const leadId of closedWonLeads) {
			const lead = filteredLeads.find((l) => l.id === leadId);
			if (lead) {
				totalClosedWonSales += Number(lead.sales) || 0;
			}
		}

		// Build funnel data with conversion rates
		const funnelData = [];
		let previousCount = leadIds.length; // Total leads as base

		for (let i = 0; i < LEAD_STATUSES.length; i++) {
			const status = LEAD_STATUSES[i];
			const reachedSet = stageReached.get(status) || new Set();
			const reachedCount = reachedSet.size;

			// Count current status
			let currentCount = 0;
			for (const [_leadId, curStatus] of currentStatus) {
				if (curStatus === status) {
					currentCount++;
				}
			}

			// Calculate conversion from previous stage
			let conversionFromPrevious = 0;
			if (i === 0) {
				// First stage (New) - everyone starts here
				conversionFromPrevious = 100;
			} else if (previousCount > 0) {
				conversionFromPrevious = Math.round((reachedCount / previousCount) * 100);
			}

			funnelData.push({
				stage: status,
				reachedCount,
				currentCount,
				totalSales: status === "Closed Won" ? totalClosedWonSales : 0,
				conversionFromPrevious,
			});

			// For cumulative funnel, use reached count as previous for next stage
			previousCount = reachedCount;
		}

		return c.json({
			funnel: funnelData,
			period: {
				dateType,
				month: month || "All months",
				year: year || "All years",
				platform: platform || "All platforms",
			},
		});
	} catch (error) {
		console.error("Error in funnel v2 analysis:", error);
		return c.json({ error: "Failed to fetch funnel v2 data" }, 500);
	}
});

app.get("/leads/funnel", async (c) => {
	try {
		// Run status maintenance with config from environment
		const followUpDays = Number((c.env as any)?.FOLLOW_UP_DAYS || 3);
		await runStatusMaintenance(db, { followUpDays });

		const dateType = c.req.query("dateType") || "lead";
		const month = c.req.query("month");
		const year = c.req.query("year");
		const platform = c.req.query("platform");

		// Build conditions based on dateType
		const conditions = [];
		if (dateType === "closed") {
			if (month) conditions.push(eq(leads.closedMonth, month));
			if (year) conditions.push(eq(leads.closedYear, year));
		} else {
			if (month) conditions.push(eq(leads.month, month));
			if (year) {
				// Handle both DD/MM/YYYY and ISO format
				conditions.push(
					sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND 
						(substr(${leads.date}, -4) = ${year} OR substr(${leads.date}, 1, 4) = ${year})`,
				);
			}
		}
		if (platform) conditions.push(eq(leads.platform, platform));

		let query = db.select().from(leads);
		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		const allLeads = await query;

		// Group by normalized status and platform
		const funnelData: Record<string, any> = {};

		for (const lead of allLeads) {
			const normalizedStatus = normalizeStatus(lead.status);
			const platformName = lead.platform || "Unknown";

			if (!funnelData[normalizedStatus]) {
				funnelData[normalizedStatus] = {
					status: normalizedStatus,
					count: 0,
					totalSales: 0,
					platforms: {},
				};
			}

			if (!funnelData[normalizedStatus].platforms[platformName]) {
				funnelData[normalizedStatus].platforms[platformName] = {
					count: 0,
					totalSales: 0,
				};
			}

			funnelData[normalizedStatus].count++;
			funnelData[normalizedStatus].totalSales += Number(lead.sales) || 0;
			funnelData[normalizedStatus].platforms[platformName].count++;
			funnelData[normalizedStatus].platforms[platformName].totalSales += Number(lead.sales) || 0;
		}

		// Sort funnel data by canonical status order
		const sortedFunnel = LEAD_STATUSES.filter((status) => funnelData[status]).map(
			(status) => funnelData[status],
		);

		return c.json({
			funnel: sortedFunnel,
			period: {
				dateType,
				month: month || "All months",
				year: year || "All years",
				platform: platform || "All platforms",
			},
		});
	} catch (error) {
		console.error("Error in funnel analysis:", error);
		return c.json({ error: "Failed to fetch funnel data" }, 500);
	}
});

app.get("/leads/options", async (c) => {
	const [_statusOptions, platformOptions, monthOptions, trainerOptions] = await Promise.all([
		db.select({ value: leads.status }).from(leads).groupBy(leads.status),
		db.select({ value: leads.platform }).from(leads).groupBy(leads.platform),
		db
			.select({ value: leads.month })
			.from(leads)
			.where(sql`${leads.month} IS NOT NULL AND ${leads.month} != ''`)
			.groupBy(leads.month),
		db.select({ value: leads.trainerHandle }).from(leads).groupBy(leads.trainerHandle),
	]);

	// Return canonical statuses from constants instead of DB-derived values
	const { LEAD_STATUSES } = await import("../lib/status");

	return c.json({
		status: [...LEAD_STATUSES],
		platform: platformOptions.map((p) => p.value).filter(Boolean),
		month: monthOptions.map((m) => m.value).filter(Boolean),
		trainerHandle: trainerOptions.map((t) => t.value).filter(Boolean),
	});
});

app.get("/leads/filter-options", async (c) => {
	try {
		// Try to get from master tables first, fallback to legacy
		const [platformsData, trainersData, monthOptions, dateOptions] = await Promise.all([
			// Try platforms master table first
			db
				.select({ id: platforms.id, name: platforms.name })
				.from(platforms)
				.where(eq(platforms.active, 1))
				.orderBy(sql`${platforms.name} COLLATE NOCASE`)
				.then((results) => (results.length > 0 ? results : null))
				.catch(() => null),
			// Try trainers master table first
			db
				.select({ id: trainers.id, handle: trainers.handle, name: trainers.name })
				.from(trainers)
				.where(eq(trainers.active, 1))
				.orderBy(sql`${trainers.handle} COLLATE NOCASE`)
				.then((results) => (results.length > 0 ? results : null))
				.catch(() => null),
			db
				.select({ value: leads.month })
				.from(leads)
				.where(sql`${leads.month} IS NOT NULL AND ${leads.month} != ''`)
				.groupBy(leads.month),
			db.select({ value: leads.date }).from(leads).groupBy(leads.date),
		]);

		// Fallback to legacy if master tables empty or don't exist
		const platformOptions =
			platformsData?.map((p) => p.name) ||
			(await db
				.select({ value: leads.platform })
				.from(leads)
				.groupBy(leads.platform)
				.then((results) => results.map((p) => p.value).filter(Boolean)));

		const trainerOptions =
			trainersData?.map((t) => t.handle) ||
			(await db
				.select({ value: leads.trainerHandle })
				.from(leads)
				.where(sql`${leads.trainerHandle} IS NOT NULL AND ${leads.trainerHandle} != ''`)
				.groupBy(leads.trainerHandle)
				.then((results) => results.map((t) => t.value).filter(Boolean)));

		// Extract unique years from dates
		const years = Array.from(
			new Set(
				dateOptions
					.map((d) => d.value)
					.filter(Boolean)
					.map((date) => getYearFromDate(date || ""))
					.filter(Boolean), // Filter out empty strings
			),
		).sort((a, b) => b.localeCompare(a)); // Sort descending

		return c.json({
			months: monthOptions
				.map((m) => m.value)
				.filter(Boolean)
				.sort(),
			years: years,
			platforms: platformOptions.sort(),
			statuses: [...LEAD_STATUSES], // Return canonical statuses
			trainers: trainerOptions.sort(),
		});
	} catch (error) {
		console.error("Error fetching filter options:", error);
		return c.json({ error: "Failed to fetch filter options" }, 500);
	}
});

// New endpoint for master data with IDs
app.get("/master-data", async (c) => {
	try {
		const [platformsData, trainersData] = await Promise.all([
			db
				.select({ id: platforms.id, name: platforms.name })
				.from(platforms)
				.where(eq(platforms.active, 1))
				.orderBy(sql`${platforms.name} COLLATE NOCASE`)
				.catch(() => []),
			db
				.select({ id: trainers.id, handle: trainers.handle, name: trainers.name })
				.from(trainers)
				.where(eq(trainers.active, 1))
				.orderBy(sql`${trainers.handle} COLLATE NOCASE`)
				.catch(() => []),
		]);

		return c.json({
			platforms: platformsData,
			trainers: trainersData,
		});
	} catch (error) {
		console.error("Error fetching master data:", error);
		return c.json({ error: "Failed to fetch master data" }, 500);
	}
});

app.post("/leads", async (c) => {
	try {
		const body = await c.req.json();

		// Validate required fields
		if (!body.name) {
			return c.json({ error: "Name is required" }, 400);
		}

		// Prepare lead data with GMT+8 datetime handling
		const standardDate = standardizeDate(body.date);
		const dateValue = standardDate ? parseDDMMYYYYToMYISO(standardDate, 9) : nowMYISO();
		const monthValue = body.month || getMonthFromISO(dateValue);
		const salesValue = Number(body.sales) || 0;

		// Determine initial status - default to "New" or auto-set "Closed Won" if sales > 0
		let initialStatus = body.status || "New";
		if (salesValue > 0) {
			initialStatus = "Closed Won";
		}

		// Normalize the status
		const normalizedStatus = normalizeStatus(initialStatus);

		// Set date fields based on status with GMT+8 timezone
		const nowISO = nowMYISO();
		let closedDateValue = "";
		let closedMonthValue = "";
		let closedYearValue = "";
		const lastActivityDate = nowISO;
		let nextFollowUpDate: string | null = null;
		const followUpDays = Number((c.env as any)?.FOLLOW_UP_DAYS || 3);

		if (normalizedStatus === "Closed Won") {
			const standardClosed = standardizeDate(body.closedDate);
			closedDateValue = standardClosed ? parseDDMMYYYYToMYISO(standardClosed, 18) || "" : dateValue;
			closedMonthValue = getMonthFromISO(closedDateValue);
			closedYearValue = getYearFromISO(closedDateValue);
		} else {
			// Set follow-up dates for active statuses using GMT+8 business days
			switch (normalizedStatus) {
				case "New":
					nextFollowUpDate = addBusinessDaysMY(nowISO, 1);
					break;
				case "Contacted":
					nextFollowUpDate = addDaysMY(nowISO, followUpDays);
					break;
				case "Follow Up":
					nextFollowUpDate = addBusinessDaysMY(nowISO, 2);
					break;
				case "Consulted":
					nextFollowUpDate = addBusinessDaysMY(nowISO, 1);
					break;
			}
		}

		// Handle platform - prefer ID if provided
		let platformId = body.platformId || null;
		let platformText = body.platform || "";

		if (platformId) {
			// Verify platform exists
			const platform = await db.select().from(platforms).where(eq(platforms.id, platformId)).get();
			if (platform) {
				platformText = platform.name; // Sync text field
			} else {
				platformId = null; // Invalid ID
			}
		} else if (platformText) {
			// Try to find platform by name (case-insensitive)
			const platform = await db
				.select()
				.from(platforms)
				.where(sql`LOWER(${platforms.name}) = LOWER(${platformText})`)
				.get();
			if (platform) {
				platformId = platform.id;
				platformText = platform.name; // Use canonical name
			}
		}

		// Handle trainer - prefer ID if provided
		let trainerId = body.trainerId || null;
		let trainerHandle = body.trainerHandle || "";

		if (trainerId) {
			// Verify trainer exists
			const trainer = await db.select().from(trainers).where(eq(trainers.id, trainerId)).get();
			if (trainer) {
				trainerHandle = trainer.handle; // Sync text field
			} else {
				trainerId = null; // Invalid ID
			}
		} else if (trainerHandle) {
			// Try to find trainer by handle (case-insensitive)
			const trainer = await db
				.select()
				.from(trainers)
				.where(sql`LOWER(${trainers.handle}) = LOWER(${trainerHandle})`)
				.get();
			if (trainer) {
				trainerId = trainer.id;
				trainerHandle = trainer.handle; // Use canonical handle
			}
		}

		const leadData = {
			name: body.name,
			phoneNumber: body.phoneNumber || "",
			platform: platformText,
			platformId: platformId,
			status: normalizedStatus,
			sales: salesValue,
			date: dateValue,
			month: monthValue,
			remark: body.remark || "",
			trainerHandle: trainerHandle,
			trainerId: trainerId,
			closedDate: closedDateValue,
			closedMonth: closedMonthValue,
			closedYear: closedYearValue,
			lastActivityDate,
			nextFollowUpDate,
			updatedAt: nowISO,
		};

		const newLead = await db.insert(leads).values(leadData).returning();

		// Record initial status in history
		if (newLead[0]) {
			await recordStatusChange(db, {
				leadId: newLead[0].id,
				fromStatus: "New",
				toStatus: normalizedStatus,
				changedAt: nowISO,
				source: "api",
				changedBy: null,
				note: salesValue > 0 ? "Auto-set to Closed Won due to sales > 0" : null,
			});
		}

		return c.json(newLead[0], 201);
	} catch (error) {
		console.error("Error creating lead:", error);
		return c.json({ error: "Failed to create lead" }, 500);
	}
});

app.put("/leads/:id", async (c) => {
	try {
		const id = Number.parseInt(c.req.param("id"), 10);
		const body = await c.req.json();

		// Get current lead data once to avoid multiple queries
		const currentLead = await db.select().from(leads).where(eq(leads.id, id));

		if (currentLead.length === 0) {
			return c.json({ error: "Lead not found" }, 404);
		}

		const current = currentLead[0];
		const followUpDays = Number((c.env as any)?.FOLLOW_UP_DAYS || 3);
		const updateData: any = {
			updatedAt: nowMYISO(),
		};

		// Only update fields that are provided
		if (body.name !== undefined) updateData.name = body.name;
		if (body.phoneNumber !== undefined) updateData.phoneNumber = body.phoneNumber;
		if (body.remark !== undefined) updateData.remark = body.remark;

		// Handle platform update - prefer ID if provided
		if (body.platformId !== undefined) {
			if (body.platformId) {
				const platform = await db
					.select()
					.from(platforms)
					.where(eq(platforms.id, body.platformId))
					.get();
				if (platform) {
					updateData.platformId = body.platformId;
					updateData.platform = platform.name;
				}
			} else {
				updateData.platformId = null;
				updateData.platform = "";
			}
		} else if (body.platform !== undefined) {
			if (body.platform) {
				const platform = await db
					.select()
					.from(platforms)
					.where(sql`LOWER(${platforms.name}) = LOWER(${body.platform})`)
					.get();
				if (platform) {
					updateData.platformId = platform.id;
					updateData.platform = platform.name;
				} else {
					updateData.platform = body.platform;
					updateData.platformId = null;
				}
			} else {
				updateData.platform = "";
				updateData.platformId = null;
			}
		}

		// Handle trainer update - prefer ID if provided
		if (body.trainerId !== undefined) {
			if (body.trainerId) {
				const trainer = await db
					.select()
					.from(trainers)
					.where(eq(trainers.id, body.trainerId))
					.get();
				if (trainer) {
					updateData.trainerId = body.trainerId;
					updateData.trainerHandle = trainer.handle;
				}
			} else {
				updateData.trainerId = null;
				updateData.trainerHandle = "";
			}
		} else if (body.trainerHandle !== undefined) {
			if (body.trainerHandle) {
				const trainer = await db
					.select()
					.from(trainers)
					.where(sql`LOWER(${trainers.handle}) = LOWER(${body.trainerHandle})`)
					.get();
				if (trainer) {
					updateData.trainerId = trainer.id;
					updateData.trainerHandle = trainer.handle;
				} else {
					updateData.trainerHandle = body.trainerHandle;
					updateData.trainerId = null;
				}
			} else {
				updateData.trainerHandle = "";
				updateData.trainerId = null;
			}
		}

		// Handle date updates with GMT+8 conversion
		if (body.date !== undefined) {
			const standardDate = standardizeDate(body.date);
			updateData.date = standardDate ? parseDDMMYYYYToMYISO(standardDate, 9) : "";
			// Auto-update month when date is provided (unless month is explicitly provided)
			if (body.month === undefined && updateData.date) {
				updateData.month = getMonthFromISO(updateData.date);
			}
		}
		if (body.month !== undefined) updateData.month = body.month;

		// Handle status transitions with comprehensive logic
		let finalStatus = normalizeStatus(current.status);
		let finalSales = Number(current.sales) || 0;
		let statusChanged = false;

		// Update sales if provided
		if (body.sales !== undefined) {
			finalSales = Number(body.sales) || 0;
			updateData.sales = finalSales;
		}

		// Handle status updates
		if (body.status !== undefined) {
			const newStatus = normalizeStatus(body.status);
			if (newStatus !== finalStatus) {
				finalStatus = newStatus;
				statusChanged = true;
				updateData.status = finalStatus;
			}
		}

		// Auto-sync status with sales
		if (finalSales > 0 && finalStatus !== "Closed Won") {
			finalStatus = "Closed Won";
			statusChanged = true;
			updateData.status = finalStatus;
		} else if (finalSales === 0 && finalStatus === "Closed Won") {
			// If sales was removed but status is still Closed Won, revert to previous logical status
			finalStatus = "Consulted";
			statusChanged = true;
			updateData.status = finalStatus;
		}

		// Handle date fields and activity tracking based on status changes
		const nowISO = nowMYISO();

		if (statusChanged) {
			updateData.lastActivityDate = nowISO;

			if (finalStatus === "Closed Won" || finalStatus === "Closed Lost") {
				// Handle closed statuses with GMT+8
				let closedDate = "";
				if (body.closedDate) {
					const standardClosed = standardizeDate(body.closedDate);
					closedDate = standardClosed ? parseDDMMYYYYToMYISO(standardClosed, 18) || "" : "";
				} else {
					closedDate = current.closedDate || current.date || nowISO;
				}
				updateData.closedDate = closedDate;
				updateData.closedMonth = getMonthFromISO(closedDate);
				updateData.closedYear = getYearFromISO(closedDate);
				updateData.nextFollowUpDate = null;
			} else {
				// Handle active statuses - set follow-up dates with GMT+8
				switch (finalStatus) {
					case "New":
						updateData.nextFollowUpDate = addBusinessDaysMY(nowISO, 1);
						break;
					case "Contacted":
						updateData.nextFollowUpDate = addDaysMY(nowISO, followUpDays);
						break;
					case "Follow Up":
						updateData.nextFollowUpDate = addBusinessDaysMY(nowISO, 2);
						break;
					case "Consulted":
						updateData.nextFollowUpDate = addBusinessDaysMY(nowISO, 1);
						break;
				}

				// Clear closed date fields if moving back to active status
				if (current.closedDate) {
					updateData.closedDate = "";
					updateData.closedMonth = "";
					updateData.closedYear = "";
				}
			}
		} else if (body.closedDate !== undefined) {
			// Handle explicit closed date updates without status change
			const standardClosed = standardizeDate(body.closedDate);
			const closedDate = standardClosed ? parseDDMMYYYYToMYISO(standardClosed, 18) || "" : "";
			updateData.closedDate = closedDate;
			if (closedDate) {
				updateData.closedMonth = getMonthFromISO(closedDate);
				updateData.closedYear = getYearFromISO(closedDate);
			} else {
				updateData.closedMonth = "";
				updateData.closedYear = "";
			}
		}

		// Record status change in history if status changed
		if (statusChanged && updateData.status) {
			await recordStatusChange(db, {
				leadId: id,
				fromStatus: current.status || "New",
				toStatus: updateData.status,
				changedAt: nowISO,
				source: "api",
				changedBy: null,
				note:
					finalSales > 0 && updateData.status === "Closed Won"
						? "Auto-set to Closed Won due to sales > 0"
						: null,
			});
		}

		const updatedLead = await db.update(leads).set(updateData).where(eq(leads.id, id)).returning();

		return c.json(updatedLead[0]);
	} catch (error) {
		console.error("Error updating lead:", error);
		return c.json({ error: "Failed to update lead" }, 500);
	}
});

app.delete("/leads/:id", async (c) => {
	const id = Number.parseInt(c.req.param("id"), 10);

	if (Number.isNaN(id)) {
		return c.json({ error: "Invalid lead ID" }, 400);
	}

	try {
		// Check if lead exists first
		const existingLead = await db.select().from(leads).where(eq(leads.id, id));

		if (existingLead.length === 0) {
			return c.json({ error: "Lead not found" }, 404);
		}

		// Delete the lead
		const deletedLead = await db.delete(leads).where(eq(leads.id, id)).returning();

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
	const year = Number.parseInt(c.req.param("year"), 10);
	const month = Number.parseInt(c.req.param("month"), 10);

	if (Number.isNaN(year) || Number.isNaN(month) || month < 1 || month > 12) {
		return c.json({ error: "Invalid year or month" }, 400);
	}

	const cost = await db
		.select()
		.from(advertisingCosts)
		.where(and(eq(advertisingCosts.year, year), eq(advertisingCosts.month, month)));

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

	const month = Number.parseInt(body.month, 10);
	const year = Number.parseInt(body.year, 10);
	const cost = Number.parseFloat(body.cost);

	if (Number.isNaN(month) || Number.isNaN(year) || Number.isNaN(cost) || month < 1 || month > 12) {
		return c.json({ error: "Invalid month, year, or cost value" }, 400);
	}

	// Check if entry already exists for this month/year
	const existing = await db
		.select()
		.from(advertisingCosts)
		.where(and(eq(advertisingCosts.year, year), eq(advertisingCosts.month, month)));

	if (existing.length > 0) {
		return c.json({ error: "Advertising cost already exists for this month and year" }, 409);
	}

	const costData = {
		month,
		year,
		cost,
		currency: body.currency || "RM",
	};

	try {
		const newCost = await db.insert(advertisingCosts).values(costData).returning();
		return c.json(newCost[0], 201);
	} catch (error) {
		console.error("Error creating advertising cost:", error);
		return c.json({ error: "Failed to create advertising cost" }, 500);
	}
});

// PUT update advertising cost
app.put("/advertising-costs/:id", async (c) => {
	const id = Number.parseInt(c.req.param("id"), 10);
	const body = await c.req.json();

	if (Number.isNaN(id)) {
		return c.json({ error: "Invalid advertising cost ID" }, 400);
	}

	const updateData: any = {
		updatedAt: sql`CURRENT_TIMESTAMP`,
	};

	// Only update fields that are provided
	if (body.month !== undefined) {
		const month = Number.parseInt(body.month, 10);
		if (Number.isNaN(month) || month < 1 || month > 12) {
			return c.json({ error: "Invalid month value" }, 400);
		}
		updateData.month = month;
	}
	if (body.year !== undefined) {
		const year = Number.parseInt(body.year, 10);
		if (Number.isNaN(year)) {
			return c.json({ error: "Invalid year value" }, 400);
		}
		updateData.year = year;
	}
	if (body.cost !== undefined) {
		const cost = Number.parseFloat(body.cost);
		if (Number.isNaN(cost)) {
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
	const id = Number.parseInt(c.req.param("id"), 10);

	if (Number.isNaN(id)) {
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
		// Run status maintenance with config from environment
		const followUpDays = Number((c.env as any)?.FOLLOW_UP_DAYS || 3);
		await runStatusMaintenance(db, { followUpDays });

		const month = c.req.query("month");
		const year = c.req.query("year");
		const platform = c.req.query("platform");
		const dateType = c.req.query("dateType") || "closed"; // Default to closed date for backward compatibility

		console.log("ROAS request params:", { month, year, platform, dateType });

		// Build conditions for leads query based on dateType
		const leadConditions = [];
		const cplConditions = []; // Separate conditions for CPL calculation

		// For sales/ROAS, always use closed date
		if (month) {
			leadConditions.push(eq(leads.closedMonth, month));
			if (dateType === "lead") {
				// For CPL with lead date
				cplConditions.push(eq(leads.month, month));
			} else {
				cplConditions.push(eq(leads.closedMonth, month));
			}
		}
		if (year) {
			leadConditions.push(eq(leads.closedYear, year));
			if (dateType === "lead") {
				// For CPL with lead date
				cplConditions.push(
					sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND 
						(substr(${leads.date}, -4) = ${year} OR substr(${leads.date}, 1, 4) = ${year})`,
				);
			} else {
				cplConditions.push(eq(leads.closedYear, year));
			}
		}
		if (platform) {
			leadConditions.push(eq(leads.platform, platform));
			cplConditions.push(eq(leads.platform, platform));
		}

		// Get leads for sales calculation (always use closed date)
		let salesQuery = db.select().from(leads);
		if (leadConditions.length > 0) {
			salesQuery = salesQuery.where(and(...leadConditions));
		}
		const salesLeads = await salesQuery;

		// Get leads for CPL calculation (use dateType)
		let cplQuery = db.select().from(leads);
		if (cplConditions.length > 0) {
			cplQuery = cplQuery.where(and(...cplConditions));
		}
		const cplLeads = dateType === "lead" ? await cplQuery : salesLeads;

		// Calculate metrics using normalized statuses
		const totalLeadsForCPL = cplLeads.length; // Leads count based on dateType
		const closedLeads = salesLeads.filter(
			(lead) => normalizeStatus(lead.status) === "Closed Won",
		).length;
		const totalSales = salesLeads
			.filter((lead) => normalizeStatus(lead.status) === "Closed Won")
			.reduce((sum, lead) => sum + (Number(lead.sales) || 0), 0);

		console.log("Sales query result:", {
			totalSales,
			totalLeadsForCPL,
			closedLeads,
			dateType,
		});

		// Get advertising costs
		let totalAdCost = 0;
		if (month && year) {
			// Specific month and year
			const monthNumber = getMonthNumber(month);
			const yearNumber = Number.parseInt(year, 10);

			if (monthNumber > 0) {
				// Validate month number
				const costResult = await db
					.select({ cost: advertisingCosts.cost })
					.from(advertisingCosts)
					.where(
						and(eq(advertisingCosts.month, monthNumber), eq(advertisingCosts.year, yearNumber)),
					);

				totalAdCost = Number(costResult[0]?.cost) || 0;
			}
		} else if (year) {
			// All months in a specific year
			const yearNumber = Number.parseInt(year, 10);
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
			totalLeadsForCPL,
			closedLeads,
			dateType,
		});

		// Calculate ROAS (always uses sale-date attribution)
		const roas = totalAdCost > 0 ? totalSales / totalAdCost : 0;

		// CPL uses dateType attribution (lead-date or closed-date)
		const costPerLead = totalLeadsForCPL > 0 ? totalAdCost / totalLeadsForCPL : 0;

		// CPA always uses closed-date attribution
		const costPerAcquisition = closedLeads > 0 ? totalAdCost / closedLeads : 0;

		// Conversion rate based on closed leads vs total leads in period
		const conversionRate = salesLeads.length > 0 ? (closedLeads / salesLeads.length) * 100 : 0;

		return c.json({
			roas: Number(roas.toFixed(2)),
			totalSales,
			totalAdCost: Number(totalAdCost.toFixed(2)),
			totalLeads: totalLeadsForCPL,
			closedLeads,
			costPerLead: Number(costPerLead.toFixed(2)),
			costPerAcquisition: Number(costPerAcquisition.toFixed(2)),
			conversionRate: Number(conversionRate.toFixed(2)),
			attribution: {
				costPerLead: dateType === "lead" ? "lead-date" : "closed-date",
				roas: "closed-date",
				costPerAcquisition: "closed-date",
			},
			period: {
				dateType,
				month: month || "All months",
				year: year || "All years",
				platform: platform || "All platforms",
			},
		});
	} catch (error) {
		console.error("Error calculating ROAS:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		const errorStack = error instanceof Error ? error.stack : undefined;
		console.error("Error details:", errorMessage, errorStack);
		return c.json({ error: "Failed to calculate ROAS", details: errorMessage }, 500);
	}
});

// Growth data endpoints
app.get("/leads/growth/monthly", async (c) => {
	try {
		const year = c.req.query("year");
		const dateType = c.req.query("dateType") || "lead"; // Default to 'lead' for backward compatibility
		console.log("Monthly growth request for year:", year, "dateType:", dateType);

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

		if (dateType === "closed") {
			// When dateType is 'closed', aggregate by closed date and show all leads that were closed in that month
			const conditions = [
				sql`${leads.closedMonth} IS NOT NULL AND ${leads.closedMonth} != ''`,
				eq(leads.status, "Closed Won"), // Only include leads that were actually closed won
			];

			if (year) {
				conditions.push(eq(leads.closedYear, year));
			}

			const salesClosedQuery = db
				.select({
					month: leads.closedMonth,
					year: leads.closedYear,
					totalLeads: count(), // Count all closed leads in this month (should equal closedLeads)
					closedLeads: count(), // Same as totalLeads since we're filtering for closed leads only
					totalSales: sql<number>`CAST(COALESCE(SUM(CAST(${leads.sales} AS INTEGER)), 0) AS INTEGER)`,
				})
				.from(leads)
				.where(and(...conditions))
				.groupBy(leads.closedMonth, leads.closedYear);

			console.log("Executing sales closed query...");
			const salesClosedData = await salesClosedQuery;
			console.log("Sales closed data:", salesClosedData);

			const sortedData = salesClosedData
				.map((item) => ({
					month: item.month,
					year: item.year,
					totalLeads: item.totalLeads || 0,
					closedLeads: item.closedLeads || 0,
					totalSales: item.totalSales || 0,
				}))
				.sort((a, b) => {
					if (a.year !== b.year) {
						return (a.year || "").localeCompare(b.year || "");
					}
					const aIndex = monthOrder.indexOf(a.month || "");
					const bIndex = monthOrder.indexOf(b.month || "");
					return aIndex - bIndex;
				});

			console.log("Final sorted data (closed):", sortedData);

			return c.json({
				data: sortedData,
				year: year || "All years",
				dateType: "closed",
			});
		}
		// Default behavior: aggregate by lead creation date (original logic)
		const leadConditions = [sql`${leads.month} IS NOT NULL AND ${leads.month} != ''`];

		if (year) {
			leadConditions.push(
				sql`${leads.date} IS NOT NULL AND ${leads.date} != '' AND substr(${leads.date}, -4) = ${year}`,
			);
		}

		const leadsCreatedQuery = db
			.select({
				month: leads.month,
				year: sql<string>`substr(${leads.date}, -4)`,
				totalLeads: count(),
			})
			.from(leads)
			.where(and(...leadConditions))
			.groupBy(leads.month, sql<string>`substr(${leads.date}, -4)`);

		console.log("Executing leads created query...");
		const leadsCreatedData = await leadsCreatedQuery;
		console.log("Leads created data:", leadsCreatedData);

		// Get monthly data for sales closure
		const salesConditions = [sql`${leads.closedMonth} IS NOT NULL AND ${leads.closedMonth} != ''`];

		if (year) {
			salesConditions.push(eq(leads.closedYear, year));
		}

		const salesClosedQuery = db
			.select({
				month: leads.closedMonth,
				year: leads.closedYear,
				closedLeads: count(sql`CASE WHEN ${leads.status} = 'Closed Won' THEN 1 END`),
				totalSales: sql<number>`CAST(COALESCE(SUM(CAST(${leads.sales} AS INTEGER)), 0) AS INTEGER)`,
			})
			.from(leads)
			.where(and(...salesConditions))
			.groupBy(leads.closedMonth, leads.closedYear);

		console.log("Executing sales closed query...");
		const salesClosedData = await salesClosedQuery;
		console.log("Sales closed data:", salesClosedData);

		// Combine both datasets by month
		const combinedData: Record<string, any> = {};

		// Add leads created data
		for (const item of leadsCreatedData) {
			if (item.month && item.year) {
				const key = `${item.year}-${item.month}`;
				combinedData[key] = {
					month: item.month,
					year: item.year,
					totalLeads: item.totalLeads || 0,
					closedLeads: 0,
					totalSales: 0,
				};
			}
		}

		// Add sales closed data to existing months (where leads were created)
		for (const item of salesClosedData) {
			if (item.month && item.year) {
				const key = `${item.year}-${item.month}`;
				// Only add closed leads and sales data to months where leads were created
				if (combinedData[key]) {
					combinedData[key].closedLeads = item.closedLeads || 0;
					combinedData[key].totalSales = item.totalSales || 0;
				}
			}
		}

		const sortedData = Object.values(combinedData).sort((a: any, b: any) => {
			if (a.year !== b.year) {
				return a.year.localeCompare(b.year);
			}
			const aIndex = monthOrder.indexOf(a.month || "");
			const bIndex = monthOrder.indexOf(b.month || "");
			return aIndex - bIndex;
		});

		console.log("Final sorted data (lead):", sortedData);

		return c.json({
			data: sortedData,
			year: year || "All years",
			dateType: "lead",
		});
	} catch (error) {
		console.error("Error fetching monthly growth data:", error);
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		const errorStack = error instanceof Error ? error.stack : undefined;
		console.error("Error details:", errorMessage, errorStack);
		return c.json(
			{
				error: "Failed to fetch monthly growth data",
				details: errorMessage,
			},
			500,
		);
	}
});

app.get("/leads/growth/yearly", async (c) => {
	try {
		// Get all leads with creation dates
		const allLeadsCreated = await db
			.select({
				date: leads.date,
			})
			.from(leads)
			.where(sql`${leads.date} IS NOT NULL AND ${leads.date} != ''`);

		// Get all leads with closure dates
		const allLeadsClosed = await db
			.select({
				closedYear: leads.closedYear,
				status: leads.status,
				sales: leads.sales,
			})
			.from(leads)
			.where(sql`${leads.closedYear} IS NOT NULL AND ${leads.closedYear} != ''`);

		// Group by year for creation
		const yearlyCreatedData: Record<string, { totalLeads: number }> = {};
		for (const lead of allLeadsCreated) {
			const year = getYearFromDate(lead.date || "");
			if (!year) continue;

			if (!yearlyCreatedData[year]) {
				yearlyCreatedData[year] = { totalLeads: 0 };
			}
			yearlyCreatedData[year].totalLeads++;
		}

		// Group by year for closure
		const yearlyClosedData: Record<string, { closedLeads: number; totalSales: number }> = {};
		for (const lead of allLeadsClosed) {
			const year = lead.closedYear;
			if (!year) continue;

			if (!yearlyClosedData[year]) {
				yearlyClosedData[year] = { closedLeads: 0, totalSales: 0 };
			}

			if (lead.status === "Closed Won") {
				yearlyClosedData[year].closedLeads++;
			}
			yearlyClosedData[year].totalSales += Number(lead.sales) || 0;
		}

		// Combine both datasets
		const combinedYearlyData: Record<
			string,
			{ totalLeads: number; closedLeads: number; totalSales: number }
		> = {};

		// Add creation data
		for (const [year, data] of Object.entries(yearlyCreatedData)) {
			combinedYearlyData[year] = {
				totalLeads: data.totalLeads,
				closedLeads: 0,
				totalSales: 0,
			};
		}

		// Add closure data
		for (const [year, data] of Object.entries(yearlyClosedData)) {
			if (!combinedYearlyData[year]) {
				combinedYearlyData[year] = {
					totalLeads: 0,
					closedLeads: 0,
					totalSales: 0,
				};
			}
			combinedYearlyData[year].closedLeads = data.closedLeads;
			combinedYearlyData[year].totalSales = data.totalSales;
		}

		// Convert to array and sort by year
		const sortedData = Object.entries(combinedYearlyData)
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
