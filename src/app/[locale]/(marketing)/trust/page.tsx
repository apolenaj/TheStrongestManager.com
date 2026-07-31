import type { Metadata } from "next";
import Link from "next/link";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { TrustCenterSections } from "@/components/trust-center/TrustCenterSections";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Alert, ButtonLink } from "@/design-system";
import {
  TRUST_CENTER_INTRO,
  TRUST_CENTER_TAGLINE,
  getTrustCenterSections,
} from "@/domain/trust-center";
import { featureFlags } from "@/config/feature-flags";
import { siteConfig } from "@/config/site";

export const metadata: Metadata = {
  title: "Trust Center",
  description: TRUST_CENTER_TAGLINE,
  alternates: { canonical: "/trust" },
  openGraph: {
    title: "Trust Center — TheStrongest",
    description: TRUST_CENTER_TAGLINE,
    url: "/trust",
    type: "website",
  },
};

export default function TrustCenterPage() {
  if (!featureFlags.trustCenter) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Trust Center"
          description="The public Trust Center is not enabled yet."
        />
      </MarketingContainer>
    );
  }

  const sections = getTrustCenterSections();

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: "Trust Center",
    description: TRUST_CENTER_TAGLINE,
    url: `https://${siteConfig.domain}/trust`,
    isPartOf: {
      "@type": "WebSite",
      name: siteConfig.name,
      url: `https://${siteConfig.domain}`,
    },
  };

  return (
    <MarketingContainer>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="relative overflow-hidden rounded-[var(--radius-lg)]">
        <div
          aria-hidden
          className="trust-hero-wash pointer-events-none absolute inset-0 -z-10"
        />
        <header className="trust-hero mx-auto grid max-w-3xl gap-5 py-10 md:py-14">
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted)]">
            Trust Center
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-4xl font-semibold tracking-tight text-[var(--color-foreground)] md:text-6xl">
            TheStrongest
          </h1>
          <p className="max-w-xl text-lg leading-relaxed text-[var(--color-muted)] md:text-xl">
            {TRUST_CENTER_TAGLINE}
          </p>
          <p className="max-w-xl text-sm leading-relaxed text-[var(--color-muted)]">
            {TRUST_CENTER_INTRO}
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <ButtonLink href="/evidence">Evidence standards</ButtonLink>
            <ButtonLink href="/privacy" variant="secondary">
              Privacy
            </ButtonLink>
            <ButtonLink href="/features" variant="ghost">
              Features
            </ButtonLink>
          </div>
        </header>
      </div>

      <Alert tone="info" title="Product honesty, not marketing spin" className="mx-auto mt-8 max-w-3xl">
        Every claim below aligns with shipped domain honesty — Coach Brain,
        technique privacy, movement disclaimers, scoring confidence gates, pain-safe
        response, and evidence quality. We do not invent capabilities here.
      </Alert>

      <nav
        aria-label="Trust Center sections"
        className="trust-nav mx-auto mt-10 max-w-3xl"
      >
        <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm text-[var(--color-muted)]">
          {sections.map((s) => (
            <li key={s.id}>
              <a
                href={`#${s.id}`}
                className="underline-offset-4 hover:text-[var(--color-foreground)] hover:underline"
              >
                {s.title}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mx-auto mt-14 max-w-3xl pb-16">
        <TrustCenterSections sections={sections} />
      </div>

      <footer className="mx-auto max-w-3xl border-t border-[var(--color-border)] py-10 text-sm text-[var(--color-muted)]">
        <p>
          Questions about your data? After sign-in, use{" "}
          <Link
            href="/app/settings"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            Settings
          </Link>{" "}
          to export or delete. Legal drafts:{" "}
          <Link
            href="/privacy"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            Privacy
          </Link>{" "}
          ·{" "}
          <Link
            href="/terms"
            className="text-[var(--color-accent)] underline-offset-4 hover:underline"
          >
            Terms
          </Link>
          .
        </p>
      </footer>
    </MarketingContainer>
  );
}
