import fs from "node:fs";
import path from "node:path";
import Papa from "papaparse";
import { leads } from "../db/schema/leads";
import { db } from "../db/script-db";

const csvFilePath = path.resolve("../../One Percent Enquiries All Data (dd-mm-yyyy).csv");
const csvFile = fs.readFileSync(csvFilePath, "utf8");

const cleanData = (row: any) => {
	const salesString = row.Sales || "0";
	const sales = Number.parseInt(salesString.replace(/[^0-9.-]+/g, "")) || 0;

	return {
		month: row.Month,
		date: row.Date,
		name: row["Name "],
		phoneNumber: row["Phone number"],
		platform: row["PlatFBorm "],
		isClosed: row["Close/ Non  close"] === "close",
		status: row.Status,
		sales: sales,
		followUp: row["Follow Up"],
		appointment: row["Appointment "],
		remark: row.Remark,
		trainerHandle: row["Trainer handle"],
	};
};

Papa.parse(csvFile, {
	header: true,
	skipEmptyLines: true,
	complete: async (results) => {
		console.log("First row:", results.data[0]);
		const cleanedData = results.data.map(cleanData);
		console.log("First cleaned row:", cleanedData[0]);

		for (const row of cleanedData) {
			await db.insert(leads).values(row).onConflictDoNothing();
		}

		console.log(`Data imported successfully! ${cleanedData.length} records processed.`);
	},
});
