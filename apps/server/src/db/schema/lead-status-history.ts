import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";
import { leads } from "./leads";

export const leadStatusHistory = sqliteTable(
	"lead_status_history",
	{
		id: integer("id").primaryKey(),
		leadId: integer("lead_id")
			.notNull()
			.references(() => leads.id),
		fromStatus: text("from_status").notNull(),
		toStatus: text("to_status").notNull(),
		changedAt: text("changed_at").notNull(),
		source: text("source", { enum: ["api", "maintenance"] })
			.notNull()
			.default("api"),
		changedBy: text("changed_by"),
		note: text("note"),
	},
	(table) => ({
		leadIdIdx: index("idx_lsh_lead_id").on(table.leadId),
		toStatusChangedAtIdx: index("idx_lsh_to_status_changed_at").on(table.toStatus, table.changedAt),
		changedAtIdx: index("idx_lsh_changed_at").on(table.changedAt),
	}),
);
