# Implementation Plan: Platform & Trainer Management System

## Executive Summary
This plan introduces a normalized, centrally managed system for Platforms and Trainers in the One Percent Stats application. Currently, platform and trainer values are stored as free-form text on each lead record, which leads to duplicates, typos, and difficult maintenance. The new system adds master tables (`platforms`, `trainers`), links leads via foreign keys, and provides admin tools to rename, merge, delete, or reassign while maintaining backward compatibility.

The rollout is zero-downtime and incremental. We first add new tables and synchronization triggers so existing APIs and analytics continue to function. Then we introduce admin management endpoints and UI tabs, followed by lead creation/editing updates to prefer IDs. Merge and reassignment flows clean up legacy inconsistencies. This improves data quality, analytics accuracy, and operational efficiency.

## Background & Context
- Project overview and current state
  - One Percent Stats is a web-based analytics dashboard to track and visualize lead data.
  - Backend: Hono on Cloudflare Workers, Cloudflare D1 (SQLite) via Drizzle ORM.
  - Frontend: React + Vite, deployed on Cloudflare Pages.
  - Authentication: better-auth. Package manager: Bun.
  - Platforms and trainers are currently TEXT columns on `leads`.
- Problem statement and motivation
  - Free-form text causes inconsistent values (typos, casing), no centralized control, and cumbersome bulk updates.
  - Analytics and filtering operate on inconsistent strings.
- Expected outcomes and success criteria
  - Normalized master data with case-insensitive uniqueness and admin management.
  - Easy rename/merge without manual lead updates; improved analytics accuracy.
  - Zero-downtime migration with no data loss; minimal code disruption during transition.
- Stakeholders and users affected
  - Admins: manage platforms/trainers, cleanup duplicates, enforce consistency.
  - Employees: simpler, cleaner options when creating/editing leads.
  - Analysts/Managers: more reliable reporting and filtering.

## Detailed Requirements

### Functional Requirements
1. Platforms Management
   - Description: Admin CRUD for platforms; case-insensitive unique names.
   - User interactions: List, search, create, rename, toggle active, delete, merge, reassign.
   - Expected behavior:
     - Rename cascades to all lead references (text stays in sync).
     - Delete: soft delete by default; if leads exist, allow reassignment or disallow hard delete.
     - Merge: move all references from sources to target; remove or deactivate sources.
   - Acceptance criteria:
     - Unique constraint ignores case; no duplicates (e.g., “Facebook”, “facebook” collapse).
     - All affected leads reflect the new canonical platform.
2. Trainers Management
   - Description: Admin CRUD for trainers, with primary identifier `handle` (unique, NOCASE).
   - User interactions: List, search, create, rename handle, set name, toggle active, delete, merge, reassign.
   - Expected behavior: Same semantics as platforms; handle changes cascade to all leads.
   - Acceptance criteria:
     - Case-insensitive uniqueness on `handle`.
     - All affected leads reflect new handle after rename/merge.
3. Lead Create/Edit Support for Normalized Data
   - Description: Dialogs prefer selecting platform/trainer by ID; admins can add new inline.
   - User interactions: Select from canonical lists; admins may type to add; non-admins restricted to existing.
   - Expected behavior: Server accepts `platformId`/`trainerId` or, for admins, creates on the fly from strings.
   - Acceptance criteria: Successful creation/edit updates both FK and denormalized text fields.
4. Options and Filters
   - Description: Filter options (platforms/trainers) sourced from master tables; fallback to legacy distinct values until populated.
   - Acceptance criteria: UI shows clean, deduplicated options ordered consistently.
5. Merge & Reassign Operations
   - Description: Bulk merge duplicates; delete with reassignment when references exist.
   - Acceptance criteria: All references updated; sources removed or marked inactive; no orphaned references.
6. Backward Compatibility
   - Description: Existing endpoints and analytics continue to work during migration.
   - Acceptance criteria: Text columns remain populated and synchronized via triggers until full cutover.

