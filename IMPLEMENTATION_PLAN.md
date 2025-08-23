# Implementation Plan: UI/UX Overhaul for OnePercent-Stats Web App

## Executive Summary

This document outlines the implementation plan for a comprehensive user interface (UI) and user experience (UX) overhaul of the `apps/web` application. The primary objective is to refactor the existing web application to mirror the modern, feature-rich, and highly-polished design of the `apps/shadcn-admin-main` template.

The project will involve replacing foundational UI components, implementing an advanced layout and navigation system, and integrating new features such as a global command menu and a theme customization drawer. The goal is to elevate the user experience of the `apps/web` application, improve developer ergonomics by using more robust and reusable components, and create a visually consistent and professional-grade product. This is a pure front-end refactoring effort with no anticipated changes to the backend or data models.

## Background & Context

- **Project overview and current state**: The project contains two distinct front-end applications: `apps/web`, the primary application, and `apps/shadcn-admin-main`, a template showcasing a desired UI. The `apps/web` application currently has a simpler, less polished UI with a custom red-and-black theme.
- **Problem statement and motivation**: The UI of `apps/web` lacks the sophistication, feature set, and customizability of the `apps/shadcn-admin-main` template. This leads to a disjointed user experience and missed opportunities for powerful UI features like advanced data tables and runtime theme configuration.
- **Expected outcomes and success criteria**: Upon completion, `apps/web` will be visually and functionally aligned with the `apps/shadcn-admin-main` template. Success will be measured by the successful implementation of the new layout system, header, data tables, and customization features, resulting in a more intuitive, powerful, and aesthetically pleasing application.
- **Stakeholders and users affected**: The end-users of the `apps/web` application will benefit from a significantly improved interface. Developers will benefit from a more maintainable and standardized component library.

## Detailed Requirements

### Functional Requirements

1.  **Advanced Layout System**
    -   **Description**: Implement a flexible sidebar layout system that supports multiple states and styles.
    -   **User Interactions**: The sidebar should be collapsible to an icon-only view or completely hidden (off-canvas). Users should be able to select different layout styles (e.g., "inset", "floating").
    -   **Expected Behavior**: The main content area should adapt correctly to the sidebar's state and style. The layout state should be persisted across sessions using cookies.
    -   **Acceptance Criteria**: The sidebar can be toggled between expanded and collapsed states. The layout options (inset, floating) are functional.

2.  **Enhanced Application Header**
    -   **Description**: The main header for `apps/web` will be upgraded to be a sticky, translucent element that includes global components for search, theme management, and user settings.
    -   **User Interactions**: Users can access a global search menu, switch themes, open a configuration drawer, and access their profile from the header.
    -   **Expected Behavior**: The header remains fixed at the top of the viewport during scrolling. It should contain a functional `Search` component, `ThemeSwitch`, `ConfigDrawer`, and `ProfileDropdown`.
    -   **Acceptance Criteria**: All header components are present and functional. The header has a blur effect and slight shadow on scroll.

3.  **Theme and Layout Customization**
    -   **Description**: Introduce a `ConfigDrawer` that allows users to customize their UI experience at runtime.
    -   **User Interactions**: Users can open a drawer to select a color theme (light, dark, system), a font, a layout style, and a text direction (LTR/RTL).
    -   **Expected Behavior**: Selections made in the drawer are applied instantly to the application. These settings are persisted in cookies.
    -   **Acceptance Criteria**: The `ConfigDrawer` is accessible from the header. All customization options work as expected.

4.  **Advanced Data Table Implementation**
    -   **Description**: Refactor the existing leads table in `apps/web` to use a highly reusable and feature-rich data table component system.
    -   **User Interactions**: Users can perform faceted filtering, toggle column visibility, sort columns, and use pagination.
    -   **Expected Behavior**: The leads table will be replaced with the new `DataTable` implementation, including a `DataTableToolbar` for controls and `DataTablePagination` for navigation.
    -   **Acceptance Criteria**: The leads table has faceted filtering for status and role, a search bar, a view options dropdown, and server-side pagination.

### Non-Functional Requirements

-   **Maintainability**: All new components ported from `shadcn-admin-main` should be reusable and placed in a logical file structure within `apps/web`.
-   **Consistency**: The visual style (colors, fonts, spacing, border-radius) must be consistent across all pages and components within the `apps/web` application.
-   **Responsiveness**: The entire application, including the new layout and components, must be fully responsive and functional on mobile, tablet, and desktop screen sizes.

### UI/UX Requirements

