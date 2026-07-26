# Leaderboards

**Date:** 2026-07-21  
**Prompt:** 76 — Leaderboards  
**Domain:** `src/domain/leaderboard/`  
**Route:** `/app/leaderboards` (flag `leaderboards`)  
**Model:** `LeaderboardOptIn`

---

## Opt-in only

Default: **not participating**. Empty boards mean insufficient real data — **never invent rankings**.

---

## Categories

| Category | What ranks |
| --- | --- |
| Verified lifts | Best singles with verification labels |
| Rep PRs | Best multi-rep set volume |
| Technique improvement | Positive technique score delta |
| Consistency | Completed sessions in window |

**Forbidden:** recovery rankings, weight-loss / bodyweight-drop races.

---

## Verification differentiation

| Tier | Source examples |
| --- | --- |
| Self-reported | ProgressMetric `reported` |
| Video verified | Technique analysis with load / `observed` |
| Competition verified | Completed Competition Mode targets / `competition` source |

Equal loads: competition &gt; video &gt; self-reported.

---

## Filters

Bodyweight class · Country (ISO) · Sport · Verification tier

---

## Safety

Safety notes always shown. Product copy discourages unsafe load chasing.

---

## Feature flag

`NEXT_PUBLIC_FF_LEADERBOARDS` → `leaderboards` (default on)
