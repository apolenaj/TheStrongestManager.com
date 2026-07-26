# Confidence System

**Date:** 2026-07-21  
**Prompt:** 142 — Confidence System  
**Domain:** `src/domain/confidence-system/`  
**UI:** `src/components/confidence/ConfidenceBadge.tsx`  
**Flag:** `confidenceSystem` (`NEXT_PUBLIC_FF_CONFIDENCE_SYSTEM`, default **on**)

---

## Intent

Universal athlete-facing confidence scale used consistently across:

| Pillar | Examples |
| --- | --- |
| Technique | Movement report, technique analysis |
| Strength | Strength Score |
| AI recommendations | Coach Brain, Copilot, adaptations, insights |
| Predictions | PR prediction |
| Recovery | Recovery Readiness estimate |

## Levels

| Display | Storage (`ConfidenceLevel`) |
| --- | --- |
| **High** | `high` |
| **Moderate** | `medium` (alias: `moderate`) |
| **Low** | `low` |
| **Insufficient data** | `none` (aliases: `insufficient`, `insufficient_data`) |

## Rules

1. **Never show a precise confidence percentage** unless `CONFIDENCE_PERCENTAGES_CALIBRATED` is true (currently **false**).
2. Empty / unknown tokens normalize to **Insufficient data** — never invent High.
3. Score gating stays in `src/domain/scoring/confidence.ts` (`displayableScore`); this system owns **labels + normalization**.

## API

- `formatConfidenceLabel(value)` → `"High" | "Moderate" | "Low" | "Insufficient data"`
- `normalizeConfidenceLevel(value)` → scoring `ConfidenceLevel`
- `confidenceBadgeVariant(value)` → Badge variant
- `formatConfidencePercent(ratio)` → `null` while uncalibrated
- `<ConfidenceBadge confidence={…} />`

## Honesty

See `CONFIDENCE_SYSTEM_HONESTY`. Explainable AI (Prompt 141) and Trust Center scoring copy reuse this scale.

## Tests

`src/domain/confidence-system/confidence-system.test.ts`
