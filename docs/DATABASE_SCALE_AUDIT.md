# Database Scale Audit

**Date:** 2026-07-22  
**Prompt:** 153 — Database Scale Audit  
**Domain:** `src/domain/database-scale/`  
**Service:** `src/services/database-scale/`  
**Dashboard:** `/app/admin/database-scale` (admin)  
**Flag:** `databaseScale` (`NEXT_PUBLIC_FF_DATABASE_SCALE`, default **on**)  
**Migration:** `prisma/migrations/20260721490000_database_scale_indexes/`

---

## Intent

Review the OLTP schema and query patterns for **100k+ users**:

| Focus | Outcome |
| --- | --- |
| Indexes | Auth FKs, session completedAt, SessionSet.completedAt, technique list + storageKey |
| N+1 | Workout previous-performance batched |
| Pagination | Technique list `take` bound; cursor strategy documented |
| Large tables | SessionSet, TechniqueAnalysis JSON, audit logs — watch + archive later |
| Analytics separation | Product events out-of-band; moat not a PII warehouse |
| Technique metrics | Child `TechniqueMetric` stays analysis-scoped |
| Video metadata | On `TechniqueAnalysis`; bytes in private object storage |
| Scaling path | Five phases — **shard last** |

## Do not prematurely shard

Postgres with indexes, pooling, replicas, cursor pagination, and analytics/archive handles well past 100k users. Application sharding by `athleteProfileId` is **phase 5 only**.

## Scaling path (summary)

1. **Indexes + bounds** (now)  
2. **Postgres + read replicas** (~10k–50k MAU / primary saturation)  
3. **Analytics warehouse + cold archive** (storage / backup pressure)  
4. **Partition SessionSet / TechniqueAnalysis** (optional, ~100M rows)  
5. **Shard only if forced** after 1–4 fail SLOs  

## Shipped code changes

- Prisma indexes (see migration)  
- `loadPreviousPerformanceMap` in workout session view  
- `listTechniqueAnalysesForUser` default `take: 40`  

## Related

- `docs/DATA_MODEL.md` — entity overview  
- `docs/DATA_MOAT_ARCHITECTURE.md` — consent-gated aggregation  
- Performance 2.0 — app CWV (not DB scale)

## Tests

`src/domain/database-scale/database-scale.test.ts`
