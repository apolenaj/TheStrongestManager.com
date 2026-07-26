# Device Data Normalization

**Date:** 2026-07-22  
**Prompt:** 186 — Device Data Normalization  
**Domain:** `src/domain/device-data-normalization/`  
**Admin:** `/app/admin/device-data-normalization`  
**Flag:** `deviceDataNormalization` (`NEXT_PUBLIC_FF_DEVICE_DATA_NORMALIZATION`, default **on**)  
**Related:** `docs/WEARABLE_INTEGRATION.md`

---

## Principle

Map vendor observations into **canonical** shapes for sleep, heart rate, HRV, steps, and workouts, always with **source metadata**.

**Do not** compare metrics from different devices as identical without caveats. `compareDeviceMetrics` sets `identicalAcrossDevices: false` by contract.

---

## Families → canonical units

| Family | Canonical |
| --- | --- |
| Sleep | `durationHours` (+ optional stage minutes; never invented) |
| Heart rate | `bpm` + kind (`resting` / `sample` / …) |
| HRV | `ms` + method (`rmssd` / `sdnn` / `unknown`) |
| Steps | integer `count` + optional `dayKey` |
| Workout | `startedAt` / `endedAt` / `durationSeconds` / activity / `energyKcal` |

Every `NormalizedDeviceRecord` includes `DeviceSourceMetadata`: provider, recorded/ingested times, original unit/value, optional device label, caveats.

---

## Comparison rules

1. Different providers → not same-source comparable; cross-device caveat required.  
2. Same provider, incompatible HRV method or HR kind → not comparable as the same series.  
3. Same provider + compatible shape → `sameSourceComparable: true` for **trends**, still `identicalAcrossDevices: false`.

---

## API

```ts
normalizeDeviceObservation(raw) → { ok, record } | { ok: false, error }
compareDeviceMetrics(a, b) → { sameSourceComparable, identicalAcrossDevices: false, caveats, detail }
```

Unknown units fail closed (error) — values are not invented.

---

## Tests

```bash
npx vitest run src/domain/device-data-normalization
```
