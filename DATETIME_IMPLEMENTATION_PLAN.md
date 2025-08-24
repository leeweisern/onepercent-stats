# Implementation Plan: Date/Time System Improvements for One Percent Stats

## Executive Summary

The One Percent Stats application, a lead management system for a fitness business in Malaysia, recently completed a major migration from a dual-state tracking system to a unified status-driven workflow. However, critical issues exist in the date/time handling system that prevent proper follow-up scheduling and create data inconsistencies. This plan addresses the immediate bug where `next_follow_up_date` is null for all leads, implements proper GMT+8 timezone handling for Malaysian business operations, and standardizes all date/time fields to include time components for improved precision.

The implementation will convert the current mixed format system (DD/MM/YYYY strings and UTC timestamps) to a consistent ISO-8601 format with GMT+8 offset, fix the critical status maintenance bug, and provide timezone-aware formatting throughout the application. This ensures accurate follow-up scheduling, eliminates timezone confusion, and provides a foundation for reliable business operations in the Malaysian timezone.

## Background & Context

### Project Overview
One Percent Stats is a web-based analytics dashboard for tracking and visualizing leads data for a fitness business operating exclusively in Malaysia. The system architecture includes:
- **Backend**: Hono framework on Cloudflare Workers with D1 (SQLite) database
- **Frontend**: React application built with Vite
- **Database ORM**: Drizzle ORM for database operations
- **Package Manager**: Bun (exclusively - never use npm/yarn/pnpm)
- **Authentication**: better-auth system
- **Deployment**: Cloudflare Workers + Pages

### Problem Statement
The current date/time system suffers from multiple critical issues:

1. **Critical Bug**: The `next_follow_up_date` field is null for all leads, including active ones requiring follow-up, due to a logic bug in the status maintenance system
2. **Format Inconsistency**: Mixed date formats across the application:
   - Business dates: DD/MM/YYYY strings (date, closedDate, contactedDate)
   - Activity tracking: Mix of DD/MM/YYYY strings and ISO UTC timestamps
   - Audit fields: UTC timestamps from SQLite CURRENT_TIMESTAMP
3. **No Timezone Handling**: Application uses UTC internally but serves Malaysian business (GMT+8), causing confusion and potential off-by-one errors
4. **No Time Components**: Date-only fields lack precision for scheduling and activity tracking
5. **Comparison Issues**: Mixed format dates cannot be reliably compared, breaking maintenance logic

### Expected Outcomes
- All active leads have properly scheduled follow-up dates based on business rules
- Consistent ISO-8601 datetime format with GMT+8 offset across all fields
- Accurate timezone handling for Malaysian business operations
- Elimination of date format confusion and comparison errors
- Foundation for future time-sensitive features (business hours, scheduling, etc.)

### Success Criteria
- Zero active leads with null `next_follow_up_date` after implementation
- All datetime fields use consistent "YYYY-MM-DDTHH:mm:ss+08:00" format
- Status maintenance operates correctly with timezone-aware calculations
- Analytics and reporting maintain accuracy with new date formats
- No data loss during migration process
- Performance remains under 100ms for status maintenance operations

### Stakeholders and Users Affected
- **Primary Users**: Malaysian fitness business staff managing leads and follow-ups
- **Secondary Users**: Management reviewing analytics and reports
- **Technical Team**: Developers maintaining and extending the system

## Detailed Requirements

### Functional Requirements

1. **Fix Critical Follow-up Date Bug**
   - All leads with active statuses (New, Contacted, Follow Up, Consulted) must have populated `next_follow_up_date`
   - Follow-up scheduling based on status and configurable business rules:
     - New: Follow up next business day
     - Contacted: Follow up after configured days (default 3, via FOLLOW_UP_DAYS environment variable)
     - Follow Up: Follow up in 2 business days
     - Consulted: Follow up next business day
     - Closed Won/Closed Lost: No follow-up required (null values acceptable)
   - Acceptance criteria: Query shows zero active leads with null follow-up dates

