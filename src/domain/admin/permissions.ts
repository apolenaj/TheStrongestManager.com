/**
 * Admin CMS domain (Prompt 41).
 * Role-based staff access — never expose controls to standard users.
 */

export const ADMIN_ENTITY_TYPES = [
  "exercise",
  "method",
  "article",
  "program_template",
  "academy",
  "research",
  "feature_flag",
  "system",
] as const;
export type AdminEntityType = (typeof ADMIN_ENTITY_TYPES)[number];

export const ADMIN_ACTIONS = [
  "admin.access",
  "content.reviewed",
  "content.note",
  "program.template_note",
  "flags.reviewed",
] as const;
export type AdminAction = (typeof ADMIN_ACTIONS)[number];

export const ADMIN_NAV = [
  { href: "/app/admin", label: "Overview", entity: "system" as const },
  { href: "/app/admin/exercises", label: "Exercises", entity: "exercise" as const },
  { href: "/app/admin/methods", label: "Methods", entity: "method" as const },
  { href: "/app/admin/articles", label: "Articles", entity: "article" as const },
  {
    href: "/app/admin/programs",
    label: "Program templates",
    entity: "program_template" as const,
  },
  { href: "/app/admin/academy", label: "Academy", entity: "academy" as const },
  {
    href: "/app/admin/research",
    label: "Research Library",
    entity: "research" as const,
  },
  {
    href: "/app/admin/research/summarizer",
    label: "AI Research Summarizer",
    entity: "research" as const,
  },
  {
    href: "/app/admin/feature-flags",
    label: "Feature flags",
    entity: "feature_flag" as const,
  },
  {
    href: "/app/admin/verified-lifts",
    label: "Verified lifts",
    entity: "system" as const,
  },
  {
    href: "/app/admin/community-qa",
    label: "Community Q&A",
    entity: "system" as const,
  },
  {
    href: "/app/admin/expert-contributors",
    label: "Expert contributors",
    entity: "system" as const,
  },
  {
    href: "/app/admin/technique-eval",
    label: "Technique eval",
    entity: "system" as const,
  },
  {
    href: "/app/admin/ai-cost",
    label: "AI cost",
    entity: "system" as const,
  },
  {
    href: "/app/admin/ai-router",
    label: "AI router",
    entity: "system" as const,
  },
  {
    href: "/app/admin/ai-observability",
    label: "AI observability",
    entity: "system" as const,
  },
  {
    href: "/app/admin/i18n",
    label: "Internationalization",
    entity: "system" as const,
  },
  {
    href: "/app/admin/unit-system",
    label: "Unit system",
    entity: "system" as const,
  },
  {
    href: "/app/admin/timezone-system",
    label: "Timezone system",
    entity: "system" as const,
  },
  {
    href: "/app/admin/accessibility",
    label: "Accessibility 2.0",
    entity: "system" as const,
  },
  {
    href: "/app/admin/performance",
    label: "Performance 2.0",
    entity: "system" as const,
  },
  {
    href: "/app/admin/database-scale",
    label: "Database scale",
    entity: "system" as const,
  },
  {
    href: "/app/admin/event-driven",
    label: "Event-driven",
    entity: "system" as const,
  },
  {
    href: "/app/admin/observability",
    label: "Observability",
    entity: "system" as const,
  },
  {
    href: "/app/admin/backup-recovery",
    label: "Backup & recovery",
    entity: "system" as const,
  },
  {
    href: "/app/admin/billing-2",
    label: "Billing 2.0",
    entity: "system" as const,
  },
  {
    href: "/app/admin/entitlements",
    label: "Entitlements",
    entity: "system" as const,
  },
  {
    href: "/app/admin/growth-experiments",
    label: "Growth experiments",
    entity: "system" as const,
  },
  {
    href: "/app/admin/activation-metrics",
    label: "Activation metrics",
    entity: "system" as const,
  },
  {
    href: "/app/admin/retention-analytics",
    label: "Retention analytics",
    entity: "system" as const,
  },
  {
    href: "/app/admin/conversion-funnel",
    label: "Conversion funnel",
    entity: "system" as const,
  },
  {
    href: "/app/admin/user-segmentation",
    label: "User segmentation",
    entity: "system" as const,
  },
  {
    href: "/app/admin/personalized-homepage",
    label: "Personalized homepage",
    entity: "system" as const,
  },
  {
    href: "/app/admin/programmatic-seo-safety",
    label: "Programmatic SEO",
    entity: "system" as const,
  },
  {
    href: "/app/admin/exercise-comparison",
    label: "Exercise comparison",
    entity: "system" as const,
  },
  {
    href: "/app/admin/sport-goal-landings",
    label: "Sport goal landings",
    entity: "system" as const,
  },
  {
    href: "/app/admin/calculator-suite",
    label: "Calculator suite",
    entity: "system" as const,
  },
  {
    href: "/app/admin/technique-check",
    label: "Technique check funnel",
    entity: "system" as const,
  },
  {
    href: "/app/admin/program-audit",
    label: "Program audit funnel",
    entity: "system" as const,
  },
  {
    href: "/app/admin/athlete-assessment",
    label: "Athlete assessment funnel",
    entity: "system" as const,
  },
  {
    href: "/app/admin/on-site-education",
    label: "On-site education",
    entity: "system" as const,
  },
  {
    href: "/app/admin/micro-learning",
    label: "Micro-learning",
    entity: "system" as const,
  },
  {
    href: "/app/admin/certificate-verification",
    label: "Certificate verification",
    entity: "system" as const,
  },
  {
    href: "/app/admin/enterprise-security",
    label: "Enterprise security",
    entity: "system" as const,
  },
  {
    href: "/app/admin/gdpr-readiness",
    label: "GDPR readiness",
    entity: "system" as const,
  },
  {
    href: "/app/admin/video-privacy",
    label: "Video privacy",
    entity: "system" as const,
  },
  {
    href: "/app/admin/model-improvement-consent",
    label: "Model improvement consent",
    entity: "system" as const,
  },
  {
    href: "/app/admin/safety-system",
    label: "Safety System 2.0",
    entity: "system" as const,
  },
  {
    href: "/app/admin/red-team-ai-coach",
    label: "Red Team AI Coach",
    entity: "system" as const,
  },
  {
    href: "/app/admin/product-trust-audit",
    label: "Product Trust Audit",
    entity: "system" as const,
  },
  {
    href: "/app/admin/mobile-workout",
    label: "Mobile workout",
    entity: "system" as const,
  },
  {
    href: "/app/admin/pwa-readiness",
    label: "PWA readiness",
    entity: "system" as const,
  },
  {
    href: "/app/admin/wearable-integration",
    label: "Wearable integration",
    entity: "system" as const,
  },
  {
    href: "/app/admin/device-data-normalization",
    label: "Device data normalization",
    entity: "system" as const,
  },
  {
    href: "/app/admin/mealnexio-deep-linking",
    label: "Mealnexio deep linking",
    entity: "system" as const,
  },
  {
    href: "/app/admin/command-center",
    label: "Command Center",
    entity: "system" as const,
  },
  {
    href: "/app/admin/custom-dashboards",
    label: "Custom dashboards",
    entity: "system" as const,
  },
  {
    href: "/app/admin/command-palette",
    label: "Command palette",
    entity: "system" as const,
  },
  {
    href: "/app/admin/universal-timeline",
    label: "Universal timeline",
    entity: "system" as const,
  },
  {
    href: "/app/admin/performance-story",
    label: "Performance Story",
    entity: "system" as const,
  },
  {
    href: "/app/admin/year-in-review",
    label: "Year in Review",
    entity: "system" as const,
  },
  {
    href: "/app/admin/social-graph",
    label: "Social graph prep",
    entity: "system" as const,
  },
  {
    href: "/app/admin/activity-feed",
    label: "Activity Feed MVP",
    entity: "system" as const,
  },
  {
    href: "/app/admin/live-competition",
    label: "Live Competition Mode",
    entity: "system" as const,
  },
  {
    href: "/app/admin/warmup-generator",
    label: "Warm-up generator",
    entity: "system" as const,
  },
  {
    href: "/app/admin/session-readiness",
    label: "Session readiness",
    entity: "system" as const,
  },
  {
    href: "/app/admin/live-session-autoregulation",
    label: "Live session autoregulation",
    entity: "system" as const,
  },
  { href: "/app/admin/audit", label: "Audit log", entity: "system" as const },
] as const;

export const ADMIN_HONESTY = [
  "Admin routes are enforced server-side. Non-admins receive a not-found response — controls are never shown in athlete navigation.",
  "Feature flags are environment-configured today; this console shows live values and records review audits, not silent client toggles.",
  "Catalog content (exercises, methods, articles, academy) is code-backed; admin notes and reviews are audited for change management.",
] as const;

export function isAdminAction(value: string): value is AdminAction {
  return (ADMIN_ACTIONS as readonly string[]).includes(value);
}

export function isAdminEntityType(value: string): value is AdminEntityType {
  return (ADMIN_ENTITY_TYPES as readonly string[]).includes(value);
}
