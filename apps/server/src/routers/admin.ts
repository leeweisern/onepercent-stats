import { zValidator } from "@hono/zod-validator";
import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { and, count, eq, inArray, sql } from "drizzle-orm";
import { Hono } from "hono";
import { z } from "zod";
import { db } from "../db";
import { account, user } from "../db/schema/auth";
import { leads } from "../db/schema/leads";
import { platforms } from "../db/schema/platforms";
import { trainers } from "../db/schema/trainers";
import { createAuth } from "../lib/auth";

type Env = {
	DB: D1Database;
	CORS_ORIGIN: string;
	BETTER_AUTH_SECRET: string;
	BETTER_AUTH_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

// Middleware to check if user is admin
const adminMiddleware = async (c: any, next: any) => {
	const auth = createAuth(c.env);
	const session = await auth.api.getSession({
		headers: c.req.raw.headers,
	});

	if (!session?.user) {
		return c.json({ error: "Unauthorized" }, 401);
	}

	// Get user from database to check role
	const dbUser = await db.select().from(user).where(eq(user.id, session.user.id)).get();

	if (!dbUser || dbUser.role !== "admin") {
		return c.json({ error: "Admin access required" }, 403);
	}

	c.set("user", dbUser);
	await next();
};

// Apply admin middleware to all routes
app.use("*", adminMiddleware);

// GET /admin/users - List all users
app.get("/users", async (c) => {
	try {
		const users = await db
			.select({
				id: user.id,
				name: user.name,
				email: user.email,
				role: user.role,
				emailVerified: user.emailVerified,
				createdAt: user.createdAt,
			})
			.from(user);

		return c.json({ users });
	} catch (error) {
		console.error("Error fetching users:", error);
		return c.json({ error: "Failed to fetch users" }, 500);
	}
});

// POST /admin/users - Create new user
const createUserSchema = z.object({
	name: z.string().min(2, "Name must be at least 2 characters"),
	email: z.string().email("Invalid email address"),
	password: z.string().min(8, "Password must be at least 8 characters"),
	role: z.enum(["admin", "employee"]).default("employee"),
});

app.post("/users", zValidator("json", createUserSchema), async (c) => {
	try {
		const { name, email, password, role } = c.req.valid("json");

		// Check if user already exists
		const existingUser = await db.select().from(user).where(eq(user.email, email)).get();
		if (existingUser) {
			return c.json({ error: "User with this email already exists" }, 400);
		}

		// Create user
		const userId = generateId();
		const hashedPassword = await hashPassword(password);

		await db.insert(user).values({
			id: userId,
			name,
			email,
			emailVerified: true,
			role,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Create account record
		await db.insert(account).values({
			id: generateId(),
			accountId: "email",
			providerId: "credential",
			userId: userId,
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		return c.json({
			message: "User created successfully",
			user: { id: userId, name, email, role },
		});
	} catch (error) {
		console.error("Error creating user:", error);
		return c.json({ error: "Failed to create user" }, 500);
	}
});

// DELETE /admin/users/:id - Delete user
app.delete("/users/:id", async (c) => {
	try {
		const userId = c.req.param("id");

		// Check if user exists
		const existingUser = await db.select().from(user).where(eq(user.id, userId)).get();
		if (!existingUser) {
			return c.json({ error: "User not found" }, 404);
		}

		// Don't allow deleting the last admin
		if (existingUser.role === "admin") {
			const adminCount = await db.select().from(user).where(eq(user.role, "admin"));
			if (adminCount.length <= 1) {
				return c.json({ error: "Cannot delete the last admin user" }, 400);
			}
		}

		// Delete user account records first
		await db.delete(account).where(eq(account.userId, userId));

		// Delete user
		await db.delete(user).where(eq(user.id, userId));

		// Note: Session invalidation would be handled here in a production setup
		// For now, the user will be logged out when they try to access protected routes

		return c.json({ message: "User deleted successfully" });
	} catch (error) {
		console.error("Error deleting user:", error);
		return c.json({ error: "Failed to delete user" }, 500);
	}
});

// ============= PLATFORMS MANAGEMENT =============

// GET /admin/platforms - List all platforms with lead counts
app.get("/platforms", async (c) => {
	try {
		const includeInactive = c.req.query("includeInactive") === "true";
		const search = c.req.query("search");

		// Get platforms with lead counts
		let query = db
			.select({
				id: platforms.id,
				name: platforms.name,
				active: platforms.active,
				leadCount: count(leads.id),
				createdAt: platforms.createdAt,
				updatedAt: platforms.updatedAt,
			})
			.from(platforms)
			.leftJoin(leads, eq(leads.platformId, platforms.id))
			.groupBy(platforms.id);

		// Apply filters
		const conditions = [];
		if (!includeInactive) {
			conditions.push(eq(platforms.active, 1));
		}
		if (search) {
			conditions.push(sql`${platforms.name} LIKE '%' || ${search} || '%' COLLATE NOCASE`);
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		const result = await query.orderBy(sql`${platforms.name} COLLATE NOCASE`);
		return c.json(result);
	} catch (error) {
		console.error("Error fetching platforms:", error);
		return c.json({ error: "Failed to fetch platforms" }, 500);
	}
});

// POST /admin/platforms - Create new platform
const createPlatformSchema = z.object({
	name: z.string().min(1, "Name is required").trim(),
});

app.post("/platforms", zValidator("json", createPlatformSchema), async (c) => {
	try {
		const { name } = c.req.valid("json");

		// Check if platform already exists (case-insensitive)
		const existing = await db
			.select()
			.from(platforms)
			.where(sql`LOWER(${platforms.name}) = LOWER(${name})`)
			.get();

		if (existing) {
			return c.json({ error: "Platform already exists" }, 409);
		}

		// Create platform
		const newPlatform = await db.insert(platforms).values({ name }).returning();

		return c.json(newPlatform[0], 201);
	} catch (error) {
		console.error("Error creating platform:", error);
		return c.json({ error: "Failed to create platform" }, 500);
	}
});

// PUT /admin/platforms/:id - Update platform (rename or toggle active)
const updatePlatformSchema = z.object({
	name: z.string().min(1).trim().optional(),
	active: z.number().min(0).max(1).optional(),
});

app.put("/platforms/:id", zValidator("json", updatePlatformSchema), async (c) => {
	try {
		const id = Number.parseInt(c.req.param("id"), 10);
		const updates = c.req.valid("json");

		// Check if platform exists
		const existing = await db.select().from(platforms).where(eq(platforms.id, id)).get();
		if (!existing) {
			return c.json({ error: "Platform not found" }, 404);
		}

		// If renaming, check for duplicates
		if (updates.name) {
			const duplicate = await db
				.select()
				.from(platforms)
				.where(
					and(
						sql`LOWER(${platforms.name}) = LOWER(${updates.name})`,
						sql`${platforms.id} != ${id}`,
					),
				)
				.get();

			if (duplicate) {
				return c.json({ error: "Platform name already exists" }, 409);
			}
		}

		// Update platform
		const updated = await db
			.update(platforms)
			.set({
				...updates,
				updatedAt: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(platforms.id, id))
			.returning();

		return c.json(updated[0]);
	} catch (error) {
		console.error("Error updating platform:", error);
		return c.json({ error: "Failed to update platform" }, 500);
	}
});

// DELETE /admin/platforms/:id - Delete platform
app.delete("/platforms/:id", async (c) => {
	try {
		const id = Number.parseInt(c.req.param("id"), 10);
		const reassignTo = c.req.query("reassignTo");
		const hardDelete = c.req.query("hardDelete") === "true";

		// Check if platform exists
		const existing = await db.select().from(platforms).where(eq(platforms.id, id)).get();
		if (!existing) {
			return c.json({ error: "Platform not found" }, 404);
		}

		// Check if there are leads using this platform
		const leadCount = await db
			.select({ count: count() })
			.from(leads)
			.where(eq(leads.platformId, id))
			.get();

		if (leadCount?.count && leadCount.count > 0) {
			if (reassignTo) {
				// Reassign leads to another platform
				const targetId = Number.parseInt(reassignTo, 10);
				const target = await db.select().from(platforms).where(eq(platforms.id, targetId)).get();
				if (!target) {
					return c.json({ error: "Target platform not found" }, 400);
				}

				// Update leads to use new platform
				await db.update(leads).set({ platformId: targetId }).where(eq(leads.platformId, id));
			} else if (!hardDelete) {
				// Soft delete - just mark as inactive
				await db
					.update(platforms)
					.set({ active: 0, updatedAt: sql`CURRENT_TIMESTAMP` })
					.where(eq(platforms.id, id));

				return c.json({ message: "Platform deactivated successfully" });
			} else {
				return c.json(
					{ error: "Cannot delete platform with existing leads. Use reassignTo parameter." },
					400,
				);
			}
		}

		// Hard delete if no leads or after reassignment
		await db.delete(platforms).where(eq(platforms.id, id));
		return c.json({ message: "Platform deleted successfully" });
	} catch (error) {
		console.error("Error deleting platform:", error);
		return c.json({ error: "Failed to delete platform" }, 500);
	}
});

// POST /admin/platforms/merge - Merge multiple platforms
const mergePlatformsSchema = z.object({
	sourceIds: z.array(z.number()).min(1),
	targetId: z.number(),
});

app.post("/platforms/merge", zValidator("json", mergePlatformsSchema), async (c) => {
	try {
		const { sourceIds, targetId } = c.req.valid("json");

		// Verify all platforms exist
		const allIds = [...sourceIds, targetId];
		const existing = await db.select().from(platforms).where(inArray(platforms.id, allIds));

		if (existing.length !== allIds.length) {
			return c.json({ error: "One or more platforms not found" }, 404);
		}

		// Update all leads from source platforms to target
		await db
			.update(leads)
			.set({ platformId: targetId })
			.where(inArray(leads.platformId, sourceIds));

		// Delete or deactivate source platforms
		await db
			.update(platforms)
			.set({ active: 0, updatedAt: sql`CURRENT_TIMESTAMP` })
			.where(inArray(platforms.id, sourceIds));

		return c.json({ message: "Platforms merged successfully" });
	} catch (error) {
		console.error("Error merging platforms:", error);
		return c.json({ error: "Failed to merge platforms" }, 500);
	}
});

// ============= TRAINERS MANAGEMENT =============

// GET /admin/trainers - List all trainers with lead counts
app.get("/trainers", async (c) => {
	try {
		const includeInactive = c.req.query("includeInactive") === "true";
		const search = c.req.query("search");

		// Get trainers with lead counts
		let query = db
			.select({
				id: trainers.id,
				handle: trainers.handle,
				name: trainers.name,
				active: trainers.active,
				leadCount: count(leads.id),
				createdAt: trainers.createdAt,
				updatedAt: trainers.updatedAt,
			})
			.from(trainers)
			.leftJoin(leads, eq(leads.trainerId, trainers.id))
			.groupBy(trainers.id);

		// Apply filters
		const conditions = [];
		if (!includeInactive) {
			conditions.push(eq(trainers.active, 1));
		}
		if (search) {
			conditions.push(
				sql`(${trainers.handle} LIKE '%' || ${search} || '%' COLLATE NOCASE 
				OR ${trainers.name} LIKE '%' || ${search} || '%' COLLATE NOCASE)`,
			);
		}

		if (conditions.length > 0) {
			query = query.where(and(...conditions));
		}

		const result = await query.orderBy(sql`${trainers.handle} COLLATE NOCASE`);
		return c.json(result);
	} catch (error) {
		console.error("Error fetching trainers:", error);
		return c.json({ error: "Failed to fetch trainers" }, 500);
	}
});

// POST /admin/trainers - Create new trainer
const createTrainerSchema = z.object({
	handle: z.string().min(1, "Handle is required").trim(),
	name: z.string().trim().optional(),
});

app.post("/trainers", zValidator("json", createTrainerSchema), async (c) => {
	try {
		const { handle, name } = c.req.valid("json");

		// Check if trainer already exists (case-insensitive)
		const existing = await db
			.select()
			.from(trainers)
			.where(sql`LOWER(${trainers.handle}) = LOWER(${handle})`)
			.get();

		if (existing) {
			return c.json({ error: "Trainer handle already exists" }, 409);
		}

		// Create trainer
		const newTrainer = await db.insert(trainers).values({ handle, name }).returning();

		return c.json(newTrainer[0], 201);
	} catch (error) {
		console.error("Error creating trainer:", error);
		return c.json({ error: "Failed to create trainer" }, 500);
	}
});

// PUT /admin/trainers/:id - Update trainer (rename handle/name or toggle active)
const updateTrainerSchema = z.object({
	handle: z.string().min(1).trim().optional(),
	name: z.string().trim().optional(),
	active: z.number().min(0).max(1).optional(),
});

app.put("/trainers/:id", zValidator("json", updateTrainerSchema), async (c) => {
	try {
		const id = Number.parseInt(c.req.param("id"), 10);
		const updates = c.req.valid("json");

		// Check if trainer exists
		const existing = await db.select().from(trainers).where(eq(trainers.id, id)).get();
		if (!existing) {
			return c.json({ error: "Trainer not found" }, 404);
		}

		// If renaming handle, check for duplicates
		if (updates.handle) {
			const duplicate = await db
				.select()
				.from(trainers)
				.where(
					and(
						sql`LOWER(${trainers.handle}) = LOWER(${updates.handle})`,
						sql`${trainers.id} != ${id}`,
					),
				)
				.get();

			if (duplicate) {
				return c.json({ error: "Trainer handle already exists" }, 409);
			}
		}

		// Update trainer
		const updated = await db
			.update(trainers)
			.set({
				...updates,
				updatedAt: sql`CURRENT_TIMESTAMP`,
			})
			.where(eq(trainers.id, id))
			.returning();

		return c.json(updated[0]);
	} catch (error) {
		console.error("Error updating trainer:", error);
		return c.json({ error: "Failed to update trainer" }, 500);
	}
});

// DELETE /admin/trainers/:id - Delete trainer
app.delete("/trainers/:id", async (c) => {
	try {
		const id = Number.parseInt(c.req.param("id"), 10);
		const reassignTo = c.req.query("reassignTo");
		const hardDelete = c.req.query("hardDelete") === "true";

		// Check if trainer exists
		const existing = await db.select().from(trainers).where(eq(trainers.id, id)).get();
		if (!existing) {
			return c.json({ error: "Trainer not found" }, 404);
		}

		// Check if there are leads using this trainer
		const leadCount = await db
			.select({ count: count() })
			.from(leads)
			.where(eq(leads.trainerId, id))
			.get();

		if (leadCount?.count && leadCount.count > 0) {
			if (reassignTo) {
				// Reassign leads to another trainer
				const targetId = Number.parseInt(reassignTo, 10);
				const target = await db.select().from(trainers).where(eq(trainers.id, targetId)).get();
				if (!target) {
					return c.json({ error: "Target trainer not found" }, 400);
				}

				// Update leads to use new trainer
				await db.update(leads).set({ trainerId: targetId }).where(eq(leads.trainerId, id));
			} else if (!hardDelete) {
				// Soft delete - just mark as inactive
				await db
					.update(trainers)
					.set({ active: 0, updatedAt: sql`CURRENT_TIMESTAMP` })
					.where(eq(trainers.id, id));

				return c.json({ message: "Trainer deactivated successfully" });
			} else {
				return c.json(
					{ error: "Cannot delete trainer with existing leads. Use reassignTo parameter." },
					400,
				);
			}
		}

		// Hard delete if no leads or after reassignment
		await db.delete(trainers).where(eq(trainers.id, id));
		return c.json({ message: "Trainer deleted successfully" });
	} catch (error) {
		console.error("Error deleting trainer:", error);
		return c.json({ error: "Failed to delete trainer" }, 500);
	}
});

// POST /admin/trainers/merge - Merge multiple trainers
const mergeTrainersSchema = z.object({
	sourceIds: z.array(z.number()).min(1),
	targetId: z.number(),
});

app.post("/trainers/merge", zValidator("json", mergeTrainersSchema), async (c) => {
	try {
		const { sourceIds, targetId } = c.req.valid("json");

		// Verify all trainers exist
		const allIds = [...sourceIds, targetId];
		const existing = await db.select().from(trainers).where(inArray(trainers.id, allIds));

		if (existing.length !== allIds.length) {
			return c.json({ error: "One or more trainers not found" }, 404);
		}

		// Update all leads from source trainers to target
		await db.update(leads).set({ trainerId: targetId }).where(inArray(leads.trainerId, sourceIds));

		// Delete or deactivate source trainers
		await db
			.update(trainers)
			.set({ active: 0, updatedAt: sql`CURRENT_TIMESTAMP` })
			.where(inArray(trainers.id, sourceIds));

		return c.json({ message: "Trainers merged successfully" });
	} catch (error) {
		console.error("Error merging trainers:", error);
		return c.json({ error: "Failed to merge trainers" }, 500);
	}
});

export default app;
