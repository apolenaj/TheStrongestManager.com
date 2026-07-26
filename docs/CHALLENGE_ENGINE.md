# Challenge Engine

**Date:** 2026-07-21  
**Prompt:** 78 — Challenge Engine  
**Domain:** `src/domain/challenge/`  
**Route:** `/app/challenges` (flag `challengeEngine`)  
**Model:** `ChallengeEnrollment`  
**Catalog:** code-backed `CHALLENGE_CATALOG`

---

## Reward pillars

| Pillar | Intent |
| --- | --- |
| Consistency | Habit and session completion |
| Learning | Academy / education progress |
| Improvement | Technique score gains |

---

## Example challenges

| Challenge | Metric |
| --- | --- |
| 30-Day Technique Challenge | Distinct technique days in 30 days |
| 100 Workout Consistency Challenge | Completed sessions |
| Deadlift Technique Improvement Challenge | Positive technique score delta |
| Academy Learning Sprint | Lessons completed |

---

## Forbidden

Never ship: max daily lift, daily 1RM, max-load races, every-day PR, bodyweight-cut races, recovery-score races.

---

## Leaderboards

Optional **per challenge**, default off. Athletes must opt in. Empty boards stay empty — no invented ranks.

---

## Completion badges

Awarded only when progress meets the target (`badgeAwardedAt`). Catalog badges: 30-Day Technique, 100 Workouts, Deadlift Technique, Learning Sprint.

---

## Feature flag

`NEXT_PUBLIC_FF_CHALLENGE_ENGINE` → `challengeEngine` (default on)
