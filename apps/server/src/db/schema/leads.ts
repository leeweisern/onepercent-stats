import { sql } from "drizzle-orm";
import { text, integer, real, sqliteTable } from "drizzle-orm/sqlite-core";

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
	remark: text("remark"),
	trainerHandle: text("trainer_handle"),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
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
