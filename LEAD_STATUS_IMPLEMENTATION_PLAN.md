# Implementation Plan: Lead Status Management System

## Executive Summary

This implementation plan outlines the transformation of the One Percent Stats lead management system from a dual-state tracking mechanism (using both `status` and `isClosed` fields) to a unified, status-driven workflow. The new system will implement a clear lead lifecycle with six distinct statuses, automated follow-up triggers, and improved data consistency.

The primary goal is to eliminate redundancy, simplify lead tracking, and introduce intelligent automation for follow-ups. By removing the `isClosed` boolean field and relying solely on a comprehensive status field, the system will provide clearer insights into lead progression while reducing technical debt and potential data inconsistencies.

## Background & Context

### Project Overview
One Percent Stats is a web-based analytics dashboard for tracking and visualizing leads data for a fitness business. The current system uses:
- **Backend**: Hono on Cloudflare Workers with D1 (SQLite) database
- **Frontend**: React with Vite
- **Database ORM**: Drizzle ORM
- **Package Manager**: Bun (exclusively)
- **Authentication**: better-auth
- **Deployment**: Cloudflare Workers + Pages

### Problem Statement
The current lead management system suffers from:
1. **Redundant state tracking**: Both `status` field and `isClosed` boolean create confusion
2. **Inconsistent status values**: Current values include "No Reply", "Consult", or null/empty
3. **No follow-up automation**: Manual tracking of when to follow up with leads
4. **Data integrity issues**: Conflicting states between `status` and `isClosed` fields
5. **Limited visibility**: No clear indication of leads requiring follow-up

### Expected Outcomes
- Single source of truth for lead state management
- Automated follow-up reminders based on inactivity periods
- Clear lead progression visibility
- Improved data consistency and integrity
- Simplified codebase with reduced technical debt

### Success Criteria
- All leads have a valid status from the defined lifecycle
- Follow-up automation triggers correctly based on time elapsed
- Analytics and reporting accurately reflect lead states
- No data loss during migration
- Performance remains unchanged or improved

## Detailed Requirements

### Functional Requirements

1. **Lead Status Lifecycle**
   - Implement six distinct status values: `New`, `Contacted`, `Follow Up`, `Consulted`, `Closed Won`, `Closed Lost`
   - Default status for new leads: `New`
   - Status progression should follow logical business flow
   - Acceptance criteria: Every lead must have exactly one valid status

2. **Automatic Status Transitions**
   - When API is called, check for stale `Contacted` leads (no activity for 3 days)
   - Automatically promote stale `Contacted` leads to `Follow Up` status
   - Calculate and set `next_follow_up_date` when transitioning
   - Acceptance criteria: Leads automatically transition after 3 days of inactivity

3. **Sales-Status Synchronization**
   - When sales amount > 0, automatically set status to `Closed Won`
   - When status is `Closed Won`, require sales amount > 0
   - When status is `Closed Lost`, set sales amount to 0
   - Acceptance criteria: Sales and status remain synchronized

4. **Date Field Management**
   - Track `contacted_date` when lead first contacted
   - Track `next_follow_up_date` for follow-up scheduling
   - Track `last_activity_date` for inactivity calculations
   - Track `updated_at` for all modifications
   - For `Closed Won`: populate `closedDate`, `closedMonth`, `closedYear`
   - For `Closed Lost`: leave `closedDate` empty, rely on `updated_at`
   - Acceptance criteria: All date fields follow DD/MM/YYYY format

5. **Remove isClosed Field**
   - Eliminate `isClosed` boolean from schema
   - Migrate all existing data to new status system
   - Update all code references to use status instead
   - Acceptance criteria: No references to `isClosed` remain in codebase

6. **Data Migration Rules**
   - `isClosed = true` with `sales > 0` → `Closed Won`
   - `isClosed = true` with `sales = 0` → `Closed Lost`
   - Current status `"Consult"` → `Consulted`
   - Current status `"No Reply"` → `Contacted`
   - Current status `null/empty` → `New`
   - Acceptance criteria: All existing leads mapped to new statuses

