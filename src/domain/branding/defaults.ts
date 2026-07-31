/**
 * Platform defaults + pure merge — no DB, no React.
 */

import { siteConfig } from "@/config/site";
import {
  BRANDING_ENGINE_VERSION,
  type BrandingConfig,
  type BrandingConfigOverlay,
  type BrandingColors,
  type BrandingDomainConfig,
  type BrandingEmailConfig,
} from "@/domain/branding/types";

const EMPTY_COLORS: BrandingColors = {
  accent: null,
  accentForeground: null,
  background: null,
  foreground: null,
};

const EMPTY_DOMAIN: BrandingDomainConfig = {
  customHostname: null,
  pathPrefix: null,
};

/**
 * Canonical platform branding (The Strongest).
 * Sourced from siteConfig — not duplicated in layout components.
 */
export function getPlatformBrandingDefaults(): BrandingConfig {
  return {
    displayName: siteConfig.name,
    logoUrl: null,
    faviconUrl: null,
    colors: { ...EMPTY_COLORS },
    domain: {
      customHostname: null,
      pathPrefix: null,
    },
    email: {
      fromName: siteConfig.name,
      fromAddress: null,
      footerText: null,
      templateSlots: [],
    },
    isWhiteLabel: false,
    engineVersion: BRANDING_ENGINE_VERSION,
  };
}

function mergeColors(
  base: BrandingColors,
  overlay: Partial<BrandingColors> | null | undefined,
): BrandingColors {
  if (!overlay) return { ...base };
  return {
    accent: overlay.accent !== undefined ? overlay.accent : base.accent,
    accentForeground:
      overlay.accentForeground !== undefined
        ? overlay.accentForeground
        : base.accentForeground,
    background:
      overlay.background !== undefined ? overlay.background : base.background,
    foreground:
      overlay.foreground !== undefined ? overlay.foreground : base.foreground,
  };
}

function mergeDomain(
  base: BrandingDomainConfig,
  overlay: Partial<BrandingDomainConfig> | null | undefined,
): BrandingDomainConfig {
  if (!overlay) return { ...base };
  return {
    customHostname:
      overlay.customHostname !== undefined
        ? overlay.customHostname
        : base.customHostname,
    pathPrefix:
      overlay.pathPrefix !== undefined ? overlay.pathPrefix : base.pathPrefix,
  };
}

function mergeEmail(
  base: BrandingEmailConfig,
  overlay: BrandingConfigOverlay["email"],
): BrandingEmailConfig {
  if (!overlay) return { ...base, templateSlots: [...base.templateSlots] };
  return {
    fromName: overlay.fromName !== undefined ? overlay.fromName : base.fromName,
    fromAddress:
      overlay.fromAddress !== undefined ? overlay.fromAddress : base.fromAddress,
    footerText:
      overlay.footerText !== undefined ? overlay.footerText : base.footerText,
    templateSlots:
      overlay.templateSlots != null
        ? [...overlay.templateSlots]
        : [...base.templateSlots],
  };
}

/**
 * Merge a customer overlay onto platform defaults.
 * Empty / null overlay → platform branding (isWhiteLabel false).
 */
export function mergeBrandingConfig(
  overlay: BrandingConfigOverlay | null | undefined,
): BrandingConfig {
  const base = getPlatformBrandingDefaults();
  if (!overlay) return base;

  const hasIdentity =
    Boolean(overlay.displayName?.trim()) ||
    Boolean(overlay.logoUrl?.trim()) ||
    Boolean(overlay.colors?.accent) ||
    Boolean(overlay.domain?.customHostname) ||
    Boolean(overlay.email?.fromName);

  return {
    displayName: overlay.displayName?.trim() || base.displayName,
    logoUrl:
      overlay.logoUrl !== undefined ? overlay.logoUrl : base.logoUrl,
    faviconUrl:
      overlay.faviconUrl !== undefined ? overlay.faviconUrl : base.faviconUrl,
    colors: mergeColors(base.colors, overlay.colors),
    domain: mergeDomain(base.domain, overlay.domain),
    email: mergeEmail(base.email, overlay.email),
    isWhiteLabel: hasIdentity,
    engineVersion: BRANDING_ENGINE_VERSION,
  };
}

/**
 * CSS custom property map for a future org shell — not applied automatically.
 * Core layouts keep globals.css until white-label product ships.
 */
export function brandingColorsToCssVars(
  colors: BrandingColors,
): Record<string, string> {
  const vars: Record<string, string> = {};
  if (colors.accent) vars["--color-accent"] = colors.accent;
  if (colors.accentForeground) {
    vars["--color-accent-foreground"] = colors.accentForeground;
  }
  if (colors.background) vars["--color-background"] = colors.background;
  if (colors.foreground) vars["--color-foreground"] = colors.foreground;
  return vars;
}

/** Parse stored colorsJson — invalid JSON → empty overrides. */
export function parseBrandingColorsJson(
  raw: string | null | undefined,
): Partial<BrandingColors> {
  if (!raw || raw.trim() === "" || raw === "{}") return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};
    const o = parsed as Record<string, unknown>;
    const out: Partial<BrandingColors> = {};
    for (const key of [
      "accent",
      "accentForeground",
      "background",
      "foreground",
    ] as const) {
      if (typeof o[key] === "string" || o[key] === null) {
        out[key] = o[key] as string | null;
      }
    }
    return out;
  } catch {
    return {};
  }
}

export function parseBrandingEmailJson(
  raw: string | null | undefined,
): BrandingConfigOverlay["email"] {
  if (!raw || raw.trim() === "" || raw === "{}") return null;
  try {
    const parsed = JSON.parse(raw) as BrandingConfigOverlay["email"];
    return parsed && typeof parsed === "object" ? parsed : null;
  } catch {
    return null;
  }
}
