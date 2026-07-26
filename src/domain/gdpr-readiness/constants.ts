/**
 * GDPR Readiness (Prompt 177).
 * Supporting workflows — not a claim of GDPR certification or counsel-approved compliance.
 */

export const GDPR_ENGINE_VERSION = "gdpr_readiness.v1" as const;

export const GDPR_HONESTY = [
  "These workflows support GDPR-style rights (consent, export, deletion, transparency). They are not a legal certification that the product is “GDPR compliant.”",
  "Privacy, Terms, and Cookie pages remain Draft — for professional legal review until counsel replaces them.",
  "Do not tell customers or authorities that counsel has approved policies when the draft banners are still present.",
  "Breach notification timelines (e.g. 72 hours) require a formal incident process — see Enterprise Security Prep; not claimed ready here.",
  "Retention periods below are product intentions — confirm with counsel before publishing as binding policy.",
] as const;

export const LEGAL_REVIEW_BANNER =
  "Draft — for professional legal review. Not counsel-approved. Not legal advice." as const;

export const COOKIE_CONSENT_COOKIE = "tsm_cookie_consent" as const;
export const COOKIE_CONSENT_VERSION = 1 as const;

export type CookieCategoryId = "essential" | "functional" | "analytics";

export type CookieConsentState = {
  version: typeof COOKIE_CONSENT_VERSION;
  essential: true;
  functional: boolean;
  analytics: boolean;
  /** ISO time when the user made a choice; null = undecided (show banner). */
  decidedAt: string | null;
};

export const DEFAULT_COOKIE_CONSENT: CookieConsentState = {
  version: COOKIE_CONSENT_VERSION,
  essential: true,
  functional: false,
  analytics: false,
  decidedAt: null,
};

export const COOKIE_CATEGORIES: readonly {
  id: CookieCategoryId;
  title: string;
  description: string;
  required: boolean;
  examples: string;
}[] = [
  {
    id: "essential",
    title: "Essential",
    description:
      "Required to sign in, keep sessions secure, and remember this cookie choice. Always on.",
    required: true,
    examples: "Auth.js session · CSRF · tsm_cookie_consent",
  },
  {
    id: "functional",
    title: "Functional / preferences",
    description:
      "Optional sticky preferences such as anonymous growth-experiment assignment cookies. Off until you opt in.",
    required: false,
    examples: "ts_gid · ts_exp_* (when growth experiments run)",
  },
  {
    id: "analytics",
    title: "Analytics / performance beacons",
    description:
      "Optional performance vitals beacons and similar non-essential measurement. Off until you opt in. No advertising network is claimed here.",
    required: false,
    examples: "Web Vitals beacon to /api/vitals (when enabled)",
  },
] as const;

export const GDPR_WORKFLOW_AREAS = [
  "consent",
  "export",
  "deletion",
  "data_processing",
  "cookie_controls",
  "retention",
  "legal_review",
] as const;

export type GdprWorkflowAreaId = (typeof GDPR_WORKFLOW_AREAS)[number];

export type GdprWorkflowStatus =
  | "ready"
  | "partial"
  | "planned"
  | "legal_review_required";

export type GdprWorkflow = {
  id: string;
  area: GdprWorkflowAreaId;
  title: string;
  detail: string;
  status: GdprWorkflowStatus;
  athletePath: string | null;
  evidence: string;
};

