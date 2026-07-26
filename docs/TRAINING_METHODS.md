# Training Methods Knowledge Engine

**Date:** 2026-07-20  
**Prompt:** 27 — Training methods knowledge engine  
**Catalog:** `src/domain/methods/*`  
**Routes:** `/methods`, `/methods/[slug]`, `/app/methods`, `/app/methods/[slug]`

---

## Principles

1. **Curated catalog** — ten published methods; no hundreds of thin stubs.
2. **History ≠ evidence verdict** — each page separates:
   - **Historical description** (overview, origins, core principles)
   - **Coaching practice** (use cases, limitations, fatigue, athletes, programming, mistakes)
   - **Modern interpretation** (how ideas are used today + evidence awareness)
3. **No fabricated citations** — `evidenceHonesty` states limits; do not invent papers.
4. **Do not oversimplify** — origins note commercial/popular dilutions vs classical framing (e.g. HIT ≠ %1RM intensity; GVT ≠ “all of Germany”).

---

## Categories

Powerlifting · Bodybuilding · Strongman · Weightlifting · General strength · Athletic performance

---

## Published methods

| Slug | Name |
| --- | --- |
| `linear-periodization` | Linear periodization |
| `block-periodization` | Block periodization |
| `daily-undulating-periodization` | DUP |
| `conjugate` | Conjugate method |
| `high-frequency-training` | High-frequency training |
| `high-intensity-training` | High-intensity training (HIT) |
| `rest-pause` | Rest-pause |
| `myo-reps` | Myo-reps |
| `cluster-sets` | Cluster sets |
| `german-volume-training` | German Volume Training |

---

## Detail sections

Overview · Origins · Core principles · Best use cases · Limitations · Fatigue profile · Suitable athletes · Programming example · Modern interpretation · Common mistakes · Related methods

Each section carries a layer badge in the UI.

---

## Feature flags

`methodDetail` and `appMethods` default **on** when unset. Set `NEXT_PUBLIC_FF_METHOD_DETAIL=false` / `NEXT_PUBLIC_FF_APP_METHODS=false` to hide.

---

## Comparison

`/compare?methods=slug-a,slug-b[,slug-c]` — qualitative side-by-side (Prompt 28). See `docs/METHOD_COMPARISON.md`.

## History timeline

`/history` and `/history/[slug]` — original educational timeline with links into method pages (Prompt 29). See `docs/HISTORY_OF_TRAINING.md`.

## Fit engine

`/fit` — “What training approach fits me?” transparent rules → primary + alternative (Prompt 30). See `docs/FIT_ENGINE.md`.
