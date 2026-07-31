# Exercise Intelligence

High-quality exercise catalog architecture for thestrongestmanager.com.

**Schema:** `Exercise`, `ExerciseVariation`, `ExerciseRelation`, `ExerciseEvidenceClaim`  
**Seed:** 10 priority lifts via `npm run db:seed:exercises`  
**Docs companion:** this file · `docs/DATA_MODEL.md`

---

## Principles

1. **Schema before volume** — do not generate hundreds of thin exercise stubs.
2. **Coaching ≠ evidence** — instructional fields are `contentKind = coaching_practice`.
3. **No fabricated citations** — `ExerciseEvidenceClaim` requires a real `citationLabel`. Priority seed inserts **zero** evidence rows.
4. **Curated priority set** — Squat, Bench, Deadlift, Overhead Press, RDL, Front Squat, Barbell Row, Pull-up, Leg Press, Hip Thrust.

---

## Data model

### `Exercise` (canonical entry)

| Field group | Fields |
| --- | --- |
| Identity | `name`, `slug`, `aliases` (JSON), `description` |
| Classification | `category`, `movementPattern`, `primaryMuscles`, `secondaryMuscles`, `equipment`, `difficulty`, `laterality`, `sportRelevance` |
| Coaching sections | `executionOverview`, `setup`, `execution`, `breathingBracing`, `commonMistakes`, `regressions`, `progressions`, `variations`, `programmingUses`, `safetyNotes` |
| Publishing | `contentKind`, `contentStatus`, `isPublished`, `publishedAt` |

JSON array/object columns stay SQLite-friendly and match other domain conventions.

### `ExerciseRelation`

Directed links: `regression` | `progression` | `variation` between catalog exercises.

### `ExerciseVariation`

Named modifiers on a parent (e.g. pause squat) — optional enrichment beyond freeform `variations` JSON.

### `ExerciseEvidenceClaim`

Only for claims with a **real** citation:

- `claim`
- `citationLabel` (required)
- `citationUrl` (optional)
- `supportLevel` (`limited` \| `moderate` \| `strong`)

If you cannot cite it, it does not belong here — keep it in coaching sections or omit it.

---

## Content honesty in UI

Public pages show an honesty banner: coaching practice vs evidence. The Evidence section renders an empty state when no claims exist (current priority catalog).

---

## Commands

```bash
npx prisma@5.22.0 migrate deploy
npx prisma@5.22.0 generate
npm run db:seed:exercises
```

---

## Discovery

`/exercises` supports shareable query params:

| Param | Meaning |
| --- | --- |
| `q` | Free-text over name, alias, muscle, movement, equipment |
| `sport` | Sport relevance high/moderate |
| `equipment` | Equipment tag |
| `movement` | Movement pattern |
| `muscle` | Primary or secondary muscle |
| `difficulty` | beginner \| intermediate \| advanced |

Also shown: **Popular** (curated), **Recently viewed** (device localStorage), **Related** (movement/muscle proximity).

---

## Surfaces

| Route | Behavior |
| --- | --- |
| `/exercises` | Search + shareable filters + discovery rails |
| `/exercises/[slug]` | Full detail with sticky desktop / compact mobile section nav; coaching context cards explicitly non-scientific |
| `/app/exercises` | Same discovery behind `appExercises` flag |

Services: `src/services/exercises/exercise-catalog.ts`  
Seed data: `src/domain/exercises/priority-seed.ts`
