# Mealnexio Integration Architecture

**Date:** 2026-07-20  
**Prompt:** 31 — Mealnexio integration architecture  
**Routes:** `/app/nutrition`  
**Domain:** `src/domain/nutrition/*`  
**Service:** `src/services/nutrition/nutrition-service.ts`  
**UI:** `src/components/nutrition/NutritionDashboard.tsx`

---

## Principle

Do **not** assume a Mealnexio API exists. Build a provider abstraction. Never invent synced calories, macros, adherence, meal timing, or training-day nutrition.

---

## Provider abstraction

```text
NutritionProviderAdapter {
  id, label, status,
  supportedDataKinds,
  getConnection(),
  fetchDailyTargets() → null when unavailable,
  fetchDailySummary()  → null when unavailable
}

unavailableMealnexioAdapter  → status: unavailable, returns null / empty connection
registerNutritionProvider()  → real client later
```

Same spirit as the recovery wearable adapter (`docs/RECOVERY_SYSTEM.md`).

---

## Possible future shared data

| Kind | Label |
| --- | --- |
| `calories` | Calories |
| `macros` | Macros |
| `bodyweight` | Bodyweight |
| `nutrition_adherence` | Nutrition adherence |
| `training_day_nutrition` | Training-day nutrition |
| `meal_timing` | Meal timing |

Bodyweight on the Nutrition page today may show **local** `BodyMetric` from the athlete profile — labeled as not Mealnexio sync.

---

## Nutrition page (`/app/nutrition`)

Shows:

1. **Nutrition status** — provider + connection honesty  
2. **Daily targets** — empty until real sync returns data  
3. **Mealnexio CTA** — deep link when `mealnexioDeepLinking` is on (see `docs/MEALNEXIO_DEEP_LINKING.md`); otherwise https://mealnexio.com (no fake OAuth button)
4. **Optional recovery prompt** — “Nutrition may be limiting recovery” → Mealnexio nutrition review

When authenticated integration exists later: synchronize securely via a real adapter + server-only credentials. Tokens must **not** live in Auth.js login `Account` rows — prefer a dedicated connection record when schema is wired. Cross-product **SSO** is architecture-only until shared identity exists.

---

## Feature flags

| Env | Flag | Default |
| --- | --- | --- |
| `NEXT_PUBLIC_FF_MEALNEXIO_SYNC` | `mealnexioSync` | **off** |

While off, the service will not present provider payloads as live sync — even if a test registers a connected adapter.

Optional future server env (documented only): `MEALNEXIO_API_BASE`, `MEALNEXIO_CLIENT_ID`, `MEALNEXIO_CLIENT_SECRET`.

---

## Out of scope until live API

- Prisma meal / food diary tables  
- Invented daily targets  
- Fake “connected” UI without credentials
