import type {
  MealnexioDeepLinkIntent,
  MealnexioReturnProtocolStatus,
  MealnexioSsoStatus,
} from "@/domain/mealnexio-deep-linking/constants";
import type { NutritionDailySummary } from "@/domain/nutrition";

export type MealnexioDeepLinkContext = {
  intent: MealnexioDeepLinkIntent;
  /** Short coaching prompt for Mealnexio context (not a diagnosis). */
  prompt?: string;
  /** Opaque correlation id for round-trip when return protocol is live. */
  ref?: string | null;
  /**
   * Absolute or path return URL Mealnexio may use later.
   * Omitted from outbound query when return protocol is not live.
   */
  returnUrl?: string | null;
};

export type MealnexioDeepLink = {
  href: string;
  intent: MealnexioDeepLinkIntent;
  label: string;
  /** True only when SSO status is available AND infrastructure would attach a token — never today by default. */
  ssoAttached: boolean;
  ssoStatus: MealnexioSsoStatus;
  honesty: string;
};

/**
 * Coaching CTA shown in TSM when recovery may be nutrition-limited.
 * Does not claim measured intake deficits.
 */
export type RecoveryNutritionDeepLinkPrompt = {
  message: string;
  ctaLabel: string;
  deepLink: MealnexioDeepLink;
  caveat: string;
};

/**
 * Structured return from Mealnexio — accepted only when protocol is live
 * and payload validates. Never invent fields.
 */
export type MealnexioReturnPayload = {
  /** Protocol version Mealnexio would send. */
  version: "mealnexio_return.v1";
  ref: string | null;
  summary: NutritionDailySummary;
  /** Optional signature when HMAC secret exists — ignored until live. */
  signature?: string | null;
};

export type MealnexioReturnAcceptResult =
  | {
      ok: true;
      summary: NutritionDailySummary;
      ref: string | null;
    }
  | {
      ok: false;
      reason:
        | "protocol_not_live"
        | "invalid_payload"
        | "missing_summary"
        | "signature_required";
      detail: string;
    };

export type MealnexioSsoArchitecture = {
  status: MealnexioSsoStatus;
  statusLabel: string;
  /** Planned model when infrastructure allows. */
  plannedModel: "oidc_authorization_code";
  note: string;
  futureEnvKeys: readonly string[];
};

export type MealnexioDeepLinkingSnapshot = {
  engineVersion: string;
  honesty: readonly string[];
  intents: Array<{ id: MealnexioDeepLinkIntent; label: string }>;
  sso: MealnexioSsoArchitecture;
  returnProtocol: {
    status: MealnexioReturnProtocolStatus;
    returnPath: string;
    note: string;
  };
  examplePrompt: {
    message: string;
    ctaLabel: string;
  };
  sampleOutboundHref: string;
  docPath: "docs/MEALNEXIO_DEEP_LINKING.md";
  generatedAt: string;
};