### Non-Functional Requirements

- **Performance**: Status checks should not add more than 100ms to API response times
- **Data Integrity**: No data loss during migration
- **Compatibility**: Maintain backward compatibility during transition period
- **Scalability**: System should handle 100,000+ leads efficiently
- **Date Format**: All dates must use DD/MM/YYYY format consistently

### UI/UX Requirements

1. **Lead Table Display**
   - Remove "Is Closed" column
   - Add "Next Follow-up" column showing `next_follow_up_date`
   - Add "Last Activity" column showing `last_activity_date`
   - Highlight overdue follow-ups (past `next_follow_up_date`) in red/warning color
   - Status badges with color coding:
     - `New`: Gray/neutral
     - `Contacted`: Blue
     - `Follow Up`: Orange/warning
     - `Consulted`: Purple
     - `Closed Won`: Green/success
     - `Closed Lost`: Red/danger

2. **Lead Filters**
   - Replace boolean "Closed Status" filter with multi-select status filter
   - Show all six canonical status values
   - Remove any database-derived status values

3. **Create/Edit Lead Dialogs**
   - Default status dropdown to `New` for new leads
   - When sales > 0 entered, auto-select `Closed Won` status
   - When `Closed Won` selected, require sales > 0
   - When `Closed Lost` selected, set sales to 0
   - Show/hide date fields based on selected status

4. **Analytics Dashboards**
   - Update "Closed Leads" metrics to count only `Closed Won` status
   - Update conversion rates to use `Closed Won` for calculations
   - Update funnel visualization with new status progression

## Technical Specifications

### Architecture Overview
```
Frontend (React) → API (Hono/Workers) → Database (D1/SQLite)
                                      ↓
                            Status Check Logic
                            (on API calls)
```

### Technology Stack
- **Languages**: TypeScript
- **Backend Framework**: Hono on Cloudflare Workers
- **Frontend Framework**: React with Vite
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Drizzle ORM
- **Package Manager**: Bun (not npm/yarn/pnpm)
- **Deployment**: Cloudflare Workers + Pages

### Data Models

#### Updated Leads Table Schema
```typescript
leads = {
  id: integer (PRIMARY KEY),
  month: text,
  date: text (DD/MM/YYYY),
  name: text,
  phoneNumber: text,
  platform: text,
  status: text (DEFAULT "New"), // MODIFIED: added default
  sales: integer,
  remark: text,
  trainerHandle: text,
  closedDate: text (DD/MM/YYYY),
  closedMonth: text,
  closedYear: text,
  contactedDate: text (DD/MM/YYYY), // NEW
  nextFollowUpDate: text (DD/MM/YYYY), // NEW
  lastActivityDate: text (DD/MM/YYYY), // NEW
  createdAt: text (DEFAULT CURRENT_TIMESTAMP),
  updatedAt: text (DEFAULT CURRENT_TIMESTAMP) // NEW
  // REMOVED: isClosed
}
```

#### Status Constants
```typescript
const LEAD_STATUSES = [
  "New",
  "Contacted",
  "Follow Up",
  "Consulted",
  "Closed Won",
  "Closed Lost"
] as const;
```

## Implementation Approach

### Phase 1: Foundation Setup (Day 1)

**Step 1.1: Define Status Constants**
- Create `apps/server/src/lib/status.ts` with canonical status values
- Export `LEAD_STATUSES` constant array
- Export type definitions for TypeScript

**Step 1.2: Extend Date Utilities**
- Update `apps/server/src/lib/date-utils.ts`
- Add `addDaysToDDMMYYYY(date: string, days: number): string`
- Add `compareDDMMYYYY(a: string, b: string): -1|0|1`
- Add `todayDDMMYYYY(): string`
- Add `daysBetweenDDMMYYYY(from: string, to: string): number`

