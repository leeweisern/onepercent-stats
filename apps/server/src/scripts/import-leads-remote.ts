import fs from "fs";
import path from "path";
import Papa from "papaparse";
import { execSync } from "child_process";

const csvFilePath = path.resolve(
	"../../One Percent Enquiries All Data (dd-mm-yyyy).csv",
);
const csvFile = fs.readFileSync(csvFilePath, "utf8");

const cleanData = (row: any) => {
	const salesString = row["Sales"] || "0";
	const sales = parseInt(salesString.replace(/[^0-9.-]+/g, "")) || 0;

	return {
		month: row["Month"] || null,
		date: row["Date"] || null,
		name: row["Name "] || null,
		phoneNumber: row["Phone number"] || null,
		platform: row["PlatFBorm "] || null,
		isClosed: row["Close/ Non  close"] === "close" ? 1 : 0,
		status: row["Status"] || null,
		sales: sales,
		followUp: row["Follow Up"] || null,
		appointment: row["Appointment "] || null,
		remark: row["Remark"] || null,
		trainerHandle: row["Trainer handle"] || null,
	};
};

const escapeString = (str: string | null): string => {
	if (str === null || str === undefined) return "NULL";
	return `'${str.replace(/'/g, "''")}'`;
};

Papa.parse(csvFile, {
	header: true,
	skipEmptyLines: true,
	complete: async (results) => {
		console.log("Processing CSV data...");
		console.log("First row:", results.data[0]);

		const cleanedData = results.data.map(cleanData);
		console.log("First cleaned row:", cleanedData[0]);
		console.log(`Total records to import: ${cleanedData.length}`);

		// Create SQL insert statements in batches
		const batchSize = 50;
		for (let i = 0; i < cleanedData.length; i += batchSize) {
			const batch = cleanedData.slice(i, i + batchSize);

			const values = batch
				.map(
					(row) =>
						`(${escapeString(row.month)}, ${escapeString(row.date)}, ${escapeString(row.name)}, ${escapeString(row.phoneNumber)}, ${escapeString(row.platform)}, ${row.isClosed}, ${escapeString(row.status)}, ${row.sales}, ${escapeString(row.followUp)}, ${escapeString(row.appointment)}, ${escapeString(row.remark)}, ${escapeString(row.trainerHandle)})`,
				)
				.join(", ");

			const sql = `INSERT INTO leads (month, date, name, phone_number, platform, is_closed, status, sales, follow_up, appointment, remark, trainer_handle) VALUES ${values};`;

			try {
				console.log(
					`Importing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(cleanedData.length / batchSize)}...`,
				);
				execSync(
					`npx wrangler d1 execute onepercent-stats-db --remote --command="${sql}"`,
					{
						stdio: "inherit",
						cwd: process.cwd(),
					},
				);
			} catch (error) {
				console.error(
					`Error importing batch ${Math.floor(i / batchSize) + 1}:`,
					error,
				);
				break;
			}
		}

		console.log(
			`Data import completed! ${cleanedData.length} records processed.`,
		);
	},
});
