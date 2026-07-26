# Coach Athlete Detail Workspace

**Date:** 2026-07-21  
**Prompt:** 36 — Coach athlete detail  
**Domain:** `src/domain/coach/workspace.ts`  
**Service:** `src/services/coach/coach-athlete-service.ts`  
**Route:** `/app/coach/[athleteProfileId]`

---

## Sections

| Section | Scope gate |
| --- | --- |
| Overview | Active grant |
| Training | `training` or `programs` |
| Technique | `technique_summary` or `technique_media` |
| Progress | `training` or `programs` (body-comp keys need `body_metrics_detailed`) |
| Recovery | `recovery` only |
| Notes | Active grant |
| Recommendations | `training`, `programs`, or `technique_summary` |
| AI Copilot | Flag `coachAiCopilot` — see `docs/COACH_AI_COPILOT.md` |

Denied sections render an honest locked state — never silent empty fakes of hidden data.

---

## Coach actions

| Action | Persistence | Audit |
| --- | --- | --- |
| Review training / leave comments | `CoachNote` (`createdAt`) | Soft-delete preserves history (`status` / `deletedAt`) |
| Suggest modifications | `CoachModification` | Append-only `CoachModificationEvent` (`created`, `withdrawn`, …) |

Modifications are **never auto-applied**. Withdrawal is timestamped with an event row.

---

## AI vs human authorship

Recommendations are split and labelled:

| Bucket | Source | Label |
| --- | --- | --- |
| Human coach | `CoachModification` (`authorship = human_coach`) | **Human coach** |
| AI engine | `ProgramAdaptation` | **AI suggestion** |
| System | `Recommendation` | **System recommendation** |

AI / system items are never presented as coach decisions.

---

## Privacy

- Requires `assertCoachCanAccessAthlete` (active grant).
- Omits sex, birth year, movement notes.
- Recovery and technique media stay locked without scopes.
- See also `docs/COACH_PLATFORM.md`.
