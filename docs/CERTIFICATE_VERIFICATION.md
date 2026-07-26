# Certificate Verification

**Date:** 2026-07-22  
**Prompt:** 175 — Certification Verification  
**Domain:** `src/domain/certificate-verification/`  
**Service:** `src/services/certificate-verification/`  
**Source of truth:** `AcademyCompletionCertificate.code` (unique)

---

## Surfaces

| Route | Role |
| --- | --- |
| `/verify/certificate` | Public form — enter unique ID |
| `/verify/certificate/[code]` | Public result |
| `/app/admin/certificate-verification` | Staff honesty + field snapshot |

---

## Public fields

| Field | Source |
| --- | --- |
| **Unique ID** | `AcademyCompletionCertificate.code` |
| **Name** | `User.name` or athlete `displayName` (never email) |
| **Course** | Catalog title from enrollment `courseSlug` |
| **Date** | `issuedAt` |
| **Status** | `valid` when enrollment is `completed`; otherwise not found |

---

## Honesty

- Verifies **Certificate of Completion** only.
- **`isAccredited` is always `false`** until an officially accredited program is launched and labeled as such.
- Status is our issuance record — not a federation / government license status.
- Copy: `CERTIFICATE_VERIFICATION_HONESTY` in `src/domain/certificate-verification/constants.ts`.

---

## Flag

`NEXT_PUBLIC_FF_CERTIFICATE_VERIFICATION` / `certificateVerification` — default **on** (after Academy 2.0).

When Certificates of Completion are launched, leave this flag on so employers / peers can verify IDs publicly without implying accreditation.
