import {
  MEALNEXIO_DEEP_LINK_FUTURE_ENV_KEYS,
  MEALNEXIO_SSO_DEFAULT_STATUS,
  MEALNEXIO_SSO_STATUS_LABELS,
  type MealnexioSsoStatus,
} from "@/domain/mealnexio-deep-linking/constants";
import type { MealnexioSsoArchitecture } from "@/domain/mealnexio-deep-linking/types";

/**
 * SSO architecture snapshot — reserved for future shared identity.
 * Never claims a live SSO session in this build.
 */
export function getMealnexioSsoArchitecture(
  status: MealnexioSsoStatus = MEALNEXIO_SSO_DEFAULT_STATUS,
): MealnexioSsoArchitecture {
  return {
    status,
    statusLabel: MEALNEXIO_SSO_STATUS_LABELS[status],
    plannedModel: "oidc_authorization_code",
    note:
      status === "available"
        ? "SSO marked available — use OIDC authorization code with shared IdP; still do not invent sessions without a real token exchange."
        : "Cross-product SSO will use OIDC-style authorization when shared identity infrastructure exists. Status is not_configured until then.",
    futureEnvKeys: MEALNEXIO_DEEP_LINK_FUTURE_ENV_KEYS,
  };
}
