# Feature: Driver Work Execution & Real-Time GPS Tracking (Session 7)

Source of truth for commercial vehicle driver job assignment, start/finish meter readings, real-time GPS location ingestion, and tracking trail querying.

## Overview & Architecture

Job execution lifecycle and telemetry pings operate within **tenant schemas**, isolated per business owner (`ros-apartment`).

```
Driver / Owner Admin / Customer (tenant schema context)
   │
   ├── POST /api/v1/bookings/:id/assign_driver ──▶ Owner admin assigns driver (role: driver)
   ├── POST /api/v1/bookings/:id/start_job     ──▶ Assigned driver starts job with start_meter_reading
   ├── POST /api/v1/bookings/:id/finish_job    ──▶ Assigned driver completes job with end_meter_reading
   ├── POST /api/v1/bookings/:id/gps_pings     ──▶ Driver emits location ping (updates vehicle coordinates)
   └── GET  /api/v1/bookings/:id/tracking      ──▶ Query latest location & chronological tracking trail
```

## Work Execution Lifecycle

```
[ confirmed ] ──( assign_driver )──▶ [ confirmed with driver ]
                                           │
                                       ( start_job + meter reading )
                                           ▼
[ completed ] ◄──( finish_job + meter )─── [ in_progress ]
                                           │
                                     ( gps_pings )
```

## Services

### 1. `JobExecutionService`
- `assign_driver`: Assigns a verified driver user to an open booking reservation.
- `start_job`: Transitions booking to `in_progress`, records `start_meter_reading` (odometer or engine hour meter), and sets `job_started_at`.
- `finish_job`: Validates `end_meter_reading >= start_meter_reading`, transitions booking to `completed`, and sets `job_finished_at`.

### 2. `GpsTrackingService`
- `record_ping`: Records a `GpsPing` (latitude, longitude, speed_kmh, recorded_at) for an active booking and updates the vehicle's real-time coordinates for discovery maps.
- `get_trail`: Returns the chronological history of GPS pings for a booking.

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/bookings/:id/assign_driver` | Assign a driver to a confirmed booking |
| `POST` | `/api/v1/bookings/:id/start_job` | Start job execution with initial meter reading |
| `POST` | `/api/v1/bookings/:id/finish_job` | Complete job execution with final meter reading |
| `POST` | `/api/v1/bookings/:id/gps_pings` | Emit real-time GPS telemetry ping |
| `GET` | `/api/v1/bookings/:id/tracking` | Retrieve latest vehicle position and GPS tracking trail |
