import { readFileSync } from "fs";
import { parse } from "csv-parse/sync";
import { drizzle } from "drizzle-orm/d1";
import { leads } from "../db/schema/leads";

// This script imports CSV data directly to D1 database
async function importCsvToD1() {
	const csvPath = "../../../One Percent Enquiries All Data (dd-mm-yyyy).csv";

	try {
		// Read and parse CSV file
		const csvContent = readFileSync(csvPath, "utf-8");
		const records = parse(csvContent, {
			columns: true,
			skip_empty_lines: true,
			trim: true,
		});

		console.log(`Found ${records.length} records to import`);

		// Process each record
		const processedRecords = records.map((record: any) => {
			// Parse sales value - remove commas and convert to integer
			let sales = null;
			if (record.Sales && record.Sales.trim() !== "") {
				const salesStr = record.Sales.replace(/,/g, "");
				const salesNum = parseFloat(salesStr);
				if (!isNaN(salesNum)) {
					sales = Math.round(salesNum * 100); // Store as cents
				}
			}

			// Parse close status
			const isClosed =
				record["Close/ Non  close"]?.toLowerCase().includes("close") || false;

			// Clean platform name
			let platform = record["PlatFBorm "] || record.Platform || "";
			platform = platform
				.replace(/FB/g, "")
				.replace(/google/g, "Google")
				.trim();
			if (platform === "") platform = "N/A";

			return {
				month: record.Month || "",
				date: record.Date || "",
				name: (record["Name "] || record.Name || "").trim(),
				phoneNumber: (record["Phone number"] || "").trim(),
				platform: platform,
				isClosed: isClosed,
				status: record.Status || "",
				sales: sales,
				followUp: record["Follow Up"] || "",
				appointment: record["Appointment "] || record.Appointment || "",
				remark: record.Remark || "",
				trainerHandle: record["Trainer handle"] || "",
			};
		});

		console.log("Processed records, sample:", processedRecords[0]);
		console.log(`Ready to insert ${processedRecords.length} records`);

		// Note: This script shows the data structure but doesn't actually insert
		// because we need to run this against the D1 database using wrangler
		return processedRecords;
	} catch (error) {
		console.error("Error importing CSV:", error);
		throw error;
	}
}

// Export for use in other scripts
export { importCsvToD1 };

// Run if called directly
if (import.meta.main) {
	importCsvToD1()
		.then((records) => {
			console.log("Import preparation completed");
			console.log("Sample record:", JSON.stringify(records[0], null, 2));
		})
		.catch(console.error);
}
