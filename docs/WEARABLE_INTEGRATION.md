# Wearable Integration Abstraction

**Date:** 2026-07-22  
**Prompt:** 185 — Wearable Integration Abstraction  
**Domain:** `src/domain/wearable-integration/`  
**Bridge:** `src/domain/recovery/wearable.ts` (sleep reads for recovery)  
**Admin:** `/app/admin/wearable-integration`  
**Architecture flag:** `wearableIntegration` (`NEXT_PUBLIC_FF_WEARABLE_INTEGRATION`, default **on**)

---

## Principle

Prepare architecture for Apple Health, Google Health Connect, Garmin, Whoop, and Oura.

**Do not build fake integrations.** No invented OAuth, tokens, or device samples.

---

## Adapter interface

```ts
WearableProviderAdapter {
  id, label, status, platforms, supportedDataKinds,
  getConnection() → never invents connected,
  fetchSamples()  → [] when not configured / unavailable
}
```

Statuses: `unavailable` | `not_configured` | `connected`

Default stubs for all five providers use **`not_configured`** and always return `[]`.

Register a real client later with `registerWearableProvider()` (replaces the stub for that id).

---

## Providers

| Id | Label | Platforms (planned) |
| --- | --- | --- |
| `apple_health` | Apple Health | iOS / watchOS |
| `google_health_connect` | Google Health Connect | Android |
| `garmin` | Garmin | iOS / Android / web API |
| `whoop` | Whoop | iOS / Android / web API |
| `oura` | Oura | iOS / Android / web API |

Planned data kinds (documentation only until live): sleep, HRV, resting HR, recovery score, steps, strain, readiness — see `WEARABLE_PROVIDER_PLANNED_KINDS`.

---

## Feature flags

| Env | Flag | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_FF_WEARABLE_INTEGRATION` | `wearableIntegration` | **on** (architecture / admin) |
| `NEXT_PUBLIC_FF_WEARABLE_APPLE_HEALTH` | `wearableAppleHealth` | **off** |
| `NEXT_PUBLIC_FF_WEARABLE_GOOGLE_HEALTH_CONNECT` | `wearableGoogleHealthConnect` | **off** |
| `NEXT_PUBLIC_FF_WEARABLE_GARMIN` | `wearableGarmin` | **off** |
| `NEXT_PUBLIC_FF_WEARABLE_WHOOP` | `wearableWhoop` | **off** |
| `NEXT_PUBLIC_FF_WEARABLE_OURA` | `wearableOura` | **off** |

Live reads require **`status === "connected"`** and the per-provider flag **on** (`mayUseLiveWearableReads`).

When live samples arrive, normalize them with **`docs/DEVICE_DATA_NORMALIZATION.md`** — never treat multi-vendor metrics as identical without caveats.

Optional future server env (documented only): `GARMIN_CLIENT_ID` / `WHOOP_CLIENT_*` / `OURA_CLIENT_*` / bridge toggles for Apple & Health Connect — see `WEARABLE_FUTURE_ENV_KEYS`.

---

## Out of scope until live clients

- OAuth / HealthKit / Health Connect UI that pretends to connect  
- Invented sleep, HRV, or recovery scores  
- Storing wearable tokens in Auth.js `Account` rows (use a dedicated connection record when schema is wired)

---

## Tests

```bash
npx vitest run src/domain/wearable-integration
```
