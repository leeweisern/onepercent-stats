# Implementation Plan: Analytics v2 with History-Powered Funnel and Clear ROAS Semantics

## Executive Summary
This plan delivers a robust, history-powered analytics layer for One Percent Stats, focused on fixing the Sales Funnel so it becomes a true funnel (non‑increasing across stages) and clarifying ROAS semantics. We will introduce a status history table that logs every lead status transition with timestamps, enabling accurate stage-entry counts, stage-by-stage conversion rates, and time-in-stage metrics. The UI will gain a toggle to view either the current pipeline distribution or the cumulative funnel view.

Additionally, we will tighten ROAS definitions and labels. The current implementation uses sale-date attribution but labels “Cost/Lead” in a way that can be misinterpreted. We will either make the endpoint honor a dateType switch or adjust the label to “Cost per Closed Case” with a clear tooltip. The platform breakdown and monthly charts already align with canonical statuses and will continue to do so.

The end result is a clear, self-consistent analytics experience where the funnel reflects true stage progression, ROAS terms match their denominators, and all metrics can be filtered consistently by date type.

## Background & Context
- Project overview and current state
  - Monorepo using Bun + Turborepo.
  - Backend: Hono on Cloudflare Workers; Database: Cloudflare D1 (SQLite) via Drizzle ORM.
  - Frontend: React + Vite on Cloudflare Pages.
  - Auth: better-auth.
  - Code uses canonical lead statuses: New, Contacted, Follow Up, Consulted, Closed Won, Closed Lost.
  - Maintenance routine auto-promotes stale Contacted to Follow Up and auto-syncs sales > 0 to Closed Won.
  - Analytics endpoints implemented: summary, funnel, months, platform-breakdown, ROAS, growth (monthly/yearly).

- Problem statement and motivation
  - The current “Sales Funnel” visual shows distribution of current statuses, which can produce bars where Closed Won > Consulted. This is not a true funnel. We need cumulative stage-entry counts and stage conversion rates.
  - ROAS endpoint currently uses sale-date attribution for all calculations; “Cost/Lead” then means “cost per closed case” in the period, which can be confusing. Either align naming with actual denominator or honor dateType to provide true CPL by lead-date.
  - The schema lacks status transition history, making accurate funnel analytics and time-in-stage metrics impossible.

- Expected outcomes and success criteria
  - Accurate, non-increasing funnel with stage-entry counts and stepwise conversion rates.
  - Clear ROAS semantics and labeling, with optional dateType support.
  - No performance regression; maintenance tasks and analytics remain responsive.

- Stakeholders and users affected
  - Sales/operations users reading analytics dashboards.
  - Developers maintaining the API and analytics code.
  - Business stakeholders relying on conversion and ROAS metrics.

## Detailed Requirements

### Functional Requirements
1. History-Powered Funnel
   - Description: Record every lead status change with timestamps. Use this history to compute a cumulative funnel (reached stage at least once), stage-by-stage conversion rates, and optionally time-in-stage metrics.
   - User interactions: On Analytics page, user can toggle funnel view between Pipeline Distribution (current statuses) and Cumulative Funnel (history-based).
   - Expected behavior:
     - Cumulative funnel bars are non-increasing across stages.
     - Stage conversion rate = reached(stageN) / reached(stageN-1), displayed per stage.
     - Filterable by month/year/platform and date type (lead vs closed vs stage date; see Technical Specifications).
   - Acceptance criteria:
     - With any dataset, cumulative bars never increase from left to right.
     - Conversion rates update correctly with filters.

2. Status History Logging
   - Description: Insert a history record for every status transition (manual PUT update, automatic maintenance, and on create where applicable).
   - Expected behavior:
     - History rows written with from_status, to_status, changed_at (MY ISO), and source (api|maintenance), optional changed_by.
     - Backfill script migrates existing records with best-effort assumptions.
   - Acceptance criteria:
     - Every change to leads.status results in a single corresponding history row.
     - Backfill runs idempotently and produces no duplicates.

3. ROAS Semantics Clarity
   - Description: Clarify denominators and labels. Provide either:
     - Option A: Keep sale-date attribution in API; rename UI metric to “Cost per Closed Case” with a tooltip; or
     - Option B (recommended): Honor dateType in API for CPL (lead-date) while still computing sales metrics by sale-date. Clearly label metrics in UI.
   - Acceptance criteria:
     - Labels match definitions; tooltips describe attribution and denominators.
     - No inconsistency between numbers and titles.

