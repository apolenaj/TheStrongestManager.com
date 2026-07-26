import {
  MEALNEXIO_DEEP_LINK_INTENT_LABELS,
  MEALNEXIO_DEEP_LINK_QUERY,
  MEALNEXIO_NUTRITION_REVIEW_PATH,
  MEALNEXIO_ORIGIN,
  MEALNEXIO_SSO_DEFAULT_STATUS,
  MEALNEXIO_SSO_STATUS_LABELS,
  TSM_DEEP_LINK_SOURCE,
  type MealnexioSsoStatus,
} from "@/domain/mealnexio-deep-linking/constants";
import type {
  MealnexioDeepLink,
  MealnexioDeepLinkContext,
} from "@/domain/mealnexio-deep-linking/types";

function resolveOrigin(baseOrigin?: string): string {
  const raw = (baseOrigin ?? MEALNEXIO_ORIGIN).trim().replace(/\/$/, "");
  return raw.length > 0 ? raw : MEALNEXIO_ORIGIN;
}

/**
 * Build an outbound Mealnexio deep link with documented TSM context params.
 * Does not attach SSO tokens unless status is explicitly `available`
 * (future infrastructure) — default is never attached.
 */
export function buildMealnexioDeepLink(
  context: MealnexioDeepLinkContext,
  options?: {
    baseOrigin?: string;
    ssoStatus?: MealnexioSsoStatus;
    /** Absolute TSM origin for return URL composition when path-only. */
    tsmOrigin?: string | null;
    /** When false (default until live), omit return URL from query. */
    includeReturnUrl?: boolean;
  },
): MealnexioDeepLink {
  const ssoStatus = options?.ssoStatus ?? MEALNEXIO_SSO_DEFAULT_STATUS;
  const origin = resolveOrigin(options?.baseOrigin);
  const url = new URL(MEALNEXIO_NUTRITION_REVIEW_PATH, `${origin}/`);

  url.searchParams.set(MEALNEXIO_DEEP_LINK_QUERY.source, TSM_DEEP_LINK_SOURCE);
  url.searchParams.set(MEALNEXIO_DEEP_LINK_QUERY.intent, context.intent);

  if (context.prompt?.trim()) {
    url.searchParams.set(
      MEALNEXIO_DEEP_LINK_QUERY.prompt,
      context.prompt.trim().slice(0, 200),
    );
  }

  if (context.ref?.trim()) {
    url.searchParams.set(
      MEALNEXIO_DEEP_LINK_QUERY.ref,
      context.ref.trim().slice(0, 64),
    );
  }

  const includeReturn = options?.includeReturnUrl === true;
  if (includeReturn && context.returnUrl?.trim()) {
    let returnTarget = context.returnUrl.trim();
    if (returnTarget.startsWith("/") && options?.tsmOrigin?.trim()) {
      returnTarget = `${options.tsmOrigin.replace(/\/$/, "")}${returnTarget}`;
    }
    url.searchParams.set(MEALNEXIO_DEEP_LINK_QUERY.returnPath, returnTarget);
  }

  url.searchParams.set(MEALNEXIO_DEEP_LINK_QUERY.sso, ssoStatus);

  const ssoAttached = ssoStatus === "available";

  return {
    href: url.toString(),
    intent: context.intent,
    label: MEALNEXIO_DEEP_LINK_INTENT_LABELS[context.intent],
    ssoAttached,
    ssoStatus,
    honesty: ssoAttached
      ? "SSO status is available — attach tokens only through the shared IdP bridge; never invent sessions."
      : "No SSO session is attached. Opening Mealnexio uses a plain deep link until shared identity infrastructure is configured.",
  };
}
