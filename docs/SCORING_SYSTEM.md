# Scoring System

Modular, honest athlete scoring for thestrongestmanager.com.

**Location:** `src/domain/scoring/`  
**Version:** `1.1.0` (`SCORING_FORMULA_VERSION`)

---

## Principles

1. **No arbitrary magic numbers** — every threshold is a named constant in `thresholds.ts` with a written rationale.
2. **No invented scores** — if minimum data is missing, `score` is `null` and `confidence` is `none`.
3. **Confidence gates display** — UI must call `displayableScore(result)`. Scores with `none` or `low` confidence are **not shown**.
4. **Equal-weight composites** — Overall Athlete Score never zero-fills missing pillars.
5. **Transparent metadata** — every result includes inputs, missing inputs, explanation, timestamp, and reasoning (formula id/version/description).

---

## Result contract

Every engine returns:

| Field | Meaning |
| --- | --- |
| `score` | `0–100` when the formula can run; otherwise `null` |
| `confidence` | `none` \| `low` \| `medium` \| `high` |
| `inputs` | Structured values actually used |
| `missingInputs` | What is still required for a stronger/displayable result |
| `explanation` | Short human-readable reasoning |
| `timestamp` | Compute time |
| `reasoning` | Formula id, version, description, minimum-data checklist, notes |

```ts
import { computeAthleteScores, displayableScore } from "@/domain/scoring";

const scores = computeAthleteScores(snapshot);
const shown = displayableScore(scores.strength); // null if confidence too low
```

---

## Conceptual scores

| Key | Label | Engine |
| --- | --- | --- |
| `strength` | Strength Score | `engines/strength.ts` |
| `technique` | Technique Score | `engines/technique.ts` |
| `programming` | Programming Score | `engines/programming.ts` |
| `recovery` | Recovery Score | `engines/recovery.ts` |
| `consistency` | Consistency Score | `engines/consistency.ts` |
| `overall` | Overall Athlete Score | `engines/overall.ts` |

Definitions (input sources, formula prose, minima, confidence rules) live in `definitions.ts` and must stay aligned with the engines.

---

## Formulas (v1.1.0)

### Strength (Prompt 12)

**Inputs:** major-lift `ProgressMetric` history (kg, optional reps), bodyweight, experience level, primary discipline.  
**Contexts:** Beginner · Intermediate · Advanced · Competition athlete (`elite` → competition). Sport weights prioritize relevant lifts (e.g. powerlifting SBD).  
**Effort resolution:**
- **Verified** — `source=observed` and reps is null or 1 (the load that was lifted)
- **Estimated** — reps 2–12 → Epley e1RM `w × (1 + r/30)` (Epley 1985). **Never presented as a PR**
- **Reported** — athlete-claimed load without observation

**Formula:** sport-weighted mean of `contextScore = 100 × (effortKg / bodyweightKg) / levelReferenceMultiple`, blended with trend (`0.7` context + `0.3` trend when both exist). Trend maps ±20% recent-vs-prior best effort to 0–100 centered at 50.  
**Minimum (medium display):** bodyweight + ≥2 **observed** sport-relevant lifts.  
**UI:** `/app/progress` shows current estimated strength, trend, best lifts (Verified / Estimated / Reported columns), and confidence.

### Technique

**Inputs:** completed `TechniqueAnalysis.overallScore` (already 0–100).  
**Minimum (medium):** ≥2 analyses.  
**Formula:** arithmetic mean of overall scores.  
**Notes:** A single analysis computes a score at `low` confidence (hidden in UI).

**Per-video conventional deadlift Technique Score (Prompt 18):**  
Documented in `docs/DEADLIFT_TECHNIQUE_SCORE.md` (`deadlift.technique.weighted_v1`). Writes `TechniqueAnalysis.overallScore` only when enough camera-appropriate components are observed.

### Programming

**Inputs:** active program + program-linked sessions in 28 days.  
**Minimum (medium):** active program and ≥3 `completed|skipped` linked sessions.  
**Formula:** `100 × completed / (completed + skipped)`.

**Training Program Score (Prompt 57)** is separate — it scores **program quality / fit** (`program.quality.weighted_v1`), not adherence. See `docs/TRAINING_PROGRAM_SCORE.md` (`src/domain/program-score/`).

### Recovery

**Inputs:** `RecoveryEntry.readiness` in 14 days.  
**Minimum (medium):** ≥3 readiness logs.  
**Formula:** arithmetic mean of readiness (no remapping — athlete scale is already 0–100).

### Consistency

**Inputs:** training sessions in 28 days.  
**Minimum (medium):** ≥3 `completed|skipped` sessions.  
**Formula:** `100 × completed / (completed + skipped)`. Future `planned` sessions are **excluded** from the denominator.

### Overall Athlete Score

**Inputs:** displayable pillar results only.  
**Minimum:** ≥3 pillars that pass `displayableScore`.  
**Formula:** equal-weight arithmetic mean. Missing pillars are omitted, never treated as zero.  
**Confidence:** minimum confidence among included pillars.

---

## Confidence → display

| Confidence | Display numeric score? |
| --- | --- |
| `none` | No |
| `low` | No |
| `medium` | Yes |
| `high` | Yes |

Dashboard and any future surfaces **must** use `displayableScore()` (or equivalent). Showing a raw `score` with `low` confidence violates product honesty rules.

---

## Architecture

```
src/domain/scoring/
  types.ts           ScoreResult, ScoringSnapshot, …
  confidence.ts      display gate helpers
  thresholds.ts      shared named constants + rationales
  definitions.ts     catalog: sources / formula / minima / confidence
  result.ts          buildResult, clamp, mean
  compute.ts         computeAthleteScores()
  engines/*.ts       one engine per conceptual score
  strength/          Prompt 12 Strength Score module (e1RM, context bands, analyze)
  index.ts           public exports
```

Engines are **pure** (no Prisma). Services build a `ScoringSnapshot` from the database, then call `computeAthleteScores`.

---

## What this is not

- Not Wilks/DOTS/IPF GL Points (may be added later as an **named**, cited strength standard — not as a hidden coefficient).
- Not an AI black-box score.
- Not a persistence layer — storing `AthleteScore` rows is a separate service concern that should copy `ScoreResult` fields when written.

---

## Tests

`src/domain/scoring/scoring.test.ts` covers:

- Display gate behavior
- Each pillar’s minimum-data refusal
- Ratio / mean formulas
- Overall omitting low-confidence pillars
- Result contract fields