**Step 1.3: Environment Configuration**
- Add `FOLLOW_UP_DAYS=3` to `apps/server/.env.example`
- Document the new environment variable

Estimated time: 1 day

### Phase 2: Database Schema Changes - Additive (Day 2)

**Step 2.1: Update Schema Definition**
- Modify `apps/server/src/db/schema/leads.ts`
- Add new fields: `contactedDate`, `nextFollowUpDate`, `lastActivityDate`, `updatedAt`
- Update `status` field to include default value "New"
- Keep `isClosed` temporarily for backward compatibility

**Step 2.2: Generate and Apply Migrations**
- Run `bun run db:generate` to create migration files
- Run `bun run db:migrate:local` for local testing
- Verify new columns exist in database

Estimated time: 1 day

### Phase 3: Data Migration Script (Day 3)

**Step 3.1: Create Migration Script**
- Create `apps/server/src/scripts/migrate-lead-status.ts`
- Implement mapping logic:
  - `isClosed = true` + `sales > 0` → `Closed Won`
  - `isClosed = true` + `sales = 0` → `Closed Lost`
  - Status `"Consult"` → `Consulted`
  - Status `"No Reply"` → `Contacted`
  - Status `null/empty` → `New`
- Set date fields appropriately for each status

**Step 3.2: Fix Existing Import Issues**
- Fix import in `apps/server/src/scripts/backfill-closed-month.ts`
- Change import source from `../routers/analytics` to `../lib/date-utils`

**Step 3.3: Test Migration Locally**
- Run script against local database
- Verify data integrity and mappings
- Generate migration report

Estimated time: 1 day

### Phase 4: API Updates (Days 4-5)

**Step 4.1: Update Analytics Router**
- Modify `apps/server/src/routers/analytics.ts`
- Update all endpoints to use status instead of `isClosed`:
  - `/leads/summary`: Count `Closed Won` for totalClosed
  - `/leads/platform-breakdown`: Use status for closed/not closed
  - `/leads/funnel`: Update status order and grouping
  - `/leads/options`: Return canonical status list
  - `/leads/filter-options`: Remove isClosed options
  - `/roas`: Use `Closed Won` for conversion metrics

**Step 4.2: Update Lead CRUD Operations**
- POST `/leads`:
  - Default status to "New"
  - Auto-set `Closed Won` when sales > 0
  - Set date fields based on status
- PUT `/leads/:id`:
  - Handle status transitions with date updates
  - Sync sales amount with status changes
  - Update `updatedAt` on every modification

**Step 4.3: Add Status Check Logic**
- Create helper function to check for stale leads
- Integrate into relevant API calls
- Auto-promote `Contacted` to `Follow Up` after 3 days

**Step 4.4: Add Follow-up Endpoints (Optional)**
- GET `/leads/follow-ups/upcoming?days=7`
- GET `/leads/follow-ups/overdue`

Estimated time: 2 days

### Phase 5: Frontend Updates (Days 6-7)

**Step 5.1: Update Lead Dialogs**
- Modify `apps/web/src/components/create-lead-dialog.tsx`:
  - Remove `isClosed` state and handling
  - Default status to "New"
  - Auto-set `Closed Won` when sales > 0
- Modify `apps/web/src/components/edit-lead-dialog.tsx`:
  - Similar changes as create dialog
  - Handle status transitions properly

**Step 5.2: Update Lead Table**
- Modify `apps/web/src/components/leads-data-table.tsx`:
  - Remove `isClosed` column
  - Add "Next Follow-up" column
  - Add "Last Activity" column
  - Implement overdue highlighting
  - Update status badges with new color scheme

**Step 5.3: Update Filters**
- Modify `apps/web/src/components/leads-filters.tsx`:
  - Replace boolean closed filter with status multi-select
  - Use canonical status list from API

**Step 5.4: Update Analytics Components**
- Update `funnel-chart.tsx`, `platform-breakdown.tsx`, etc.
- Remove `isClosed` references
- Use new status-based calculations

