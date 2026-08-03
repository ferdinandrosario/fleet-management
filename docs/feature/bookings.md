# Feature: Discovery, Booking & Payments (Session 6)

Source of truth for location-based commercial vehicle discovery, reservation booking state machine, advance token payments, and cancellations.

## Overview & Architecture

Customer vehicle search and reservation bookings operate within **tenant schemas**, isolated per business owner (`ros-apartment`).

```
Customer / Driver / Owner Admin (tenant schema context)
   │
   ├── GET /api/v1/discovery/vehicles        ──▶ Spatial proximity search (Haversine/PostGIS in km, availability window filter)
   ├── GET /api/v1/bookings                  ──▶ List customer/driver/tenant bookings
   ├── POST /api/v1/bookings                 ──▶ Create reservation (pending_payment state, calculate quote & advance deposit)
   ├── GET /api/v1/bookings/:id              ──▶ Booking details
   ├── POST /api/v1/bookings/:id/pay_advance ──▶ Verify advance payment (promotes to confirmed & advance_paid)
   └── PATCH /api/v1/bookings/:id/cancel     ──▶ Cancel reservation
```

## State Machine & Lifecycles

### 1. Booking Status
- `pending_payment` (0): Initial state upon creation.
- `confirmed` (1): Advance deposit verified via `PaymentVerificationService`.
- `in_progress` (2): Work execution active.
- `completed` (3): Work execution completed.
- `cancelled` (4): Booking cancelled by customer or owner.

### 2. Payment Status
- `pending` (0): No payment recorded.
- `advance_paid` (1): 20% advance token deposit (minimum ₹500 / 50000 paise) verified.
- `fully_paid` (2): Complete rental balance settled.
- `refunded` (3): Booking cancelled and deposit refunded.

## Services

### 1. `VehicleDiscoveryService`
- Performs location proximity search filtering vehicles within a specified `radius_km` (default 50 km).
- Excludes vehicles with conflicting `VehicleAvailability` holds or active overlapping `Booking`s during `[start_time, end_time]`.
- Orders results by spatial distance ascending.

### 2. `BookingService`
- Validates vehicle availability and duration validity.
- Calculates total rental price using `PricingCalculatorService`.
- Enforces 20% advance token payment (minimum ₹500 / 50000 paise, capped at total price).
- Generates sandboxed Razorpay order payload.

### 3. `PaymentVerificationService`
- Verifies Razorpay payment signature & payment ID.
- Transitions booking state to `confirmed` and `payment_status` to `advance_paid`.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/discovery/vehicles` | Search vehicles by latitude, longitude, radius_km, category, and date range |
| `GET` | `/api/v1/bookings` | List bookings for current customer, assigned driver, or tenant owner |
| `POST` | `/api/v1/bookings` | Create vehicle reservation (calculates quote and advance order) |
| `GET` | `/api/v1/bookings/:id` | Show booking reservation details |
| `POST` | `/api/v1/bookings/:id/pay_advance` | Verify advance token deposit and confirm booking |
| `PATCH` | `/api/v1/bookings/:id/cancel` | Cancel booking reservation |