4. Funnel UI Enhancements
   - Description: Display full 6-stage funnel in canonical order with consistent colors and add mode toggle.
   - Acceptance criteria:
     - Two modes: “Pipeline Distribution” (current status counts) and “Cumulative Funnel” (history based).
     - Stage-by-stage conversion % shown in cumulative mode.

5. Utilize Contacted Date and Stage Entry Dates
   - Description: Populate contactedDate when entering Contacted (if missing). Derive cumulative funnel primarily from history (source of truth). No additional denormalized stage_entered columns required initially.
   - Acceptance criteria:
     - contactedDate is set when appropriate and not overwritten once set.

6. Consistent Filters
   - Description: Ensure funnel, platform breakdown, monthly charts, and ROAS respect the chosen filters (month, year, platform) and date type rules as specified.
   - Acceptance criteria:
     - Switching date type updates all relevant analytics consistently.

7. Performance
   - Description: Maintain fast responses.
   - Acceptance criteria:
     - Status maintenance executes under ~100ms typical.
     - Funnel queries remain performant on D1 with proper indexes; page loads remain responsive.

### Non-Functional Requirements
- Performance requirements:
  - Status maintenance target < 100ms typical per request.
  - History-powered funnel endpoints should return within ~300ms on typical dataset sizes; add indexes.
- Security requirements:
  - No new secrets. Reuse existing auth and access controls. History logging from maintenance must be safe.
- Scalability requirements:
  - Support 100k+ leads. Index lead_status_history on (lead_id), (to_status, changed_at), and (changed_at) for filtering.
- Compatibility requirements:
  - Continue supporting both DD/MM/YYYY legacy and ISO strings where currently handled. Internally prefer ISO with GMT+8.
- Accessibility requirements:
  - Provide clear labels, tooltips explaining metrics and modes, readable contrasts for colors.

### UI/UX Requirements
- Analytics Page
  - Global filters: dateType selector (Lead Date vs Sale Date), month, year, platform (existing pattern).
  - Sales Funnel Card
    - Title: Sales Funnel
    - Mode toggle: Pipeline Distribution | Cumulative Funnel
    - Pipeline Distribution
      - Bars show current status counts in canonical order: New, Contacted, Follow Up, Consulted, Closed Won, Closed Lost.
      - This mode may show non-monotonic bars; include helper text: “Current pipeline distribution by present status.”
    - Cumulative Funnel
      - Bars show reached-stage counts: a lead is counted in a stage if it ever entered that stage.
      - Non-increasing bars, with per-stage conversion from prior stage.
      - Right side shows “Closed Won Rate” = Closed Won reached / Total Leads reached.
    - Colors:
      - New: Gray/neutral
      - Contacted: Blue
      - Follow Up: Orange
      - Consulted: Purple
      - Closed Won: Green
      - Closed Lost: Red
    - Stats row below bars: show counts and conversion %; for Closed Won include total sales (RM X,XXX) for the filtered period.
  - Platform Breakdown Card (existing)
    - Ensure closedWonLeads and closedLostLeads remain based on canonical statuses with normalization.
  - Monthly Leads and Sales Charts (existing)
    - Continue supporting dateType; show lead-date vs sale-date appropriately.
  - ROAS Metrics Card
    - If Option A: label “Cost per Closed Case (sale-date)” and add tooltip.
    - If Option B: show “Cost per Lead (lead-date)” and “ROAS (sale-date)”, with clear subtitles/tooltips.

- Visual mockup reference (from screenshot provided):
  - A card titled “Sales Funnel” with a badge showing period filters at top right, three vertical bars (Leads: tall red; Consulted: short gray; Closed Won: short black), and a right-aligned “6.0% Closed Won Rate”. A stats row underneath shows three tiles: Leads 183, Consulted 4, Closed Won 11 with RM 67,908. This is the current simplified view and motivates the improvement to a full 6-stage funnel with a cumulative mode that guarantees non-increasing bars.

## Technical Specifications

### Architecture Overview
- System architecture
  - Frontend (React/Vite) → API (Hono on Cloudflare Workers) → D1 (SQLite via Drizzle)
  - Status Maintenance runs on read paths of analytics endpoints, keeping data consistent before aggregation.
