# GitHub Actions Setup

## Required Secrets

To enable automatic deployments, you need to add the following secrets to your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret" and add each of the following:

### Required Secrets:

- **CLOUDFLARE_API_TOKEN**: Your Cloudflare API token with D1 permissions
- **CLOUDFLARE_ACCOUNT_ID**: Your Cloudflare account ID
- **CLOUDFLARE_DATABASE_ID**: Your D1 database ID (ab4a3dca-8c8f-4208-9f90-3cb7a2a78db4)
- **CLOUDFLARE_D1_TOKEN**: Same as CLOUDFLARE_API_TOKEN (used by the deploy script)

### Getting the Values:

You can find these values in your local `.env` file at `apps/server/.env`:
```
CLOUDFLARE_API_TOKEN=your-token-here
CLOUDFLARE_ACCOUNT_ID=2c151c1ac903456d335dab88828abf46
CLOUDFLARE_DATABASE_ID=ab4a3dca-8c8f-4208-9f90-3cb7a2a78db4
CLOUDFLARE_D1_TOKEN=your-token-here
```

## Deployment Process

When you push to the `main` branch:
1. GitHub Actions will automatically trigger the deployment workflow
2. It will install dependencies using Bun
3. Build the web application
4. Apply any pending database migrations
5. Deploy the Worker to Cloudflare
6. Verify the deployment

## Manual Deployment

You can also trigger a deployment manually from the Actions tab in your GitHub repository.

## Monitoring Deployments

Check the Actions tab in your repository to see the status of deployments and any error logs.