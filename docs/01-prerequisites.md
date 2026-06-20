# 01 — Prerequisites

Tool versions are pinned (latest stable; OS is latest Ubuntu LTS). The
**manifest is the source of truth** — `backend/.ruby-version`,
`backend/Gemfile`. The versions below are quoted for readability; the
version-bump audit (`AGENTS.md` → VERSION & STABILITY) keeps them honest.

## Required tools

| Tool | Version | Why | Verify |
|---|---|---|---|
| **Ruby** | 4.0.5 | backend runtime (pinned `backend/.ruby-version`) | `ruby -v` → `ruby 4.0.5` |
| **Rails** | 8.1.3 | backend framework (pinned `= 8.1.3` in Gemfile) | `bin/rails -v` → `Rails 8.1.3` |
| **PostgreSQL** | 18.x | primary database | `psql --version` → `psql (PostgreSQL) 18.x` |
| **PostGIS** | 3.6.x | geospatial discovery (installed in the public schema — see [multi-tenancy](feature/multi-tenancy.md)) | `psql -d fleet_management_development -c 'SELECT postgis_version();'` |
| **Node.js** | 26.3.1 (pinned `.mise.toml`) | mobile (Expo) + web-admin tooling | `node -v` → `v26.3.1` |
| **mise** | latest | pins/activates Ruby (and Node) per directory | `mise --version` |

> **Ruby and Node are managed by `mise`.** With mise activated in your shell
> (it reads the root `.mise.toml` + `backend/.ruby-version`), `ruby`, `bundle`,
> and `bin/rails` resolve to 4.0.5 inside `backend/` and `node` resolves to
> 26.3.1 repo-wide. Confirm with
> `cd backend && ruby -v` → `ruby 4.0.5`. **If it prints `2.6.x`, mise isn't
> activated** — that's the most common setup failure; see
> [`09-troubleshooting.md`](09-troubleshooting.md).

## macOS install (Homebrew)

Hand-run these (the agent does not run system installs). Each dependency
auto-resolves its own sub-dependencies — install only the one named.

```bash
brew install mise            # then add `mise activate` to your shell rc per `mise` docs
brew install postgresql@18   # starts a server; verify: pg_isready  => /tmp:5432 - accepting connections
brew install postgis         # PostGIS extension for postgresql@18

mise install                 # from repo root: reads .mise.toml => Ruby 4.0.5 + Node 26.3.1
```

Verification (expected output on the right):

```bash
psql --version          # psql (PostgreSQL) 18.4
postgis_version via psql # 3.6 USE_GEOS=1 USE_PROJ=1 USE_STATS=1
pg_isready              # /tmp:5432 - accepting connections
ruby -v                 # ruby 4.0.5 ...
node -v                 # v26.3.1
```

PostgreSQL + PostGIS are **system installs** — see
[`AGENTS.md`](../AGENTS.md) "System-level installs". Repo dependency
manifests (`bundle install`, `npm install`) are part of setup, covered in
the per-codebase setup pages.

## Next

- Backend: [`02-backend-setup.md`](02-backend-setup.md)
- Mobile: [`03-mobile-setup.md`](03-mobile-setup.md)
- Then run them together: [`04-running-locally.md`](04-running-locally.md)