Estimated time: 2 days

### Phase 6: Testing and Validation (Day 8)

**Step 6.1: Backend Testing**
- Test all API endpoints with new status logic
- Verify data migration completeness
- Test status transition rules
- Validate date calculations

**Step 6.2: Frontend Testing**
- Test lead creation with all status values
- Test lead editing and status transitions
- Verify table display and filtering
- Test analytics dashboards

**Step 6.3: Integration Testing**
- End-to-end lead lifecycle testing
- Follow-up automation verification
- Performance testing

Estimated time: 1 day

### Phase 7: Production Migration (Day 9)

**Step 7.1: Database Backup**
- Run `wrangler d1 export onepercent-stats-new --remote --output backup.sql`
- Store backup securely

**Step 7.2: Deploy Code**
- Deploy backend changes to Cloudflare Workers
- Deploy frontend changes to Cloudflare Pages

**Step 7.3: Run Production Migration**
- Apply database migrations to remote
- Run data migration script
- Verify data integrity

**Step 7.4: Remove isClosed Column**
- Update schema to remove `isClosed`
- Generate and apply final migration
- Verify system stability

Estimated time: 1 day

### Phase 8: Post-Migration Cleanup (Day 10)

**Step 8.1: Code Cleanup**
- Remove any commented code related to `isClosed`
- Update documentation
- Clean up migration scripts

**Step 8.2: Monitoring**
- Monitor system performance
- Check for any data inconsistencies
- Gather user feedback

Estimated time: 1 day

## File Structure & Changes

### New Files to Create
- `apps/server/src/lib/status.ts` - Status constants and types
- `apps/server/src/scripts/migrate-lead-status.ts` - Data migration script

### Files to Modify

#### Backend Files
- `apps/server/src/db/schema/leads.ts` - Add new fields, remove isClosed
- `apps/server/src/lib/date-utils.ts` - Add date manipulation functions
- `apps/server/src/routers/analytics.ts` - Update all endpoints for status-based logic
- `apps/server/src/scripts/backfill-closed-month.ts` - Fix imports
- `apps/server/.env.example` - Add FOLLOW_UP_DAYS variable

#### Frontend Files
- `apps/web/src/components/create-lead-dialog.tsx` - Remove isClosed, update status handling
- `apps/web/src/components/edit-lead-dialog.tsx` - Remove isClosed, update status handling
- `apps/web/src/components/leads-data-table.tsx` - Update columns and filters
- `apps/web/src/components/leads-filters.tsx` - Replace closed filter with status filter
- `apps/web/src/components/funnel-chart.tsx` - Use status for calculations
- `apps/web/src/components/platform-breakdown.tsx` - Update closed lead calculations
- `apps/web/src/components/monthly-leads-chart.tsx` - Update data interpretation
- `apps/web/src/components/monthly-sales-chart.tsx` - Update data interpretation
- `apps/web/src/components/roas-metrics.tsx` - Update conversion calculations
- `apps/web/src/routes/leads.tsx` - Update summary display

## Testing Strategy

### Unit Tests
- Date utility functions (add days, compare, etc.)
- Status transition logic
- Sales-status synchronization rules
- Data migration mappings

### Integration Tests
- API endpoint responses with new status logic
- Database operations with new fields
- Status transition workflows
- Follow-up date calculations

### User Acceptance Tests
1. Create new lead → Verify default status is "New"
2. Add sales to lead → Verify status changes to "Closed Won"
3. Wait 3 days after contacting → Verify status changes to "Follow Up"
4. Edit lead status → Verify appropriate date fields update
5. Filter by status → Verify correct results returned
6. View analytics → Verify metrics calculate correctly

## Deployment & Migration

### Pre-Deployment Checklist
- [ ] All code changes reviewed and tested
- [ ] Database backup completed
- [ ] Migration script tested on staging data
- [ ] Rollback plan documented
- [ ] Team notified of deployment window

