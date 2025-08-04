# Development Guide

## Database Migration Workflow

### 1. Making Schema Changes

When you need to change the database schema:

1. **Edit the schema files** in `apps/server/src/db/schema/`
2. **Generate migration files**:
   ```bash
   cd apps/server
   bun run db:generate
   ```
   This creates SQL migration files in `src/db/migrations/`

### 2. Testing Locally

Before deploying, always test your migrations locally:

1. **Apply migrations to local database**:
   ```bash
   cd apps/server
   bun run db:migrate:local
   ```

2. **Test your application locally**:
   ```bash
   # Start the development server
   bun run dev
   
   # In another terminal, run the web app
   cd apps/web
   bun run dev
   ```

3. **Verify the changes work as expected**
   - Test the new functionality
   - Ensure existing features still work
   - Check data integrity

4. **If something goes wrong**, you can reset your local database:
   ```bash
   # Export current local data if needed
   wrangler d1 export onepercent-stats-new --local --output=local-backup.sql
   
   # Reset local database
   wrangler d1 execute onepercent-stats-new --local --file=remote-backup.sql
   ```

### 3. Deploying Changes

Once you've tested locally and everything works:

#### Option A: Manual Deployment
```bash
# From project root
bun run deploy
```

#### Option B: Git Push (Automated)
```bash
git add .
git commit -m "Add new feature with database migration"
git push origin main
```
GitHub Actions will automatically deploy and apply migrations.

### 4. Migration Commands Reference

From the `apps/server` directory:

- **Generate migrations**: `bun run db:generate`
- **Apply to local DB**: `bun run db:migrate:local`
- **Apply to remote DB**: `bun run db:migrate:remote`
- **View local DB**: `bun run db:studio`
- **Push schema directly** (skips migrations): `bun run db:push`

### 5. Example Workflow

Here's a complete example of adding a new column:

```bash
# 1. Edit schema
# Add a new column to apps/server/src/db/schema/leads.ts

# 2. Generate migration
cd apps/server
bun run db:generate

# 3. Review the generated SQL
cat src/db/migrations/0001_*.sql

# 4. Test locally
bun run db:migrate:local
bun run dev

# 5. Test the feature
# Make sure everything works

# 6. Deploy
cd ../..  # Back to project root
bun run deploy

# OR commit and push
git add .
git commit -m "Add new column to leads table"
git push origin main
```

## Running the Application Locally

To run the application in development mode, you need to start both the server and the web application.

### 1. Start the Server

```bash
cd apps/server
bun run dev
```

This will start the server on `http://localhost:3000` with access to the remote D1 database.

### 2. Start the Web Application

In a new terminal:

```bash
cd apps/web
bun run dev
```

This will start the web application on `http://localhost:5173`.

### 3. Access the Application

1. Open your browser and go to `http://localhost:5173`
2. You should be redirected to the login page
3. Use the admin credentials:
   - **Email:** signatureonepercent2025@gmail.com
   - **Password:** 12345678

### Troubleshooting

#### Infinite Loading on Login Page

If you see an infinite loading spinner:

1. **Check if the server is running:** Make sure `bun run dev` is running in the `apps/server` directory
2. **Check the browser console:** Look for any error messages
3. **Verify environment variables:** Make sure `VITE_SERVER_URL=http://localhost:3000` is set in `apps/web/.env`

#### Authentication Issues

1. **Clear browser storage:** Clear localStorage and cookies for localhost
2. **Check server logs:** Look at the server terminal for any error messages
3. **Verify database:** Make sure the user exists in the database

#### CORS Issues

If you see CORS errors, make sure:
1. The server is running on port 3000
2. The web app is running on port 5173
3. The CORS configuration in the server allows requests from the web app

### Database Management

#### Syncing Local Database with Remote

To sync your local SQLite database with the remote D1 database:

```bash
cd apps/server
bun run db:sync
```

This script will:
1. Export all data from the remote D1 database
2. Apply local migrations to ensure schema is up to date
3. Clear existing local data
4. Import the remote data to your local database
5. Verify the sync was successful

**Available options:**
- `bun run db:sync` - Full sync (export + import)
- `bun run db:sync --no-import` - Export only (useful for backups)
- `bun run db:sync --keep` - Keep temporary SQL files for debugging

#### Direct Database Access

To query the remote database directly:

```bash
cd apps/server
wrangler d1 execute onepercent-stats-new --remote --command "SELECT * FROM user"
```

To query the local database:

```bash
cd apps/server
wrangler d1 execute onepercent-stats-new --local --command "SELECT * FROM user"
```

#### Common Database Operations

```bash
# Count records in each table (remote)
wrangler d1 execute onepercent-stats-new --remote --command "SELECT 'leads' as table_name, COUNT(*) as count FROM leads UNION ALL SELECT 'advertising_costs', COUNT(*) FROM advertising_costs"

# Get recent leads
wrangler d1 execute onepercent-stats-new --remote --command "SELECT id, name, platform, sales, created_at FROM leads ORDER BY created_at DESC LIMIT 10"

# Check advertising costs
wrangler d1 execute onepercent-stats-new --remote --command "SELECT * FROM advertising_costs ORDER BY year DESC, month DESC"
```

### Admin Features

Once logged in as an admin user, you can:
1. Access the admin panel at `/admin`
2. Create new employee accounts
3. Delete existing users (except yourself)
4. Manage user roles (admin vs employee)
