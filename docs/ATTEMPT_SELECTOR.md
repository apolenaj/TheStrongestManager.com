# Powerlifting Attempt Selector

**Date:** 2026-07-21  
**Prompt:** 71 — Powerlifting attempt selector  
**Domain:** `src/domain/attempt-selector/`  
**Route:** `/app/attempt-selector` (flag `attemptSelector`)

---

## Intent

Attempt planning tool for powerlifting (and deadlift-focused meets).

### Example

```text
Opener: 300 kg
Second: 315 kg
Third: 325–330 depending on second attempt
```

### Inputs

| Input | Source |
| --- | --- |
| Recent strength | PR prediction range from working sets |
| Competition history | Completed meets / logged lift PRs (when present) |
| Confidence | Athlete-selected (seeded from readiness) |
| Goal | Competition Mode target lifts |
| Risk preference | Conservative / Balanced / Aggressive |

### Outputs

- Conservative-leaning **opener** (scales with risk)  
- Suggested **second**  
- **Conditional third** range + condition text  
- **Strategy** explanation  
- Honesty: **never guarantees** a make  

---

## Risk preference

| Preference | Relative intensity |
| --- | --- |
| Conservative | Safer opener / tighter thirds |
| Balanced | Default meet sketch |
| Aggressive | Higher seconds/thirds — still not a guarantee |

---

## Feature flag

`NEXT_PUBLIC_FF_ATTEMPT_SELECTOR` → `attemptSelector` (default on)
