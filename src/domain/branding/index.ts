export type {
  BrandingColors,
  BrandingEmailTemplateSlot,
  BrandingEmailConfig,
  BrandingDomainConfig,
  BrandingConfig,
  BrandingConfigOverlay,
  BrandingEmailTemplateKey,
} from "@/domain/branding/types";
export {
  BRANDING_ENGINE_VERSION,
  WHITE_LABEL_HONESTY,
  BRANDING_EMAIL_TEMPLATE_KEYS,
} from "@/domain/branding/types";

export {
  getPlatformBrandingDefaults,
  mergeBrandingConfig,
  brandingColorsToCssVars,
  parseBrandingColorsJson,
  parseBrandingEmailJson,
} from "@/domain/branding/defaults";
