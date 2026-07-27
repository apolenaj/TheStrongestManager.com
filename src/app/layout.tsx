import type { Metadata } from "next";
import { DM_Sans, Oswald } from "next/font/google";
import { CookieConsentBanner } from "@/components/gdpr/CookieConsentBanner";
import { WebVitalsReporter } from "@/components/performance/WebVitalsReporter";
import { PwaInstallPrompt } from "@/components/pwa/PwaInstallPrompt";
import { PwaRegister } from "@/components/pwa/PwaRegister";
import { siteConfig } from "@/config/site";
import { t } from "@/domain/i18n";
import "./globals.css";

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

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://thestrongestmanager.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteConfig.name,
    template: `%s · ${siteConfig.name}`,
  },
  description: siteConfig.description,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.description,
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
  },
  robots: {
    index: true,
    follow: true,
  },
  applicationName: siteConfig.name,
  appleWebApp: {
    capable: true,
    title: siteConfig.name,
    statusBarStyle: "black-translucent",
  },
  formatDetection: {
    telephone: false,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${display.variable} ${body.variable} antialiased`}>
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
      </body>
    </html>
  );
}
