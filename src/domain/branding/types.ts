/**
 * White-label branding configuration (Prompt 89).
 * Configuration lives here — not hard-coded in UI components.
 * Full white-label product is NOT implemented; resolver returns platform defaults today.
 */

export const BRANDING_ENGINE_VERSION = "white_label.v1" as const;

/** CSS-oriented brand color overrides (optional keys only). */
export type BrandingColors = {
  /** Maps to --color-accent when applied at a future shell boundary. */
  accent: string | null;
  accentForeground: string | null;
  /** Optional page background override — null keeps platform globals. */
  background: string | null;
  foreground: string | null;
};

/**
 * Email branding / template slots — keys only, not a CMS.
 * Bodies stay in code or future template files; this config supplies identity.
 */
export type BrandingEmailTemplateSlot = {
  /** Stable key e.g. password_reset | org_invite | welcome */
  key: string;
  /** Optional subject override; null = platform default subject. */
  subjectOverride: string | null;
};

export type BrandingEmailConfig = {
  fromName: string | null;
  fromAddress: string | null;
  footerText: string | null;
  /** Named slots for future per-tenant subject/footer tweaks — not HTML editors. */
  templateSlots: BrandingEmailTemplateSlot[];
};

export type BrandingDomainConfig = {
  /**
   * Custom hostname reserved for future multi-tenant routing.
   * Middleware must NOT use this until white-label product ships.
   */
  customHostname: string | null;
  /** Optional path co-brand prefix e.g. /p/acme — unused today. */
  pathPrefix: string | null;
};

/**
 * Full branding configuration for a tenant (or platform defaults).
 * Keep this shape free of React / Prisma imports.
 */
export type BrandingConfig = {
  /** Product or customer display name in chrome / email From. */
  displayName: string;
  logoUrl: string | null;
  faviconUrl: string | null;
  colors: BrandingColors;
  domain: BrandingDomainConfig;
  email: BrandingEmailConfig;
  /** True when this config came from a customer profile (vs platform defaults). */
  isWhiteLabel: boolean;
  engineVersion: typeof BRANDING_ENGINE_VERSION;
};

/** Partial overlay stored per organization — merged onto platform defaults. */
export type BrandingConfigOverlay = {
  displayName?: string | null;
  logoUrl?: string | null;
  faviconUrl?: string | null;
  colors?: Partial<BrandingColors> | null;
  domain?: Partial<BrandingDomainConfig> | null;
  email?: Partial<Omit<BrandingEmailConfig, "templateSlots">> & {
    templateSlots?: BrandingEmailTemplateSlot[] | null;
  } | null;
};

export const WHITE_LABEL_HONESTY = [
  "White-label is architecture-ready only — the product still ships as The Strongest branding.",
  "Branding configuration is separated from core UI; components should not hard-code customer logos or colors.",
  "Custom domains and email template CMS are not implemented; stored hostname fields are reserved for later.",
] as const;

/** Template slot keys the platform may honor later. */
export const BRANDING_EMAIL_TEMPLATE_KEYS = [
  "password_reset",
  "org_invite",
  "welcome",
  "billing_receipt",
] as const;
export type BrandingEmailTemplateKey =
  (typeof BRANDING_EMAIL_TEMPLATE_KEYS)[number];