export const GDPR_WORKFLOWS: readonly GdprWorkflow[] = [
  {
    id: "consent.technique",
    area: "consent",
    title: "Technique upload consent",
    detail:
      "Athletes must tick consent before technique video analysis. Separate from cookie banner.",
    status: "ready",
    athletePath: "/app/technique",
    evidence: "TechniqueUploadWizard consent checkbox",
  },
  {
    id: "consent.coach_scopes",
    area: "consent",
    title: "Coach sensitive-scope grants",
    detail:
      "Recovery and detailed body metrics stay opt-in via CoachAthleteAccess scopes.",
    status: "ready",
    athletePath: "/app/settings",
    evidence: "CoachAccessSettings",
  },
  {
    id: "consent.data_moat",
    area: "consent",
    title: "Data-moat aggregate opt-in",
    detail:
      "Model-improvement aggregates require explicit opt-in; flag default off; no live pipeline by default.",
    status: "partial",
    athletePath: "/app/settings",
    evidence: "DataMoatConsent · docs/DATA_MOAT_ARCHITECTURE.md",
  },
  {
    id: "consent.cookies",
    area: "consent",
    title: "Cookie preference consent",
    detail:
      "Banner + /cookies controls for essential / functional / analytics. Essential always on.",
    status: "ready",
    athletePath: "/cookies",
    evidence: "CookieConsentBanner · tsm_cookie_consent",
  },
  {
    id: "export.json",
    area: "export",
    title: "JSON data export (portability)",
    detail:
      "Settings → Export my data. Omits password hashes, storage keys, raw video bytes, and other users’ data.",
    status: "ready",
    athletePath: "/app/settings",
    evidence: "src/services/privacy/export-service.ts",
  },
  {
    id: "deletion.videos",
    area: "deletion",
    title: "Delete technique videos",
    detail: "Bulk delete from Settings; per-analysis delete from Technique.",
    status: "ready",
    athletePath: "/app/settings",
    evidence: "deleteAllVideosAction · purge-media",
  },
  {
    id: "deletion.account",
    area: "deletion",
    title: "Delete account",
    detail:
      "Password-confirmed account deletion purges technique media then removes the User row (cascade).",
    status: "ready",
    athletePath: "/app/settings",
    evidence: "deleteAccountAction · account-service",
  },
  {
    id: "deletion.scheduled_ttl",
    area: "deletion",
    title: "Scheduled retention purge jobs",
    detail:
      "No automatic soft-delete TTL worker yet — soft-deleted technique rows are not auto-purged on a schedule.",
    status: "planned",
    athletePath: null,
    evidence: "docs/DISASTER_RECOVERY.md video retention",
  },
  {
    id: "dp.inventory",
    area: "data_processing",
    title: "Processing activity inventory",
    detail:
      "Catalog of purposes / categories for transparency — product documentation pending counsel DPA language.",
    status: "partial",
    athletePath: "/privacy",
    evidence: "GDPR_PROCESSING_ACTIVITIES · docs/GDPR_READINESS.md",
  },
  {
    id: "cookies.policy",
    area: "cookie_controls",
    title: "Cookie policy page",
    detail: "/cookies — draft marked for professional legal review.",
    status: "legal_review_required",
    athletePath: "/cookies",
    evidence: "src/app/(marketing)/cookies/page.tsx",
  },
  {
    id: "cookies.gating",
    area: "cookie_controls",
    title: "Non-essential cookie gating",
    detail:
      "Growth-experiment sticky cookies require functional consent when GDPR readiness flag is on. Vitals beacon requires analytics consent.",
    status: "ready",
    athletePath: "/cookies",
    evidence: "growth-experiments · WebVitalsReporter",
  },
  {
    id: "retention.schedule",
    area: "retention",
    title: "Retention schedule (intentions)",
    detail:
      "Documented intentions for account, logs, media, backups — confirm with counsel before binding customers.",
    status: "legal_review_required",
    athletePath: "/privacy",
    evidence: "GDPR_RETENTION_INTENTIONS",
  },
  {
    id: "legal.privacy_terms",
    area: "legal_review",
    title: "Privacy & Terms drafts",
    detail:
      "/privacy and /terms show Draft — for professional legal review banners. Not counsel-approved.",
    status: "legal_review_required",
    athletePath: "/privacy",
    evidence: "LEGAL_REVIEW_BANNER",
  },
] as const;

