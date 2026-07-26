import type { Metadata } from "next";
import { LegalReviewAlert } from "@/components/gdpr/LegalReviewAlert";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PageIntro } from "@/components/ui/PageIntro";

export const metadata: Metadata = {
  title: "Terms of Use",
  description:
    "Terms of Use placeholder for TheStrongestManager — draft for professional legal review, not approved terms.",
  alternates: { canonical: "/terms" },
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Legal"
        title="Terms of Use"
        description="Intended conditions for using TheStrongestManager. This page is a product placeholder — not legal advice and not approved terms of service."
      />

      <div className="mt-8 max-w-2xl space-y-6 text-sm leading-relaxed text-[var(--color-muted)]">
        <LegalReviewAlert surface="These Terms of Use" />

        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            Service nature
          </h2>
          <p>
            TheStrongestManager provides training, technique, and related
            performance tools. Features may be gated, unfinished, or unavailable.
            We do not invent scores, checkout success, or synced third-party data
            when those systems are not configured.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            Accounts and acceptable use
          </h2>
          <p>
            You are responsible for credentials protecting your account. Do not
            attempt to access other users&apos; data, abuse upload or analysis
            endpoints, or circumvent ownership and authorization checks.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            Payments
          </h2>
          <p>
            Paid plans and checkout become available only when a billing provider
            is configured and verified. Webhook and payment endpoints reject
            unsigned or unverified requests.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            Related pages
          </h2>
          <p>
            See the{" "}
            <a
              href="/privacy"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              Privacy Policy placeholder
            </a>{" "}
            and{" "}
            <a
              href="/pricing"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              Pricing
            </a>
            .
          </p>
        </section>

        <p className="text-xs">
          Placeholder last updated for product documentation (Prompt 43). Pending
          legal review.
        </p>
      </div>
    </MarketingContainer>
  );
}
