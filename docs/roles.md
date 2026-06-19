# Roles & permissions

Authorization is **default-deny** (Pundit): no policy / no explicit allow ⇒ no
access. Role and tenant are derived from the verified token, never from params.

## Roles

| Role | Lives in | Authenticates with | Scope |
|---|---|---|---|
| **Super Admin** | `public` schema | email + password | manages owners (tenants) + subscriptions/billing; **cannot read tenant business data** |
| **Owner / Admin** | tenant schema (`users`, role `owner_admin`) | phone + password (+ OTP) | manages their tenant: drivers, vehicles, pricing, availability, reporting |
| **Driver / Employee** | tenant schema (role `driver`) | phone + password (+ OTP) | vehicles, tasks, tracking, own leave + payslips |
| **Customer** | tenant schema (role `customer`) | phone + password (+ OTP) | browse, book, pay, history, completion photo + reviews |

Self-registration creates a **customer** only. Drivers and owner_admins are
created by privileged users (Sessions 4–5).

## Permission matrix

Built out as each feature lands; default-deny means anything not listed is
forbidden. Session 3 (auth) surface:

| Action | Customer | Driver | Owner | Super Admin |
|---|---|---|---|---|
| Register (self) | ✅ (customer role) | — | — | — |
| Verify OTP / login / refresh / logout | ✅ | ✅ | ✅ | (own admin flow) |
| View / update **own** profile (`/me`) | ✅ | ✅ | ✅ | — |
| Act on **another** user | ❌ | ❌ | ❌ | ❌ |
| Read another tenant's data | ❌ (impossible — schema isolation) | ❌ | ❌ | ❌ |

Enforcement: `app/policies/` (`ApplicationPolicy` denies all; `UserPolicy` opens
self-access). See [feature/auth.md](feature/auth.md) and
[feature/security.md](feature/security.md).
