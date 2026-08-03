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
| `GET` | `/api/v1/reports/dashboard` | Fetch owner fleet analytics dashboard |
| `GET` | `/api/v1/reports/bookings_csv` | Download CSV export file of booking records |
| `GET` | `/api/v1/super_admin/dashboard` | Fetch super admin platform metrics dashboard |
