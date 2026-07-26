# Admin & Content Management

**Date:** 2026-07-21  
**Prompt:** 41 — Secure admin architecture  
**Domain:** `src/domain/admin/`  
**Guard:** `src/services/admin/require-admin.ts`  
**Service:** `src/services/admin/admin-service.ts`  
**Routes:** `/app/admin/*` (outside athlete `(main)` shell)

---

## Access control

| Rule | Behavior |
| --- | --- |
| Role | `User.isAdmin` (default **false**) |
| Gate | `requireAdmin()` re-checks DB on every request |
| Failure | `notFound()` — does **not** reveal admin UI to standard users |
| Navigation | **Not** listed in athlete / public nav |

Promote staff only via database (or controlled ops), never via client UI for normal users.

---

## Admin functions

| Area | Route |
| --- | --- |
| Overview | `/app/admin` |
| Exercise content | `/app/admin/exercises` |
| Training methods | `/app/admin/methods` |
| Articles | `/app/admin/articles` |
| Program templates | `/app/admin/programs` |
| Academy content | `/app/admin/academy` |
| Feature flags | `/app/admin/feature-flags` |
| Audit log | `/app/admin/audit` |

Catalog areas are code-backed today: admins review inventory and write **audited notes**. Feature flags are **environment-backed**; the console shows live values and records review audits (no fake browser toggles).

---

## Audit log

`AdminAuditLog` is append-only:

- `admin.access` · `content.reviewed` · `content.note` · `flags.reviewed` · …

Fields: actor, action, entityType, entityId, summary, detailJson, createdAt.

---

## Security notes

- Mutations call `requireAdmin()` in server actions.
- `/app/*` already requires auth via middleware + layout.
- Admin layout does not use the athlete AppShell.
- `robots` already disallows `/app/`.