/** Illustrative processing activities — not a counsel-approved RoPA. */
export const GDPR_PROCESSING_ACTIVITIES: readonly {
  id: string;
  purpose: string;
  categories: string;
  legalBasisNote: string;
}[] = [
  {
    id: "account",
    purpose: "Provide and secure user accounts",
    categories: "Email, auth credentials/OAuth links, session data",
    legalBasisNote:
      "Typically contract / legitimate interest — confirm with counsel",
  },
  {
    id: "training",
    purpose: "Deliver training programs and progress tools",
    categories: "Athlete profile, sessions, sets, goals, PRs",
    legalBasisNote: "Typically contract — confirm with counsel",
  },
  {
    id: "technique",
    purpose: "Private technique analysis of uploaded video",
    categories: "Video files, analysis metadata, scores",
    legalBasisNote: "Consent at upload + contract — confirm with counsel",
  },
  {
    id: "coaching",
    purpose: "Coach Mode collaboration under athlete grants",
    categories: "Shared training views; opt-in recovery/body scopes",
    legalBasisNote: "Consent / contract via grants — confirm with counsel",
  },
  {
    id: "billing",
    purpose: "Paid plans via Stripe when enabled",
    categories: "Subscription metadata (no PAN stored in our DB)",
    legalBasisNote: "Contract — confirm with counsel",
  },
  {
    id: "academy",
    purpose: "Academy learning progress and Certificates of Completion",
    categories: "Enrollments, quiz attempts, certificate codes",
    legalBasisNote: "Contract — confirm with counsel",
  },
] as const;

/** Product retention intentions — not binding until legal review. */
export const GDPR_RETENTION_INTENTIONS: readonly {
  id: string;
  asset: string;
  intention: string;
}[] = [
  {
    id: "account_active",
    asset: "Active account data",
    intention: "Kept while the account exists; deleted on account deletion.",
  },
  {
    id: "technique_active",
    asset: "Technique videos (active)",
    intention:
      "Kept until athlete deletes the analysis/videos or deletes the account.",
  },
  {
    id: "technique_soft",
    asset: "Soft-deleted technique rows",
    intention:
      "No automated purge job yet — define a counsel-approved window before coding TTL.",
  },
  {
    id: "admin_audit",
    asset: "Admin audit logs",
    intention:
      "Append-only operational logs; cold-archive policy TBD (see database scale docs).",
  },
  {
    id: "backups",
    asset: "Ops backups",
    intention:
      "Follow DISASTER_RECOVERY.md; encrypted backups outside git; align retention with counsel.",
  },
] as const;

export const LEGAL_CONTENT_SURFACES: readonly {
  path: string;
  title: string;
  reviewStatus: "draft_for_legal_review";
}[] = [
  {
    path: "/privacy",
    title: "Privacy Policy",
    reviewStatus: "draft_for_legal_review",
  },
  {
    path: "/terms",
    title: "Terms of Use",
    reviewStatus: "draft_for_legal_review",
  },
  {
    path: "/cookies",
    title: "Cookie Policy",
    reviewStatus: "draft_for_legal_review",
  },
] as const;

export function parseCookieConsent(
  raw: string | undefined | null,
): CookieConsentState {
  if (!raw) return { ...DEFAULT_COOKIE_CONSENT };
  try {
    const parsed = JSON.parse(raw) as Partial<CookieConsentState>;
    return {
      version: COOKIE_CONSENT_VERSION,
      essential: true,
      functional: Boolean(parsed.functional),
      analytics: Boolean(parsed.analytics),
      decidedAt:
        typeof parsed.decidedAt === "string" ? parsed.decidedAt : null,
    };
  } catch {
    return { ...DEFAULT_COOKIE_CONSENT };
  }
}

export function serializeCookieConsent(state: CookieConsentState): string {
  return JSON.stringify({
    version: COOKIE_CONSENT_VERSION,
    essential: true,
    functional: state.functional,
    analytics: state.analytics,
    decidedAt: state.decidedAt,
  });
}

export function hasDecidedCookieConsent(state: CookieConsentState): boolean {
  return Boolean(state.decidedAt);
}
