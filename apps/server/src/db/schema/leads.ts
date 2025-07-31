import { sql } from "drizzle-orm";
import { text, integer, sqliteTable } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
	id: integer("id").primaryKey(),
	month: text("month"),
	date: text("date"),
	name: text("name"),
	phoneNumber: text("phone_number"),
	platform: text("platform"),
	isClosed: integer("is_closed", { mode: "boolean" }),
	status: text("status"),
	sales: integer("sales"),
	followUp: text("follow_up"),
	appointment: text("appointment"),
	remark: text("remark"),
	trainerHandle: text("trainer_handle"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
});
