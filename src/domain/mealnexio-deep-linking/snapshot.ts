import {
  MEALNEXIO_DEEP_LINK_INTENT_LABELS,
  MEALNEXIO_DEEP_LINK_INTENTS,
  MEALNEXIO_DEEP_LINKING_ENGINE_VERSION,
  MEALNEXIO_DEEP_LINKING_HONESTY,
  RECOVERY_NUTRITION_CTA_LABEL,
  RECOVERY_NUTRITION_PROMPT,
  TSM_MEALNEXIO_RETURN_PATH,
} from "@/domain/mealnexio-deep-linking/constants";
import { buildRecoveryNutritionDeepLinkPrompt } from "@/domain/mealnexio-deep-linking/prompt";
import { getMealnexioSsoArchitecture } from "@/domain/mealnexio-deep-linking/sso";
import type { MealnexioDeepLinkingSnapshot } from "@/domain/mealnexio-deep-linking/types";

export function buildMealnexioDeepLinkingSnapshot(
  generatedAt: string = new Date().toISOString(),
): MealnexioDeepLinkingSnapshot {
  const example = buildRecoveryNutritionDeepLinkPrompt();

  return {
    engineVersion: MEALNEXIO_DEEP_LINKING_ENGINE_VERSION,
    honesty: MEALNEXIO_DEEP_LINKING_HONESTY,
    intents: MEALNEXIO_DEEP_LINK_INTENTS.map((id) => ({
      id,
      label: MEALNEXIO_DEEP_LINK_INTENT_LABELS[id],
    })),
    sso: getMealnexioSsoArchitecture(),
    returnProtocol: {
      status: "not_live",
      returnPath: TSM_MEALNEXIO_RETURN_PATH,
      note: "Return handshake accepts mealnexio_return.v1 only when protocol status is ready — default not_live invents nothing.",
    },
    examplePrompt: {
      message: RECOVERY_NUTRITION_PROMPT,
      ctaLabel: RECOVERY_NUTRITION_CTA_LABEL,
    },
    sampleOutboundHref: example.deepLink.href,
    docPath: "docs/MEALNEXIO_DEEP_LINKING.md",
    generatedAt,
  };
}
