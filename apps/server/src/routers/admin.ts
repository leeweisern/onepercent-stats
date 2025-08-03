import { Hono } from "hono";
import { createAuth } from "../lib/auth";
import { db } from "../db";
import { user, account } from "../db/schema/auth";
import { eq } from "drizzle-orm";
import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";

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
	const dbUser = await db
		.select()
		.from(user)
		.where(eq(user.id, session.user.id))
		.get();

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
		const existingUser = await db
			.select()
			.from(user)
			.where(eq(user.email, email))
			.get();
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
		const existingUser = await db
			.select()
			.from(user)
			.where(eq(user.id, userId))
			.get();
		if (!existingUser) {
			return c.json({ error: "User not found" }, 404);
		}

		// Don't allow deleting the last admin
		if (existingUser.role === "admin") {
			const adminCount = await db
				.select()
				.from(user)
				.where(eq(user.role, "admin"));
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

export default app;
