import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { DM_Sans, Oswald } from "next/font/google";
import { CookieConsentBanner } from "@/components/gdpr/CookieConsentBanner";
import { WebVitalsReporter } from "@/components/performance/WebVitalsReporter";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { t } from "@/domain/i18n";
import { routing } from "@/i18n/routing";

/** Athletic condensed display for headings / brand marks. */
const display = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

/** Clean readable sans for body UI. */
const body = DM_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

type LocaleLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={`${display.variable} ${body.variable} antialiased`}>
        <NextIntlClientProvider messages={messages}>
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[var(--z-modal)] focus:rounded-[var(--radius-sm)] focus:bg-[var(--color-accent)] focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-[var(--color-background)]"
          >
            {t("a11y.skipToContent")}
          </a>
          {children}
          <CookieConsentBanner />
          <WebVitalsReporter />
          <PwaRegister />
          <PwaInstallPrompt />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
