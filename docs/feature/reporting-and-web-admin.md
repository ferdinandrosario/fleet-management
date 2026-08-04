# Feature: Reporting, Dashboards, Exports & Web Admin (Session 10)

Source of truth for owner fleet analytics dashboards, super-admin platform metrics, CSV booking export generation, and the Web Admin SPA (`web-admin/`).

## Overview & Architecture

Reporting services aggregate operational statistics across **tenant schemas** (`ros-apartment`) for business owners and platform metrics across **public schema** for super-admins.

```
Owner Admin / Super Admin
   │
   ├── GET /api/v1/reports/dashboard       ──▶ Owner fleet metrics (revenue, vehicle utilization, active drivers)
   ├── GET /api/v1/reports/bookings_csv     ──▶ Stream CSV export of tenant booking records
   └── GET /api/v1/super_admin/dashboard   ──▶ Super admin platform metrics (owners count, MRR paise, active subscriptions)
```

## Metrics Breakdown

### Owner Dashboard Metrics
- `total_revenue_cents`: Total sum of completed booking amounts.
- `completed_jobs_count`: Total number of completed booking jobs.
- `total_vehicles_count`: Total registered vehicles in fleet.
- `active_vehicles_count`: Number of available vehicles.
- `active_drivers_count`: Number of verified driver users.
- `average_vehicle_rating`: Fleet-wide average review rating (1..5).
- `vehicle_utilization_pct`: Percentage of active available vehicles relative to total fleet.

### Super Admin Dashboard Metrics
- `total_owners_count`: Platform owner count.
- `active_owners_count`: Active non-suspended owner count.
- `active_subscriptions_count`: Active paying tenant subscriptions count.
- `mrr_paise`: Monthly Recurring Revenue in INR paise.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Fleet owner / driver session authentication (returns JWT access_token) |
| `POST` | `/api/v1/super_admin/login` | Super admin operator authentication (returns JWT access_token) |
| `DELETE` | `/api/v1/auth/logout` | Revoke session refresh tokens and logout user |
| `GET` | `/api/v1/reports/dashboard` | Fetch owner fleet analytics dashboard |
| `GET` | `/api/v1/reports/bookings_csv` | Download CSV export file of booking records |
| `GET` | `/api/v1/super_admin/dashboard` | Fetch super admin platform metrics dashboard |

## Web Admin Design System, Theme Provider & Authentication

The `web-admin/` application implements a full-featured theme system, authentication gate, and UI component suite:

- **Authentication Gate (`AuthGate`)**: Restricts unauthenticated access to dashboards based on URL routes. The landing page (`/`) renders strictly the **Fleet Owner login form** (phone + password + tenant slug). Appending `/superadmin` renders strictly the **Super Admin login form** (email + password). Tokens are kept in memory only (`setAuthToken`), fulfilling the security requirement preventing XSS local storage exposure.
- **Header Navigation Bar**: Modern glassmorphic sticky top navbar (`bg-[var(--bg-secondary)]/85 backdrop-blur-md border-b border-[var(--border-color)]`) featuring brand logo with live status pulse indicator, navigation tab items (`Overview`, `Fleet Equipment`, `Telemetry & System`), inline tenant schema selector for fleet owners, theme toggle, and authenticated user profile chip with role badges.
- **Responsive Multi-Column Footer**: Modern 3-column footer layout featuring platform brand & security metadata, platform feature pills (`ros-apartment`, Razorpay), 99.99% operational status bar, and role-gated access link to `/technical`. Administrative routes (`/superadmin`) are unexposed to general audience UI elements.
- **Theme Modes**: Supports `Dark Fleet` (`--bg-primary: #0b0f19`), `Light` (`--bg-primary: #f8fafc`), and `Obsidian` (`--bg-primary: #050508`) modes via `ThemeProvider` (`src/lib/theme.tsx`) and `ThemeToggle` (`src/components/ui/ThemeToggle.tsx`). All form controls, buttons, and badges dynamically adjust using CSS custom properties (`var(--input-bg)`, `var(--border-color)`).
- **Status Badges**: `Badge.tsx` provides semantic pills following canonical status rules: Emerald Green for `active`/`success`/`paid`, Warm Amber for `warning`/`in_service`/`pending`, Crimson Red for `danger`/`overdue`/`inactive`, and Indigo Blue for `info`/`on_trip`.
- **Analytics Visualizations**: `FleetRevenueChart.tsx` renders interactive SVG bar charts displaying weekly revenue trends and job volume.
- **Data Tables**: `DataTable.tsx` provides client-side searchable, paginated inventory and multitenant schema tables.
- **Add Vehicle Modal (`AddVehicleModal`)**: Enables fleet owners to register new commercial vehicles directly from the Web Admin page. Collects vehicle name, category, registration number, model year, hourly/daily rates, and specs JSON, posting to `/api/v1/vehicles` with error handling for plan limits (`plan_limit_exceeded`) and validation errors.
- **Technical Architecture Route (`/technical` & `/tecnical`)**: Role-gated route (`src/features/super-admin/TechnicalArchitecture.tsx`) accessible strictly to Super Administrators (`role === 'super_admin'`). Displays full infrastructure telemetry, version specifications (Rails 8.1.3 API, Ruby 4.0.6, React 19.2, Expo React Native 0.85, PostgreSQL 17 + PostGIS 3.5, ros-apartment schema isolation, Solid Queue), topology breakdown, and security policies. Access attempts by non-super-admins render a 403 Forbidden card.

