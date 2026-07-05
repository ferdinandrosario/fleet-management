# Backend — Fleet Management API

Rails 8.1 API-only app (Ruby 4.0.5, PostgreSQL + PostGIS, schema-per-tenant).
Serves the mobile app and web admin over one JSON API.

**This file is a pointer — the real guides live in [`../docs/`](../docs/):**

- Install tools: [`docs/getting-started/prerequisites.md`](../docs/getting-started/prerequisites.md)
- Empty clone → running API (with expected output):
  [`docs/backend/setup.md`](../docs/backend/setup.md)
- Rules for changing this code: [`AGENTS.md`](AGENTS.md) (Rails layer rules,
  API envelope, testing, version policy)
- How it fits together: [`docs/architecture/overview.md`](../docs/architecture/overview.md),
  [`docs/feature/multi-tenancy.md`](../docs/feature/multi-tenancy.md),
  [`docs/security/threat-model.md`](../docs/security/threat-model.md)

## Quickstart

Ruby is managed by **mise** — make sure it's activated so `ruby -v` prints
`4.0.5` inside this folder (otherwise you'll hit macOS's system Ruby 2.6; see
[`docs/troubleshooting/backend.md`](../docs/troubleshooting/backend.md)).

```bash
bundle install        # install gems
bin/rails db:prepare  # create + migrate the dev and test databases
bin/rails server      # http://localhost:3000

curl -s localhost:3000/api/v1/health
# => {"status":"success","data":{"service":"fleet-management-api","status":"ok"},"error":null}
```

## Tests + gates

```bash
COVERAGE=full bundle exec rspec          # 100% line-coverage gate (CI sets COVERAGE)
bundle exec brakeman -q                  # static security analysis
bundle exec bundler-audit check --update # vulnerable-gem audit
bin/rubocop                              # style (omakase)
```