2. **Implement GMT+8 Timezone-Aware DateTime System**
   - Store all datetime values in GMT+8 offset format: "YYYY-MM-DDTHH:mm:ss+08:00"
   - Convert existing date fields to include time components with sensible defaults:
     - Business dates (lead creation): 09:00:00 Malaysia time
     - Closed dates: 18:00:00 Malaysia time (end of business day)
     - Activity dates: Actual time when activity occurred
   - All new datetime calculations use Malaysia timezone (Asia/Kuala_Lumpur)
   - Acceptance criteria: All stored dates follow consistent GMT+8 ISO format

3. **Standardize Date Field Architecture**
   - Maintain distinction between business activity and technical audit tracking:
     - `last_activity_at`: Business-level customer interaction timestamp
     - `updated_at`: Database-level record modification timestamp
   - Both fields serve different purposes and should be retained
   - Clear naming convention to eliminate confusion
   - Acceptance criteria: Code comments and documentation clearly define each field's purpose

4. **Automatic Status Maintenance with Timezone Awareness**
   - Status maintenance runs on API calls with GMT+8 calculations
   - Promote stale "Contacted" leads to "Follow Up" after configured inactivity period
   - Sync sales amounts with "Closed Won" status using GMT+8 timestamps
   - Update activity dates and follow-up schedules based on Malaysian business calendar
   - Acceptance criteria: Status transitions occur at correct Malaysian time intervals

5. **Data Migration and Format Conversion**
   - Convert all existing DD/MM/YYYY strings to ISO GMT+8 format
   - Handle mixed format data (some fields may have ISO UTC, others DD/MM/YYYY)
   - Preserve data integrity during conversion process
   - Backfill missing follow-up dates for existing active leads
   - Acceptance criteria: No data loss, all dates in consistent format post-migration

6. **Environment Configuration Updates**
   - Replace `process.env` usage with Cloudflare Workers environment bindings (`c.env`)
   - Configure `FOLLOW_UP_DAYS` through Wrangler environment variables
   - Default to 3 days if not configured
   - Acceptance criteria: Environment variables work in Workers runtime

### Non-Functional Requirements

- **Performance**: Status maintenance operations complete within 100ms
- **Data Integrity**: Zero data loss during migration process
- **Compatibility**: No breaking changes to API contracts (maintain backward compatibility during transition)
- **Scalability**: System handles current load (~200 leads) and scales to 1000+ leads
- **Timezone Consistency**: All operations use GMT+8 regardless of server or user location
- **Date Format Validation**: All stored dates validate as proper ISO-8601 with GMT+8 offset

### UI/UX Requirements

1. **Lead Table Display Updates**
   - Display dates in Malaysian format: "DD/MM/YYYY HH:mm"
   - Show "Next Follow-up" column with formatted datetime
   - Show "Last Activity" column with "time ago" format (e.g., "2 hours ago")
   - Highlight overdue follow-ups in red/warning color when past due date
   - Add tooltips showing exact datetime for relative displays
   - Acceptance criteria: Users see times in familiar Malaysian format

2. **Create/Edit Lead Dialogs**
   - Lead date input remains date-only (server applies default 09:00 time)
   - Display current follow-up schedule when editing leads
   - Show calculated next follow-up date based on current status
   - Optionally allow time specification for lead dates (future enhancement)
   - Acceptance criteria: Date inputs are intuitive for Malaysian users

3. **Analytics Dashboard Updates**
   - Maintain current analytics functionality with new date formats
   - Ensure year extraction works with ISO format (YYYY prefix instead of suffix)
   - Display dates consistently across all charts and metrics
   - Preserve dateType filtering (lead date vs closed date) functionality
   - Acceptance criteria: All existing analytics continue to function correctly

## Technical Specifications

### Architecture Overview
```
Frontend (React) → API (Hono/Workers) → Database (D1/SQLite)
                                      ↓
                            Date/Time Utilities (GMT+8)
                                      ↓
                            Status Maintenance Logic
                            (timezone-aware calculations)
```

