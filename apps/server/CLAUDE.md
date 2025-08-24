# One Percent Stats - Server Application

This document contains development guidelines specifically for the server application (`apps/server/`) of the One Percent Stats project.

## 🎯 Quick Reference

**Runtime**: Bun (not npm/yarn/pnpm)  
**Framework**: Hono on Cloudflare Workers  
**Database**: Cloudflare D1 (SQLite)  
**ORM**: Drizzle ORM  
**Authentication**: better-auth  
**Build Tool**: Wrangler  
**Deployment**: Cloudflare Workers

## 🏗️ Architecture

### File Structure
```
src/
├── db/
│   ├── schema/
│   │   ├── auth.ts              # Authentication tables (user, session, account)
│   │   └── leads.ts             # Business logic tables (leads, advertising_costs)
│   ├── migrations/              # Generated Drizzle migrations
│   ├── index.ts                 # Main database connection
│   └── script-db.ts             # Separate connection for scripts
├── lib/
│   ├── auth.ts                  # better-auth configuration
│   ├── date-utils.ts            # Date formatting utilities
│   ├── status.ts                # Lead status constants and utilities
│   └── status-maintenance.ts    # Automatic status transition logic
├── routers/
│   ├── admin.ts                 # Admin-only endpoints
│   ├── analytics.ts             # Main analytics API endpoints
│   └── index.ts                 # Router composition
├── scripts/                     # Data management scripts
│   ├── import-leads.ts          # CSV import functionality
│   ├── create-db-from-sql.ts    # Database creation from SQL
│   └── ...                      # Other utility scripts
└── index.ts                     # Main application entry point
```

### Database Architecture
The application uses **two separate database schemas** in `src/db/schema/`:

- **`auth.ts`**: Authentication tables managed by better-auth
  - `user` - User accounts and profiles
  - `session` - Active user sessions
  - `account` - OAuth provider accounts
  - `verification` - Email verification tokens

- **`leads.ts`**: Business logic tables
  - `leads` - Core lead tracking data with unified status system
  - `advertising_costs` - Monthly advertising spend data

## 📋 Coding Standards

### API Design Patterns
```typescript
// Standard Hono router setup
const app = new Hono();

// GET endpoint with query parameters
app.get("/leads", async (c) => {
  const month = c.req.query("month");
  const year = c.req.query("year");
  
  let query = db.select().from(leads);
  
  const conditions = [];
  if (month) conditions.push(eq(leads.month, month));
  if (year) conditions.push(eq(leads.closedYear, year));
  
  if (conditions.length > 0) {
    query = query.where(and(...conditions));
  }
  
  const results = await query.orderBy(desc(leads.createdAt));
  return c.json(results);
});

// POST endpoint with validation
app.post("/leads", async (c) => {
  const body = await c.req.json();
  
  // Validate required fields
  if (!body.name) {
    return c.json({ error: "Name is required" }, 400);
  }
  
  try {
    const newLead = await db.insert(leads).values(leadData).returning();
    return c.json(newLead[0], 201);
  } catch (error) {
    console.error("Error creating lead:", error);
    return c.json({ error: "Failed to create lead" }, 500);
  }
});
```

### Database Query Patterns
```typescript
// Use Drizzle ORM query builder
import { and, count, desc, eq, sql, sum } from "drizzle-orm";

// Simple select with conditions
const leads = await db
  .select()
  .from(leads)
  .where(eq(leads.platform, "Facebook"))
  .orderBy(desc(leads.createdAt));

// Aggregation queries
const summary = await db
  .select({
    platform: leads.platform,
    totalLeads: count(),
    closedLeads: count(sql`CASE WHEN ${leads.isClosed} = 1 THEN 1 END`),
    totalSales: sql<number>`CAST(COALESCE(SUM(CAST(${leads.sales} AS INTEGER)), 0) AS INTEGER)`
  })
  .from(leads)
  .groupBy(leads.platform);

// Complex conditions with multiple filters
const conditions = [];
if (month) conditions.push(eq(leads.month, month));
if (platform) conditions.push(eq(leads.platform, platform));

const query = db.select().from(leads);
if (conditions.length > 0) {
  query = query.where(and(...conditions));
}
```

## 🗄️ Database Operations

### Schema Management
```bash
# Generate migrations after schema changes
bun run db:generate

# Apply migrations locally
bun run db:migrate:local

# Apply migrations to remote D1
bun run db:migrate:remote

# View database in Drizzle Studio
bun run db:studio
```

### Date Handling Conventions
The application uses **DD/MM/YYYY** format consistently:

```typescript
import { standardizeDate, getMonthFromDate, getYearFromDate, addDaysToDDMMYYYY, todayDDMMYYYY } from '../lib/date-utils';

// Always standardize dates before storing
const dateValue = standardizeDate(body.date) || "";
const monthValue = getMonthFromDate(dateValue);
const yearValue = getYearFromDate(dateValue);

// Lead data preparation with status-based date handling
const leadData = {
  name: body.name,
  date: dateValue,
  month: monthValue,
  status: body.status || "New",
  contactedDate: body.status === "Contacted" ? dateValue : "",
  nextFollowUpDate: body.status === "Follow Up" ? addDaysToDDMMYYYY(dateValue, 3) : "",
  lastActivityDate: todayDDMMYYYY(),
  closedDate: standardizeDate(body.closedDate) || "",
  closedMonth: getMonthFromDate(closedDate),
  closedYear: getYearFromDate(closedDate),
};
```

### Lead Status Management
```typescript
import { LEAD_STATUSES, normalizeStatus, isWonStatus } from '../lib/status';
import { runStatusMaintenance } from '../lib/status-maintenance';

// Auto-derive status based on business rules
const salesValue = body.sales || 0;
let statusValue = normalizeStatus(body.status);

// Auto-set status to "Closed Won" when sales > 0
if (salesValue > 0 && !isWonStatus(statusValue)) {
  statusValue = "Closed Won";
} else if (salesValue === 0 && statusValue === "Closed Won") {
  statusValue = "Closed Lost";
}

// Auto-set closed date for won leads
let closedDateValue = standardizeDate(body.closedDate) || "";
if (statusValue === "Closed Won" && !closedDateValue && dateValue) {
  closedDateValue = dateValue;
} else if (statusValue !== "Closed Won") {
  closedDateValue = ""; // Clear if not won
}

// Run automatic status maintenance on API calls
await runStatusMaintenance(db);
```

## 🔐 Authentication

### better-auth Configuration
```typescript
// src/lib/auth.ts
export function createAuth(env: any) {
  return betterAuth({
    database: drizzleAdapter(db, {
      provider: "sqlite",
      schema: schema, // auth schema
    }),
    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
      disableSignUp: true, // Registration disabled
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
  });
}
```

### Auth Route Handling
```typescript
// Main app setup with auth routes
app.on(["POST", "GET", "OPTIONS"], "/api/auth/**", async (c) => {
  try {
    const auth = createAuth(c.env);
    const response = await auth.handler(c.req.raw);
    return response;
  } catch (error) {
    console.error("Auth error:", error);
    return c.json({ error: "Authentication error", details: error.message }, 500);
  }
});
```

## 📊 API Endpoints

### Core Analytics Endpoints
- `GET /api/analytics/leads` - Get leads with filtering by status, platform, dateType
- `GET /api/analytics/leads/summary` - Total counts and sales with status-based metrics
- `GET /api/analytics/leads/platform-breakdown` - Platform performance with dateType support
- `GET /api/analytics/leads/funnel` - Sales funnel analysis with 6-stage canonical status flow
- `GET /api/analytics/leads/filter-options` - Available filter options including canonical statuses
- `GET /api/analytics/roas` - ROAS calculations using "Closed Won" for conversions
- `GET /api/analytics/leads/growth/monthly` - Monthly growth data
- `GET /api/analytics/leads/growth/yearly` - Yearly growth data

### CRUD Endpoints
- `POST/PUT/DELETE /api/analytics/leads/:id` - Lead management
- `POST/PUT/DELETE /api/analytics/advertising-costs/:id` - Cost management

### Query Parameter Patterns
```typescript
// Standard filtering parameters
const month = c.req.query("month");     // "January", "February", etc.
const year = c.req.query("year");       // "2024", "2025", etc.
const platform = c.req.query("platform"); // "Facebook", "Google", etc.
const status = c.req.query("status");   // "New", "Contacted", "Follow Up", etc.
const dateType = c.req.query("dateType"); // "lead" or "closed"
```

## 🛠️ Development Commands

### Local Development
```bash
# Start development server (port 3000)
bun run dev

# Type checking
bun run check-types

# Build for deployment (dry run)
bun run build

# Deploy to Cloudflare Workers
bun run deploy
```

### Database Commands
```bash
# Generate migrations after schema changes
bun run db:generate

# Apply migrations locally
bun run db:migrate:local

# Apply migrations to remote D1
bun run db:migrate:remote

# Launch Drizzle Studio
bun run db:studio

# Sync local database with remote
bun run db:sync
```

### Script Execution
```bash
# Run data import scripts
cd apps/server
bun run src/scripts/import-leads.ts

# Create database from SQL file
bun run src/scripts/create-db-from-sql.ts
```

## 🌍 Environment Configuration

