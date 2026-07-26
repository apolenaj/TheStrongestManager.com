"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button } from "@/design-system";
import { continueAffiliateClickAction } from "@/services/affiliate-system/actions";
import { AffiliateDisclosureBanner } from "@/components/affiliate-system/AffiliateDisclosureBanner";

export function AffiliateLandingContinue({
  code,
  displayName,
  partnerTypeLabel,
  disclosure,
  disclosureShort,
}: {
  code: string;
  displayName: string;
  partnerTypeLabel: string;
  disclosure: readonly string[];
  disclosureShort: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="grid gap-6">
      <AffiliateDisclosureBanner
        lines={disclosure}
        short={disclosureShort}
      />

      <div>
        <p className="text-sm uppercase tracking-wide text-[var(--color-muted)]">
          Affiliate partner · {partnerTypeLabel}
        </p>
        <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold">
          {displayName}
        </h1>
        <p className="mt-3 text-[var(--color-muted)]">
          Continuing records a click for affiliate tracking, then opens signup
          with an affiliate attribution code (separate from personal referrals).
        </p>
      </div>

      <Alert tone="info" title="What happens next">
        Click and conversion events are tracked. Commission is ledgered as an
        estimate — not a guaranteed payout.
      </Alert>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          startTransition(async () => {
            const result = await continueAffiliateClickAction(fd);
            if (result.ok) {
              router.push(result.redirectPath);
            }
          });
        }}
      >
        <input type="hidden" name="code" value={code} />
        <Button type="submit" loading={pending}>
          Continue to signup
        </Button>
      </form>
    </div>
  );
}