### Technology Stack
- **Languages**: TypeScript (both frontend and backend)
- **Backend Framework**: Hono on Cloudflare Workers
- **Frontend Framework**: React with Vite
- **Database**: Cloudflare D1 (SQLite-compatible)
- **ORM**: Drizzle ORM with SQLite adapter
- **Package Manager**: Bun (exclusively)
- **Runtime Environment**: Cloudflare Workers (V8 isolates)
- **Deployment**: Cloudflare Workers + Pages

### Data Models

#### Updated Leads Table Schema
```typescript
export const leads = sqliteTable("leads", {
  id: integer("id").primaryKey(),
  month: text("month"), // Month name derived from lead date
  date: text("date").notNull(), // Lead date in ISO GMT+8 format
  name: text("name"),
  phoneNumber: text("phone_number"),
  platform: text("platform"),
  status: text("status").default("New"),
  sales: integer("sales"),
  remark: text("remark"),
  trainerHandle: text("trainer_handle"),
  closedDate: text("closed_date"), // ISO GMT+8 format
  closedMonth: text("closed_month"),
  closedYear: text("closed_year"),
  contactedDate: text("contacted_date"), // ISO GMT+8 format
  nextFollowUpDate: text("next_follow_up_date"), // ISO GMT+8 format
  lastActivityDate: text("last_activity_date"), // ISO GMT+8 format
  createdAt: text("created_at").default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").default(sql`CURRENT_TIMESTAMP`)
});
```

#### Date/Time Utility Functions
```typescript
// Core timezone utilities
const MY_TIMEZONE = "Asia/Kuala_Lumpur";
const MY_OFFSET = "+08:00";

// Format functions
function nowMYISO(): string; // Current time in GMT+8 ISO format
function toMYISO(date: Date): string; // Convert Date to GMT+8 ISO
function parseDDMMYYYYToMYISO(ddmmyyyy: string, hour?: number, minute?: number): string;
function addDaysMY(isoString: string, days: number): string;
function addBusinessDaysMY(isoString: string, businessDays: number): string;
function compareISOStrings(a: string, b: string): -1|0|1;
```

## Implementation Approach

### Phase 1: Foundation Setup (Day 1)
**Step 1.1: Create Timezone-Aware Date Utilities**
- Create `apps/server/src/lib/datetime-utils.ts` with GMT+8 utility functions
- Functions for current time, parsing, formatting, date arithmetic in Malaysian timezone
- Maintain backward compatibility with existing DD/MM/YYYY functions during transition
- Add comprehensive unit tests for timezone calculations

**Step 1.2: Environment Configuration Updates**
- Update status maintenance to accept configuration parameters instead of process.env
- Add FOLLOW_UP_DAYS to Wrangler environment configuration
- Create config passing mechanism through Hono context

Estimated time: 1 day

### Phase 2: Database Schema and Migration Preparation (Days 2-3)
**Step 2.1: Add New Database Columns**
- Add `last_activity_at` and `next_follow_up_at` columns to leads table
- Keep existing columns during transition for rollback capability
- Generate and test migrations locally

**Step 2.2: Create Data Migration Scripts**
- Build script to convert existing date formats to ISO GMT+8
- Handle mixed format data (DD/MM/YYYY strings and ISO UTC timestamps)
- Create validation queries to verify conversion accuracy
- Test migration on local database copy

**Step 2.3: Update Year Extraction Logic**
- Replace `substr(..., -4)` with `substr(..., 1, 4)` for ISO format compatibility
- Update all analytics queries that extract year from date fields
- Ensure backward compatibility during transition

Estimated time: 2 days

### Phase 3: Backend Logic Updates (Days 4-5)
**Step 3.1: Fix Status Maintenance Logic**
- Correct `updateActivityDates` function to populate follow-up dates for all active leads
- Implement timezone-aware status promotion logic
- Use GMT+8 calculations for all date comparisons and scheduling
- Replace process.env usage with configuration parameters

**Step 3.2: Update API Endpoints**
- Modify lead creation/update endpoints to use GMT+8 datetime functions
- Ensure all datetime fields are written in consistent ISO GMT+8 format
- Update analytics endpoints to handle new date formats
- Maintain API response compatibility during transition