- Component structure
  - Server routers: analytics endpoints under apps/server/src/routers/analytics.ts
  - Status utilities: apps/server/src/lib/status.ts, apps/server/src/lib/status-maintenance.ts
  - Frontend analytics components: funnel-chart.tsx, platform-breakdown.tsx, monthly-leads-chart.tsx, monthly-sales-chart.tsx, roas-metrics.tsx, routes/analytics.tsx
- Data flow
  - On analytics request → run maintenance → fetch filtered data → compute aggregates → return JSON → UI renders.
- Integration points
  - Drizzle ORM for D1 access.
  - No external analytics services.

### Technology Stack
- Languages and frameworks
  - TypeScript everywhere; Hono (server); React (frontend).
- Libraries and dependencies
  - Drizzle ORM; Cloudflare Wrangler; lucide-react; TanStack Table; recharts.
- Database and storage
  - Cloudflare D1 (SQLite). Migrations via Drizzle.
- External services/APIs
  - None beyond Cloudflare services (Workers/Pages/D1).

### Data Models
- leads (existing)
  - id, month, date (ISO), name, phoneNumber, platform, platformId, status (default "New"), sales, remark, trainerHandle, trainerId, closedDate (ISO), closedMonth, closedYear, contactedDate, nextFollowUpDate, lastActivityDate, createdAt, updatedAt.

- NEW: lead_status_history
  - id INTEGER PRIMARY KEY
  - lead_id INTEGER NOT NULL REFERENCES leads(id)
  - from_status TEXT NOT NULL
  - to_status TEXT NOT NULL
  - changed_at TEXT NOT NULL (ISO string in MY time zone)
  - source TEXT NOT NULL DEFAULT 'api' CHECK (source IN ('api','maintenance'))
  - changed_by TEXT NULL (user identifier or system)
  - note TEXT NULL
  - Indexes:
    - idx_lsh_lead_id (lead_id)
    - idx_lsh_to_status_changed_at (to_status, changed_at)
    - idx_lsh_changed_at (changed_at)

- Status constants (unchanged)
  - ["New", "Contacted", "Follow Up", "Consulted", "Closed Won", "Closed Lost"]
  - normalizeStatus maps legacy values: "Consult"→"Consulted", "No Reply"→"Contacted".

## Implementation Approach

### Phase 1: Foundation and Schema
- Step 1.1: Add lead_status_history table with indexes via Drizzle migration.
- Step 1.2: Create server utility recordStatusChange(db, {leadId, from, to, at, source, changedBy?, note?}).
- Step 1.3: Wire recordStatusChange into all status transitions:
  - POST /leads (on initial status if not "New"; if sales > 0 → Closed Won).
  - PUT /leads/:id (when status changes; also when sales triggers Closed Won).
  - runStatusMaintenance (when auto-promoting Contacted → Follow Up or sales sync → Closed Won).
- Estimated time: 1–2 days.

### Phase 2: Backfill and Data Integrity
- Step 2.1: Create backfill script apps/server/src/scripts/backfill-status-history.ts.
  - Seed initial state per lead:
    - New at createdAt or date.
  - If contactedDate exists → add transition into Contacted at contactedDate.
  - If status is Consulted or Closed → approximate consulted_at:
    - For Closed Won/Lost with closedDate: consulted change recorded at closedDate minus 1 day (or updatedAt/lastActivityDate if absent), with note="approx".
  - Closed Won/Lost at closedDate (or updatedAt if missing).
- Step 2.2: Idempotency: protect against duplicates (e.g., by checking existing history for a (lead_id,to_status,changed_at) window).
- Step 2.3: Run verification queries to ensure non-increasing funnel counts using history snapshot.
- Estimated time: 1–2 days.

### Phase 3: API Enhancements
- Step 3.1: Add /api/analytics/leads/funnel/v2 (history‑powered)
  - Query parameters: dateType=lead|closed|stage (default stage), month, year, platform.
  - Behavior:
    - If dateType=stage: filter on changed_at month/year for each stage; reached(stage) = count of distinct leads with any transition into that stage within the filter window (or up to end of window for cumulative-to-date views).
    - If dateType=lead: filter overall set by lead creation month/year; compute reached(stage) across all time up to now (or within same window, configurable via param mode=cumulative_to_date|within_period).
    - If dateType=closed: filter overall set by closedMonth/year; reached(Closed Won) aligns with this window; earlier stages can be cumulative_to_date.
    - Output per stage: { stage, reachedCount, currentCount (optional), totalSales (for Closed Won), conversionFromPrevious }.
  - Index usage: idx_lsh_to_status_changed_at for stage filters; join to leads for platform filter and sales.
