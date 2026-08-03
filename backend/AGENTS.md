# Backend — Rails

Canonical ruleset for `backend/`. Agents that resolve the nearest
`AGENTS.md` (Codex, Cursor, …) load this automatically when editing
this tree; Claude Code reaches it via `.claude/skills/backend/SKILL.md`.
Universal rules: [`AGENTS.md`](../AGENTS.md).

## Stack

- Ruby 4.0.6, Rails 8.1.3 (pinned `= 8.1.3` in `backend/Gemfile`), API-only.
- **PostgreSQL only.** No SQLite, no MySQL, no swapping.
- **Rails defaults only:** Solid Queue (jobs), Solid Cache (cache),
  Solid Cable (websockets), Propshaft (assets).
- **RSpec** for tests (`rspec-rails`, `factory_bot_rails`, `faker`,
  `shoulda-matchers`, `database_cleaner-active_record`, `webmock`, `vcr`,
  `simplecov`). All specs live under `spec/` — `test/` is not used.
- `rubocop-rails-omakase` for style.

## Version & stability (backend delta)

Universal rule in [`AGENTS.md`](../AGENTS.md) "VERSION & STABILITY".
Backend-specific:

- **Ruby:** pinned in `backend/.ruby-version` and `backend/Gemfile` —
  both must match. The root `.ruby-version` exists for tool discovery
  and must match as well; the version-bump audit catches drift.
- **Rails:** pin exact in `Gemfile` (`gem "rails", "= 8.1.3"`). Stay on
  the actively-maintained branch — never a `.beta`, `.rc`, or EOL'd minor.
- **Audit before each release:** `bundle exec bundler-audit check --update`
  (expected: `No vulnerabilities found`).
- **Prefer Rails defaults** (Solid Queue / Cache / Cable / Propshaft)
  over third-party gems for the problems Rails already solves.

## Style

- Idiomatic Ruby: small methods, guard clauses, no deep nesting.
- **Thin controllers — zero business logic.**
- Services only when necessary → `app/services/`, **one responsibility each**.
  Don't pre-create the directory until a real service exists.

## Layer rules (where code lives)

- **Models** — domain state only. Associations, validations, scopes, enums,
  and transformer/normaliser callbacks. No mailer calls, no HTTP, no job
  enqueues. `Current.*` is allowed **only** for attribute defaults
  (`default: -> { Current.user }`) and audit stamping
  (`self.updated_by = Current.user`) — never in scopes, `where` clauses,
  or business conditionals.
- **Services** (`app/services/`) — orchestration across models. Use a `.call`
  class-method interface; return a typed result object. One public entry point
  per service. Don't create the directory until a real service is needed.
- **Serializers** (`app/serializers/`) — the on-the-wire shape of each
  resource: one `module <Model>Serializer` with `module_function` and a
  `call(record)` returning the envelope's `data` hash. Controllers, jobs,
  and channels all render through them so REST and broadcast payloads can't
  drift. Never define the JSON shape inline in a controller.
- **Controllers** — params → one service or model method → render envelope
  via the resource's serializer. No domain conditionals beyond auth/param
  guards. Never call two services from one action; extract a third service
  instead.

## Callback rule

Keep a callback only if it **transforms or normalises data on the record
itself** (e.g. `normalize_email`, `set_slug`, `downcase_token`).
If it triggers external work — sending email, enqueuing a job, making HTTP
calls, creating associated records — remove it from the model and call it
explicitly from the service or controller.

Scoring guide (1 = extract, 5 = keep):

| Score | Type | Example |
|---|---|---|
| 5 | Transformer | `normalize_email` |
| 4 | Normaliser / utility | counter cache |
| 3 | Timestamp | `set_published_at` |
| 2 | Observer / background | `enqueue_indexing` |
| 1 | Operation | `send_welcome_email`, `create_audit_log` |

## Model size signals

When a model exceeds ~250 LOC or ~20 methods, note it in the PR description
as a signal to plan extraction. Not a hard block, but a required callout.

## API

