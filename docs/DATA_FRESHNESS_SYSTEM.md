# Data Freshness System

**Date:** 2026-07-21  
**Prompt:** 143 — Data Freshness System  
**Domain:** `src/domain/data-freshness/`  
**UI:** `src/components/data-freshness/` (`FreshnessBadge`, `DataFreshnessPanel`)  
**Flag:** `dataFreshnessSystem` (`NEXT_PUBLIC_FF_DATA_FRESHNESS_SYSTEM`, default **on**)

---

## Intent

Show when pillar data becomes outdated, with athlete-facing relative copy:

```
Technique data: 42 days old.
Recovery: No data this week.
Strength estimate: Updated yesterday.
```

AI recommendations **must account for stale data** — confidence is capped and stale/missing pillars appear in supporting data and missing information.

## Bands

| Band | Meaning |
| --- | --- |
| **Fresh** | Within domain fresh window |
| **Aging** | Between fresh and stale |
| **Stale** | Past domain stale threshold |
| **Missing** | No signal timestamp |

### Thresholds (hours)

| Domain | Fresh | Stale |
| --- | --- | --- |
| Overall / training | ≤48h | ≥14d |
| Technique | ≤14d | ≥42d |
| Recovery | ≤2d | ≥7d (“this week”) |
| Strength | ≤24h | ≥28d |

## API

- `buildFreshnessSnapshot(signals, now)`
- `formatRelativeFreshness(lastAt, now, domain)`
- `applyPillarFreshnessToConfidence(confidence, snapshot, category)`
- `freshnessMissingInformation(snapshot)`
- `freshnessSnapshotFromAthleteState(state)`

## Integration

| Surface | Behavior |
| --- | --- |
| Performance Intelligence | `dataFreshness.value.pillars` + `displayLines` |
| Coach Brain rules | Every hit gets freshness supporting lines + confidence cap |
| Dashboard / Athlete state | `DataFreshnessPanel` |
| Today | Freshness panel above daily brief |

## Honesty

See `DATA_FRESHNESS_HONESTY`. Ages are never invented.

## Tests

`src/domain/data-freshness/data-freshness.test.ts`
