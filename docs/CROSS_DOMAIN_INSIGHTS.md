# Cross-Domain Insights

**Date:** 2026-07-20  
**Prompt:** 32 — Performance OS cross-domain insights  
**Routes:** `/app/insights` (+ dashboard teaser)  
**Domain:** `src/domain/insights/*`  
**Service:** `src/services/insights/insights-service.ts`  
**UI:** `src/components/insights/InsightsPanel.tsx`

---

## Purpose

Surface combined recommendations across:

- Training  
- Recovery  
- Nutrition  
- Body metrics  

Example: bodyweight decreasing rapidly + training performance declining + recovery worsening →  
“Your recent trends suggest reviewing recovery and nutrition intake.”

---

## Each insight includes

| Field | Role |
| --- | --- |
| **Evidence** | Domain-tagged statements from real signals |
| **Confidence** | `low` \| `medium` \| `high` from signal richness |
| **Action** | Review / log / connect with href — never silent |

---

## Hard rules

1. Do **not** automatically prescribe exact calorie changes without sufficient synced nutrition data (`nutritionHasTargets` / `nutritionHasSummary`).  
2. Missing domains stay null — never invent macros, readiness, or volume.  
3. Insights never auto-apply program changes (same honesty as adaptive programming).

---

## Engine

Pure `proposeCrossDomainInsights(signals)` — deterministic.  
Service gathers bodyweight, recovery readiness, session volume, Mealnexio connection status.

Engine version: `insights.v1`

---

## Feature flag

`appInsights` / `NEXT_PUBLIC_FF_APP_INSIGHTS` defaults **on**.  
Set `false` to hide `/app/insights` from nav and FeatureGate the page.
