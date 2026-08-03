# Feature: Driver Leave Management & Payroll Settlement (Session 9)

Source of truth for commercial vehicle driver leave applications, owner admin approvals, and automated payroll settlements based on completed job hours and earnings.

## Overview & Architecture

Leave management and payroll calculations operate within **tenant schemas**, isolated per business owner (`ros-apartment`).

```
Driver / Owner Admin (tenant schema context)
   │
   ├── POST  /api/v1/driver_leaves              ──▶ Driver applies for leave (pending status)
   ├── PATCH /api/v1/driver_leaves/:id/status   ──▶ Owner admin approves/rejects leave
   ├── GET   /api/v1/driver_leaves              ──▶ Query leave application records
   │
   ├── POST  /api/v1/driver_payrolls/calculate  ──▶ Owner admin calculates payroll for driver period
   ├── PATCH /api/v1/driver_payrolls/:id/pay    ──▶ Owner admin marks payroll settlement as paid
   └── GET   /api/v1/driver_payrolls            ──▶ Query driver payroll records
```

## Payroll Calculation Formula

When an owner admin initiates payroll calculation for a target driver and period range:

$$\text{base\_pay\_cents} = \sum (\text{booking.total\_cents} \times 0.40)$$

$$\text{total\_hours\_worked} = \sum \frac{\text{job\_finished\_at} - \text{job\_started\_at}}{3600}$$

$$\text{total\_payout\_cents} = \max(\text{base\_pay\_cents} + \text{bonus\_cents} - \text{deductions\_cents}, 0)$$

## API Reference

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/v1/driver_leaves` | List leave applications for logged-in driver or owner admin |
| `POST` | `/api/v1/driver_leaves` | Driver submits a new leave application |
| `PATCH` | `/api/v1/driver_leaves/:id/status` | Owner admin approves or rejects driver leave application |
| `GET` | `/api/v1/driver_payrolls` | List driver payroll settlement records |
| `POST` | `/api/v1/driver_payrolls/calculate` | Calculate completed job earnings, hours, and payout for driver |
| `PATCH` | `/api/v1/driver_payrolls/:id/pay` | Settle driver payroll status as paid |
