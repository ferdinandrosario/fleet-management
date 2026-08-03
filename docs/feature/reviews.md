# Feature: Completion Photos, Reviews & Rating Aggregation (Session 8)

Source of truth for commercial vehicle booking review submissions, completion proof photo uploads, and automatic rating score aggregation.

## Overview & Architecture

Reviews operate within **tenant schemas**, isolated per business owner (`ros-apartment`).

```
Customer (tenant schema context)
   │
   ├── POST /api/v1/bookings/:id/review ──▶ Submit rating (1..5), comment & completion_photo_url for completed booking
   │                                        ├── Validates booking status is completed
   │                                        ├── Validates 1 review per booking
   │                                        └── Triggers vehicle.update_rating_stats!
   │
   └── GET  /api/v1/vehicles/:id/reviews ──▶ Query paginated reviews and average_rating / reviews_count summary
```

## Rating Aggregation Formula

When a review is created, the target `Vehicle` recalculates its rating counters atomically:

$$\text{average\_rating} = \text{round}\left(\frac{\sum \text{rating}}{\text{reviews\_count}}, 2\right)$$

- `reviews_count`: Total number of submitted reviews for the vehicle.
- `average_rating`: Rounded to 2 decimal places (default `0.0`).

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/v1/bookings/:id/review` | Submit rating, comment, and completion proof photo URL |
| `GET` | `/api/v1/vehicles/:id/reviews` | Retrieve paginated vehicle reviews with rating summary |
