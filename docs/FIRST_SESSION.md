# First-session wow — first ~10 minutes

**Date:** 2026-07-21  
**Prompt:** 47 — Optimize Homepage → Signup → Onboarding → Profile → first insight → first workout / technique

---

## Intent

New athletes should get **one useful action** before they see a wall of empty charts. Forms stay short; optional fields are skippable; progress is visible.

---

## Journey

| Step | Route / surface | What we optimize |
| --- | --- | --- |
| Homepage | `/` | Clear CTA into signup |
| Signup | auth | Minimal account create |
| Onboarding | `/app/onboarding` | Path-personalized when `advancedOnboardingPersonalization` is on: Beginner / Experienced / Powerlifter / Bodybuilder / Strongman / Coach. Beginner stays simple; advanced paths may optionally ask PRs, competition date, current program. Flag off → goal → experience → optional details → caution |
| Dashboard | `/app/dashboard` | First-session checklist, not score pillars |
| First insight | Dashboard opportunity card | From onboarding recommendation or profile gaps |
| First win | `/app/technique` or `/app/today` | Upload video or log a workout |

---

## Onboarding (short)

1. **Goal** (required)
2. **Experience** (required)
3. **Optional details** — sports, frequency, equipment, body, lifts, history, recovery — **Skip optional details**
4. **Caution** (required ack) → building → profile create

Progress UI: “Step N of 4” plus step chips. Optional step is labeled as optional.

Initial recommendation prefers **“Log your first workout”** when frequency + equipment exist; otherwise asks only for the missing gap.

---

## New-athlete dashboard

Shown when there are no athlete scores, technique scores, recovery signals, or completed sessions.

**Does not show:** Athlete Score rings, empty pillar grid, “15 empty charts.”

**Does show:**

1. Welcome + **progress bar** (`completedCount` / `totalCount`)
2. Numbered priorities (done / next badges):
   1. Complete profile  
   2. Upload first technique video  
   3. Log first workout  
   4. Choose / confirm first goal  
3. **One** “first useful insight” (opportunity or top insight)
4. Reported lifts if any (honest “reported,” not a strength score)

`DashboardView.firstSession` flags drive the checklist:

| Flag | Meaning |
| --- | --- |
| `profileReady` | Display name + experience level + at least one enrichment (frequency, equipment, bodyweight, or reported lifts) |
| `techniqueUploaded` | Any non-deleted technique analysis row (not only scored) |
| `workoutLogged` | ≥1 completed training session |
| `goalChosen` | ≥1 active goal |

---

## Honesty

Scores stay hidden until real signals exist. Empty insight copy does not invent a next workout or diagnosis.
