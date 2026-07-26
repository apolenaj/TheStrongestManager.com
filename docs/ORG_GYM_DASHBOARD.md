# Gym / Team Organization Dashboard

**Date:** 2026-07-21  
**Prompt:** 87 — Gym / Team Dashboard  
**Domain:** `src/domain/org/`  
**Service:** `src/services/org/`  
**Schema:** `Organization`, `OrgMembership`, `Team`, `TeamMembership`, `OrgPermission`  
**Routes:** `/app/org`, `/app/org/[orgId]` (flag `gymTeamDashboard`)

---

## Entities

| Entity | Role |
| --- | --- |
| **Organization** | Gym, team, club, facility, or other |
| **OrgMembership** | User ↔ org with role + `aggregateOptIn` |
| **Team** | Group inside an organization |
| **TeamMembership** | User ↔ team |
| **OrgPermission** | Extra capabilities (not health scopes) |

---

## Roles

| Role | Default capabilities |
| --- | --- |
| `org_admin` | manage members/teams, view aggregates, invite, billing_view |
| `org_coach` | view aggregates, invite, manage teams |
| `org_staff` | view aggregates |
| `org_athlete` | none (self opt-in only) |

---

## Analytics (opted-in athletes only)

1. **Training adherence** — mean adherence %, missed training count, sessions 28d  
2. **Participation** — 7d participation rate, session count  
3. **Performance trends** — mean technique Δ, improving / regression shares  
4. **Team rollups** — same signals per team  

Roster rows: display name, teams, trained Y/N, sessions, adherence estimate.

---

## Privacy (hard rules)

Org roles **never** unlock:

- Recovery entries  
- Body metrics  
- Technique media  
- Coach notes / session notes  
- Sex, birth year, movement notes  

`orgRoleUnlocksPrivateAthleteData()` is always `false`.  
1:1 athlete detail still requires `CoachAthleteAccess`.

Athletes appear in aggregates only when `status=active` **and** `aggregateOptIn=true`.

---

## Billing

See `docs/ORG_BILLING.md` (Prompt 88) — `/app/org/[orgId]/billing` for seats, usage, and upgrade. B2B prices are env-only (never hard-coded).

---

## Feature flag

`NEXT_PUBLIC_FF_GYM_TEAM_DASHBOARD` → `gymTeamDashboard` (default on)
