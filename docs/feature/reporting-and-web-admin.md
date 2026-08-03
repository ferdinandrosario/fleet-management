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

- **Authentication Gate (`AuthGate`)**: Restricts unauthenticated access to `http://localhost:3001/` dashboards. Supports Fleet Owner login (phone + password + tenant slug) and Super Admin login (email + password). Tokens are kept in memory only (`setAuthToken`), fulfilling the security requirement preventing XSS local storage exposure.
- **Theme Modes**: Supports `Dark Fleet` (`--bg-primary: #0b0f19`), `Light` (`--bg-primary: #f8fafc`), and `Obsidian` (`--bg-primary: #050508`) modes via `ThemeProvider` (`src/lib/theme.tsx`) and `ThemeToggle` (`src/components/ui/ThemeToggle.tsx`).
- **Status Badges**: `Badge.tsx` provides semantic pills following canonical status rules: Emerald Green for `active`/`success`/`paid`, Warm Amber for `warning`/`in_service`/`pending`, Crimson Red for `danger`/`overdue`/`inactive`, and Indigo Blue for `info`/`on_trip`.
- **Analytics Visualizations**: `FleetRevenueChart.tsx` renders interactive SVG bar charts displaying weekly revenue trends and job volume.
- **Data Tables**: `DataTable.tsx` provides client-side searchable, paginated inventory and multitenant schema tables.