- Step 3.2: Keep existing /leads/funnel (v1) for Pipeline Distribution (current status) to avoid breaking change.
- Step 3.3: ROAS endpoint update
  - Option A: Keep sale-date attribution; rename metric in UI only.
  - Option B (recommended): Honor dateType=lead for CPL while retaining sale-date for sales/ROAS (document mixed attribution in response).
- Estimated time: 2–3 days.

### Phase 4: Frontend Updates
- Step 4.1: FunnelChart UI
  - Add mode toggle: Distribution (use v1) vs Cumulative (use v2).
  - Render 6-stage bars with canonical colors; show per-stage conversion in Cumulative.
  - Keep the simplified 3-bar overview optionally as a secondary summary row.
- Step 4.2: ROAS Metrics UI
  - Option A: rename “Cost/Lead” to “Cost per Closed Case” and add tooltip “Sale-date attribution; denominator = count of leads with closed date in period (won+lost).”
  - Option B: show “Cost/Lead (lead-date)” and “ROAS (sale-date)”, add tooltips.
- Step 4.3: Ensure Platform Breakdown and Monthly charts continue to honor dateType and filters.
- Estimated time: 2–3 days.

### Phase 5: Performance and Hardening
- Step 5.1: Add D1 indexes (as above) and verify query plans.
- Step 5.2: Measure status maintenance execution time and funnel endpoint latency on representative data; optimize queries, batch operations if needed.
- Step 5.3: Add defensive checks and logging around history insertion (ensure one history row per transition).
- Estimated time: 1 day.

### Phase 6: Documentation and Handoff
- Step 6.1: Update CLAUDE.md/README to reflect analytics v2, funnel modes, ROAS semantics.
- Step 6.2: Provide migration notes and backfill steps.
- Estimated time: 0.5 day.

## File Structure & Changes

### New Files to Create
- apps/server/src/db/schema/lead-status-history.ts – Drizzle schema for lead_status_history and indexes.
- apps/server/src/lib/status-history.ts – recordStatusChange and small helpers (e.g., ensureSingleTransition).
- apps/server/src/scripts/backfill-status-history.ts – One-off backfill script with idempotency.

### Files to Modify
- apps/server/src/routers/analytics.ts
  - Add /leads/funnel/v2 endpoint (history-powered).
  - Update ROAS handling per chosen option (A or B).
  - Call recordStatusChange where status transitions occur in API paths.
- apps/server/src/lib/status-maintenance.ts
  - When promoting Contacted → Follow Up or syncing sales → Closed Won, call recordStatusChange with source='maintenance'.
- apps/server/src/routers/analytics.ts (POST/PUT /leads)
  - Populate contactedDate when entering Contacted if missing.
  - Call recordStatusChange for all status changes.
- apps/web/src/components/funnel-chart.tsx
  - Add mode toggle; integrate v1 for Distribution and v2 for Cumulative.
  - Render 6-stage funnel with canonical colors; show stage conversion in Cumulative.
- apps/web/src/components/roas-metrics.tsx
  - Update labeling and tooltips to match semantics; if Option B, pass dateType and render both CPL and ROAS carefully.
- Documentation updates in root/CLAUDE.md and app-specific docs as needed.

## Testing Strategy

### Unit Tests
- status-history.ts
  - recordStatusChange inserts exactly one row per transition.
  - Normalization: legacy statuses map correctly.
- status-maintenance.ts
  - Auto-promotion and sales sync create appropriate history events.
- datetime-utils
  - nowMYISO, parseDDMMYYYYToMYISO, addBusinessDaysMY correctness.

### Integration Tests
- API: /leads/funnel/v2
  - Distribution vs Cumulative behavior; filters for month/year/platform; dateType behavior.
- API: ROAS
  - Option A: Labels only; values unchanged; tooltips correct.
  - Option B: dateType=lead affects CPL denominator; sales remain sale-date; responses documented.
- Backfill script
  - Idempotency; no duplicates on rerun; reasonable approximations.

