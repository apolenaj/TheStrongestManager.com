import { EN_MESSAGES } from "@/domain/i18n/messages/en";
import type { LocaleId, MessageCatalog } from "@/domain/i18n/types";

/**
 * Planned locales start empty — coverage is 0 until catalogs are authored
 * and terminology is reviewed. Never invent machine translations here.
 */
export const MESSAGE_CATALOGS: Record<LocaleId, MessageCatalog> = {
  en: EN_MESSAGES,
  cs: {},
  de: {},
  es: {},
  ar: {},
};

export function getMessageCatalog(locale: LocaleId): MessageCatalog {
  return MESSAGE_CATALOGS[locale];
}