**Step 3.3: Implement Status Maintenance Trigger**
- Call status maintenance on relevant API endpoints
- Ensure maintenance operations complete within performance targets
- Add logging for maintenance operations and follow-up scheduling

Estimated time: 2 days

### Phase 4: Data Migration Execution (Day 6)
**Step 4.1: Local Migration and Validation**
- Execute migration script on local database
- Validate conversion results with test queries
- Verify follow-up dates are populated for active leads
- Test application functionality with migrated data

**Step 4.2: Remote Database Migration**
- Backup remote database before migration
- Apply schema changes to remote database
- Execute data migration script on remote database
- Validate remote migration results

Estimated time: 1 day

### Phase 5: Frontend Updates (Days 7-8)
**Step 5.1: Create Frontend DateTime Utilities**
- Add `formatMY()` function for Malaysian date/time display
- Implement "time ago" formatting with timezone awareness
- Create overdue detection logic using Malaysian time

**Step 5.2: Update Lead Table and Dialogs**
- Modify leads data table to show formatted dates and overdue indicators
- Update create/edit lead dialogs with improved date handling
- Ensure date inputs work correctly with backend API changes

**Step 5.3: Update Analytics Components**
- Verify analytics components work with new date formats
- Update any hardcoded date format assumptions
- Test dateType filtering functionality

Estimated time: 2 days

### Phase 6: Testing and Deployment (Days 9-10)
**Step 6.1: Comprehensive Testing**
- Execute unit tests for all datetime utilities
- Run integration tests on API endpoints
- Perform user acceptance testing on key workflows
- Load test status maintenance performance

**Step 6.2: Production Deployment**
- Deploy backend changes to Cloudflare Workers
- Deploy frontend changes to Cloudflare Pages
- Monitor application logs for errors
- Verify follow-up scheduling works correctly

**Step 6.3: Post-Deployment Validation**
- Run validation queries on production database
- Verify zero active leads have null follow-up dates
- Check analytics dashboards for correct data
- Monitor performance metrics

Estimated time: 2 days

### Phase 7: Cleanup and Optimization (Day 11)
**Step 7.1: Legacy Column Removal**
- Remove legacy date columns after monitoring period
- Update TypeScript types to remove deprecated fields
- Clean up backward compatibility code

**Step 7.2: Documentation Updates**
- Update CLAUDE.md with new datetime handling procedures
- Document migration process for future reference
- Create troubleshooting guide for datetime issues

Estimated time: 1 day

## File Structure & Changes

### New Files to Create
- `apps/server/src/lib/datetime-utils.ts` - GMT+8 timezone utilities and date manipulation functions
- `apps/server/src/scripts/migrate-datetime-fields.ts` - Data migration script for converting date formats
- `apps/web/src/lib/datetime.ts` - Frontend datetime formatting utilities for Malaysian timezone
- `apps/server/src/scripts/validate-datetime-migration.ts` - Validation script for verifying migration success

### Files to Modify

#### Backend Files
- `apps/server/src/db/schema/leads.ts` - Add new datetime columns, maintain existing during transition
- `apps/server/src/lib/date-utils.ts` - Add GMT+8 functions while maintaining DD/MM/YYYY compatibility
- `apps/server/src/lib/status-maintenance.ts` - Fix follow-up date population bug, implement timezone-aware logic
- `apps/server/src/routers/analytics.ts` - Update year extraction logic, replace process.env usage, add status maintenance calls
- `apps/server/wrangler.jsonc` - Add FOLLOW_UP_DAYS environment variable configuration
- `apps/server/.env.example` - Document FOLLOW_UP_DAYS configuration

#### Frontend Files
- `apps/web/src/components/leads-data-table.tsx` - Update date column formatting, add overdue indicators
- `apps/web/src/components/create-lead-dialog.tsx` - Ensure date inputs work with GMT+8 backend
- `apps/web/src/components/edit-lead-dialog.tsx` - Update datetime handling and display
- `apps/web/src/lib/date-utils.ts` - Add Malaysian timezone formatting functions

#### Migration Files
- Create new Drizzle migration for schema changes
- Update migration configuration files for local and remote deployment

