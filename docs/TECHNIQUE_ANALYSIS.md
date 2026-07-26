# Technique Analysis — Upload Pipeline

**Date:** 2026-07-20  
**Prompt:** 16 — Video upload pipeline (extended by Prompt 17 movement MVP)  
**Code:** `src/domain/technique/*`, `src/services/technique/*`, `src/app/api/technique/*`, `src/app/app/(main)/technique/*`

Movement / pose report: see **`docs/MOVEMENT_ANALYSIS.md`**.

---

## User flow

1. Upload video  
2. Choose exercise  
3. Choose camera angle  
4. Enter optional load  
5. Enter optional reps  
6. Consent to analysis  
7. Process (store + queue status)  
8. Results page (honest: score only if a real backend wrote one)

---

## Validation

| Check | Rule |
| --- | --- |
| File type | `video/mp4`, `video/webm`, `video/quicktime` (+ extension match + container sniff) |
| File size | ≤ 100 MiB |
| Duration | 1–90 seconds |
| Resolution | ≥ 640×360 |

Client validates before upload; server re-validates. Upload progress uses XHR `upload.onprogress`.

---

## Storage & access

- Videos live under private disk storage (`TECHNIQUE_STORAGE_DIR` or `./storage/technique`).
- Objects are **not** public static files.
- Playback uses **signed** `/api/technique/analyses/[id]/media?token=…` URLs (HMAC, short TTL) **and** the owner’s session.
- Athletes can **delete** an upload: media removed from disk; row marked `deleted`.

---

## Analysis honesty (non-negotiable)

- `overallScore` stays `null` until a real analysis backend writes it.
- When the backend is unavailable:
  - Development → `analysisBackendStatus = development_stub`
  - Production → `analysisBackendStatus = unavailable`
- Status summaries explain that **no technique score was generated**.
- **Never** randomly generate Technique Scores.
- **Never** label a report expert-reviewed until a verified expert Confirm / Correct / Comments — see `docs/TECHNIQUE_HUMAN_REVIEW.md`.

---

## Privacy copy

Shown on upload and detail. Videos are private to the athlete account, not marketing assets, deletable anytime.

---

## API

| Method | Path | Purpose |
| --- | --- | --- |
| `POST` | `/api/technique/analyses` | Multipart upload + metadata |
| `POST` | `/api/technique/analyses/[id]/movement` | Pose frames → movement report (Prompt 17) |
| `GET` | `/api/technique/analyses/[id]/media` | Signed private media |
| Server action | `deleteTechniqueAnalysisAction` | Delete media + soft-delete row |

---

## Env

| Variable | Role |
| --- | --- |
| `AUTH_SECRET` / `TECHNIQUE_MEDIA_SECRET` | Sign media tokens |
| `TECHNIQUE_STORAGE_DIR` | Optional storage root |
| `TECHNIQUE_ANALYSIS_BACKEND` | Reserved; does not invent scores even if set |
