import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const trainers = sqliteTable("trainers", {
	id: integer("id").primaryKey({ autoIncrement: true }),
	handle: text("handle").notNull().unique(),
	name: text("name"),
	active: integer("active").default(1),
	createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
	updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`),
});

export type Trainer = typeof trainers.$inferSelect;
export type NewTrainer = typeof trainers.$inferInsert;
