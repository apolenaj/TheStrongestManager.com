# Expert Contributor System

**Date:** 2026-07-21  
**Prompt:** 82 — Expert Contributor System  
**Domain:** `src/domain/expert-contributor/`  
**App route:** `/app/expert-contributor` (flag `expertContributor`)  
**Public:** `/experts/[slug]`, `/experts/[slug]/articles/[articleSlug]`  
**Admin:** `/app/admin/expert-contributors`  
**Models:** `ExpertContributorProfile`, `ExpertArticle`

---

## Roles

| Role | How it is earned |
| --- | --- |
| Coach | `User.isCoach` |
| Verified Coach | Coach + ≥1 verified marketplace `CoachCredential` |
| Expert Contributor | **Explicit staff verification only** |

Coach Mode and verified credentials **never** auto-grant Expert Contributor.

---

## Profile fields

Specialization · Credentials summary · Experience · Bio · SEO slug

---

## Articles + SEO author schema

Verified experts may publish articles. JSON-LD uses `schema.org/Person` as author only when `verificationStatus === verified`; otherwise Organization fallback.

---

## Q&A Expert badge

Community Q&A Expert badge now requires verified Expert Contributor — not marketplace credentials alone.

---

## Feature flag

`NEXT_PUBLIC_FF_EXPERT_CONTRIBUTOR` → `expertContributor` (default on)