-   **Layout and Design**: The application will adopt the "inset" layout by default, where the main content panel is visually distinct from the sidebar and has surrounding margins, giving it a modern, floating appearance.
-   **Visual Elements and Styling**: The color scheme will be changed from the current red theme to the neutral, slate-based palette of `shadcn-admin-main`. The `border-radius` will be standardized using the `--radius` CSS variable.
-   **Component Descriptions**: All primitive components (`Button`, `Card`, `Input`, etc.) in `apps/web` will be replaced with the versions from `shadcn-admin-main` to ensure an identical look, feel, and set of variants.
-   **User Flow**: The user flow for navigation will be improved with the introduction of the `CommandMenu` (accessible via `⌘+K`), providing a fast way to jump between pages.

## Technical Specifications

### Architecture Overview

The refactoring will be based on a component-driven architecture. The core of the work involves porting components and React Contexts from `apps/shadcn-admin-main` to `apps/web`.

-   **Component Structure**: `apps/web` will adopt the UI component structure from `shadcn-admin-main`, including the `components/ui`, `components/layout`, and `components/data-table` directories.
-   **Data Flow**: UI state (like theme, layout preferences, and table filters) will be managed by a combination of React Contexts and URL search parameters. The `useTableUrlState` hook will be crucial for syncing table state with the URL.
-   **Integration Points**: The primary integration point is wrapping the root layout of `apps/web` with the necessary context providers (`ThemeProvider`, `LayoutProvider`, etc.).

### Technology Stack

No changes to the core technology stack are required. The project will continue to use:
-   **Languages**: TypeScript
-   **Frameworks**: React, Vite
-   **Styling**: Tailwind CSS
-   **UI Components**: shadcn/ui

### Data Models

No changes to the backend data models or API schemas are required for this UI overhaul.

## Implementation Approach

### Phase 1: Foundation - Components & Theming (Est. 1 day)
-   **Step 1.1**: **Copy UI Primitives**. Overwrite the contents of `apps/web/src/components/ui` with the component files from `apps/shadcn-admin-main/src/components/ui`.
-   **Step 1.2**: **Unify CSS**. Replace the content of `apps/web/src/index.css` with the styles from `apps/shadcn-admin-main/src/styles/index.css` and `apps/shadcn-admin-main/src/styles/theme.css`. This will standardize the color palette, fonts, and base styles.
-   **Step 1.3**: **Integrate Context Providers**. Copy the context files (`ThemeProvider`, `FontProvider`, `DirectionProvider`, `LayoutProvider`, `SearchProvider`) into a new `apps/web/src/context` directory.
-   **Step 1.4**: **Update Root Layout**. Modify `apps/web/src/root.tsx` to wrap the main application layout with the newly added providers.

### Phase 2: Core Layout Refactoring (Est. 1 day)
-   **Step 2.1**: **Port Layout Components**. Copy the `Header`, `Main`, `AppSidebar`, `NavGroup`, and other layout-related components from `shadcn-admin-main/src/components/layout` to `apps/web/src/components/layout`.
-   **Step 2.2**: **Create Navigation Data**. Create a `sidebar-data.ts` file for `apps/web` to define its specific navigation structure, similar to the one in `shadcn-admin-main`.
-   **Step 2.3**: **Rebuild Main Layout**. Refactor the main layout in `apps/web` to use the new `Header` and `AppSidebar` components.
-   **Step 2.4**: **Integrate Header Features**. Add the `CommandMenu`, `ConfigDrawer`, and `ProfileDropdown` components to the new header.

### Phase 3: Page Refactoring - Data Table (Est. 1-2 days)
-   **Step 3.1**: **Copy Data Table System**. Copy the entire `apps/shadcn-admin-main/src/components/data-table` directory to `apps/web/src/components/`.
-   **Step 3.2**: **Refactor Leads Page**. Modify `apps/web/src/routes/leads.tsx` to replace the existing table with the new `DataTable` component system.
-   **Step 3.3**: **Integrate Filters**. Adapt the existing filter logic from `LeadsFilters.tsx` to work with the new `DataTableToolbar` and its faceted filter components.
-   **Step 3.4**: **Hook up State**. Use the `useTableUrlState` hook to manage table state (pagination, filters) via URL search parameters.

### Phase 4: Final Polish & Consistency Pass (Est. 1 day)
-   **Step 4.1**: **Review All Pages**. Audit all pages (`Analytics`, `Advertising`, etc.) to ensure they use the new `Card` components and follow the consistent page structure.
-   **Step 4.2**: **Verify Responsiveness**. Perform a full review of the application on mobile, tablet, and desktop screen sizes to fix any layout issues.
-   **Step 4.3**: **Clean Up**. Remove old, unused components and CSS from `apps/web`.

