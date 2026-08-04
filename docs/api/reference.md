# API reference

Versioned under `/api/v1`. Every response uses the envelope
`{ "status", "data", "error" }`. Keys are **snake_case**.

**Headers**
- `X-Tenant: <slug>` — required on every tenant endpoint; unknown ⇒ `404 unknown_tenant`.
- `Authorization: Bearer <access_token>` — required on protected endpoints.
- `Accept-Language: <locale>` — optional; localizes messages (en).

## Health

`GET /api/v1/health` → `200`
```json
{ "status": "success", "data": { "service": "fleet-management-api", "status": "ok" }, "error": null }
```

## Auth (Session 3)

All require `X-Tenant`. Throttled by rack-attack.

### `POST /api/v1/auth/register`
Self-registration (customer). Body: `{ "user": { "name", "phone", "password", "locale"? } }`.
→ `201` `{ "data": { "id": "<uuid>", "phone_verification_required": true } }`. Sends an OTP.
Invalid → `422 validation_failed` with `error.fields`.

### `POST /api/v1/auth/otp`
Request an OTP. Body: `{ "phone" }`. → `200 { "data": { "sent": true } }` **always**
(no user enumeration).

### `POST /api/v1/auth/otp/verify`
Body: `{ "phone", "code" }`. On success marks the phone verified and returns tokens:
```json
{ "data": { "access_token": "…", "refresh_token": "…",
            "user": { "id", "name", "phone", "role", "locale", "phone_verified" } } }
```
Wrong/expired/locked → `422 otp_invalid`.

### `POST /api/v1/auth/login`
Body: `{ "phone", "password" }`. → `200` tokens (as above). Wrong creds →
`401 invalid_credentials`; unverified phone → `403 phone_unverified`.

### `POST /api/v1/auth/refresh`
Body: `{ "refresh_token" }`. → `200 { "data": { "access_token", "refresh_token" } }`
(rotated). Invalid/expired/reused → `401 invalid_token` (reuse revokes the family).

### `DELETE /api/v1/auth/logout` — _auth required_
Revokes all refresh tokens. → `200 { "data": { "signed_out": true } }`.

## Profile (Session 3) — _auth required_

### `GET /api/v1/me`
→ `200 { "data": { "id", "name", "phone", "role", "locale", "phone_verified" } }`.
No/invalid token → `401 unauthorized`.

### `PATCH /api/v1/me`
Body: `{ "user": { "name"?, "locale"? } }`. → `200` updated user. Invalid → `422`.

## Error codes

`unknown_tenant` (404) · `unauthorized` (401) · `forbidden` (403) ·
`invalid_credentials` (401) · `phone_unverified` (403) · `otp_invalid` (422) ·
`invalid_token` (401) · `validation_failed` (422, with `fields`) ·
`rate_limited` (429).