### Non-Functional Requirements
- Performance requirements
  - Index FKs on `leads(platform_id, trainer_id)`; unique NOCASE indexes on master names/handles.
  - Backfill and merges should be efficient on D1; consider off-peak operations.
- Security requirements
  - Admin-only routes for management; reuse existing admin middleware.
  - Validation for uniqueness and safe deletes.
- Scalability requirements
  - Support thousands of leads and moderate lists of platforms/trainers.
- Compatibility requirements
  - Zero-downtime; legacy text-based consumers keep working.
- Accessibility requirements
  - Follow existing UI component accessibility patterns (shadcn/ui).

### UI/UX Requirements
- Layout and design
  - Extend `/admin` page with tabs: Users (existing), Platforms, Trainers.
- Components
  - Tables with columns:
    - Platforms: Name, Active, Leads, Created, Actions.
    - Trainers: Handle, Name, Active, Leads, Created, Actions.
  - Modals for Create/Edit, Merge, and Delete/Reassign.
- User flows
  - Admin selects tab, manages items; merge via multi-select; delete prompts reassignment.
  - Lead dialogs show canonical options; admin can add new values; non-admin cannot.
- Visual elements & styling
  - Reuse shadcn/ui components to match existing look.
- Responsive
  - Tables and modals behave sensibly on small screens.
- Images/mockups
  - None shared; adhere to current design system.

## Technical Specifications

### Architecture Overview
- System architecture
  - D1 (SQLite) with Drizzle ORM; Hono API routes; React UI.
- Component structure
  - Admin router extended with resources: platforms, trainers.
  - Analytics router adapts filter options to use master tables.
  - Lead dialogs consume new master-data endpoint; fallback to legacy.
- Data flow
  - Admin CRUD/merge/delete -> DB changes -> triggers keep `leads.platform`/`leads.trainer_handle` in sync.
  - Lead create/edit -> sets FK ids (preferred) -> triggers sync text fields.
- Integration points
  - Existing admin auth middleware; existing analytics endpoints.

### Technology Stack
- Languages and frameworks: TypeScript, Hono, React, Vite.
- Libraries and dependencies: Drizzle ORM, better-auth, shadcn/ui; Bun as package manager.
- Database and storage: Cloudflare D1 (SQLite).
- External services/APIs: Cloudflare Workers/Pages, Wrangler CLI.

### Data Models
- platforms
  - id INTEGER PRIMARY KEY
  - name TEXT NOT NULL (UNIQUE, COLLATE NOCASE)
  - active INTEGER DEFAULT 1
  - created_at TEXT DEFAULT CURRENT_TIMESTAMP
  - updated_at TEXT DEFAULT CURRENT_TIMESTAMP
- trainers
  - id INTEGER PRIMARY KEY
  - handle TEXT NOT NULL (UNIQUE, COLLATE NOCASE)
  - name TEXT NULL
  - active INTEGER DEFAULT 1
  - created_at TEXT DEFAULT CURRENT_TIMESTAMP
  - updated_at TEXT DEFAULT CURRENT_TIMESTAMP
- leads (additive changes; legacy columns retained for transition)
  - platform_id INTEGER NULL REFERENCES platforms(id) ON UPDATE CASCADE ON DELETE SET NULL
  - trainer_id INTEGER NULL REFERENCES trainers(id) ON UPDATE CASCADE ON DELETE SET NULL
  - platform TEXT (legacy, kept in sync by triggers)
  - trainer_handle TEXT (legacy, kept in sync by triggers)

## Implementation Approach

### Phase 1: Database Foundation (Zero Downtime)
- Step 1.1: Create `platforms` and `trainers` tables with NOCASE unique indexes.
- Step 1.2: Add nullable `platform_id` and `trainer_id` to `leads` + indexes.
- Step 1.3: Backfill master tables from distinct trimmed legacy values; backfill FK ids on leads.
- Step 1.4: Add triggers:
  - On platform rename -> update `leads.platform`.
  - On trainer handle rename -> update `leads.trainer_handle`.
  - On `leads.platform_id` update -> set `leads.platform` from master.
  - On `leads.trainer_id` update -> set `leads.trainer_handle` from master.