## Testing Strategy

### Unit Tests
- **Datetime Utilities Testing**
  - GMT+8 timezone conversion accuracy
  - Date parsing from DD/MM/YYYY to ISO format
  - Date arithmetic (adding days, business days) in Malaysian timezone
  - Edge cases: month boundaries, year boundaries, leap years
  - ISO string comparison functionality

- **Status Maintenance Testing**
  - Follow-up date calculation based on lead status
  - Stale lead promotion logic with timezone awareness
  - Sales-status synchronization with GMT+8 timestamps
  - Configuration parameter handling (FOLLOW_UP_DAYS)

- **Data Migration Testing**
  - DD/MM/YYYY to ISO conversion accuracy
  - Mixed format data handling (ISO UTC to GMT+8)
  - Null value handling and default time assignment
  - Data integrity preservation during conversion

### Integration Tests
- **API Endpoint Testing**
  - Lead creation with GMT+8 datetime fields
  - Lead updates maintain timezone consistency
  - Analytics endpoints with new date format
  - Year extraction accuracy with ISO format
  - Status maintenance performance under load

- **Database Operations Testing**
  - Schema migration execution (local and remote)
  - Data migration script execution
  - Follow-up date population for active leads
  - Date field querying and filtering accuracy

### User Acceptance Tests
1. **Lead Management Workflow**
   - Create new lead → Verify follow-up date automatically scheduled
   - Edit lead status → Verify follow-up date updates appropriately
   - View leads table → Confirm dates display in Malaysian format with overdue indicators

2. **Status Maintenance Automation**
   - Wait for configured follow-up period → Verify "Contacted" leads promote to "Follow Up"
   - Add sales amount to lead → Verify status changes to "Closed Won" with GMT+8 timestamp
   - Check closed leads → Confirm no follow-up dates scheduled

3. **Analytics Dashboard Verification**
   - Monthly/yearly analytics show correct data with new date formats
   - dateType filtering (lead vs closed date) works correctly
   - Platform breakdown and funnel charts display accurate metrics

### Success Criteria
- Zero regression failures in existing functionality
- All active leads have populated follow-up dates
- Date displays consistently use Malaysian timezone
- Performance targets met (status maintenance <100ms)
- No data loss during migration process

## Deployment & Migration

### Pre-Deployment Checklist
- [ ] All unit tests pass with >95% coverage
- [ ] Integration tests verify API functionality
- [ ] Migration script tested successfully on database copy
- [ ] Frontend displays dates correctly in development environment
- [ ] Performance benchmarks meet requirements
- [ ] Rollback plan documented and tested

### Deployment Steps
1. **Phase 1: Backend Infrastructure**
   - Deploy datetime utility functions to Workers
   - Apply database schema changes (add new columns)
   - Update environment variable configuration
   - Verify basic functionality without breaking existing features

2. **Phase 2: Data Migration**
   - Create production database backup
   - Execute data migration script on remote database
   - Validate migration results with test queries
   - Verify zero active leads have null follow-up dates

3. **Phase 3: Application Logic**
   - Deploy updated API endpoints with GMT+8 logic
   - Enable status maintenance with new datetime handling
   - Monitor application logs for errors or timezone issues
   - Verify follow-up scheduling works correctly

4. **Phase 4: Frontend Updates**
   - Deploy frontend changes for datetime formatting
   - Test user interface displays Malaysian time correctly
   - Verify overdue indicators and "time ago" displays
   - Check cross-browser compatibility

### Post-Deployment Validation
- **Database Validation Queries**
  ```sql
  -- Verify zero active leads with null follow-up dates
  SELECT COUNT(*) FROM leads WHERE status IN ('New', 'Contacted', 'Follow Up', 'Consulted') AND next_follow_up_date IS NULL;
  
  -- Check date format consistency
  SELECT COUNT(*) FROM leads WHERE date NOT LIKE '____-__-__T__:__:__+08:00';
  
  -- Validate status distribution
  SELECT status, COUNT(*) FROM leads GROUP BY status;
  ```

