# Disaster Recovery & Backup

**Date:** 2026-07-22  
**Prompt:** 156 — Backup and Recovery  
**Domain:** `src/domain/backup-recovery/`  
**Dashboard:** `/app/admin/backup-recovery` (admin)  
**Flag:** `backupRecovery` (`NEXT_PUBLIC_FF_BACKUP_RECOVERY`, default **on**)  
**Status:** Runbook + audit registry — **no automated backup product is shipped in-repo**

> Athletic “recovery” (readiness / HRV) is documented in `docs/RECOVERY_SYSTEM.md`. This file is **ops disaster recovery** only.

---

## Honest current state

| Asset | Today | Not yet |
| --- | --- | --- |
| Database | Prisma + **SQLite** locally (`DATABASE_URL=file:./dev.db`) | Managed Postgres backups / PITR |
| Technique video | Local disk (`TECHNIQUE_STORAGE_DIR` or `./storage/technique`) | S3/R2 object storage adapter |
| Messaging files | Local disk (`MESSAGING_STORAGE_DIR` or `./storage/messaging`) | Same |
| Secrets | Env / host secret manager | Documented rotation runbook beyond `.env.example` |
| Automated backup cron | **None in-repo** | Provider backups when Postgres lands |
| Multi-region DR | **Not implemented** | Do not invent |

Gitignore already excludes `prisma/dev.db` and `/storage/` — backups must live **outside** the repo.

---

## What must be backed up together

Restore without all three is incomplete:

1. **Database** — SQLite file now; Postgres dump / snapshot later  
2. **File trees** — `storage/technique` (+ `storage/messaging` if used)  
3. **Secrets** — `AUTH_SECRET`, `TECHNIQUE_MEDIA_SECRET` (or shared auth secret), Stripe keys, `DATABASE_URL`  

Signed media URLs (`TECHNIQUE_SIGNED_URL_TTL_SECONDS` = 600) are **ephemeral**. Restoring DB + files + secrets re-enables new signed URLs; old tokens expire.

---

## Database backups

### Local / staging (SQLite)

```bash
# App stopped or briefly consistent copy
cp prisma/dev.db "/backups/thestrongest/dev-$(date -u +%Y%m%dT%H%M%SZ).db"
```

- Prefer copy while the app is stopped for a consistent snapshot.  
- Keep at least **7 daily** local copies for staging; production targets TBD with the host.  
- After schema changes, note the migration revision (`prisma/migrations/`) that matches the dump.

### Production path (when Postgres is live)

Per `docs/DATA_MODEL.md` and `docs/DATABASE_SCALE_AUDIT.md` phase 2:

1. Switch Prisma provider to `postgresql` and set managed `DATABASE_URL`.  
2. Enable **provider automated backups** (daily + point-in-time if available).  
3. Document host-specific RPO/RTO here once chosen — **do not invent numbers before the host is selected**.  
4. Test restore into a non-prod instance before relying on it.

### What not to do

- Do not commit DB files to git.  
- Do not treat Analytics adapters / in-memory event queues as durable (see Event-Driven + Observability docs).

---

## File backup

### Technique video

| Item | Value |
| --- | --- |
| Code | `src/services/technique/storage.ts` |
| Root | `TECHNIQUE_STORAGE_DIR` or `./storage/technique` |
| Key shape | `{athleteProfileId}/{analysisId}-{nonce}.{ext}` |
| Access | Private disk + session ownership + signed token route |

Backup the entire technique root recursively with the matching DB backup:

```bash
rsync -a "./storage/technique/" "/backups/thestrongest/technique-$(date -u +%Y%m%dT%H%M%SZ)/"
```

### Messaging attachments

| Item | Value |
| --- | --- |
| Code | `src/services/messaging/storage.ts` |
| Root | `MESSAGING_STORAGE_DIR` or `./storage/messaging` |

Include in the same backup window as the DB if messaging is in use.

### Future object storage

The technique storage module is written so an object-store adapter can replace local disk later. Until that ships, **file backup = disk/volume snapshot or rsync**, not S3 versioning.

---

## Restore tests

