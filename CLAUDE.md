# One Percent Stats

This repository contains the source code for the One Percent Stats application, a web-based analytics dashboard for tracking and visualizing leads data.

## 🎯 Quick Reference

**Language**: TypeScript  
**Package Manager**: Bun (not npm/yarn/pnpm)  
**Backend**: Hono on Cloudflare Workers  
**Frontend**: React with Vite  
**Database**: Cloudflare D1 (SQLite)  
**ORM**: Drizzle ORM  
**Authentication**: better-auth  
**Linting**: Biome  
**Deployment**: Cloudflare Workers + Pages

## 🏗️ Monorepo Structure

The repository is a monorepo managed by Bun and Turborepo, divided into two main applications: `apps/server` and `apps/web`.

### Essential Commands

```bash
# Development
bun run dev              # Start both server and web in development
bun run server:dev       # Start only server
bun run web:dev          # Start only web

# Build
bun run build            # Build both applications
bun run server:build     # Build only server
bun run web:build        # Build only web

# Linting & Type checking
bun run lint             # Lint all code with Biome
bun run check-types      # Type check all applications

# Database operations (from apps/server)
cd apps/server
bun run db:generate      # Generate migrations after schema changes
bun run db:migrate:local # Apply migrations locally
bun run db:migrate:remote # Apply migrations to remote D1
bun run db:studio        # Launch Drizzle Studio
```

## 📚 Documentation Structure

Each part of the monorepo has its own detailed documentation:

- **Root CLAUDE.md** (this file): Monorepo overview and database operations
- **`apps/server/CLAUDE.md`**: Backend development guidelines, API patterns, Cloudflare Workers
- **`apps/web/CLAUDE.md`**: Frontend development guidelines, UI components, React patterns

### Application Structure

#### `apps/server` - Backend API
Hono-based API running on Cloudflare Workers with D1 database integration.
**📋 See `apps/server/CLAUDE.md` for detailed server development guidelines.**

#### `apps/web` - Frontend Application  
React application built with Vite, deployed on Cloudflare Pages.
**📋 See `apps/web/CLAUDE.md` for detailed web development guidelines.**

## Database Operations

### Querying the Remote D1 Database

The project uses Cloudflare D1 as the database. You can query the remote database directly using the Wrangler CLI.

#### Basic Query Commands

```bash
# Navigate to the server directory
cd apps/server

# Query the remote database (replace with your actual database name)
wrangler d1 execute onepercent-stats-new --remote --command "SELECT * FROM leads LIMIT 5"

# Get table structure
wrangler d1 execute onepercent-stats-new --remote --command "PRAGMA table_info(leads)"

# Count total records
wrangler d1 execute onepercent-stats-new --remote --command "SELECT COUNT(*) as total FROM leads"
```

#### Common Queries

```bash
# Get leads by platform
wrangler d1 execute onepercent-stats-new --remote --command "SELECT platform, COUNT(*) as count FROM leads GROUP BY platform ORDER BY count DESC"

# Get conversion data
wrangler d1 execute onepercent-stats-new --remote --command "SELECT is_closed, COUNT(*) as count, SUM(sales) as total_sales FROM leads GROUP BY is_closed"

# Get recent leads
wrangler d1 execute onepercent-stats-new --remote --command "SELECT id, name, platform, sales, created_at FROM leads ORDER BY created_at DESC LIMIT 10"

# Get leads with sales data
wrangler d1 execute onepercent-stats-new --remote --command "SELECT * FROM leads WHERE sales > 0 ORDER BY sales DESC"
```

#### Database Schema

The main tables in the database:

**leads table:**
- `id` (INTEGER, PRIMARY KEY)
- `month` (TEXT) - Month name (e.g., "May", "June")
- `date` (TEXT) - Date in DD/MM/YYYY format
- `name` (TEXT) - Lead's name
- `phone_number` (TEXT) - Phone number
- `platform` (TEXT) - Marketing platform (Facebook, Google, etc.)
- `is_closed` (INTEGER) - Boolean (0/1) indicating if lead is closed
- `status` (TEXT) - Lead status
- `sales` (INTEGER) - Sales amount in RM
- `remark` (TEXT) - Additional notes
- `trainer_handle` (TEXT) - Trainer identifier
- `closed_date` (TEXT) - Date when lead was closed (DD/MM/YYYY)
- `closed_month` (TEXT) - Month when lead was closed
- `closed_year` (TEXT) - Year when lead was closed
- `created_at` (TEXT) - Timestamp when record was created

