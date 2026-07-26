import type { Metadata } from "next";
import { LegalReviewAlert } from "@/components/gdpr/LegalReviewAlert";
import { MarketingContainer } from "@/components/marketing/MarketingContainer";
import { PageIntro } from "@/components/ui/PageIntro";
import { featureFlags } from "@/config/feature-flags";
import {
  GDPR_PROCESSING_ACTIVITIES,
  GDPR_RETENTION_INTENTIONS,
} from "@/domain/gdpr-readiness";
import { ButtonLink } from "@/design-system";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description:
    "Privacy Policy placeholder for TheStrongestManager — draft for professional legal review, not an approved policy.",
  alternates: { canonical: "/privacy" },
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <MarketingContainer>
      <PageIntro
        eyebrow="Legal"
        title="Privacy Policy"
        description="How we intend to handle account, training, and technique data. This page is a product placeholder — not legal advice and not an approved policy."
      />

      <div className="mt-8 max-w-2xl space-y-6 text-sm leading-relaxed text-[var(--color-muted)]">
        <LegalReviewAlert surface="This Privacy Policy" />

        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            What this product stores (summary)
          </h2>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Account identifiers (email) and authentication credentials or OAuth
              links.
            </li>
            <li>
              Athlete profile, goals, training sessions, and related performance
              data you enter.
            </li>
            <li>
              Technique videos you upload — stored privately, accessible only
              with a signed token plus your session, and deletable by you.
            </li>
            <li>
              Subscription and credit metadata when billing is configured.
            </li>
          </ul>
        </section>

        {featureFlags.gdprReadiness ? (
          <>
            <section className="space-y-2">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
                Data processing (product inventory)
              </h2>
              <p>
                Illustrative purposes for transparency. Legal bases below are
                notes for counsel — not approved Article 6 determinations.
              </p>
              <ul className="mt-3 space-y-3">
                {GDPR_PROCESSING_ACTIVITIES.map((a) => (
                  <li key={a.id}>
                    <p className="font-medium text-[var(--color-foreground)]">
                      {a.purpose}
                    </p>
                    <p className="mt-1 text-xs">
                      {a.categories}. {a.legalBasisNote}.
                    </p>
                  </li>
                ))}
              </ul>
            </section>

            <section className="space-y-2">
              <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
                Retention (intentions)
              </h2>
              <p>
                Product intentions pending professional legal review — not
                binding retention periods.
              </p>
              <ul className="mt-3 list-disc space-y-2 pl-5">
                {GDPR_RETENTION_INTENTIONS.map((r) => (
                  <li key={r.id}>
                    <strong className="text-[var(--color-foreground)]">
                      {r.asset}:
                    </strong>{" "}
                    {r.intention}
                  </li>
                ))}
              </ul>
            </section>
          </>
        ) : null}

        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            Your controls
          </h2>
          <p>
            Signed-in athletes can export a JSON copy of their data, delete
            uploaded technique videos, and delete their account from Settings.
            Cookie preferences (when GDPR readiness is enabled) live on{" "}
            <a
              href="/cookies"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              Cookies
            </a>
            .
          </p>
          <div className="flex flex-wrap gap-2 pt-2">
            <ButtonLink href="/app/settings" variant="secondary" size="sm">
              Settings
            </ButtonLink>
            {featureFlags.gdprReadiness ? (
              <ButtonLink href="/cookies" variant="secondary" size="sm">
                Cookie controls
              </ButtonLink>
            ) : null}
          </div>
        </section>

        <section className="space-y-2">
          <h2 className="font-[family-name:var(--font-display)] text-lg text-[var(--color-foreground)]">
            Medical disclaimer
          </h2>
          <p>
            TheStrongestManager is a performance training product. It does not
            provide medical diagnosis or treatment. Pain, injury, and health
            decisions require a qualified professional.
          </p>
        </section>

        <p className="text-xs">
          Placeholder last updated for product documentation (Prompt 177).
          Pending professional legal review.
        </p>
      </div>
    </MarketingContainer>
  );
}
