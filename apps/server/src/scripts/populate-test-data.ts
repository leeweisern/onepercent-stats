// @ts-expect-error - bun:sqlite is only available in Bun runtime
import { Database } from "bun:sqlite";
import path from "node:path";
import { drizzle } from "drizzle-orm/bun-sqlite";
import { globSync } from "glob";
import { leads } from "../db/schema/leads";

// Get the sqlite database file path (same logic as script-db.ts)
const dbFile =
	globSync(
		path.join(
			process.cwd(),
			".wrangler",
			"state",
			"v3",
			"d1",
			"miniflare-D1DatabaseObject",
			"*.sqlite",
		),
	)[0] ||
	globSync(
		path.join(
			process.cwd(),
			"apps",
			"server",
			".wrangler",
			"state",
			"v3",
			"d1",
			"miniflare-D1DatabaseObject",
			"*.sqlite",
		),
	)[0];

if (!dbFile) {
	throw new Error(
		"Local D1 database file not found. Please run 'bun run dev:server' once to ensure it's created.",
	);
}

const sqlite = new Database(dbFile);
const db = drizzle(sqlite);

/**
 * Populates local database with test data for migration testing
 * Creates representative samples of the different status scenarios we need to migrate
 */
async function populateTestData() {
	console.log("Populating local database with test data...");

	// Clear existing data
	await db.delete(leads);

	// Test data representing all migration scenarios
	const testLeads = [
		// Scenario 1: isClosed=true + sales>0 → "Closed Won"
		{
			id: 1,
			month: "June",
			date: "15/06/2024",
			name: "John Won",
			phoneNumber: "123456789",
			platform: "Facebook",
			status: "Consult", // Should become "Closed Won" due to is_closed=1 + sales>0
			sales: 5000,
			isClosed: 1,
			remark: "Great client",
			trainerHandle: "trainer1",
			closedDate: "15/06/2024",
			closedMonth: "June",
			closedYear: "2024",
		},
		// Scenario 2: isClosed=true + sales=0 → "Closed Lost"
		{
			id: 2,
			month: "June",
			date: "16/06/2024",
			name: "Jane Lost",
			phoneNumber: "123456790",
			platform: "Google",
			status: "", // Should become "Closed Lost" due to is_closed=1 + sales=0
			sales: 0,
			isClosed: 1,
			remark: "Not interested",
			trainerHandle: "trainer2",
			closedDate: "16/06/2024",
			closedMonth: "June",
			closedYear: "2024",
		},
		// Scenario 3: status='Consult' → status='Consulted'
		{
			id: 3,
			month: "June",
			date: "17/06/2024",
			name: "Bob Consult",
			phoneNumber: "123456791",
			platform: "Instagram",
			status: "Consult", // Should become "Consulted"
			sales: 0,
			isClosed: 0,
			remark: "Had consultation",
			trainerHandle: "trainer3",
		},
		// Scenario 4: status='No Reply' → status='Contacted'
		{
			id: 4,
			month: "June",
			date: "18/06/2024",
			name: "Alice NoReply",
			phoneNumber: "123456792",
			platform: "WhatsApp",
			status: "No Reply", // Should become "Contacted"
			sales: null,
			isClosed: 0,
			remark: "Not responding",
			trainerHandle: "trainer4",
		},
		// Scenario 5: status=null/empty → status='New'
		{
			id: 5,
			month: "June",
			date: "19/06/2024",
			name: "Charlie New",
			phoneNumber: "123456793",
			platform: "TikTok",
			status: null, // Should become "New"
			sales: null,
			isClosed: 0,
			remark: "Just signed up",
			trainerHandle: "trainer5",
		},
		// Scenario 6: status=empty string → status='New'
		{
			id: 6,
			month: "June",
			date: "20/06/2024",
			name: "Diana Empty",
			phoneNumber: "123456794",
			platform: "Facebook",
			status: "", // Should become "New"
			sales: null,
			isClosed: 0,
			remark: "Empty status",
			trainerHandle: "trainer6",
		},
		// Scenario 7: Already modern status - should remain unchanged
		{
			id: 7,
			month: "June",
			date: "21/06/2024",
			name: "Edward Modern",
			phoneNumber: "123456795",
			platform: "Google",
			status: "Follow Up", // Should remain "Follow Up"
			sales: null,
			isClosed: 0,
			remark: "Already modern status",
			trainerHandle: "trainer7",
		},
		// Scenario 8: Another closed won case with different original status
		{
			id: 8,
			month: "June",
			date: "22/06/2024",
			name: "Frank ClosedWon2",
			phoneNumber: "123456796",
			platform: "Instagram",
			status: "", // Should become "Closed Won" due to is_closed=1 + sales>0
			sales: 3000,
			isClosed: 1,
			remark: "Second won case",
			trainerHandle: "trainer8",
			closedDate: "22/06/2024",
			closedMonth: "June",
			closedYear: "2024",
		},
	];

	// Insert test data using raw SQL since is_closed is not in current Drizzle schema

	for (const leadData of testLeads) {
		const stmt = sqlite.prepare(`INSERT INTO leads (
			id, month, date, name, phone_number, platform, status, sales, 
			is_closed, remark, trainer_handle, closed_date, closed_month, closed_year
		) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`);

		stmt.run(
			leadData.id,
			leadData.month,
			leadData.date,
			leadData.name,
			leadData.phoneNumber,
			leadData.platform,
			leadData.status,
			leadData.sales,
			leadData.isClosed,
			leadData.remark,
			leadData.trainerHandle,
			leadData.closedDate || null,
			leadData.closedMonth || null,
			leadData.closedYear || null,
		);
	}

	console.log(`✅ Inserted ${testLeads.length} test leads`);

	// Verify the data using raw SQL
	const countStmt = sqlite.prepare("SELECT COUNT(*) as count FROM leads");
	const count = countStmt.get();

	console.log(`📊 Total leads in local database: ${count.count}`);

	// Show the distribution of test scenarios
	const distributionStmt = sqlite.prepare(`SELECT 
		status,
		is_closed,
		CASE WHEN sales > 0 THEN 'has_sales' ELSE 'no_sales' END as sales_status,
		COUNT(*) as count
	FROM leads 
	GROUP BY status, is_closed, CASE WHEN sales > 0 THEN 'has_sales' ELSE 'no_sales' END
	ORDER BY count DESC`);

	const distribution = distributionStmt.all();

	console.log("\n📈 Test data distribution:");
	console.table(distribution);

	return testLeads.length;
}

// Script runner for local execution
if (import.meta.main) {
	try {
		const count = await populateTestData();
		console.log(`\n🎉 Test data population completed! Created ${count} test leads.`);
		console.log("Ready for migration testing!");
	} catch (error) {
		console.error("❌ Error populating test data:", error);
		process.exit(1);
	}
}