- **Application Function Tests**
  - Create test lead → Verify proper GMT+8 datetime storage
  - Check analytics endpoints → Confirm year extraction works
  - Monitor status maintenance → Verify timezone-aware calculations

### Migration Requirements
- **Backward Compatibility**: Maintain during transition period, remove after validation
- **Data Preservation**: No loss of historical lead data or timestamps
- **Performance**: Migration completes within maintenance window
- **Validation**: Comprehensive checks before and after migration

## Risk Analysis

### Technical Risks

**Risk 1: Data Loss During Migration**
- **Description**: Potential corruption or loss of date data during format conversion
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**: 
  - Complete database backup before migration
  - Test migration script on database copy
  - Implement validation queries to verify conversion
  - Maintain rollback capability with original data

**Risk 2: Timezone Calculation Errors**
- **Description**: Incorrect GMT+8 offset calculations leading to wrong follow-up scheduling
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - Comprehensive unit testing of timezone utilities
  - Manual verification of sample calculations
  - Use proven timezone libraries where possible
  - Include edge case testing (daylight savings, etc.)

**Risk 3: Performance Degradation**
- **Description**: Status maintenance operations exceed 100ms target with new datetime logic
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**:
  - Benchmark current performance before changes
  - Optimize database queries and batch operations
  - Monitor performance in production
  - Implement caching if needed

**Risk 4: SQLite Date Comparison Issues**
- **Description**: Mixed timezone formats causing incorrect date comparisons
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - Ensure all stored dates use consistent GMT+8 format
  - Test lexicographic comparison accuracy
  - Implement proper date parsing and comparison functions
  - Validate comparison logic with test data

### Business Risks

**Risk 1: Follow-up Schedule Disruption**
- **Description**: Incorrect follow-up dates causing missed customer interactions
- **Likelihood**: Medium
- **Impact**: High
- **Mitigation**:
  - Thorough testing of follow-up calculation logic
  - Manual verification of sample lead schedules
  - Gradual rollout with monitoring
  - Quick rollback capability if issues detected

**Risk 2: Analytics Data Inconsistency**
- **Description**: Historical reports showing different metrics after date format changes
- **Likelihood**: Low
- **Impact**: Medium
- **Mitigation**:
  - Preserve data integrity during migration
  - Test analytics queries before and after changes
  - Document any expected changes in reporting
  - Provide comparison reports if needed

**Risk 3: User Interface Confusion**
- **Description**: Users confused by new date/time display formats
- **Likelihood**: Low
- **Impact**: Low
- **Mitigation**:
  - Use familiar Malaysian date formats
  - Provide tooltips for relative time displays
  - Maintain consistent formatting across application
  - Monitor user feedback after deployment

## Success Metrics

### Primary Metrics
- **Follow-up Coverage**: 100% of active leads have populated next_follow_up_date
- **Data Consistency**: 100% of datetime fields use GMT+8 ISO format
- **Zero Data Loss**: All historical lead data preserved during migration
- **Performance Target**: Status maintenance operations complete within 100ms

### Secondary Metrics
- **Timezone Accuracy**: All displayed times reflect Malaysian timezone correctly
- **User Experience**: No increase in support requests related to date/time confusion
- **System Reliability**: No date-related errors in application logs
- **Analytics Accuracy**: Historical reporting maintains consistency after migration

### Monitoring and Validation
- **Database Health Checks**: Daily validation queries for date format consistency
- **Performance Monitoring**: Track status maintenance execution times
- **Error Tracking**: Monitor application logs for timezone-related errors
- **User Feedback**: Collect feedback on date/time display improvements

## Timeline & Milestones

### Week 1: Foundation and Planning
- **Day 1**: Complete datetime utility implementation and testing
- **Day 2**: Database schema updates and migration script creation
- **Day 3**: Backend logic updates and status maintenance fixes

### Week 2: Migration and Frontend Updates
- **Day 4**: API endpoint updates and environment configuration
- **Day 5**: Local data migration testing and validation
- **Day 6**: Remote database migration execution

### Week 2: Frontend and Deployment
- **Day 7**: Frontend datetime formatting implementation
- **Day 8**: User interface updates and testing
- **Day 9**: Production deployment and validation

