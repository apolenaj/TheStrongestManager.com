/**
 * Branding resolution stub (Prompt 89).
 * Does not implement white-label product — returns platform defaults unless
 * a draft BrandingProfile exists and the whiteLabel flag is on.
 */

import { featureFlags } from "@/config/feature-flags";
import {
  getPlatformBrandingDefaults,
  mergeBrandingConfig,
  parseBrandingColorsJson,
  parseBrandingEmailJson,
  type BrandingConfig,
  type BrandingConfigOverlay,
} from "@/domain/branding";
import { prisma } from "@/lib/db";

/**
 * Resolve branding for an optional organization.
 * Custom domain is never applied to routing here.
 */
export async function resolveBranding(input?: {
  organizationId?: string | null;
}): Promise<BrandingConfig> {
  const organizationId = input?.organizationId?.trim() || null;

  if (!featureFlags.whiteLabel || !organizationId) {
    return getPlatformBrandingDefaults();
  }

  const profile = await prisma.brandingProfile.findUnique({
    where: { organizationId },
  });

  if (!profile || profile.status === "archived") {
    return getPlatformBrandingDefaults();
  }

  const overlay: BrandingConfigOverlay = {
    displayName: profile.displayName,
    logoUrl: profile.logoUrl,
    faviconUrl: profile.faviconUrl,
    colors: parseBrandingColorsJson(profile.colorsJson),
    domain: {
      customHostname: profile.customHostname,
      pathPrefix: profile.pathPrefix,
    },
    email: parseBrandingEmailJson(profile.emailJson),
  };

  return mergeBrandingConfig(overlay);
}