### User Acceptance Tests
- Sales Funnel
  - Toggle modes: distribution may be non-monotonic; cumulative is non-increasing.
  - Stage conversion rates correct under filters.
- ROAS
  - Labels match numbers; tooltips clarify attribution.
- Platform breakdown and monthly charts
  - Respond to dateType and filters consistently.

## Deployment & Migration

### Deployment Steps
1. Pre-deployment checklist
   - Database backup (remote D1 export).
   - Verify migrations on staging/local.
   - Feature flags/toggles prepared (optional fallback to v1 funnel only).
2. Deployment process
   - Apply migrations to add lead_status_history and indexes.
   - Deploy server code with history insertion and v2 endpoint.
   - Run backfill script on production with prior backup.
   - Deploy frontend with new funnel toggle and ROAS labels.
3. Post-deployment validation
   - Verify /leads/funnel/v2 responses.
   - Check non-increasing cumulative funnel.
   - Confirm history writes on new transitions.
   - Validate ROAS labels/values and tooltips.

### Migration Requirements
- Database migrations
  - Create lead_status_history table + indexes.
- Data transformation
  - Backfill history from existing leads: initial New, optional Contacted via contactedDate, approximated Consulted before Closed when necessary, Closed Won/Lost at closedDate.
- Backward compatibility
  - Keep /leads/funnel (v1) for pipeline distribution; add v2 without breaking existing consumers.

## Risk Analysis

### Technical Risks
- History Backfill Accuracy
  - Mitigation: Document assumptions; mark approximated events; allow filtering “post-migration only” in UI.
- Performance of v2 under large datasets
  - Mitigation: Proper indexes, limit heavy queries, cache common aggregations if needed.

### Business Risks
- Metric Interpretation Changes
  - Mitigation: Tooltips and documentation; clear toggles; communicate change in release notes.
- Temporary Data Discrepancies during rollout
  - Mitigation: Deploy in order (DB → server → backfill → web); verify after each step.

## Success Metrics
- Funnel Integrity: 100% non-increasing bars in cumulative mode.
- History Coverage: ≥ 99% of status changes logged post-deploy; backfill covers 100% of leads with reasonable approximations.
- Performance: Funnel v2 p95 < 300ms on production dataset; maintenance p95 < 100ms.
- ROAS Clarity: Zero support tickets about CPL/ROAS semantics after release.

## Timeline & Milestones
- Day 1–2: Schema + history insertion plumbing
- Day 3–4: Backfill script + verification
- Day 5–7: API v2 + ROAS adjustments
- Day 8–10: Frontend funnel toggle + stage conversions + polish
- Day 11: Perf hardening, docs update, release

## Appendix

### Conversation Highlights
- Adopt Track B (history-powered funnel) for accuracy.
- Keep canonical statuses; normalize legacy values.
- Status maintenance should remain fast (<100ms typical).
- ROAS semantics to be clarified: either rename to “Cost per Closed Case” or honor dateType for CPL.
- Screenshot indicates current funnel is a 3-bar view with Leads 183, Consulted 4, Closed Won 11, and 6.0% Closed Won rate; motivates cumulative funnel.

### References
- Code locations reviewed:
  - Server analytics: apps/server/src/routers/analytics.ts
  - Status utils: apps/server/src/lib/status.ts, apps/server/src/lib/status-maintenance.ts
  - Leads schema: apps/server/src/db/schema/leads.ts
  - Frontend analytics: apps/web/src/components/funnel-chart.tsx, platform-breakdown.tsx, monthly-leads-chart.tsx, monthly-sales-chart.tsx, roas-metrics.tsx, routes/analytics.tsx
- Drizzle ORM, Cloudflare Workers (Wrangler), React, TanStack Table, recharts.

### Glossary
- Cumulative Funnel: Counts leads that have reached each stage at least once, yielding non-increasing bars across stages.
- Pipeline Distribution: Counts leads by their current status only; may appear non-monotonic.
- CPL: Cost per Lead.
- CPA/Cost per Closed Case: Ad cost divided by number of closed cases in period.
- DateType:
  - lead: based on lead creation date.
  - closed: based on closed date (Closed Won/Lost).
  - stage: based on status change date (new history mode).

---
*Generated on: Sun Aug 24 2025*
*Based on conversation context from: Analytics Track B decision and repository inspection*