### Week 2: Finalization
- **Day 10**: Post-deployment monitoring and issue resolution
- **Day 11**: Cleanup, documentation, and project closure

### Key Milestones
- **Milestone 1** (Day 3): Backend datetime logic complete and tested
- **Milestone 2** (Day 6): Data migration successful with validation passed
- **Milestone 3** (Day 9): Production deployment complete and functional
- **Milestone 4** (Day 11): All follow-up dates populated and system stable

## Appendix

### Conversation Highlights

**Key Decisions Made:**
1. **GMT+8 Only**: Application serves Malaysia exclusively, use GMT+8 for all operations
2. **Keep Both Date Fields**: `last_activity_date` and `updated_at` serve different purposes - business activity vs technical audit
3. **Include Time Components**: All dates should include time for better precision and scheduling
4. **Fix Follow-up Bug First**: Critical issue where `next_follow_up_date` is null for all leads needs immediate attention
5. **Phased Migration**: Add new columns, migrate data, then remove old columns to minimize risk
6. **ISO Format Standard**: Use "YYYY-MM-DDTHH:mm:ss+08:00" format consistently throughout application

**Technical Constraints Identified:**
- Bun package manager only (never use npm/yarn/pnpm)
- SQLite has no native timezone support - must handle in application layer
- Cloudflare Workers use UTC by default - need explicit GMT+8 handling
- process.env doesn't work reliably in Workers - use c.env bindings instead
- Current status maintenance logic bug prevents follow-up date population

**Business Requirements Clarified:**
- Malaysian business hours and timezone must be respected
- Follow-up scheduling is critical for lead conversion
- Existing analytics and reporting must continue to function
- No disruption to current lead management workflows

### References
- [SQLite Date and Time Functions](https://www.sqlite.org/lang_datefunc.html)
- [Cloudflare Workers Runtime APIs](https://developers.cloudflare.com/workers/runtime-apis/)
- [Drizzle ORM SQLite Documentation](https://orm.drizzle.team/docs/get-started-sqlite)
- [JavaScript Intl.DateTimeFormat](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/DateTimeFormat)
- [ISO 8601 Date Format Standard](https://en.wikipedia.org/wiki/ISO_8601)

### Glossary

- **GMT+8**: Malaysian Standard Time (UTC+8 hours)
- **ISO-8601**: International standard for date and time representation
- **Lead**: Potential customer in the sales pipeline
- **Follow-up Date**: Scheduled date for next customer interaction
- **Status Maintenance**: Automated system for updating lead statuses based on time and activity
- **D1 Database**: Cloudflare's SQLite-compatible database service
- **Workers**: Cloudflare's serverless computing platform
- **Drizzle ORM**: TypeScript ORM for database operations
- **Business Days**: Monday through Friday, excluding weekends
- **Activity Date**: Timestamp of last meaningful customer interaction
- **Audit Timestamp**: Technical record of when database record was modified

### Data Migration Commands Reference

**Local Development:**
```bash
cd apps/server
bun run db:generate                    # Generate migration files
bun run db:migrate:local              # Apply migrations locally
bun run scripts/migrate-datetime-fields.ts    # Execute data migration
bun run scripts/validate-datetime-migration.ts    # Validate migration results
```

**Remote Production:**
```bash
# Backup before migration
wrangler d1 export onepercent-stats-new --remote --output=backup-$(date +%Y%m%d).sql

# Apply schema changes
wrangler d1 migrations apply onepercent-stats-new --remote

# Execute data migration script
wrangler d1 execute onepercent-stats-new --remote --file=migrate-datetime-data.sql

# Validation queries
wrangler d1 execute onepercent-stats-new --remote --command "SELECT COUNT(*) FROM leads WHERE status IN ('New', 'Contacted', 'Follow Up', 'Consulted') AND next_follow_up_date IS NULL"
```

---
*Generated on: December 2024*
*Based on conversation context from: Date/Time System Implementation Discussion*
*Priority: Critical (follow-up scheduling bug affects business operations)*