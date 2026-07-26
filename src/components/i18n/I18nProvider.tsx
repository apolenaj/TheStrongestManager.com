"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from "react";
import {
  DEFAULT_LOCALE,
  getLocaleDefinition,
  t as translate,
  type LocaleId,
  type MessageKey,
  type MessageParams,
} from "@/domain/i18n";

type I18nContextValue = {
  locale: LocaleId;
  bcp47: string;
  textDirection: "ltr" | "rtl";
  t: (key: MessageKey, params?: MessageParams) => string;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale = DEFAULT_LOCALE,
  children,
}: {
  locale?: LocaleId;
  children: ReactNode;
}) {
  const def = getLocaleDefinition(locale);
  const t = useCallback(
    (key: MessageKey, params?: MessageParams) => translate(key, locale, params),
    [locale],
  );
  const value = useMemo<I18nContextValue>(
    () => ({
      locale,
      bcp47: def.bcp47,
      textDirection: def.textDirection,
      t,
    }),
    [locale, def.bcp47, def.textDirection, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    return {
      locale: DEFAULT_LOCALE,
      bcp47: "en-US",
      textDirection: "ltr",
      t: (key, params) => translate(key, DEFAULT_LOCALE, params),
    };
  }
  return ctx;
}
