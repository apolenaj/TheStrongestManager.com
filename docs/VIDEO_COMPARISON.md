# Side-by-Side Video Comparison

**Date:** 2026-07-21  
**Prompt:** 64 — Side-by-side video comparison  
**Route:** `/app/technique/compare?old=&new=` (flag `videoComparison`)  
**Domain:** `src/domain/video-comparison/`  
**Service:** `src/services/video-comparison/`  
**UI:** `src/components/video-comparison/`

---

## Intent

Compare **old lift vs new lift** with synchronized playback:

| Control | Behavior |
| --- | --- |
| Pause / Play | Both videos |
| Frame step | ±1/30 s on both |
| Speed | 0.25× / 0.5× / 1× / 1.5× |
| Overlay | Optional stacked opacity |
| Landmarks | Toggle — draws stored pose when present; otherwise phase markers / honest empty |

Compare panels:

- Start position  
- Movement path  
- Key phases  
- Technique metrics  

Mobile: stacked videos + sticky transport bar.

---

## Metric gating

Videos always play when media exists. Metric tables require:

1. Same exercise slug  
2. Compatible camera angles (`areCameraAnglesComparable` from Technique Trend Engine)

Otherwise playback works with a clear warning and empty metric tables.

---

## Landmarks honesty

Pose frames are **not** persisted after analysis today. The landmark toggle:

- Renders a skeleton when `landmarkFrames` are supplied  
- Falls back to phase-band highlights when only phases exist  
- Never invents joint positions  

---

## Entry points

- Technique report → “Side-by-side video compare” (previous vs current)  
- Nav → Compare lifts  
- `/app/technique/compare` picker when query params missing  

---

## Related

`docs/TECHNIQUE_TREND_ENGINE.md`, `docs/LIFT_PHASE_ANALYSIS.md`, `docs/TECHNIQUE_REPORT_UX.md`