### Deployment Process
1. Set maintenance mode (if applicable)
2. Backup production database
3. Deploy backend code to Cloudflare Workers
4. Apply database migrations
5. Run data migration script
6. Deploy frontend code to Cloudflare Pages
7. Verify system functionality
8. Remove maintenance mode

### Post-Deployment Validation
- [ ] All API endpoints responding correctly
- [ ] Lead table displays new columns
- [ ] Status filters working
- [ ] Analytics dashboards showing correct data
- [ ] No console errors in frontend
- [ ] Performance metrics within acceptable range

### Data Migration Steps
1. Add new columns to database (non-breaking)
2. Run migration script to populate new fields
3. Deploy code that uses new fields
4. Verify data integrity
5. Remove old `isClosed` column (breaking change)

## Risk Analysis

### Technical Risks

**Risk 1: Data Loss During Migration**
- Description: Potential loss of lead data during schema changes
- Mitigation: Complete database backup before migration, test migration script thoroughly on staging data

**Risk 2: SQLite Column Drop Complexity**
- Description: SQLite requires table rebuild to drop columns
- Mitigation: Use phased migration approach, keep isClosed during transition

**Risk 3: Performance Degradation**
- Description: Status checks on every API call could slow responses
- Mitigation: Optimize queries, use indexes, implement caching if needed

**Risk 4: Date Calculation Errors**
- Description: DD/MM/YYYY string manipulation could have edge cases
- Mitigation: Comprehensive date utility testing, use proven date libraries if needed

### Business Risks

**Risk 1: User Confusion During Transition**
- Description: Users may be confused by status changes
- Mitigation: Clear communication, training materials, gradual rollout

**Risk 2: Analytics Discrepancies**
- Description: Historical data might show different metrics
- Mitigation: Document changes, provide comparison reports

## Success Metrics
- **Data Integrity**: 100% of leads successfully migrated to new status system
- **System Availability**: Less than 5 minutes downtime during migration
- **Performance**: API response times remain under 200ms
- **Automation Effectiveness**: 90% of eligible leads auto-promoted to Follow Up
- **User Satisfaction**: No critical bugs reported in first week

## Timeline & Milestones
- **Day 1**: Foundation setup complete
- **Day 2**: Database schema updated (additive)
- **Day 3**: Data migration script ready and tested
- **Days 4-5**: Backend API updates complete
- **Days 6-7**: Frontend updates complete
- **Day 8**: Full testing complete
- **Day 9**: Production deployment
- **Day 10**: Post-migration cleanup and monitoring

## Appendix

### Conversation Highlights

**Key Decisions:**
1. Use 3 days as the default follow-up period
2. Check for stale leads on API calls rather than using cron jobs
3. Auto-set status to Closed Won when sales amount is entered
4. Leave closedDate empty for Closed Lost, rely on updatedAt timestamp
5. Keep the system simple, avoiding complexity of enterprise CRM systems

### Status Transition Rules
```
New → Contacted (manual)
Contacted → Follow Up (automatic after 3 days)
Follow Up → Consulted (manual)
Consulted → Closed Won/Lost (manual)
```

### Data Mapping Rules
| Current State | New Status |
|--------------|------------|
| isClosed=true, sales>0 | Closed Won |
| isClosed=true, sales=0 | Closed Lost |
| status="Consult" | Consulted |
| status="No Reply" | Contacted |
| status=null/empty | New |

### Glossary
- **Lead**: A potential customer in the sales pipeline
- **Status**: The current stage of a lead in the sales process
- **Follow-up**: A scheduled future interaction with a lead
- **Closed Won**: A lead that resulted in a sale
- **Closed Lost**: A lead that did not result in a sale
- **D1**: Cloudflare's SQLite database service
- **Drizzle ORM**: TypeScript ORM used for database operations

---
*Generated on: December 2024*
*Based on conversation about lead status management system implementation*