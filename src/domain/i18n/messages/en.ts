import type { MessageCatalog } from "@/domain/i18n/types";

/**
 * English message catalog — source of truth for user-facing copy
 * that has been migrated onto the i18n architecture.
 * Add keys here; do not hard-code the same strings in UI.
 */
export const EN_MESSAGES = {
  "a11y.skipToContent": "Skip to content",

  "common.loading": "Loading…",
  "common.save": "Save",
  "common.cancel": "Cancel",
  "common.close": "Close",
  "common.error": "Something went wrong. Try again.",
  "common.comingSoon": "Coming soon",
  "common.learnMore": "Learn more",

  "locale.en": "English",
  "locale.cs": "Czech",
  "locale.de": "German",
  "locale.es": "Spanish",
  "locale.ar": "Arabic",
  "locale.active": "Active",
  "locale.planned": "Planned",
  "locale.direction.ltr": "Left to right",
  "locale.direction.rtl": "Right to left",

  "i18n.admin.title": "Internationalization",
  "i18n.admin.subtitle":
    "Message catalogs and terminology review for multilingual expansion. English is active; other locales are planned shells.",
  "i18n.admin.engine": "Engine {version}",
  "i18n.admin.defaultLocale": "Default locale",
  "i18n.admin.englishKeys": "English message keys",
  "i18n.admin.terminology": "Terminology entries",
  "i18n.admin.readiness": "Locale readiness",
  "i18n.admin.coverage": "UI message coverage",
  "i18n.admin.termReviewed": "Terminology reviewed",
  "i18n.admin.termPending": "Terminology pending review",
  "i18n.admin.honestyTitle": "Honesty",
  "i18n.admin.noAutoTranslate":
    "Technical fitness terms are never auto-translated. They stay in English until a human review lands in the glossary.",
  "i18n.admin.flagOffTitle": "Internationalization",
  "i18n.admin.flagOffDescription":
    "The i18n architecture console is not enabled yet.",
  "i18n.admin.flagOffReason":
    "Set NEXT_PUBLIC_FF_I18N=true to inspect locale readiness and terminology review status.",

  "i18n.rule.noHardcoded":
    "User-facing strings must use message keys via t() — not hard-coded literals in components.",
  "i18n.rule.terminologyReview":
    "Do not automatically translate technical fitness terminology without review.",
} as const satisfies MessageCatalog;

export type EnMessageKey = keyof typeof EN_MESSAGES;
