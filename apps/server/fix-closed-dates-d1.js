#!/usr/bin/env node

// Script to fix closed_date data directly in Cloudflare D1 database
// This will update all rows to have proper closed_date values

const ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID;
const DATABASE_ID = process.env.CLOUDFLARE_DATABASE_ID;
const API_TOKEN = process.env.CLOUDFLARE_D1_TOKEN;

if (!ACCOUNT_ID || !DATABASE_ID || !API_TOKEN) {
	console.error("Missing required environment variables:");
	console.error("- CLOUDFLARE_ACCOUNT_ID");
	console.error("- CLOUDFLARE_DATABASE_ID");
	console.error("- CLOUDFLARE_D1_TOKEN");
	process.exit(1);
}

async function executeD1Query(sql, params = []) {
	const url = `https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/d1/database/${DATABASE_ID}/query`;

	const response = await fetch(url, {
		method: "POST",
		headers: {
			Authorization: `Bearer ${API_TOKEN}`,
			"Content-Type": "application/json",
		},
		body: JSON.stringify({
			sql: sql,
			params: params,
		}),
	});

	if (!response.ok) {
		const error = await response.text();
		throw new Error(`D1 API error: ${response.status} ${error}`);
	}

	const result = await response.json();

	if (!result.success) {
		throw new Error(`D1 query failed: ${JSON.stringify(result.errors)}`);
	}

	return result.result[0];
}

async function fixClosedDates() {
	console.log("🔧 Starting to fix closed_date data in D1 database...");

	try {
		// First, let's see how many rows need fixing
		console.log("📊 Checking current data...");
		const countResult = await executeD1Query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN closed_date = 'closed_date' THEN 1 END) as bad_data,
                COUNT(CASE WHEN sales > 0 THEN 1 END) as with_sales,
                COUNT(CASE WHEN sales = 0 OR sales IS NULL THEN 1 END) as without_sales
            FROM leads
        `);

		console.log("Current data status:");
		console.log(`- Total leads: ${countResult.results[0].total}`);
		console.log(
			`- Rows with bad "closed_date": ${countResult.results[0].bad_data}`,
		);
		console.log(`- Leads with sales: ${countResult.results[0].with_sales}`);
		console.log(
			`- Leads without sales: ${countResult.results[0].without_sales}`,
		);

		// Check if we need to set closed_date for leads with sales
		const needsFixing = await executeD1Query(`
            SELECT COUNT(*) as count 
            FROM leads 
            WHERE sales > 0 AND (closed_date IS NULL OR closed_date = '')
        `);

		if (
			countResult.results[0].bad_data === 0 &&
			needsFixing.results[0].count === 0
		) {
			console.log(
				"✅ No bad data found! All closed_date fields are already clean.",
			);
			return;
		}

		if (needsFixing.results[0].count > 0) {
			console.log(
				`📝 Found ${needsFixing.results[0].count} leads with sales that need closed_date set`,
			);
		}

		console.log("\n🔄 Fixing closed_date data...");

		// Update 1: Set closed_date = date for leads with sales > 0
		console.log("📝 Setting closed_date = date for leads with sales > 0...");
		const updateWithSales = await executeD1Query(`
            UPDATE leads 
            SET closed_date = date 
            WHERE (sales > 0) AND (closed_date = 'closed_date' OR closed_date IS NULL OR closed_date = '')
        `);
		console.log(`✅ Updated ${updateWithSales.meta.changes} leads with sales`);

		// Update 2: Set closed_date = NULL for leads with no sales
		console.log("📝 Setting closed_date = NULL for leads without sales...");
		const updateWithoutSales = await executeD1Query(`
            UPDATE leads 
            SET closed_date = NULL 
            WHERE (sales = 0 OR sales IS NULL) AND (closed_date = 'closed_date' OR closed_date != '' AND closed_date IS NOT NULL)
        `);
		console.log(
			`✅ Updated ${updateWithoutSales.meta.changes} leads without sales`,
		);

		// Verify the fix
		console.log("\n🔍 Verifying the fix...");
		const verifyResult = await executeD1Query(`
            SELECT 
                COUNT(*) as total,
                COUNT(CASE WHEN closed_date = 'closed_date' THEN 1 END) as still_bad,
                COUNT(CASE WHEN sales > 0 AND closed_date = date THEN 1 END) as correct_with_sales,
                COUNT(CASE WHEN (sales = 0 OR sales IS NULL) AND closed_date IS NULL THEN 1 END) as correct_without_sales
            FROM leads
        `);

		console.log("After fix:");
		console.log(`- Total leads: ${verifyResult.results[0].total}`);
		console.log(
			`- Still bad "closed_date": ${verifyResult.results[0].still_bad}`,
		);
		console.log(
			`- Correctly set with sales: ${verifyResult.results[0].correct_with_sales}`,
		);
		console.log(
			`- Correctly set without sales: ${verifyResult.results[0].correct_without_sales}`,
		);

		if (verifyResult.results[0].still_bad === 0) {
			console.log("\n🎉 SUCCESS! All closed_date data has been fixed!");
		} else {
			console.log(
				"\n⚠️  WARNING: Some bad data still remains. Manual review may be needed.",
			);
		}
	} catch (error) {
		console.error("❌ Error fixing closed dates:", error.message);
		process.exit(1);
	}
}

// Run the fix
fixClosedDates();
