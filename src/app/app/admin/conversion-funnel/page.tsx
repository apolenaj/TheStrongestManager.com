import { ComingSoon } from "@/components/ui/ComingSoon";
import { ConversionFunnelPanel } from "@/components/conversion-funnel/ConversionFunnelPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getConversionFunnelSnapshot } from "@/services/conversion-funnel";

export default async function AdminConversionFunnelPage() {
  await requireAdmin();

  if (!featureFlags.conversionFunnel) {
    return (
      <ComingSoon
        title="Conversion Funnel"
        description="Homepage → Paid conversion funnel analytics are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_CONVERSION_FUNNEL=true to review funnel visualization and drop-offs."
      />
    );
  }

  const snapshot = await getConversionFunnelSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Conversion funnel
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Homepage → Signup → Onboarding → First value → Pricing → Checkout →
          Paid. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <ConversionFunnelPanel snapshot={snapshot} />
    </div>
  );
}
