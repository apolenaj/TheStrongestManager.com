import { ComingSoon } from "@/components/ui/ComingSoon";
import { GdprReadinessPanel } from "@/components/gdpr/GdprReadinessPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getGdprReadinessSnapshot } from "@/services/gdpr-readiness";

export default async function AdminGdprReadinessPage() {
  await requireAdmin();

  if (!featureFlags.gdprReadiness) {
    return (
      <ComingSoon
        title="GDPR readiness"
        description="GDPR-supporting workflows console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_GDPR_READINESS=true to review consent, export, deletion, cookies, retention, and legal-review markers."
      />
    );
  }

  const snapshot = getGdprReadinessSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          GDPR readiness
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Supporting workflows — not a legal certification. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <GdprReadinessPanel snapshot={snapshot} />
    </div>
  );
}
