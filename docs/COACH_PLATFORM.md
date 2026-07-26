# Coach Platform Foundation

**Date:** 2026-07-21  
**Prompt:** 35 — Coach Mode architecture  
**Domain:** `src/domain/coach/`  
**Service:** `src/services/coach/coach-service.ts`  
**Schema:** `User.isAthlete` / `User.isCoach` + `CoachAthleteAccess`

---

## Roles

A user may be:

| Role | Flag | Meaning |
| --- | --- | --- |
| **Athlete** | `isAthlete` (default true) | Owns an `AthleteProfile`; can grant/revoke coaches |
| **Coach** | `isCoach` (default false) | Sees Coach dashboard for athletes with active grants |
| **Both** | both true | Common for player-coaches |

Enable Coach Mode from **Settings**. Turning it on does not reveal any athletes until they grant access.

---

## Permission model

`CoachAthleteAccess` is the only bridge.

- Coach sees **only** athletes with `status: "active"`.
- Athlete grants by coach account **email**.
- Athlete can **revoke** at any time (`status: "revoked"` + audit fields).
- No browse / search of athletes without a grant.

### Scopes

| Scope | Default | Notes |
| --- | --- | --- |
| `training` | Yes | Sessions, adherence signals |
| `programs` | Yes | Program / adherence context |
| `technique_summary` | Yes | Score trends only — no video |
| `technique_media` | No | Explicit opt-in |
| `recovery` | No | Sensitive — explicit opt-in |
| `body_metrics_detailed` | No | Sensitive — explicit opt-in |

Empty `scopesJson` resolves to the training-safe defaults — never to recovery or media.

---

## Coach dashboard

Route: `/app/coach` (flag `appCoach`, default on; attention via `multiAthleteCoachDashboard`)

Surfaces (grant-scoped only):

1. **Needs attention** — prioritized queue (missed training, decline, technique regression, competition, new PR, incomplete check-in); capped so coaches are not overwhelmed  
2. Athlete roster (sorted by urgency; quiet athletes stay quiet)  
3. Recent activity  
4. Technique awaiting review (summary)  
5. Program adherence estimate on roster cards  

See `docs/COACH_MULTI_ATHLETE_DASHBOARD.md` (Prompt 86).

Each athlete links to **`/app/coach/[athleteProfileId]`** — see `docs/COACH_ATHLETE_DETAIL.md`.

Dashboard queries **omit** sex, birth year, movement notes, and body-comp fields. Recovery check-ins appear only as attention signals when `recovery` is scoped. Technique media links stay null without `technique_media`.

---

## Athlete detail workspace (Prompt 36)

Route: `/app/coach/[athleteProfileId]`

Sections: Overview · Training · Technique · Progress · Recovery · Notes · Recommendations.

- Coach can review training, leave timestamped comments (`CoachNote`), and suggest modifications (`CoachModification` + `CoachModificationEvent`).
- AI engine adaptations and system recommendations are labelled separately from human coach decisions.

---

## Athlete controls

**Settings → Coach Mode & access**

- Enable Coach Mode  
- Grant coach by email (+ optional sensitive scopes)  
- Revoke active grants  

Honesty copy lives in `COACH_PLATFORM_HONESTY` (`src/domain/coach/permissions.ts`).

---

## What this is not

- Not a coach marketplace with inventing coaches (marketplace schema is separate — see `docs/COACH_MARKETPLACE.md`)  
- Not medical diagnosis or injury assessment  
- Not automatic exposure of health/profile fields  
