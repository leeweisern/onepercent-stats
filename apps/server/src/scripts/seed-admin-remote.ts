import { generateId } from "better-auth";
import { hashPassword } from "better-auth/crypto";

async function generateSeedSQL() {
	const email = "signatureonepercent2025@gmail.com";
	const password = "12345678";
	const name = "Jane";

	// Generate a new user ID and hash the password
	const userId = generateId();
	const hashedPassword = await hashPassword(password);
	const accountId = generateId();
	const now = new Date().toISOString();

	console.log(`-- Delete existing user if any`);
	console.log(
		`DELETE FROM account WHERE user_id IN (SELECT id FROM user WHERE email = '${email}');`,
	);
	console.log(`DELETE FROM user WHERE email = '${email}';`);
	console.log();

	console.log(`-- Create admin user`);
	console.log(
		`INSERT INTO user (id, name, email, email_verified, role, created_at, updated_at) VALUES ('${userId}', '${name}', '${email}', 1, 'admin', '${now}', '${now}');`,
	);
	console.log();

	console.log(`-- Create account with hashed password`);
	console.log(
		`INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at) VALUES ('${accountId}', '${email}', 'credential', '${userId}', '${hashedPassword}', '${now}', '${now}');`,
	);
	console.log();

	console.log(`-- Login credentials:`);
	console.log(`-- Email: ${email}`);
	console.log(`-- Password: ${password}`);
}

generateSeedSQL();
