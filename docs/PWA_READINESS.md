# PWA Readiness

**Date:** 2026-07-22  
**Prompt:** 184 — PWA Readiness  
**Domain:** `src/domain/pwa-readiness/`  
**Service worker:** `/sw.js`  
**Manifest:** `/manifest.webmanifest` (Next `src/app/manifest.ts`)  
**Offline shell:** `/offline`  
**Flag:** `pwaReadiness` (`NEXT_PUBLIC_FF_PWA_READINESS`, default **on**)  
**Admin:** `/app/admin/pwa-readiness`

---

## Capabilities

| Capability | How |
| --- | --- |
| **Installable** | Web app manifest + 192/512 icons; `beforeinstallprompt` UI |
| **Offline shell** | SW serves `/offline` when navigation fails |
| **Cached workout** | Active `WorkoutSessionView` snapshot in IndexedDB (client) |
| **Sync when online** | Existing set-log queue + `online` flush + optional Background Sync tag `tsm-workout-sync` |
| **No insecure sensitive cache** | SW deny-list: auth, `/api/*`, technique media, settings/admin, Set-Cookie |

---

## Security rules

The service worker **never** puts these in Cache Storage:

- `/api/auth`, `/api/*`, `/auth/*`
- `/technique/*`, signed/video/media URLs
- `/app/settings`, `/app/admin`
- Responses with `Set-Cookie` or `Authorization` request headers

Workout resume data lives in **IndexedDB** on the device (same trust boundary as the offline set queue) — not as cached authenticated HTML.

Server remains source of truth after sync.

---

## Files

| Path | Role |
| --- | --- |
| `public/sw.js` | Shell + safe static cache |
| `src/app/manifest.ts` | Install manifest |
| `src/app/offline/page.tsx` | Offline shell UI |
| `src/lib/pwa/workout-cache.ts` | IndexedDB workout snapshot + sync registration |
| `src/components/pwa/*` | Register, install prompt, online status, admin panel |

---

## Honesty

- Not a full offline clone of the product  
- Technique video and account settings are not available offline by design  
- Flag off → no SW registration / install prompt  

```bash
npx vitest run src/domain/pwa-readiness
```
