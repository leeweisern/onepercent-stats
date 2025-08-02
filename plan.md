# Dual Month Approach Implementation Plan

Here's a concrete, end-to-end implementation plan for the "dual-month" approach that preserves both perspectives (lead-creation vs. sale-closure) and aligns with common CRM practice.

## 1. Schema & Migration

### 1.1 Add new columns to the leads table
- closedMonth TEXT - e.g. "June"
- closedYear TEXT/INT - optional but handy for fast filtering
- Optionally add an index on (closedYear, closedMonth) for ROAS queries.

### 1.2 Migration file
- SQL migration (0004_add_closed_month.sql) that:
  a) Adds the columns (nullable).
  b) Back-fills existing rows that already have a closedDate:
     ```sql
     UPDATE leads
     SET closedMonth = CASE ... END,
         closedYear = CASE ... END
     WHERE closedDate IS NOT NULL AND closedDate <> '';
     ```

### 1.3 Update Drizzle schema
Update `apps/server/src/db/schema/leads.ts` to add:
```ts
closedMonth: text("closed_month"),
closedYear: text("closed_year"), // or integer(...)
```

## 2. API Layer Changes

### 2.1 Helpers
Extend `getMonthFromDate(date)` → returns month name.
Add `getYearFromDate(date)` → already exists.

### 2.2 POST /leads
When `salesValue > 0`:
- Ensure `closedDateValue` is set (existing code)
- Derive `closedMonth = getMonthFromDate(closedDateValue)`
- Derive `closedYear = getYearFromDate(closedDateValue)`

### 2.3 PUT /leads/:id
- If sales changes from 0 → positive OR closedDate is (re)set:
  - Re-compute `closedMonth` / `closedYear` exactly as above.
- If sales changes to 0, clear `closedDate`, `closedMonth`, `closedYear`.

### 2.4 Edge-case safeguard
- If the user manually supplies `closedDate` AND `closedMonth`, trust user input; otherwise derive.

## 3. Analytics Query Refactor

### 3.1 Decide which endpoints need which date:
- "Lead generation" metrics → use `month/year` (creation)
- "Closed/won, sales, ROAS" → use `closedMonth/closedYear`

### 3.2 Concrete endpoints to update:

a) `/leads/summary`
- `totalSales` → unchanged (sum over all)
- `totalClosed` → WHERE `isClosed = 1` (same)
(No monthly dimension here, so OK.)

b) `/leads/platform-breakdown`
- Filter/group sales & closedLeads by `closedMonth/closedYear`
- `totalLeads` can still be by creation month if desired, or provide both

c) `/leads/funnel`
- For stages < "Closed" keep creation month
- For "Closed" stage counts & sales use `closedMonth/closedYear`

d) `/roas`
- Replace `leads.month` filters with `leads.closedMonth`
- Replace year substring test on `leads.date` with `leads.closedYear` (faster)

e) Growth endpoints
- `/leads/growth/monthly`
  - Run two queries:
    1. LeadsCreated: GROUP BY month (creation)
    2. SalesClosed: GROUP BY closedMonth (closure)
  - Return both series to the frontend.

- `/leads/growth/yearly`
  - Similar dual aggregation (created vs closed)

### 3.3 Update query parameter docs
- Accept `closedMonth` / `closedYear` aliases, or keep `month` / `year` but document that for ROAS they refer to the close month.

## 4. Front-End Adjustments

### 4.1 Update type definitions for Lead
Add `closedMonth` & `closedYear`.

### 4.2 Dashboards
- Leads charts keep existing behaviour (created)
- Sales / revenue widgets call updated endpoints (no UI change)
- (Optional) add a toggle or two-line chart to show Leads vs Sales

## 5. Back-fill Script & Validation

### 5.1 Write a short TS script
In `apps/server/scripts/` to:
- SELECT `id`, `closedDate` WHERE `closedDate IS NOT NULL`
- Compute and UPDATE `closedMonth`, `closedYear`

### 5.2 Run script locally
Run against dev DB, deploy migration to prod.

### 5.3 Verify
- `/roas?month=June&year=2025` now shows the sale we closed on 10 Jun 2025
- Leads created in May still appear in May's "lead inflow" chart

## 6. Testing

### 6.1 Unit tests
For helper functions (month/year derivation).

### 6.2 Integration test
- Create lead (5 May 2025) with sales = 0
- Update same lead: sales = 100, closedDate = 10 Jun 2025
- Assert DB row has month = "May", closedMonth = "June"
- Call `/roas?month=June&year=2025` → totalSales = 100
- Call `/leads/growth/monthly?year=2025` →
  - LeadsCreated["May"] = 1
  - SalesClosed["June"] = 100

## 7. Deployment / Roll-out

### 7.1 Merge migration & code

### 7.2 Deploy backend first
Then frontend once queries stabilise

### 7.3 Monitor dashboards
Check for any sudden data shifts; sanity-check totals against previous month

## Todo List (high-level)

```markdown
- [x] Create SQL migration adding closedMonth & closedYear and back-fill existing data
- [x] Extend Drizzle schema with closedMonth/closedYear
- [x] Update POST /leads logic to populate closedMonth/closedYear
- [x] Update PUT /leads logic to maintain closedMonth/closedYear
- [x] Refactor analytics queries (ROAS, platform breakdown, growth, funnel) to use closedMonth/closedYear for sales-related metrics
- [ ] Add/adjust frontend type definitions & dashboard calls
- [x] Write back-fill script and run against dev DB
- [ ] Add unit & integration tests covering new logic
- [ ] Deploy migration, backend, then frontend; verify dashboards
```

## Implementation Summary

### Completed Tasks

1. **Schema Changes**: Added `closedMonth` and `closedYear` columns to the leads table
2. **API Updates**: Modified POST and PUT endpoints to automatically populate these fields
3. **Analytics Refactoring**: Updated all sales-related analytics to use closure dates instead of creation dates:
   - ROAS endpoint now filters by `closedMonth`/`closedYear`
   - Platform breakdown uses closure dates for sales metrics
   - Funnel analysis uses closure dates for sales data
   - Growth endpoints now return dual data (leads created vs sales closed)
4. **Backfill Script**: Created script to populate existing data

### Key Changes Made

- Sales metrics now reflect when deals were actually closed, not when leads were created
- Lead generation metrics continue to use creation dates
- Growth charts now show both perspectives (lead inflow vs revenue closure)
- ROAS calculations are now accurate to the month sales were closed