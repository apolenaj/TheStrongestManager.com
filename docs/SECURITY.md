# Security, Privacy & Data Control

**Date:** 2026-07-22  
**Prompt:** 43 — Security hardening · **176 — Enterprise Security Prep**  
**Ownership:** `src/domain/security/`  
**Enterprise registry:** `src/domain/enterprise-security/` · `docs/ENTERPRISE_SECURITY.md`  
**Rate limit:** `src/lib/rate-limit.ts`  
**Export / purge:** `src/services/privacy/`  
**Webhook verify:** `src/domain/billing/webhook.ts`  
**Legal placeholders:** `/privacy`, `/terms`  
**Settings:** `/app/settings`

> **B2B procurement:** Use `docs/ENTERPRISE_SECURITY.md` for access controls, encryption, data processing, logging, backups, and incident response. **Do not claim SOC 2 / ISO / HIPAA / etc. unless obtained.**  
> **GDPR workflows:** Use `docs/GDPR_READINESS.md` for consent, export, deletion, cookies, and retention. Legal pages remain **Draft — for professional legal review**.

---

## Review checklist

| Area | Status |
| --- | --- |
| Authentication | Auth.js credentials + optional OAuth; `requireSession()`; middleware for `/app` |
| Authorization | Admin DB re-check; coach grants + scopes; athlete ownership via profile |
| Object ownership / IDOR | Technique, workout, coach, academy queries scoped to session owner |
| File uploads | Multipart size/mime/duration validation; private disk storage; path traversal blocked |
| Video access | HMAC signed URL **and** session user match **and** profile ownership |
| Rate limiting | Auth actions + technique upload/movement/media + export + billing webhook |
| Input validation | Zod on auth; technique validation domain; login schema on login action |
| SQL injection | Prisma parameterized queries only |
| XSS | React escaping; sanitized `Content-Disposition` filenames; nosniff |
| CSRF | Next.js Server Actions origin checks; Auth.js CSRF on `/api/auth` |
| Secrets | `.env.example` documents Auth, Stripe, technique signing — never commit real secrets |
| Webhook verification | `POST /api/billing/webhook` requires Stripe signature; 503 if secret unset |
| Payment endpoints | Checkout gated until provider ready; webhook does not invent activations |

---

## User controls

| Control | Where |
| --- | --- |
| Export data (JSON) | Settings → Export · `GET /app/settings/export` |
| Delete uploaded videos | Settings → Delete all · per-analysis on Technique |
| Delete account | Settings → Delete account (purges videos first) |

Export **excludes** raw video bytes, storage keys, password hashes, and other users’ data.

Platform **data moat** aggregates (future model improvement) require separate opt-in — default off. See `docs/DATA_MOAT_ARCHITECTURE.md` (Prompt 91). No live training pipeline yet.

---

## Privacy & Terms

- `/privacy` and `/terms` are **placeholders clearly marked “Draft — for legal review”**.
- They are **not** legally approved policies. Do not present them as counsel-reviewed.

---

## Rate limits (in-memory)

Single-node sliding window. Production should replace with Redis/Upstash using the same `rateLimit()` interface.

Presets: signup, login, forgot/reset password, technique upload/movement/media, data export, billing webhook.

---

## Technique media gates

1. Valid HMAC token for `analysisId` + `userId`  
2. Authenticated session `user.id` matches token  
3. Analysis `athleteProfileId` belongs to that user  
4. Rate limit + `Cache-Control: private, no-store`

---

## Billing webhook

```text
POST /api/billing/webhook
  → rate limit
  → require STRIPE_WEBHOOK_SECRET
  → verifyStripeWebhookSignature (timing-safe)
  → acknowledge only — do not invent subscription activation
```

Call `emitSubscriptionActivatedEvent` only from a ready adapter after verified, idempotent event handling.

---

## Residual risks (honest)

- OAuth `allowDangerousEmailAccountLinking` until email verification is enforced.
- In-memory rate limits are not multi-instance safe.
- Coach `technique_media` scope does not yet grant signed playback (owner-only media).
- Broaden Zod coverage on remaining FormData actions over time.
