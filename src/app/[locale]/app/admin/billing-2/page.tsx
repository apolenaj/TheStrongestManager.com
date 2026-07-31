import { ComingSoon } from "@/components/ui/ComingSoon";
import { Billing2Panel } from "@/components/billing/Billing2Panel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getBilling2Snapshot } from "@/services/billing/billing-2-service";

export default async function AdminBilling2Page() {
  await requireAdmin();

  if (!featureFlags.billing2) {
    return (
      <ComingSoon
        title="Billing 2.0"
        description="The Billing 2.0 console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_BILLING_2=true to review monthly/annual, trials, coupons, credits, upgrades, grace, invoices, and webhook idempotency."
      />
    );
  }

  const snapshot = getBilling2Snapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Billing 2.0
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Monetization infrastructure — entitlements only from verified
          webhooks. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <Billing2Panel snapshot={snapshot} />
    </div>
  );
}
