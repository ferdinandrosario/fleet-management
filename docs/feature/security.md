# Feature: Security (threat model + controls)

Security is first-class on every change. This app handles money, PII
(phone/location/photos), and strictly isolated multi-tenant data. Default-deny,
defense-in-depth, OWASP Top 10 + API Top 10, DPDP Act 2023. Where secure vs.
fast conflict, we choose secure.

## Threat model

| # | Threat (OWASP) | Control | Status |
|---|---|---|---|
| T1 | Cross-tenant data access (API1 BOLA) — **highest risk** | schema switch + token-derived tenant + Pundit + UUID lookups | mechanism in place ([multi-tenancy](multi-tenancy.md)); data-isolation specs S3 |
| T2 | Broken auth / token theft (API2) | short-lived JWT + rotating refresh + revocation; bcrypt; lockout | Session 3 |
| T3 | OTP abuse / enumeration | hashed single-use OTP, short expiry, attempt/resend caps, throttling | rack-attack guards live; OTP S3 |
| T4 | Broken authorization / priv-esc (API1/API5) | Pundit default-deny; role+tenant from token, not params; strict params | scaffolding live; policies S3+ |
| T5 | Payment tampering | server-side amounts; webhook + payment signature verify; idempotent webhooks | Session 4/6 (sandbox) |
| T6 | PII exposure (DPDP) | AR Encryption; TLS+HSTS; filtered logs; private uploads + EXIF strip | encryption + filters live |
| T7 | Injection / misconfig (API8) | parameterized queries; secure_headers/CSP; strict CORS; force_ssl | live |
| T8 | Resource exhaustion / scraping (API4) | rack-attack throttles; mandatory pagination | throttles live; pagination S4 |
| T9 | Supply chain | brakeman + bundler-audit blocking in CI | live |
| T10 | Mobile token leakage | Keychain/Keystore; no secrets in bundle; TLS | Session 2 |

## Controls in place (Session 1)

- **Security headers** (`config/initializers/secure_headers.rb`): HSTS,
  `X-Frame-Options: DENY`, `nosniff`, strict referrer policy, and a JSON-API
  CSP locked to `default-src 'none'` / `script-src 'none'`. Verified by
  `spec/requests/security_headers_spec.rb`.
- **CORS allowlist** (`config/initializers/cors.rb`): explicit origins only
  (`CORS_ALLOWED_ORIGINS`), never `*`, credentials off (Bearer tokens). Verified
  by `spec/requests/cors_spec.rb`.
- **Rate limiting** (`config/initializers/rack_attack.rb`): per-IP throttles on
  login, OTP, password reset, payments, search, plus a coarse API ceiling;
  health is safelisted; 429s use the standard error envelope. Verified by
  `spec/requests/rate_limiting_spec.rb`.
- **force_ssl + assume_ssl** in production (`config/environments/production.rb`).
- **PII encryption at rest** (DPDP): Active Record Encryption configured in
  `config/application.rb`. Keys from ENV — **production boot fails if they're
  unset**; dev/test use clearly non-secret defaults. Encrypted attributes
  (phone, precise location, KYC) are declared on the models that hold them
  (Session 3+).
- **Log filtering** (`config/initializers/filter_parameter_logging.rb`):
  passwords, tokens, OTPs, signatures, phone, precise location, and Razorpay /
  payment fields never reach a log line.
- **Authorization scaffolding**: Pundit default-deny included in
  `ApplicationController`; `Pundit::NotAuthorizedError` → 403 envelope. Policies
  land per-resource from Session 3.
- **Supply chain**: `brakeman` (SAST) and `bundler-audit` run in CI and block
  on findings (`.github/workflows/backend-ci.yml`).

## Secrets

Rails encrypted credentials / ENV only; per-env keys; never committed. The
PostGIS dev/test app needs no secrets to run (AR encryption uses non-secret
dev defaults). Production keys + rotation: see runbook (added when deploy lands).

## How to extend

Every new endpoint: authorize with Pundit (default-deny), scope to the current
tenant, strict params, paginate collections, and add the matching threat-model
row here in the same change.
