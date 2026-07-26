# GDPR Readiness

**Date:** 2026-07-22  
**Prompt:** 177 — GDPR Readiness  
**Domain:** `src/domain/gdpr-readiness/`  
**Admin:** `/app/admin/gdpr-readiness`  
**Flag:** `gdprReadiness` (`NEXT_PUBLIC_FF_GDPR_READINESS`, default **on**)

---

## Honesty

These are **supporting workflows**, not a claim that the product is “GDPR certified” or that counsel has approved policies.

Legal pages (`/privacy`, `/terms`, `/cookies`) are marked:

> **Draft — for professional legal review**

See `LEGAL_REVIEW_BANNER` in `src/domain/gdpr-readiness/constants.ts`.

Related: `docs/SECURITY.md`, `docs/ENTERPRISE_SECURITY.md`, `docs/DISASTER_RECOVERY.md`, `docs/DATA_MOAT_ARCHITECTURE.md`.

---

## Workflows

| Area | What ships |
| --- | --- |
| **Consent** | Technique upload checkbox; coach sensitive scopes; data-moat opt-in; cookie banner / preferences |
| **Export** | Settings → Export my data (JSON; no raw video / password hashes) |
| **Deletion** | Delete videos; delete account (media purge + user cascade); scheduled TTL **planned** |
| **Data processing docs** | Product inventory on `/privacy` + admin registry (not a counsel RoPA) |
| **Cookie controls** | Banner, `/cookies`, Settings preferences; essential / functional / analytics |
| **Retention** | Documented **intentions** — confirm with counsel before binding |
| **Legal review** | All three legal surfaces flagged for professional review |

---

## Cookie categories

| Category | Default | Examples |
| --- | --- | --- |
| Essential | Always on | Session, CSRF, `tsm_cookie_consent` |
| Functional | Off until opt-in | Growth experiment `ts_gid` / `ts_exp_*` |
| Analytics | Off until opt-in | Web Vitals beacon to `/api/vitals` |

When `gdprReadiness` is on:

- Growth-experiment sticky cookies are set only with functional consent.  
- Production vitals beacons send only with analytics consent.

---

## Athlete surfaces

| Path | Role |
| --- | --- |
| `/app/settings` | Export, delete videos, delete account, cookie prefs |
| `/privacy` | Draft policy + processing/retention sections |
| `/terms` | Draft terms |
| `/cookies` | Draft cookie policy + preference panel |

---

## Flag

`NEXT_PUBLIC_FF_GDPR_READINESS` / `gdprReadiness` — default **on**.
