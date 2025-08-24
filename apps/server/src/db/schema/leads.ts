import { sql } from "drizzle-orm";
import { integer, real, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const leads = sqliteTable("leads", {
	id: integer("id").primaryKey(),
	month: text("month"),
	date: text("date").notNull(),
	name: text("name"),
	phoneNumber: text("phone_number"),
	platform: text("platform"),
	status: text("status").default("New"),
	sales: integer("sales"),
	remark: text("remark"),
	trainerHandle: text("trainer_handle"),
	closedDate: text("closed_date"),
	closedMonth: text("closed_month"),
	closedYear: text("closed_year"),
	contactedDate: text("contacted_date"),
	nextFollowUpDate: text("next_follow_up_date"),
	lastActivityDate: text("last_activity_date"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export const advertisingCosts = sqliteTable("advertising_costs", {
	id: integer("id").primaryKey(),
	month: integer("month").notNull(),
	year: integer("year").notNull(),
	cost: real("cost").notNull(),
	currency: text("currency").default("RM"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});
