# Exercise Relationship Graph

**Date:** 2026-07-21  
**Prompt:** 109 — Exercise Relationship Graph  
**Route:** `/app/exercise-graph`  
**Domain:** `src/domain/exercise-relationship-graph/`  
**Service:** `src/services/exercise-relationship-graph/`  
**Flag:** `exerciseRelationshipGraph` (`NEXT_PUBLIC_FF_EXERCISE_RELATIONSHIP_GRAPH`, default **on**)

---

## Intent

Knowledge-graph architecture for exercises with **typed, curated edges only**.

| Relation | Source (explicit only) |
| --- | --- |
| Exercise → variation | `PRIORITY_EXERCISE_RELATIONS` + seed `relatedSlug` refs |
| Exercise → muscles | Seed `primaryMuscles` / `secondaryMuscles` |
| Exercise → weak point | `PRESCRIPTION_RULES` (weak-point-specific rules) |
| Exercise → sport | Seed `sportRelevance` (high / moderate) |
| Exercise → method | `relatedMethodsForPattern` / methods-by-pattern |
| Exercise → technique issue | Technique component drills + feedback `exerciseSlug` |

**Hard rule:** Do **not** create arbitrary relationships (no embedding similarity, no “same equipment” invent edges). Label-only variations without `relatedSlug` do not become edges.

---

## Consumers

| Surface | Improvement |
| --- | --- |
| Recommendations | Prescription alternatives prefer graph variation neighbors; personalization surfaces graph-backed alts |
| SEO | Learn clusters append graph variation / method / technique-error links for exercises already in supporting pages |
| Related content | Discovery “Related” rail prefers graph variations when present |

---

## Tests

`src/domain/exercise-relationship-graph/exercise-relationship-graph.test.ts`
