# Growth Experiment Framework

**Date:** 2026-07-22  
**Prompt:** 159 — Growth Experiment Framework  
**Domain:** `src/domain/growth-experiments/`  
**Service:** `src/services/growth-experiments/`  
**Dashboard:** `/app/admin/growth-experiments` (admin)  
**Flag:** `growthExperiments` (`NEXT_PUBLIC_FF_GROWTH_EXPERIMENTS`, default **on**)

---

## Intent

Safe A/B architecture for growth copy/presentation — **not** personal training experiments (`docs/EXPERIMENT_MODE.md`) and **not** programming A/B insights (`docs/AB_PROGRAMMING_INSIGHTS.md`).

| Allowed surfaces | Never experiment |
| --- | --- |
| Homepage CTA | Safety warnings |
| Onboarding intro framing | Privacy copy |
| Pricing presentation (labels) | Medical messaging |

---

## Running experiments

| Id | Surface | Primary outcome |
| --- | --- | --- |
| `homepage_cta_v1` | `homepage_cta` | `signup_started` |
| `onboarding_intro_v1` | `onboarding` | `onboarding_completed` |
| `pricing_cta_v1` | `pricing_presentation` | `pricing_viewed` / free CTA engagement |

Sticky assignment via hash + cookies (`ts_gid`, `ts_exp_*`). Exposures/conversions emit `growth_experiment_exposure` / `growth_experiment_conversion`.

---

## Statistics

- Minimum **100** exposures per arm before rates are reported.
- Underpowered arms → `insufficient_sample`; **no declared winner**.
- Wilson score intervals for estimates when sample is met — never fake significance.

Process-local counters feed the admin snapshot; warehouse aggregates are required for production decisions.

---

## Wired surfaces

- Marketing home → `resolveHomepageCtaLabel` → `HomeHero`
- `/app/onboarding` → `resolveOnboardingIntro` → `OnboardingWizard`
- `/pricing` → `resolvePricingFreeCtaLabel` → free-tier CTA only (honesty alerts unchanged)

---

## Related

- `docs/ANALYTICS_EVENTS.md` — catalog events  
- `docs/EXPERIMENT_MODE.md` — athlete training experiments (different product)

## Tests

`src/domain/growth-experiments/growth-experiments.test.ts`
