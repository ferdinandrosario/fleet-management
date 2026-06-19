# 02 — Backend setup

From a fresh clone to a running, fully-tested Rails API. All commands run
from `backend/`. Ruby resolves to 4.0.5 via mise (see
[`01-prerequisites.md`](01-prerequisites.md)).

## 1. Install gems

```bash
cd backend
bundle install
# => Bundle complete! 32 Gemfile dependencies, 136 gems now installed.
```

## 2. Create + migrate the databases

```bash
bin/rails db:prepare
# => Created database 'fleet_management_development'
# => Created database 'fleet_management_test'
# => (runs migrations: PostGIS + btree_gist, super_admins, owners,
# =>  subscriptions, tenant_registries)
```

Database names are set in `config/database.yml` (`fleet_management_*`), adapter
`postgis`. The schema is dumped to `db/structure.sql` (not `schema.rb`) because
PostGIS needs SQL format; `db:test:prepare` loads it into the test DB. PostGIS +
btree_gist are installed in the **public** schema — see
[multi-tenancy](feature/multi-tenancy.md).

Verify PostGIS and the public-schema tables:

```bash
bin/rails runner 'puts ActiveRecord::Base.connection.select_value("SELECT postgis_version()")'
# => 3.6 USE_GEOS=1 USE_PROJ=1 USE_STATS=1

bin/rails tenants:list
# => No tenants provisioned yet.
```

## 3. Run the API

```bash
bin/rails server
# => Listening on http://localhost:3000
```

Verify the versioned health endpoint and the framework liveness probe:

```bash
curl -s localhost:3000/api/v1/health
# => {"status":"success","data":{"service":"fleet-management-api","status":"ok"},"error":null}

curl -s -o /dev/null -w "%{http_code}\n" localhost:3000/up
# => 200
```

`/api/v1/health` is the owned endpoint — it proves the `/api/v1`
namespace and the standard response envelope are wired. `/up` is Rails'
built-in probe for load balancers.

## 4. Run the test suite + gates

The project is **test-first with a mandatory 100% backend line-coverage
gate** (`backend/AGENTS.md` → Coverage enforcement). The gate is enforced
when `COVERAGE` is set; CI always sets `COVERAGE=full`.

```bash
# Fast inner-loop run (no coverage gate — use while iterating on one file):
bundle exec rspec spec/requests/api/v1/health_spec.rb

# Full suite with the coverage gate (what CI runs):
COVERAGE=full bundle exec rspec
# => 60 examples, 0 failures
# => Line Coverage: 100.0% (75 / 75)
```

A full HTML coverage report is written to `coverage/index.html` whenever
`COVERAGE` is set.

### Security scanners (CI gates, run them locally too)

```bash
bundle exec brakeman -q
# => No warnings found

bundle exec bundler-audit check --update
# => No vulnerabilities found
```

Both block the build on findings (wired into CI in Chunk C).

## Test harness — what's configured

- **RSpec** (`spec/`, not `test/`) with `factory_bot_rails`, `faker`,
  `shoulda-matchers`, `database_cleaner-active_record`, `webmock`/`vcr`.
- **SimpleCov** starts at the top of `spec/spec_helper.rb`, guarded by
  `COVERAGE`, with `minimum_coverage line: 100` — never lowered.
- The test environment **eager-loads** under `CI` or `COVERAGE` so every
  file under `app/`/`lib/` is measured (not just the ones a single spec
  happens to load).

## Style

```bash
bin/rubocop        # rubocop-rails-omakase
bin/rubocop -a     # autofix
```

## Troubleshooting

Boot or bundler errors (e.g. `undefined method 'filter_map'`, or a gem
"Could not find … required by Gemfile.lock") almost always mean a shell
fell back to system Ruby instead of mise's 4.0.5 — see
[`09-troubleshooting.md`](09-troubleshooting.md).
