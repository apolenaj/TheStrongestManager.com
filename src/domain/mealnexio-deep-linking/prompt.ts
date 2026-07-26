import {
  RECOVERY_NUTRITION_CTA_LABEL,
  RECOVERY_NUTRITION_PROMPT,
  TSM_MEALNEXIO_RETURN_PATH,
  type MealnexioSsoStatus,
} from "@/domain/mealnexio-deep-linking/constants";
import { buildMealnexioDeepLink } from "@/domain/mealnexio-deep-linking/deep-link";
import type { RecoveryNutritionDeepLinkPrompt } from "@/domain/mealnexio-deep-linking/types";

/**
 * TheStrongestManager recovery → Mealnexio CTA.
 * Message is a coaching prompt, not a measured intake claim.
 */
export function buildRecoveryNutritionDeepLinkPrompt(options?: {
  baseOrigin?: string;
  ssoStatus?: MealnexioSsoStatus;
  ref?: string | null;
  tsmOrigin?: string | null;
  includeReturnUrl?: boolean;
}): RecoveryNutritionDeepLinkPrompt {
  const deepLink = buildMealnexioDeepLink(
    {
      intent: "nutrition_review",
      prompt: RECOVERY_NUTRITION_PROMPT,
      ref: options?.ref ?? null,
      returnUrl: TSM_MEALNEXIO_RETURN_PATH,
    },
    {
      baseOrigin: options?.baseOrigin,
      ssoStatus: options?.ssoStatus,
      tsmOrigin: options?.tsmOrigin,
      includeReturnUrl: options?.includeReturnUrl === true,
    },
  );

  return {
    message: RECOVERY_NUTRITION_PROMPT,
    ctaLabel: RECOVERY_NUTRITION_CTA_LABEL,
    deepLink,
    caveat:
      "This prompt invites a nutrition review in Mealnexio. It is not a diagnosis, calorie target, or proof that intake is insufficient.",
  };
}