## File Structure & Changes

### New Files to Create
-   `apps/web/src/context/`: Directory for all new context providers.
-   `apps/web/src/components/layout/`: Directory for new layout components (`Header`, `NavGroup`, etc.).
-   `apps/web/src/components/data-table/`: Directory for the advanced data table system.
-   `apps/web/src/components/command-menu.tsx`: The global search component.
-   `apps/web/src/components/config-drawer.tsx`: The theme/layout customization component.
-   `apps/web/src/lib/sidebar-data.ts`: Data source for the new sidebar navigation.

### Files to Modify
-   `apps/web/src/index.css`: To be overwritten with the new theme and base styles.
-   `apps/web/src/root.tsx`: To add the new context providers.
-   `apps/web/src/routes/leads.tsx`: To replace the simple table with the `DataTable` system.
-   `apps/web/src/routes/analytics.tsx`: To adopt the new `Card` layout.
-   `apps/web/src/routes/advertising.tsx`: To adopt the new `Card` layout.
-   `apps/web/src/components/app-sidebar.tsx`: To be replaced with the new layout system.
-   `apps/web/src/components/site-header.tsx`: To be replaced with the new layout system.
-   All files in `apps/web/src/components/ui/`: To be overwritten with the versions from `shadcn-admin-main`.

## Testing Strategy

### Unit Tests
-   No new unit tests are planned, as this is primarily a UI and component integration task.

### Integration Tests
-   No automated integration tests are planned.

### User Acceptance Tests
-   **Theme & Layout**: Manually test the `ConfigDrawer` by changing the theme, font, layout style, and text direction. Verify changes apply correctly and persist after a page refresh.
-   **Navigation**: Test the `CommandMenu` (`⌘+K`) to ensure it opens and allows for quick navigation to all pages. Test all sidebar links.
-   **Data Table Functionality**: On the Leads page, test all data table features:
    -   Search by name/phone.
    -   Faceted filtering for status and role.
    -   Sorting on all sortable columns.
    -   Pagination controls.
    -   Toggling column visibility via the "View" dropdown.
-   **Responsiveness**: Verify the application layout and functionality on three breakpoints: mobile (<768px), tablet (768px-1024px), and desktop (>1024px). Ensure the sidebar correctly switches to a sheet on mobile.
-   **Cross-Browser Check**: Perform a quick check on latest versions of Chrome, Firefox, and Safari.

## Deployment & Migration

-   **Deployment Steps**: The standard deployment process for the `apps/web` application will be followed. This involves running `bun run build` and then `wrangler pages deploy dist`.
-   **Migration Requirements**: There are no database or data migration requirements.

## Risk Analysis

### Technical Risks
-   **Styling Conflicts**: Overwriting the entire CSS and UI component library may lead to unforeseen styling issues on pages not explicitly targeted for refactoring.
    -   **Mitigation**: A thorough visual regression test of all pages in `apps/web` must be conducted after Phase 1.
-   **Component Prop Mismatches**: The new, more advanced components may have different prop requirements than the old ones.
    -   **Mitigation**: During refactoring, pay close attention to TypeScript errors and component definitions to ensure correct props are passed.

### Business Risks
-   There are no significant business risks associated with this technical UI/UX improvement initiative.

## Success Metrics
-   **UI Parity**: The `apps/web` application's look and feel is visually indistinguishable from the `apps/shadcn-admin-main` template.
-   **Feature Functionality**: The `ConfigDrawer`, `CommandMenu`, and advanced `DataTable` features are fully functional within `apps/web`.
-   **Performance**: The application's perceived performance and load times are not negatively impacted by the new components.

## Timeline & Milestones
-   **Milestone 1**: Foundation & Theming Complete (1 day)
-   **Milestone 2**: Core Layout & Header Refactored (1 day)
-   **Milestone 3**: Leads Page Data Table Refactored (2 days)
-   **Milestone 4**: Project Complete & Tested (1 day)
-   **Total Estimated Time**: 5 days

## Appendix

### Conversation Highlights
-   The core requirement is to make `apps/web` look and feel like `apps/shadcn-admin-main`.
-   The request is for a plan, not immediate implementation.
-   Key features to adopt are the layout system, theming/customization drawer, enhanced header with command menu, and the advanced data table components.

### References
-   `shadcn/ui` documentation
-   `apps/shadcn-admin-main` source code as the primary reference implementation.

---
*Generated on: 2025-08-23*
*Based on conversation context from: Gemini CLI Session*
