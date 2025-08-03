import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import { db } from "../db/script-db";
import { account, user } from "../db/schema/auth";

async function seedAdmin() {
	const email = "signatureonepercent2025@gmail.com";
	const password = "12345678";
	const name = "Jane";

	console.log(`Seeding admin user: ${email}...`);

	try {
		// First, delete any existing records to prevent conflicts
		const existingUser = await db
			.select()
			.from(user)
			.where(eq(user.email, email))
			.get();
		if (existingUser) {
			console.log("Found existing user. Deleting old records...");
			await db.delete(account).where(eq(account.userId, existingUser.id));
			await db.delete(user).where(eq(user.id, existingUser.id));
			console.log("Old records deleted.");
		}

		// Generate a new user ID and hash the password
		const userId = generateId();
		const hashedPassword = await hashPassword(password);

		console.log("Creating new user and account records...");

		// Create the user record
		await db.insert(user).values({
			id: userId,
			name: name,
			email: email,
			emailVerified: true,
			role: "admin",
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		// Create the associated account record with the hashed password
		await db.insert(account).values({
			id: generateId(),
			accountId: email,
			providerId: "credential",
			userId: userId,
			password: hashedPassword,
			createdAt: new Date(),
			updatedAt: new Date(),
		});

		console.log("✅ Admin user created successfully!");
		console.log("You can now log in with:");
		console.log(`   Email: ${email}`);
		console.log(`   Password: ${password}`);
	} catch (e) {
		console.error("❌ Seeding failed:", e);
		process.exit(1);
	}
}

seedAdmin();
