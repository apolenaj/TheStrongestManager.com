# Enterprise Security Prep

**Date:** 2026-07-22  
**Prompt:** 176 — Enterprise Security Prep  
**Audience:** Future B2B procurement / security questionnaires  
**Domain:** `src/domain/enterprise-security/`  
**Admin:** `/app/admin/enterprise-security`  
**Flag:** `enterpriseSecurity` (`NEXT_PUBLIC_FF_ENTERPRISE_SECURITY`, default **on**)

---

## Purpose

Prepare honest answers for gym / team / enterprise buyers who ask about security before purchase.

This document is a **control registry and narrative**, not:

- A SOC 2 / ISO 27001 / HIPAA certification  
- A penetration-test report  
- Counsel-approved privacy commitments  

Related product docs: `docs/SECURITY.md` (hardening checklist), `docs/DISASTER_RECOVERY.md` (backups / IR severity tiers), `docs/DATA_MODEL.md`, `docs/DATA_MOAT_ARCHITECTURE.md`.

---

## Compliance certifications — not obtained

**Do not claim** the following unless an audit is completed and a report is available to customers:

| Certification | Status |
| --- | --- |
| SOC 2 Type I / Type II | **Not obtained** |
| ISO/IEC 27001 / 27701 | **Not obtained** |
| HIPAA (covered entity / BA attestation) | **Not obtained** — product is not a medical device or diagnosis system |
| FedRAMP | **Not obtained** |
| PCI DSS (as this product storing card data) | **Not obtained** — card data handled by Stripe when billing is enabled; we do not store PANs |
| CSA STAR / Cyber Essentials (etc.) | **Not obtained** unless later listed here after real attainment |

Stripe’s own PCI status as a processor does **not** transfer as “Performance OS is PCI certified.”

Source of truth in code: `COMPLIANCE_CERTIFICATIONS_NOT_OBTAINED` in `src/domain/enterprise-security/constants.ts`.

---

## 1. Access controls

| Topic | Current state |
| --- | --- |
| Authentication | Auth.js credentials (+ optional OAuth); bcrypt password hashes; session required for `/app` |
| Admin | `User.isAdmin` re-checked in DB per request (`requireAdmin`) |
| Coach | Explicit `CoachAthleteAccess` grants; scoped sensitive data |
| Athlete ownership | Queries scoped to profile / session; ownership helpers in `src/domain/security/` |
| Technique media | HMAC signed URL **and** session user match **and** profile ownership |
| Org / team | Membership models for gym/team dashboards; enterprise SSO/SAML **not** productized yet |
| Rate limiting | In-memory sliding window for auth, technique, export, webhooks — replace with Redis for multi-instance production |

**Honest gaps:** No SAML/OIDC enterprise IdP connector yet; in-memory rate limits are single-node.

---

## 2. Encryption

| Layer | Current state |
| --- | --- |
| In transit | Expect TLS at production edge (host/CDN). Local HTTP possible in development — do not claim universal TLS. |
| At rest (DB) | Local SQLite = disk file; no app-level DB encryption. Managed volume encryption is a **host** feature when Postgres is live. |
| At rest (files) | Technique / messaging files on private disk (or future object store). Object-store SSE is host/config when adopted. |
| Secrets | Env vars (`AUTH_SECRET`, media signing, Stripe) — never in git. |
| Passwords | bcryptjs hashes only. |
| Field-level KMS | **Not implemented** — do not claim column encryption. |

---

## 3. Data processing

### Categories (typical)

- Account: email, optional name  
- Training: programs, sessions, sets, progress metrics  
- Technique: analysis metadata + video files  
- Coaching: notes, grants, marketplace profile data  
- Billing: Stripe customer/subscription metadata (no PAN storage in our DB)  
- Academy: enrollments, quiz attempts, Certificates of Completion  

### Processing principles

- Export JSON from Settings (excludes raw video, storage keys, password hashes, other users’ data).  
- Delete videos / delete account purge paths exist.  
- Data-moat aggregates are opt-in and flag-gated; no live training pipeline by default.  
- `/privacy` and `/terms` are **draft placeholders** until legal review.

### Subprocessors

Maintain a customer-facing subprocessor list when MSAs require it. Do **not** invent a fixed vendor list in this repo until hosting and payment are contracted for that environment. Stripe is the intended payment processor when billing flags are enabled.

---

## 4. Logging

| Log type | Current state |
| --- | --- |
| Admin audit | `AdminAuditLog` — append-only staff actions; viewable at `/app/admin/audit` |
| App observability | Product observability surfaces exist; **not** enterprise SIEM export or 24×7 SOC |
| Edge access logs | Host-dependent (retention/export TBD per provider) |
| Security alerting | No claimed pager / SOC — planned for enterprise readiness |

**Do not claim:** continuous security monitoring, log immutability WORM storage, or customer log shipping unless built and contracted.

---

## 5. Backups

Full runbook: **`docs/DISASTER_RECOVERY.md`** · admin registry: `/app/admin/backup-recovery`.

Summary:

- DB + technique/messaging files + secrets must restore together.  
- **No** automated backup cron in-repo today.  
- Managed Postgres backups / PITR planned at production cutover.  
- RPO/RTO **not invented** until host is selected.  

---

## 6. Incident response

| Element | Current state |
| --- | --- |
| Severity tiers | S1–S4 outlined in `docs/DISASTER_RECOVERY.md` (DB loss, media loss, secret leak, host/region) |
| Secret leak | Rotate `AUTH_SECRET` / media secrets / Stripe keys; invalidate sessions as needed |
| Formal IR playbook | **Planned** — commander roster, tabletop cadence, customer notification SLAs not claimed |
| Regulatory breach notify | Requires counsel-approved process — **not claimed** ready |

Until a formal IR program exists, treat the DR severity tiers as the working outline and escalate to founders / ops contacts for production incidents.

---

## Procurement Q&A cheat sheet

| Question | Honest answer |
| --- | --- |
| Are you SOC 2 certified? | **No.** Controls are documented; audit not completed. |
| ISO 27001? | **No.** |
| HIPAA compliant? | **No.** We are not offering a HIPAA-covered clinical product. |
| Where is data encrypted? | TLS expected in production; at-rest via host when configured; passwords hashed; no field-level KMS yet. |
| Who can access athlete data? | The athlete; coaches with explicit grants; staff admins for CMS (audited). |
| Can we export/delete? | Yes — Settings export / delete videos / delete account. |
| Backups? | Runbook documented; automation planned with managed DB. |
| Incident response? | Severity tiers documented; formal playbook planned. |

---

## Flag & admin

| Item | Value |
| --- | --- |
| Flag | `NEXT_PUBLIC_FF_ENTERPRISE_SECURITY` / `enterpriseSecurity` |
| Admin | `/app/admin/enterprise-security` |
| Registry | `src/domain/enterprise-security/` |

Update the “not obtained” list only when a real report can be shared under NDA.