- Estimated time: 1–2 days (incl. verification).

### Phase 2: Backend APIs
- Step 2.1: Add Drizzle schemas for `platforms` and `trainers`; extend leads schema with ids.
- Step 2.2: Extend admin router with endpoints (admin-only):
  - GET /admin/platforms (include leadCount, search, includeInactive)
  - POST /admin/platforms (create)
  - PUT /admin/platforms/:id (rename/toggle active)
  - DELETE /admin/platforms/:id (soft delete by default; support reassign/hard-delete when safe)
  - POST /admin/platforms/merge (sourceIds -> targetId)
  - Mirror routes for trainers.
- Step 2.3: Update analytics router:
  - Prefer master tables for filter options; fallback to distinct legacy values.
  - Add `/analytics/master-data` with id-bearing lists.
- Step 2.4: Accept IDs on lead create/update; allow admin inline creation from strings.
- Estimated time: 2–3 days.

### Phase 3: Frontend Admin UI
- Step 3.1: Add tabs to `/admin`: Users, Platforms, Trainers.
- Step 3.2: Platforms tab:
  - Table, create/edit dialogs, merge modal, delete with reassignment modal; show lead counts.
- Step 3.3: Trainers tab: same as Platforms; fields adjusted (handle + name).
- Estimated time: 2–3 days.

### Phase 4: Lead Dialogs Update
- Step 4.1: Fetch `/analytics/master-data` and populate selects by id; store id values.
- Step 4.2: Admin-only “Add new” inline; non-admins restricted to existing options.
- Step 4.3: Submit `platformId`/`trainerId`; fallback to legacy on server if needed.
- Estimated time: 1–2 days.

### Phase 5: Cleanup & Optional Analytics Join Migration
- Step 5.1: Provide admin tools to merge/clean duplicates; encourage canonical usage.
- Step 5.2 (optional): Migrate analytics groupings to join via ids instead of text.
- Step 5.3 (future optional): Consider dropping legacy text columns after full adoption.
- Estimated time: 1–2 days.

## File Structure & Changes

### New Files to Create
- `apps/server/src/db/migrations/0002_platforms_trainers_normalization.sql` — Migration (tables, indexes, backfill, triggers).
- `apps/server/src/db/schema/platforms.ts` — Drizzle schema for `platforms`.
- `apps/server/src/db/schema/trainers.ts` — Drizzle schema for `trainers`.

### Files to Modify
- `apps/server/src/db/schema/leads.ts` — Add `platformId`, `trainerId` columns; export as needed.
- `apps/server/src/routers/admin.ts` — Add platforms/trainers admin endpoints, reuse admin middleware.
- `apps/server/src/routers/analytics.ts` — Prefer master tables for options; add `/analytics/master-data`; accept ids in create/update.
- `apps/web/src/routes/admin.tsx` — Add tabs; new sections for Platforms/Trainers with tables and modals.
- `apps/web/src/components/create-lead-dialog.tsx` — Use id-based selects, admin-only add.
- `apps/web/src/components/edit-lead-dialog.tsx` — Same as create dialog.

## Testing Strategy

### Unit Tests
- Server helpers: case-insensitive lookups, uniqueness validation, merge/reassign logic (pure parts).
- Client components: basic rendering and state transitions for modals and forms.
- Coverage: key paths for create, rename, merge, delete with reassign.

### Integration Tests
- API endpoints: happy paths and error cases (409 on duplicates, 400 on invalid reassigns).
- Data flow: rename triggers update `leads` text; merge moves references; delete with reassign.
- Options endpoints: master-data primary, legacy fallback.

### User Acceptance Tests
- Admin workflows: create, rename, toggle active, merge, delete with reassign on both platforms and trainers.
- Lead workflows: non-admin select existing; admin add new inline; edits reflect correctly.
- Success criteria: No orphan references; options deduplicated; analytics stable.

## Deployment & Migration

