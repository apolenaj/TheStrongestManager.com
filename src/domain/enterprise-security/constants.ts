/**
 * Enterprise Security Prep (Prompt 176).
 * B2B procurement registry — document controls honestly.
 * Do not claim compliance certifications not obtained.
 */

export const ENTERPRISE_SECURITY_ENGINE_VERSION =
  "enterprise_security.v1" as const;

export const ENTERPRISE_SECURITY_HONESTY = [
  "This registry prepares for future B2B procurement questionnaires — it is not a compliance certification.",
  "We do not claim SOC 2, ISO 27001, HIPAA, FedRAMP, PCI DSS (as a Level 1 merchant), or similar unless an audit is completed and a report is available.",
  "Stripe may be PCI-certified as a payment processor; that does not mean Performance OS holds PCI merchant certification for card data we never store.",
  "Privacy/Terms pages remain draft until legal review — do not present them as counsel-approved.",
  "Production encryption-at-rest and managed backups depend on the chosen host — do not invent provider attestations here.",
] as const;

/** Explicitly NOT claimed — keep in sync with docs/ENTERPRISE_SECURITY.md */
export const COMPLIANCE_CERTIFICATIONS_NOT_OBTAINED = [
  "SOC 2 Type I",
  "SOC 2 Type II",
  "ISO/IEC 27001",
  "ISO/IEC 27701",
  "HIPAA (BAAs / covered entity or BA attestation)",
  "FedRAMP",
  "PCI DSS (as this product / merchant of record for card storage)",
  "CSA STAR",
  "Cyber Essentials / Cyber Essentials Plus (unless later obtained)",
] as const;

export const ENTERPRISE_SECURITY_AREAS = [
  "access_controls",
  "encryption",
  "data_processing",
  "logging",
  "backups",
  "incident_response",
] as const;

export type EnterpriseSecurityAreaId =
  (typeof ENTERPRISE_SECURITY_AREAS)[number];

export type EnterpriseSecurityStatus =
  | "documented"
  | "partial"
  | "planned"
  | "not_claimed";

export type EnterpriseSecurityControl = {
  id: string;
  area: EnterpriseSecurityAreaId;
  title: string;
  detail: string;
  status: EnterpriseSecurityStatus;
  /** Pointer into docs or code — never a fake certificate ID. */
  evidence: string;
};

