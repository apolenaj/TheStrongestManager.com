# Technique Feedback & Drill Engine

**Date:** 2026-07-20  
**Prompt:** 20 — Technique feedback and drill engine  
**Code:** `src/domain/technique/feedback/*`  
**UI:** `TechniqueFeedbackList` on the technique report (“How to improve”)

---

## Principle

**Do not prescribe blindly.** Recommendations are rule-based and gated by:

| Gate | Behavior |
| --- | --- |
| Confidence | Assessment & component must reach `medium` (or higher) to prescribe drills/exercises |
| Pain / movement flags | Non-empty `movementNotes` → caution + unload dosage; blocks aggressive load-management |
| Training level | Beginner / intermediate / advanced dosage strings |
| Goal / discipline | Soft preference for competition vs general templates |

Every recommendation includes **Why · How · Suggested dosage · When to reassess**.

---

## Example: early hip rise

If `hip_rise_pattern` score ≤ `FEEDBACK_ISSUE_SCORE_MAX` (55) with adequate confidence, catalog may include:

- Position drill (slow first pull)  
- Paused deadlift  
- Tempo deadlift  
- Load management (only if score ≤ significant band **and** no pain flags)  
- Setup cue  

The engine picks the best template for athlete context (not all five at once) and caps total recommendations at **3**.

---

## Named thresholds

See `thresholds.ts` — issue score max, significant band, dosages, reassessment window.

---

## Athlete context

Built from profile via `buildFeedbackAthleteContext` (experience level, goal, discipline, movement notes, pain-caution ack).
