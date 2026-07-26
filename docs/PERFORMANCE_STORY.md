# Performance Story

**Date:** 2026-07-22  
**Prompt:** 192 — Performance Story  
**Domain:** `src/domain/performance-story/`  
**Athlete UI:** `/app/performance-story`  
**Share:** `/share/story/[token]`  
**Admin:** `/app/admin/performance-story`  
**Flag:** `performanceStory` (`NEXT_PUBLIC_FF_PERFORMANCE_STORY`, default **on**)

---

## Principle

Turn athlete history into a **long-term narrative** of chronological observations. **Avoid fake causal conclusions** — parallel facts in a month are never glued into “because X, Y happened.”

---

## Example chapter shape

| Month | Lines |
| --- | --- |
| January | Deadlift 280 kg. |
| April | Deadlift 300 kg. |
| July | Technique improved +12. |
| July | Bodyweight −5 kg. |

July’s technique and bodyweight lines sit side-by-side. The product does **not** claim the technique change was caused by weight change.

---

## Shareable yearly review

Athletes can create a public-safe share (`PerformanceStoryShare`) with:

- Month chapters + lines  
- Yearly highlight bullets  
- Explicit causality caveat  
- No private coach notes or session dumps  

---

## Data sources

Lift peaks from progress metrics + major-lift session loads; technique month averages; bodyweight start→end delta; session counts as fallback when nothing else is notable. Quiet months are listed, not invented.

---

## Tests

```bash
npx vitest run src/domain/performance-story
```
