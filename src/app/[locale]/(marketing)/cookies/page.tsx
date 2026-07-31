import type { Metadata } from "next";
import { CookiePreferencesPanel } from "@/components/gdpr/CookiePreferencesPanel";
import { LegalReviewAlert } from "@/components/gdpr/LegalReviewAlert";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import {
  COOKIE_CATEGORIES,
  GDPR_HONESTY,
} from "@/domain/gdpr-readiness";

export const metadata: Metadata = {
  title: "Cookie Policy",
  description:
    "Cookie Policy placeholder — draft for professional legal review, not an approved policy.",
  alternates: { canonical: "/cookies" },
  robots: { index: false, follow: false },
};

export default function CookiesPage() {
  if (!featureFlags.gdprReadiness) {
    return (
      <MarketingContainer>
        <ComingSoon
          title="Cookie Policy"
          description="Cookie controls ship with GDPR readiness."
          reason="Set NEXT_PUBLIC_FF_GDPR_READINESS=true."
        />
      </MarketingContainer>
    );
  }

  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Legal"
        title="Cookie Policy"
        description="How we use cookies and similar technologies. This page is a product placeholder — not legal advice."
      />
      <div className="mt-8 max-w-2xl space-y-8 text-sm leading-relaxed text-[var(--color-muted)]">
        <LegalReviewAlert surface="This Cookie Policy" />

        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            Categories
          </h2>
          <ul className="space-y-3">
            {COOKIE_CATEGORIES.map((cat) => (
              <li key={cat.id}>
                <p className="font-medium text-[var(--color-foreground)]">
                  {cat.title}
                  {cat.required ? " (required)" : ""}
                </p>
                <p className="mt-1">{cat.description}</p>
                <p className="mt-1 font-mono text-[10px]">{cat.examples}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            Your controls
          </h2>
          <CookiePreferencesPanel />
        </section>

        <ul className="list-disc space-y-2 pl-5 text-xs">
          {GDPR_HONESTY.slice(0, 2).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
        <p className="text-xs">
          Placeholder for product documentation (Prompt 177). Pending
          professional legal review.
        </p>
      </div>
    </MarketingContainer>
  );
}
