# Deployment Guide

This project includes automated deployment scripts that handle building the frontend, running database migrations, and deploying to Cloudflare Workers with Static Assets.

## Quick Deploy

```bash
# Full deployment (recommended)
bun run deploy

# Advanced deployment with more options
bun run deploy:advanced
```

## Deploy Commands

| Command | Description |
|---------|-------------|
| `bun run deploy` | Simple deployment - builds web app, runs migrations, deploys Worker |
| `bun run deploy:advanced` | Advanced deployment with pre-checks and verification |
| `bun run deploy:dry-run` | Test deployment without actually deploying |
| `bun run deploy:quick` | Deploy without running migrations |
| `bun run deploy:no-build` | Deploy without rebuilding the web app |

## Advanced Options

The advanced deploy script supports additional flags:

```bash
# Test what would happen without deploying
bun run deploy:advanced --dry-run

# Skip building the web application
bun run deploy:advanced --skip-build

# Skip database migrations
bun run deploy:advanced --skip-migrations

# Verbose output for debugging
bun run deploy:advanced --verbose

# Combine flags
bun run deploy:advanced --skip-build --verbose
```

## What the Deploy Script Does

1. **Pre-deployment Checks**
   - Verifies required directories exist
   - Checks Wrangler CLI is available
   - Validates authentication

2. **Build Web Application**
   - Runs `bun run build` in the web directory
   - Generates static assets for deployment

3. **Database Migrations**
   - Checks for pending migration files
   - Applies migrations to remote D1 database
   - Skips if no migrations found

4. **Deploy Worker**
   - Deploys Worker with static assets
   - Includes API routes and frontend

5. **Post-deployment Verification**
   - Tests API endpoints
   - Verifies frontend is serving
   - Checks database connectivity

## Environment Variables

Make sure you have the following environment variable set:

```bash
CLOUDFLARE_D1_TOKEN=your_cloudflare_api_token
```

Or the script will use the hardcoded token as fallback.

## Troubleshooting

If deployment fails:

1. **Check Authentication**: Run `wrangler whoami` to verify your token
2. **Check Permissions**: Ensure your API token has Workers and D1 permissions
3. **Use Dry Run**: Test with `--dry-run` flag first
4. **Use Verbose**: Add `--verbose` flag for detailed output
5. **Manual Steps**: Run individual commands manually to isolate issues

## Manual Deployment Steps

If you need to deploy manually:

```bash
# 1. Build web app
cd apps/web && bun run build

# 2. Run migrations (if any)
cd ../server && wrangler d1 migrations apply onepercent-stats-new --remote

# 3. Deploy Worker
wrangler deploy
```

## Database Sync

To sync your local database to remote:

```bash
bun run db:sync
```

This is useful if you have local data changes you want to push to production.