- **RESTful, JSON only.**
- **Standard envelope (every response, success and error):**
  ```json
  { "status": "success" | "error", "data": {}, "error": null }
  ```
  - Success: `status: "success"`, `data: <resource or array>`, `error: null`.
  - Error: `status: "error"`, `data: null`, `error: { "code": "snake_case_id", "message": "human readable" }`.
  - Validation errors: `error: { "code": "validation_failed", "fields": { "email": ["is invalid"] } }`.
- HTTP status code matches the envelope: 2xx ↔ `status: "success"`,
  4xx/5xx ↔ `status: "error"`. Never return 200 with `status: "error"`.
- **snake_case keys on the wire.** Don't camelCase JSON.

## Database

- **PostgreSQL only.** No SQLite, no MySQL, no swapping.
- **Index foreign keys and query columns.** Every migration that adds an FK
  or a column used in `where` must add the index in the same migration.
- **No N+1 queries.** Eager-load with `includes` / `preload`. If unsure,
  log queries in dev and check.
- Tables: `snake_case_plural`, `id bigint` PKs, `created_at` / `updated_at`
  timestamps (Rails defaults).
- **External identifiers are UUIDs, not the bigint PK.** Any model exposed
  over the API carries a non-enumerable `uuid` column (NOT NULL, unique,
  `default: gen_random_uuid()`), assigned in Ruby via the `HasPublicUuid`
  concern. Routes and serializers use `uuid`; the bigint PK never leaves the
  server (no sequential-id enumeration). Internal-only tables (e.g.
  `tenant_registries`) may skip it.
- One logical change per migration. Reversible (`change` over `up`/`down`
  when possible).
- **Schema format is `:sql`** (`db/structure.sql`) because PostGIS spatial
  types and schema-qualified extensions can't be represented in `schema.rb`.
  `lib/tasks/structure_sql_cleanup.rake` post-processes every dump (idempotent
  `CREATE SCHEMA`, and re-adds the `CREATE EXTENSION` lines pg_dump omits under
  `--schema`). PostGIS + btree_gist live in the **public** schema (the
  Apartment persistent schema) so they aren't cloned per tenant — see
  `docs/feature/multi-tenancy.md`.

## Seed data

The dev/demo seed is **modular and feature-scoped**: one
`Seeds::<Feature>` module per file under `backend/db/seeds/`, wired into
`backend/db/seeds.rb`.

- **Touch a table, update its seed in the same change.** A new model with
  no seed row is missing work, not a later task.
- **Idempotent only.** Every module uses `find_or_initialize_by` on a
  **date-independent** natural key; re-running `bin/rails db:seed` must
  never duplicate. The whole run is one transaction — partial seeds are a bug.
- **Realistic data, no placeholders.** Values must pass the model's
  validators. No `foo`/`test1`/lorem.
- Verify with two consecutive `bin/rails db:seed` runs (identical counts)
  plus `bin/rubocop db/seeds db/seeds.rb`.
- **Seed ≠ new-user defaults.** The seed is demo data. Values *every real
  signup* should get live in a provisioner service called from the
  registration controller, not the seed — it's the only thing that fires
  per new user. A column `default:` only holds a scalar; it can't create a
  *set* of starter rows.

## Errors

- **Fail fast. Never silently rescue.**
- No bare `rescue` or `rescue StandardError`. Catch the specific class you
  expect, and re-raise or convert to a typed error.
- A controller that returns 200 on a failed operation is a bug.

## Forbidden

- Fat controllers (any business logic in a controller).
- **Non-Rails gems unless explicitly requested.** Sidekiq, Postmark-the-gem,
  Falcon — none of these without a written PR reason. (RSpec, FactoryBot,
  Faker, Shoulda, DatabaseCleaner, WebMock/VCR, SimpleCov are
  project-approved test gems.)
- 200-with-error or 4xx-with-success.

## Already-approved non-Rails gems

Every non-Rails gem added with a written PR reason is recorded here (what
it does, why a Rails default doesn't cover it, where it's configured) so a
future maintainer never has to reverse-engineer an unexplained dependency.