export const ENTERPRISE_SECURITY_CONTROLS: readonly EnterpriseSecurityControl[] =
  [
    {
      id: "ac.session",
      area: "access_controls",
      title: "Authenticated app routes",
      detail:
        "Auth.js sessions; middleware and requireSession() gate /app. Credentials use bcrypt password hashes — never store plaintext passwords.",
      status: "documented",
      evidence: "src/services/auth · src/lib/password.ts · docs/SECURITY.md",
    },
    {
      id: "ac.admin",
      area: "access_controls",
      title: "Staff admin re-check",
      detail:
        "Admin CMS requires User.isAdmin from the database on each request — not JWT claims alone. Non-admins get not-found; controls never appear in athlete nav.",
      status: "documented",
      evidence: "src/services/admin/require-admin.ts",
    },
    {
      id: "ac.coach_grants",
      area: "access_controls",
      title: "Coach access grants & scopes",
      detail:
        "Coach Mode sees athletes only via explicit CoachAthleteAccess grants. Sensitive scopes (recovery, body metrics) are opt-in.",
      status: "documented",
      evidence: "CoachAthleteAccess · docs/SECURITY.md",
    },
    {
      id: "ac.ownership",
      area: "access_controls",
      title: "Object ownership / IDOR resistance",
      detail:
        "Technique, workouts, academy progress, and similar queries scoped to session owner (or granted coach). Ownership helpers in domain/security.",
      status: "documented",
      evidence: "src/domain/security/ownership.ts",
    },
    {
      id: "ac.org_rbac",
      area: "access_controls",
      title: "Org / team RBAC for B2B",
      detail:
        "Organization memberships exist for gym/team surfaces. Enterprise SSO/SAML and fine-grained org roles for procurement are not fully productized yet.",
      status: "partial",
      evidence: "OrgMembership · TeamMembership · /app/org",
    },
    {
      id: "enc.in_transit",
      area: "encryption",
      title: "Encryption in transit",
      detail:
        "Production must terminate TLS at the edge (host / CDN). Local dev may use HTTP — do not claim universal TLS for every environment.",
      status: "partial",
      evidence: "Host configuration (not enforced in-repo)",
    },
    {
      id: "enc.at_rest_db",
      area: "encryption",
      title: "Encryption at rest (database)",
      detail:
        "Local SQLite is a file on disk without app-level field encryption. Managed Postgres volume encryption is a host feature when production DB lands — not attested here.",
      status: "planned",
      evidence: "docs/DISASTER_RECOVERY.md · docs/DATA_MODEL.md",
    },
    {
      id: "enc.secrets",
      area: "encryption",
      title: "Secrets & password hashing",
      detail:
        "AUTH_SECRET, Stripe keys, media signing secrets via env — never committed. Passwords hashed with bcryptjs. Technique media uses HMAC signed URLs + session match.",
      status: "documented",
      evidence: ".env.example · src/lib/password.ts · technique media routes",
    },
    {
      id: "enc.field_level",
      area: "encryption",
      title: "Application-level field encryption",
      detail:
        "No general KMS field encryption for PII columns yet. Do not claim column-level encryption.",
      status: "planned",
      evidence: "n/a",
    },
    {
      id: "dp.categories",
      area: "data_processing",
      title: "Data categories processed",
      detail:
        "Account (email, optional name), training logs, programs, technique video metadata + media files, coach notes, billing metadata via Stripe, academy progress. No medical diagnosis product.",
      status: "documented",
      evidence: "docs/DATA_MODEL.md · /privacy (draft)",
    },
    {
      id: "dp.processors",
      area: "data_processing",
      title: "Subprocessors (illustrative)",
      detail:
        "Auth/hosting provider TBD; Stripe for payments when enabled; optional future object storage. Maintain a live subprocessor list for customers when B2B contracts require it — do not invent vendors here.",
      status: "partial",
      evidence: "docs/ENTERPRISE_SECURITY.md",
    },
    {
      id: "dp.export_delete",
      area: "data_processing",
      title: "Export & delete controls",
      detail:
        "Settings export (JSON, no raw video/password hashes). Delete videos and delete account purge paths exist. Privacy policy still draft for legal review.",
      status: "documented",
      evidence: "src/services/privacy · /app/settings · docs/SECURITY.md",
    },
    {
      id: "dp.moat_consent",
      area: "data_processing",
      title: "Aggregates / model improvement consent",
      detail:
        "Data moat architecture is opt-in and flag-gated; no live training pipeline by default.",
      status: "documented",
      evidence: "docs/DATA_MOAT_ARCHITECTURE.md",
    },
    {
      id: "log.admin_audit",
      area: "logging",
      title: "Admin audit log",
      detail:
        "Append-only AdminAuditLog for staff content reviews and similar actions. Not a full SIEM.",
      status: "documented",
      evidence: "AdminAuditLog · /app/admin/audit",
    },
    {
      id: "log.app_observability",
      area: "logging",
      title: "Application observability",
      detail:
        "Observability ring / event adapters are in-progress product surfaces — not enterprise log retention or SIEM export. Do not claim 24×7 SOC monitoring.",
      status: "partial",
      evidence: "docs related to observability (Prompt 155+)",
    },
    {
      id: "log.access_logs",
      area: "logging",
      title: "Edge / access logs",
      detail:
        "HTTP access logs depend on the host (Vercel/Fly/etc.). Retention and export for customer audit packages are host-specific — not claimed in-app.",
      status: "planned",
      evidence: "Host provider",
    },
    {
      id: "bak.runbook",
      area: "backups",
      title: "Backup & restore runbook",
      detail:
        "Documented DB + file + secrets restore checklist. No automated backup cron in-repo. See disaster recovery admin console.",
      status: "documented",
      evidence: "docs/DISASTER_RECOVERY.md · /app/admin/backup-recovery",
    },
    {
      id: "bak.managed",
      area: "backups",
      title: "Managed automated backups",
      detail:
        "Planned with Postgres cutover (provider PITR). RPO/RTO not invented until host selected.",
      status: "planned",
      evidence: "docs/DISASTER_RECOVERY.md",
    },
    {
      id: "ir.severity_tiers",
      area: "incident_response",
      title: "Severity tiers & response outlines",
      detail:
        "S1–S4 in disaster recovery doc (DB loss, media loss, secret leak, host failure). Contact tree and customer notification SLAs for enterprise contracts are not yet formalized.",
      status: "partial",
      evidence: "docs/DISASTER_RECOVERY.md",
    },
    {
      id: "ir.playbook",
      area: "incident_response",
      title: "Formal IR playbook & tabletop",
      detail:
        "No dedicated 24×7 incident commander roster or tabletop cadence claimed. Prepare playbook before enterprise MSAs that require it.",
      status: "planned",
      evidence: "docs/ENTERPRISE_SECURITY.md",
    },
    {
      id: "ir.breach_notify",
      area: "incident_response",
      title: "Breach notification commitments",
      detail:
        "Legal timelines (e.g. GDPR 72h) require counsel-approved process. Do not claim regulatory notification readiness until counsel and runbooks land.",
      status: "planned",
      evidence: "Legal review pending",
    },
  ] as const;
