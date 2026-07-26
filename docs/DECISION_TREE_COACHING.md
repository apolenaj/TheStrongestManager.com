# Decision Tree Coaching Tools

**Date:** 2026-07-21  
**Prompt:** 116 — Decision Tree Coaching Tools  
**Routes:** `/decision-trees`, `/decision-trees/[slug]`  
**Domain:** `src/domain/decision-trees/`  
**Service:** `src/services/decision-trees/`  
**Flag:** `decisionTreeCoaching` (`NEXT_PUBLIC_FF_DECISION_TREE_COACHING`, default **on**)

---

## Example trees

| Slug | Question |
| --- | --- |
| `should-i-deload` | Should I deload? |
| `should-i-increase-weight` | Should I increase weight? |
| `which-deadlift-variation` | Which deadlift variation should I use? |
| `do-i-need-more-volume` | Do I need more volume? |

## How it works

1. Answer one question at a time  
2. Each option is a **structured rule** (`ruleId`, `ruleLabel`, `ruleExplanation`)  
3. Outcome shows guidance + caveats  
4. **Why this result** lists every rule that fired  
5. Shareable `?path=optionA.optionB` URLs  

## Hard rules

- **Explain output** — never hide the rule path  
- **Not medical advice** — pain / red flags route to “seek professional care”  
- Trees do **not** replace a coach or clinician  

## Related

- Fit engine: `/fit`  
- Myth vs Reality: `/myths`  
- Methods: `/methods`

## Tests

`src/domain/decision-trees/decision-trees.test.ts`