| Gem | What / why | Configured in |
|---|---|---|
| `ros-apartment` | Schema-per-tenant multi-tenancy (Rails has none). #1 isolation control. | `config/initializers/apartment.rb`, `lib/tasks/tenants.rake` |
| `activerecord-postgis-adapter` + `rgeo` | PostGIS column types + spatial queries for location discovery. | `config/database.yml` (adapter: postgis) |
| `pundit` | Default-deny authorization (Rails has none). | `app/controllers/application_controller.rb` |
| `rack-attack` | Request throttling (auth/OTP/payments/search). | `config/initializers/rack_attack.rb` |
| `secure_headers` | CSP + security response headers. | `config/initializers/secure_headers.rb` |
| `rack-cors` | Strict CORS allowlist (no `*`). | `config/initializers/cors.rb` |
| `pagy` | Mandatory pagination on collections (wired Session 4). | (gem only so far) |
| `bullet` | Raises on N+1 / unused eager-load in dev/test (build fails). | `config/initializers/bullet.rb` |
| `bcrypt` | `has_secure_password` for SuperAdmin (and tenant users, S3). | `app/models/super_admin.rb` |

Test-only gems (`database_cleaner-active_record`, `webmock`, `vcr`,
`simplecov`, `rspec-rails`, `factory_bot_rails`, `faker`, `shoulda-matchers`)
are project-approved and listed in "Stack".

## Folder layout (Rails-default — do not reshape)

```
backend/
  app/                  # controllers/, models/, jobs/, mailers/,
                        # serializers/, services/, channels/
  config/               # routes.rb, application.rb, environments/
  db/                   # migrations + Solid {Queue,Cache,Cable} schemas
  lib/                  # custom non-app code; rake tasks under lib/tasks/
  spec/                 # RSpec — models/, requests/, jobs/, mailers/,
                        # plus support/, factories/, cassettes/
```

## Commands

```bash
bin/rails server                    # boot (port 3000)
bin/rails console
bin/rails db:migrate
bin/rails db:rollback
bundle exec rspec                   # full suite
bundle exec rspec spec/models/foo_spec.rb
bundle exec rspec spec/requests/foo_spec.rb:42  # by line
COVERAGE=full bundle exec rspec     # coverage report → coverage/index.html
bin/rubocop                         # before push
bin/rubocop -a                      # autofix
```

## Coverage enforcement

100% line coverage is mandatory (universal rule). SimpleCov enforces it in
`spec/spec_helper.rb` via `minimum_coverage line: 100`; that line is added
when the spec harness is first generated and is never lowered. Missing
coverage means missing spec.

## Env vars

Every ENV var the backend reads is recorded here with its local default and
the file that reads it, so the run/deploy story is reconstructable from this
table alone. Add the row in the same change as the code that reads the var.

| Var | Local default | Read in |
|---|---|---|
| `RAILS_MAX_THREADS` | unset (Puma default 3) | `config/puma.rb`, `config/database.yml` |
| `DATABASE_URL` | unset (uses `database.yml` + OS user) | Rails default |
| `COVERAGE` | unset (gate off); set `full` to enforce the 100% line gate + emit `coverage/index.html` | `spec/spec_helper.rb`, `config/environments/test.rb` |
| `CI` | unset locally (set by the CI runner) | `config/environments/test.rb` (eager-load so coverage sees every file) |
| `CORS_ALLOWED_ORIGINS` | `http://localhost:5173,http://localhost:8081` (web-admin + Expo web dev) | `config/initializers/cors.rb` |
| `AR_ENCRYPTION_PRIMARY_KEY` | dev/test: non-secret default; **prod: required (boot fails if unset)** | `config/application.rb` |
| `AR_ENCRYPTION_DETERMINISTIC_KEY` | dev/test: non-secret default; **prod: required** | `config/application.rb` |
| `AR_ENCRYPTION_KEY_DERIVATION_SALT` | dev/test: non-secret default; **prod: required** | `config/application.rb` |
