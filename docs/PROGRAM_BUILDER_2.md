# Program Builder 2.0

**Date:** 2026-07-21  
**Prompt:** 117 — Program Builder 2.0  
**Route:** `/app/program-builder`  
**Domain:** `src/domain/program-builder/`  
**Service:** `src/services/program-builder/`  
**Flag:** `programBuilder` (`NEXT_PUBLIC_FF_PROGRAM_BUILDER`, default **on**)

---

## User inputs

| Input | Source |
| --- | --- |
| Goal | Fit goals |
| Days | Fit days (2–6) |
| Session duration | Fit session (short / medium / long) |
| Equipment | Fit equipment |
| Priority lifts | Curated catalog slugs (max 4) |
| Experience | Fit experience |

## Every draft includes

1. **Why exercises were chosen** — rule ids + reasons  
2. **Progression** — structured rule kinds (`add_load`, `double_progression`, …)  
3. **Deload strategy** — cadence from volume table + adaptive load/set defaults  
4. **Adjustment rules** — when / action / summary  

## Volume rule

Hard sets and rep prescriptions come from `PROGRAM_BUILDER_VOLUME_TABLE` only.

**AI must not create random exercise volume.** User edits clamp sets to 1–8. Drafts have `autoApply: false`.

## Edit

Athletes can change set counts on the draft. Edits mark `status: user_edited` and never write the live program graph automatically.

## Tests

`src/domain/program-builder/program-builder.test.ts`
