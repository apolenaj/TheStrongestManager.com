# Free Athlete Assessment Funnel

**Date:** 2026-07-22  
**Prompt:** 171 — Free Athlete Score Funnel  
**Domain:** `src/domain/athlete-assessment/`  
**Service:** `src/services/athlete-assessment/`  
**Route:** `/athlete-assessment`  
**API:** `POST /api/athlete-assessment/claim`  
**Dashboard:** `/app/admin/athlete-assessment` (admin)  
**Flag:** `athleteAssessment` (`NEXT_PUBLIC_FF_ATHLETE_ASSESSMENT`, default **on**)

---

## Intent

Public assessment:

1. User answers **limited questions**  
2. Return a **partial profile**  
3. Clearly label:
   - **Self-assessment estimate**
   - **Not full Athlete Score**
4. CTA: **Create account for real data-driven score**

---

## Flow

| Step | Behavior |
| --- | --- |
| Questions | Goal, experience, sport, frequency, recovery feel, logging habit |
| Claim ticket | `POST /api/athlete-assessment/claim` — **10 / hour / IP** |
| Partial profile | Echo reported answers + pillar unlock checklist (from `SCORE_DEFINITIONS`) |
| Signup | `/signup?next=/app/dashboard&from=athlete-assessment` |

---

## Scoring honesty (non-negotiable)

- **Never** call `computeAthleteScores` from questionnaire answers.  
- `athleteScore.shown` is always `false` on this page.  
- Every field is `source: "reported"` with label **Self-assessment estimate**.  
- Banner / badges: **Not full Athlete Score**.  
- Real overall needs ≥3 displayable pillars from **logged** training (`docs/SCORING_SYSTEM.md`).

---

## Privacy

- Answers stay in the browser for the free assessment.  
- Claim endpoint accepts **no questionnaire body**.  
- No guest `AthleteScore` row is written.

---

## Related

- `docs/SCORING_SYSTEM.md`  
- `docs/ATHLETE_LEVEL.md`  
- `docs/PROGRAM_AUDIT.md` / `docs/TECHNIQUE_CHECK.md` (funnel twins)  

## Tests

`src/domain/athlete-assessment/athlete-assessment.test.ts`
