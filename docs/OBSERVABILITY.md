# Observability

**Date:** 2026-07-22  
**Prompt:** 155 — Observability  
**Domain:** `src/domain/observability/`  
**Service:** `src/services/observability/`  
**Dashboard:** `/app/admin/observability` (admin)  
**Flag:** `productionObservability` (`NEXT_PUBLIC_FF_PRODUCTION_OBSERVABILITY`, default **on**)  
**Beacon:** `POST /api/observability`

---

## Intent

Production monitoring for:

| Category | Coverage |
| --- | --- |
| Errors | React digest beacons; API unhandled exceptions |
| Performance / API latency | `withObservedApi` → method, path, status, durationMs |
| Database | Prisma `$on('error')` → structured log (no query args) |
| Background jobs | Domain event handler failures |
| Payment failures | Webhook + checkout failure codes |
| Technique failures | Upload exceptions + pipeline / honesty failures |

## Correlation IDs

- Header: `x-correlation-id`
- Minted or accepted when well-formed
- Propagated via `AsyncLocalStorage` into all `obs.*` logs for the request
- Echoed on API responses

## Privacy

`sanitizeLogProps` drops emails, passwords, tokens, video/pose payloads, health notes, stacks, webhook bodies. Nested objects are never logged.

## Related

- AI metrics: `docs/AI_OBSERVABILITY.md` (Prompt 147) — separate  
- CWV: Performance 2.0 — separate  

## Tests

`src/domain/observability/observability.test.ts`