Run restore tests on a **non-production** machine. Record date, operator, and pass/fail in the admin audit notes or ops log.

### Checklist (SQLite + local files)

1. Stop the app process.  
2. Restore `DATABASE_URL` target file from backup.  
3. Restore `storage/technique` (and messaging if applicable) to the configured roots.  
4. Ensure `.env` secrets match the environment that produced the backup (or re-issue secrets and accept signed-URL / session invalidation).  
5. Run `npx prisma migrate deploy` only if the dump is behind migrations — never invent schema.  
6. Start the app.  
7. **Verify:**
   - Login works  
   - Athlete dashboard loads  
   - A known technique analysis plays via signed media  
   - Soft-deleted analyses stay deleted (`deletedAt` / status)  
8. Mark the restore test **pass** only if media and DB agree (no orphaned keys required for the smoke test; note orphans separately).

### Cadence (recommended)

| Environment | Restore test |
| --- | --- |
| Local / staging | After major migrations; at least quarterly |
| Production (future) | After first Postgres cutover; then at least semi-annually |

---

## Video retention

### App behavior (shipped)

| Action | Behavior |
| --- | --- |
| Soft-delete one analysis | Unlinks file; sets `status=deleted`, `deletedAt`; clears media/score fields (`deleteTechniqueAnalysisForUser`) |
| Delete all videos | `deleteAllTechniqueVideosForUser` / privacy actions |
| Account delete | `purgeTechniqueVideosForUser` then hard-delete User (cascade) |

### Not shipped

- No scheduled job hard-purges soft-deleted `TechniqueAnalysis` rows.  
- Soft-deleted DB rows can remain indefinitely until account cascade.  
- No automatic TTL (e.g. “delete videos after N days”) on private technique objects.  
- Data moat retention constants (`docs/DATA_MOAT_ARCHITECTURE.md`) are **policy for consent-gated aggregates**, not athlete video TTL.

### Policy direction (document before coding)

When product sets a retention window:

1. Define athlete-visible notice (privacy / technique settings).  
2. Soft-delete → grace period → hard-delete row + object.  
3. Keep backups subject to the same privacy obligations (encrypted backups; limited retention of deleted-user media).

Signed URL TTL (10 minutes) is **access control**, not retention.

---

## Disaster recovery

### Severity tiers

| Tier | Example | Response |
| --- | --- | --- |
| **S1** | DB file / volume lost | Restore latest DB + storage backup; verify login + technique media |
| **S2** | Technique disk lost, DB intact | Restore `storage/technique`; analyses without files show honest media errors — do not invent scores |
| **S3** | Secrets leaked | Rotate `AUTH_SECRET` / media secret / Stripe keys; invalidate sessions; re-sign media |
| **S4** | Region / host dead (future) | Fail over per managed Postgres + object storage runbook (TBD) |

### Communication honesty

- Prefer “restoring from backup” over fake “all data recovered” until restore verification passes.  
- Technique scores and movement reports live in the DB (`movementReportJson`); video bytes live on disk — both are required for full UX.

### Related systems

- **Event-driven queue** — in-process; not durable across crash (Prompt 154).  
- **Observability ring** — in-memory; not a backup (Prompt 155).  
- **Database scale** — cold archive / partitions are later phases, not a substitute for backups (Prompt 153).

---

## RPO / RTO (placeholders)

Fill when production hosting is chosen:

| Metric | Staging (guidance) | Production |
| --- | --- | --- |
| RPO | Last successful local copy (often ≥ 24h if manual) | TBD (provider backup window) |
| RTO | Manual restore + verify (often hours) | TBD |

---

## Related docs

- `docs/DATA_MODEL.md` — SQLite → Postgres  
- `docs/DATABASE_SCALE_AUDIT.md` — scale path (no premature shard)  
- `docs/TECHNIQUE_ANALYSIS.md` / `docs/SECURITY.md` — private media + purge  
- `docs/DATA_MOAT_ARCHITECTURE.md` — aggregate retention policy  
- `docs/RECOVERY_SYSTEM.md` — athletic recovery (**not** DR)

## Tests

`src/domain/backup-recovery/backup-recovery.test.ts`
