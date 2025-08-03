// This script should be run via wrangler to have access to the D1 database
// Run with: wrangler d1 execute onepercent-stats-new --remote --file seed-employees.sql

// First, let's create the SQL commands to insert the user manually
console.log(`
-- Check if Jane already exists
SELECT * FROM user WHERE email = 'chongxienhui4m@gmail.com';

-- If she doesn't exist, run these commands:
-- Note: You'll need to generate a proper password hash and user ID

-- Example user ID (generate a proper one): user_123456789
-- Example password hash for "12345678" (generate a proper one using better-auth)

INSERT INTO user (id, name, email, email_verified, role, created_at, updated_at) 
VALUES ('user_jane_admin', 'Jane', 'chongxienhui4m@gmail.com', 1, 'admin', ${Date.now()}, ${Date.now()});

INSERT INTO account (id, account_id, provider_id, user_id, password, created_at, updated_at)
VALUES ('account_jane_admin', 'email', 'credential', 'user_jane_admin', '$2a$10$example_hash_here', ${Date.now()}, ${Date.now()});
`);
