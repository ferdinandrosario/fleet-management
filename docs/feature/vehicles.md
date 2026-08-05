# Feature: Vehicles, Availability, Pricing & Discounts (Session 5)

Source of truth for tenant vehicle fleet management, hold/availability blocks, and rental quote calculations with tier discounts.

## Overview & Multi-Tenancy

Vehicle listings (`vehicles`), schedules (`vehicle_availabilities`), and discount rules (`pricing_rules`) live inside **tenant schemas**, isolated per owner via `ros-apartment`.

```
Owner Admin (tenant schema context)
   │
   ├── GET /api/v1/vehicles                      ──▶ List vehicles (category/status filter, Pagy)
   ├── POST /api/v1/vehicles                     ──▶ Create vehicle (enforces PlanLimitService!)
   ├── GET/PATCH/DELETE /api/v1/vehicles/:id      ──▶ Vehicle detail & soft archive
   ├── GET /api/v1/vehicles/:id/quote            ──▶ PricingCalculatorService
   ├── GET/POST/DELETE /api/v1/vehicles/:id/availabilities
   └── GET/POST/DELETE /api/v1/vehicles/:id/pricing_rules
```

## Supported Vehicle Categories

- `tractor` (0)
- `jcb` (1)
- `heavy_vehicle` (2)
- `bus` (3)
- `crane` (4)
- `harvester` (5)

## Vehicle Catalog (VehicleModels)

To support dependent dropdowns in the frontend UI (Make -> Variety/Model), a global catalog of `VehicleModel` records is stored in the `public` schema. Super Admins manage the varieties (e.g., Swaraj -> 744 XT).

- **SuperAdmin API:** `SuperAdmin::VehicleModelsController` provides full CRUD for the catalog (`/api/v1/super_admin/vehicle_models`).
- **Discovery API:** `Discovery::VehicleModelsController` provides read-only listing (`/api/v1/discovery/vehicle_models`) accessible without authentication for populating frontend dropdowns.
- **Vehicles Table:** Contains an optional `vehicle_model_id` pointing to the public `VehicleModel` record.

## Services & Logic

### 1. `PricingCalculatorService`
Calculates instant quotes for duration requests (hours and/or days):
- Computes standard base cost using `hourly_rate_cents` and `daily_rate_cents`.
- Evaluates active `PricingRule` matching `min_duration_hours` and date range (`start_date` .. `end_date`).
- Applies rate overrides (`override_hourly_rate_cents`, `override_daily_rate_cents`) or percentage discounts (`discount_percentage`).

### 2. Plan Limit Enforcement
`VehiclesController#create` checks `PlanLimitService.check(owner, :vehicles, current_count: Vehicle.count)` before persisting new vehicle listings. If the plan cap is reached, returns `HTTP 403 Forbidden` (`code: "plan_limit_exceeded"`).

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/vehicles` | List tenant vehicles with filters |
| `POST` | `/api/v1/vehicles` | Create new vehicle (plan limit checked) |
| `GET` | `/api/v1/vehicles/:id` | Get vehicle details and specs |
| `PATCH` | `/api/v1/vehicles/:id` | Update vehicle details |
| `DELETE` | `/api/v1/vehicles/:id` | Archive vehicle (`status: :inactive`) |
| `GET` | `/api/v1/vehicles/:id/quote` | Calculate price quote with discount rules |
| `GET` | `/api/v1/vehicles/:id/availabilities` | List availability blocks / holds |
| `POST` | `/api/v1/vehicles/:id/availabilities` | Create maintenance hold or booked range |
| `DELETE` | `/api/v1/vehicles/:id/availabilities/:id` | Remove availability block |
| `GET` | `/api/v1/vehicles/:id/pricing_rules` | List tiered discount rules |
| `POST` | `/api/v1/vehicles/:id/pricing_rules` | Create pricing discount rule |
| `DELETE` | `/api/v1/vehicles/:id/pricing_rules/:id` | Delete pricing rule |