### Deployment Steps
1. Pre-deployment checklist
   - Back up D1 remote database.
   - Ensure env vars configured (`CLOUDFLARE_*` tokens/ids) in `apps/server/.env`.
2. Deployment process
   - Apply migration 0002 to remote DB.
   - Deploy server (new endpoints) — legacy endpoints remain.
   - Deploy web (admin tabs, id-based selects with fallback).
3. Post-deployment validation
   - Run verification queries (see below); test admin CRUD and merges; test lead dialogs.

### Migration Requirements
- Database migrations
  - Create master tables, add FKs, backfill, add triggers.
- Data transformation
  - Distinct TRIMmed legacy values inserted; backfill `platform_id`/`trainer_id` by NOCASE match.
- Backward compatibility
  - Triggers keep legacy text and FK ids in sync; existing analytics/UI continue working.

Verification queries (remote/local):
- `SELECT COUNT(*) FROM leads WHERE platform IS NOT NULL AND TRIM(platform) != '' AND platform_id IS NULL;`
- `SELECT COUNT(*) FROM leads WHERE trainer_handle IS NOT NULL AND TRIM(trainer_handle) != '' AND trainer_id IS NULL;`
- `SELECT id, name FROM platforms ORDER BY name COLLATE NOCASE LIMIT 10;`
- `SELECT id, handle FROM trainers ORDER BY handle COLLATE NOCASE LIMIT 10;`

## Risk Analysis

### Technical Risks
- Trigger complexity/recursion — Keep triggers minimal and non-recursive; test thoroughly.
- Case-insensitive uniqueness limits with non-ASCII — Acceptable for domain; document limitation.
- D1 transaction limits — Sequence merge/reassign carefully; aim for idempotency; prefer transactions if available.
- Large backfill runtime — Run during off-peak or accept brief maintenance.

### Business Risks
- Admin misuse (accidental merge/delete) — Add confirmations and clear UX; limit access to admins.
- Partial deployment mismatch — Keep strong backward compatibility; deploy DB first, then server, then UI.

## Success Metrics
- Reduction of duplicate platform/trainer values to zero (NOCASE unique pass).
- 100% of non-empty leads have `platform_id`/`trainer_id` populated post-migration.
- Admin tasks (rename/merge/delete) complete without errors; no orphan references.
- Stable or improved page load and option fetch latencies.

## Timeline & Milestones
- Week 1
  - Apply migration (P1), backend schemas & admin endpoints (P2).
- Week 2
  - Admin UI tabs (P3), lead dialogs update (P4), testing and fixes.
- Week 3
  - Cleanup, optional analytics migration (P5), documentation and handover.

## Appendix

### Conversation Highlights
- Decision to normalize platforms/trainers and manage centrally.
- Zero-downtime approach with triggers to keep legacy text in sync.
- Admin-only CRUD, merge, delete with reassignment; soft delete by default.
- Frontend to add Platforms/Trainers tabs and prefer id-based selections; admin-only inline add.
- Options endpoints to use master tables with legacy fallback.

### References
- Codebase context
  - `apps/server/src/db/schema/leads.ts` (current leads, advertising_costs)
  - `apps/server/src/routers/admin.ts` (admin middleware and users API pattern)
  - `apps/server/src/routers/analytics.ts` (leads endpoints and options)
  - `apps/web/src/routes/admin.tsx` (admin UI base)
  - `apps/web/src/components/create-lead-dialog.tsx` and `edit-lead-dialog.tsx` (current options usage)
- Platform stack
  - Bun, Hono, Drizzle ORM, Cloudflare D1/Workers, better-auth, React + Vite, shadcn/ui.

### Glossary
- NOCASE: SQLite collation for case-insensitive comparisons.
- Soft delete: Mark record inactive without removal.
- Reassign: Move lead references from one master record to another.
- Merge: Consolidate multiple master records into one.

---
*Generated on: Sun Aug 24 2025*
*Based on conversation context from: One Percent Stats Platform/Trainer Management Session*
