# Performance 2.0

**Date:** 2026-07-22  
**Prompt:** 152 — Performance 2.0  
**Domain:** `src/domain/performance-system/`  
**Service:** `src/services/performance-system/`  
**Reporting:** `WebVitalsReporter` · `/api/vitals`  
**Dashboard:** `/app/admin/performance` (admin)  
**Flag:** `performanceSystem` (`NEXT_PUBLIC_FF_PERFORMANCE_SYSTEM`, default **on**)

---

## Intent

Audit and budget Core Web Vitals on priority surfaces:

| Surface | Path | Focus |
| --- | --- | --- |
| Homepage | `/` | SSR/ISR, below-fold JS split, light LCP |
| Dashboard | `/app/dashboard` | RSC, bounded Prisma, parallel fetches |
| Exercise pages | `/exercises/*` | ISR + `unstable_cache` catalog reads |
| Technique analysis | `/app/technique/*` | Deferred MediaPipe, video `preload=metadata` |

## Measurable budget (good CWV)

| Metric | Global good | Notes |
| --- | --- | --- |
| LCP | ≤ 2500ms | Technique allows ≤ 3000ms (media) |
| INP | ≤ 200ms | All priority surfaces |
| CLS | ≤ 0.1 | All priority surfaces |
| TTFB | ≤ 800–1200ms | Surface-specific server budget |

Exact per-surface numbers live in `PERFORMANCE_BUDGETS`.

## Optimization pillars

| Pillar | Shipped |
| --- | --- |
| Images | next/image AVIF/WebP; marketing avoids heavy bitmap LCP |
| Video | Technique players use `preload="metadata"` |
| JS | Homepage below-fold `dynamic`; MediaPipe `ssr:false` |
| Server rendering | RSC on priority routes |
| Caching | ISR `revalidate=3600`; `/_next/static` immutable; exercise `unstable_cache` |
| Database queries | Dashboard `take` / `select` + parallel count |

Private technique video is **not** long-cached on a public CDN.

## Related

- Admin console: `/app/admin/performance`
- Field beacons: `POST /api/vitals` (no PII)

## Tests

`src/domain/performance-system/performance-system.test.ts`