**advertising_costs table:**
- `id` (INTEGER, PRIMARY KEY)
- `month` (INTEGER) - Month number (1-12)
- `year` (INTEGER) - Year
- `cost` (REAL) - Advertising cost amount
- `currency` (TEXT) - Currency (default "RM")
- `created_at` (TEXT) - Creation timestamp
- `updated_at` (TEXT) - Last update timestamp

#### Database Migrations

```bash
# Generate new migration (after schema changes)
cd apps/server
bun run db:generate

# Apply migrations locally
bun run db:migrate:local

# Apply migrations to remote database
bun run db:migrate:remote

# Check migration status
wrangler d1 execute onepercent-stats-new --remote --command "SELECT * FROM __drizzle_migrations"
```

#### Local vs Remote Database

```bash
# Query local database
wrangler d1 execute onepercent-stats-new --local --command "SELECT COUNT(*) FROM leads"

# Query remote database  
wrangler d1 execute onepercent-stats-new --remote --command "SELECT COUNT(*) FROM leads"
```

#### Data Backup and Export

```bash
# Export data to SQL file
wrangler d1 export onepercent-stats-new --remote --output backup.sql

# Import data from SQL file
wrangler d1 execute onepercent-stats-new --remote --file backup.sql
```

#### Cloudflare Authentication

**IMPORTANT**: Do NOT use `wrangler login` for authentication. Instead, use the API token from the `.env` file.

The project uses API token authentication which is automatically read from the `.env` file in `apps/server/`:
- `CLOUDFLARE_D1_TOKEN` - API token for D1 database access
- `CLOUDFLARE_API_KEY` - Same token value for API access
- `CLOUDFLARE_ACCOUNT_ID` - Account ID for Cloudflare operations
- `CLOUDFLARE_DATABASE_ID` - Database ID for the D1 database

Wrangler automatically reads these environment variables, so no manual authentication is needed.

#### Export/Import Data Between Remote and Local

```bash
# Export full database from remote
cd apps/server
wrangler d1 export onepercent-stats-new --remote --output=./backup.sql

# Export only data (no schema)
wrangler d1 export onepercent-stats-new --remote --output=./data-only.sql --no-schema

# Export only schema (no data)
wrangler d1 export onepercent-stats-new --remote --output=./schema-only.sql --no-data

# Import to local database (after clearing existing data)
wrangler d1 execute onepercent-stats-new --local --file=./backup.sql

# Clear local database tables before import
wrangler d1 execute onepercent-stats-new --local --command "DROP TABLE IF EXISTS leads; DROP TABLE IF EXISTS advertising_costs; DROP TABLE IF EXISTS account; DROP TABLE IF EXISTS session; DROP TABLE IF EXISTS verification; DROP TABLE IF EXISTS user;"
```

## 🚀 Getting Started

### Prerequisites
- **Bun** (latest version) - [Install Bun](https://bun.sh)
- **Cloudflare account** - For D1 database and Workers deployment

### Quick Setup
```bash
# Clone and install
git clone <repository-url>
cd onepercent-stats
bun install

# Set up environment (copy from .env.example files)
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.example apps/web/.env

# Start development
bun run dev
```

### Environment Variables
Both applications require environment setup. See individual CLAUDE.md files for complete lists:
- **Server**: Database credentials, auth secrets, CORS origins
- **Web**: API URLs, auth configuration

## ⚠️ Important Notes

- **Never use npm/yarn/pnpm** - This project uses Bun exclusively
- **Database operations** - Always run from `apps/server` directory
- **Authentication** - Uses API token authentication (not `wrangler login`)
- **Date format** - All dates use DD/MM/YYYY format consistently

## 🛠️ Troubleshooting

### Common Issues
- **Column not found errors**: Apply migrations with `bun run db:migrate:remote`
- **Authentication errors**: Verify API token in `apps/server/.env`
- **Database not found**: Check database name in `apps/server/wrangler.jsonc`
- **CORS issues**: Verify `CORS_ORIGIN` matches your frontend URL
