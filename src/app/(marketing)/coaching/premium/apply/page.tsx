import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { CoachingApplicationForm } from "@/components/premium-coaching-sales/CoachingApplicationForm";
import { ComingSoon } from "@/components/ui/ComingSoon";
import { Alert, ButtonLink } from "@/design-system";
import { PREMIUM_COACHING_HONESTY } from "@/domain/premium-coaching-sales";
import { featureFlags } from "@/config/feature-flags";
import { auth } from "@/auth";

export const metadata: Metadata = {
  title: "Apply for 1:1 coaching",
  description:
    "Multi-step premium coaching application — review does not promise acceptance.",
  alternates: { canonical: "/coaching/premium/apply" },
  robots: { index: false, follow: false },
};

export default async function PremiumCoachingApplyPage() {
  if (!featureFlags.premiumCoachingSales) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <ComingSoon
          title="Apply for 1:1 coaching"
          description="Applications are not open yet."
        />
      </div>
    );
  }

  const session = await auth();

  return (
    <div className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        <Link
          href="/coaching/premium"
          className="inline-flex min-h-11 items-center gap-2 text-sm text-[var(--color-muted)] transition-colors hover:text-[var(--color-foreground)]"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} aria-hidden />
          Back to coaching
        </Link>

        <header className="mt-8 grid gap-4">
          <p className="text-[0.7rem] font-medium uppercase tracking-[0.22em] text-[var(--color-accent)]">
            1:1 Coaching
          </p>
          <h1 className="font-[family-name:var(--font-display)] text-[clamp(2rem,4vw,3.25rem)] font-bold uppercase tracking-[0.02em] text-[var(--color-foreground)]">
            Coaching application
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-[var(--color-muted)]">
            Five short steps. {PREMIUM_COACHING_HONESTY[0]}
          </p>
        </header>

        <div className="mt-10">
          {!session?.user ? (
            <div className="grid gap-4 border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-6 sm:p-8">
              <Alert tone="info" title="Sign in required">
                Create an account or sign in to submit an application. Your
                answers are reviewed by staff — not auto-accepted.
              </Alert>
              <ButtonLink
                href="/login?next=/coaching/premium/apply"
                className="min-h-12 w-full sm:w-auto"
              >
                Sign in to apply
              </ButtonLink>
            </div>
          ) : (
            <CoachingApplicationForm />
          )}
        </div>
      </div>
    </div>
  );
}