### Required Environment Variables
```bash
# Database
CLOUDFLARE_ACCOUNT_ID=your-account-id
CLOUDFLARE_DATABASE_ID=your-database-id
CLOUDFLARE_D1_TOKEN=your-api-token

# Authentication
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-domain.com
CORS_ORIGIN=https://your-frontend-domain.com

# Lead Management
FOLLOW_UP_DAYS=3  # Days before automatic status promotion from "Contacted" to "Follow Up"

# Optional OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### Cloudflare Workers Configuration
```jsonc
// wrangler.jsonc
{
  "name": "onepercent-stats-server",
  "main": "src/index.ts",
  "compatibility_date": "2025-06-15",
  "compatibility_flags": ["nodejs_compat"],
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "onepercent-stats-new",
      "database_id": "your-database-id",
      "migrations_dir": "./src/db/migrations"
    }
  ]
}
```

## 🧪 Data Scripts & Utilities

### Import Scripts
```bash
# Import leads from CSV
cd apps/server
bun run src/scripts/import-leads.ts path/to/leads.csv

# Import to remote database
bun run src/scripts/import-leads-remote.ts
```

### Database Queries
```bash
# Query remote database directly
wrangler d1 execute onepercent-stats-new --remote --command "SELECT COUNT(*) FROM leads"

# Export database to SQL
wrangler d1 export onepercent-stats-new --remote --output backup.sql

# Import data from SQL file
wrangler d1 execute onepercent-stats-new --remote --file backup.sql
```

## 📈 Performance & Optimization

### Query Optimization
```typescript
// Use indexes effectively
const leads = await db
  .select()
  .from(leads)
  .where(and(
    eq(leads.platform, platform),     // Indexed field
    eq(leads.closedYear, year)        // Indexed field
  ))
  .orderBy(desc(leads.createdAt));    // Indexed field

// Aggregate efficiently
const summary = await db
  .select({
    count: count(),
    totalSales: sql<number>`CAST(COALESCE(SUM(CAST(${leads.sales} AS INTEGER)), 0) AS INTEGER)`
  })
  .from(leads)
  .where(eq(leads.isClosed, true));
```

### Error Handling
```typescript
// Standard error handling pattern
app.get("/endpoint", async (c) => {
  try {
    const result = await db.select().from(table);
    return c.json(result);
  } catch (error) {
    console.error("Error description:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    return c.json({ 
      error: "User-friendly error message", 
      details: errorMessage 
    }, 500);
  }
});
```

## ⚠️ Common Pitfalls

### ❌ DON'T
- Use `npm` or `yarn` - this project uses Bun exclusively
- Modify migration files manually after generation
- Store dates in inconsistent formats
- Skip input validation on POST/PUT endpoints
- Use raw SQL when Drizzle query builder suffices
- Commit sensitive environment variables
- Skip error handling in async operations
- Use `console.log` without error context

### ✅ DO
- Use Bun for all package management and script execution
- Generate migrations with `bun run db:generate` after schema changes
- Standardize all dates using `standardizeDate()` utility
- Validate inputs and return appropriate HTTP status codes
- Use Drizzle ORM query builder for type safety
- Use environment variables for configuration
- Implement comprehensive error handling with logging
- Use structured logging with context information

## 🔧 Debugging & Troubleshooting

### Common Issues
1. **Migration errors**: Ensure migrations are applied in order
2. **Date format issues**: Always use `standardizeDate()` utility
3. **CORS issues**: Check `CORS_ORIGIN` environment variable
4. **Authentication errors**: Verify `BETTER_AUTH_SECRET` and `BETTER_AUTH_URL`
5. **Database connection**: Confirm D1 binding and credentials

### Development Tools
```bash
# Check database schema
wrangler d1 execute onepercent-stats-new --remote --command "PRAGMA table_info(leads)"

# View recent logs
wrangler tail onepercent-stats-server

# Test endpoints locally
curl http://localhost:3000/api/analytics/leads/summary
```

## 📚 Key Dependencies

### Core
- `hono` (4.8+) - Web framework for Cloudflare Workers
- `drizzle-orm` (0.44+) - Type-safe ORM
- `better-auth` (1.3+) - Authentication library

### Database & Validation
- `@libsql/client` - D1 database client
- `zod` (4.0+) - Schema validation
- `@hono/zod-validator` - Hono + Zod integration

### Utilities
- `csv-parse` - CSV file processing
- `dotenv` - Environment variable loading

### Development
- `drizzle-kit` (0.31+) - Migration generation
- `wrangler` (4.27+) - Cloudflare Workers CLI
- `typescript` (5.8+) - Type checking

---

**Remember**: Always follow Cloudflare Workers best practices, use type-safe database queries, and maintain consistent date formatting throughout the application. When in doubt, check existing endpoints and patterns in the codebase.