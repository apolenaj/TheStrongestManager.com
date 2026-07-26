# Academy Architecture

**Date:** 2026-07-22  
**Prompt:** 38 — Academy · **174 — Academy 2.0**  
**Domain:** `src/domain/academy/`  
**Service:** `src/services/academy/academy-service.ts`  
**Progress schema:** `AcademyEnrollment` · `AcademyLessonProgress` · `AcademyQuizAttempt` · `AcademyCompletionCertificate`

---

## Surfaces

| Route | Role |
| --- | --- |
| `/academy` | Public landing + catalog (+ learning paths when `academy20`) |
| `/academy/[slug]` | Course detail (outline; enroll when signed in) |
| `/app/academy` | Student dashboard (flag `appAcademy`, default on) |
| `/app/academy/[slug]` | In-app learning (lessons, quizzes, completion) |
| `/app/admin/academy` | Staff catalog + Academy 2.0 snapshot |

---

## Course structure

Each course has:

1. **Modules**  
2. **Lessons** (mark complete)  
3. **Progress** (per enrollment)  
4. **Quiz** (per module when present; pass %)  
5. **Completion** → **Certificate of Completion**

### Academy 2.0 additions (Prompt 174)

| Feature | Behavior |
| --- | --- |
| **Learning paths** | Ordered `courseSlug[]` catalogs in `paths.ts` (athlete + coach curriculum) |
| **Prerequisites** | `prerequisiteCourseSlugs` — enrollment blocked until those courses are **completed** |
| **Quizzes** | Unchanged — real `scoreQuiz` + stored attempts |
| **Practical assignments** | Self-attested checklists; stored as `AcademyLessonProgress` with `assignment:{id}` keys |
| **Technique examples** | Links to `/exercises/[slug]` — not fabricated video grades |
| **Coach curriculum** | Path `coach-curriculum` (strength-coaching → programming → powerlifting) |
| **Knowledge progress** | % from lessons + passed quizzes + assignments — never a fake IQ / mastery score |

Assignments **do not** gate Certificate of Completion (still lessons + quizzes only).

### Published topics

- Deadlift Specialist (prereq: Programming Fundamentals)  
- Programming Fundamentals  
- Powerlifting Programming (prereq: Programming Fundamentals)  
- Strength Coaching  

Curriculum lives in `src/domain/academy/catalog.ts` (curated, published). Paths in `src/domain/academy/paths.ts`. Progress is persisted in the database.

---

## Certificates — honesty

| Allowed | Not allowed |
| --- | --- |
| **Certificate of Completion** (`certificate_of_completion`) | Fake “official” / accredited certifications |
| Opaque completion `code` for future verify pages | Implying NASM, CSCS, or similar without a real partnership |

Completion requires **all lessons complete** and **all module quizzes passed**.

Honesty copy: `ACADEMY_HONESTY` + `ACADEMY_2_HONESTY` in `src/domain/academy/types.ts`.

---

## Flags

| Flag | Env | Default |
| --- | --- | --- |
| `appAcademy` | `NEXT_PUBLIC_FF_APP_ACADEMY` | on |
| `academy20` | `NEXT_PUBLIC_FF_ACADEMY_20` | on |

Public `/academy` catalog is always available. Academy 2.0 UI (paths, prereqs, assignments, technique examples, knowledge %) respects `academy20`.

---

## Public verification (Prompt 175)

Certificates of Completion expose a unique `code`. Public verify:

- `/verify/certificate` · `/verify/certificate/[code]`
- Flag: `certificateVerification` (`NEXT_PUBLIC_FF_CERTIFICATE_VERIFICATION`)
- Docs: `docs/CERTIFICATE_VERIFICATION.md`

Never implies accreditation unless an officially accredited program is launched and labeled as such.
