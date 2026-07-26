import { ComingSoon } from "@/components/ui/ComingSoon";
import { PwaReadinessPanel } from "@/components/pwa/PwaReadinessPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getPwaReadinessSnapshot } from "@/services/pwa-readiness";

export default async function AdminPwaReadinessPage() {
  await requireAdmin();

  if (!featureFlags.pwaReadiness) {
    return (
      <ComingSoon
        title="PWA readiness"
        description="Progressive Web App capabilities are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_PWA_READINESS=true for installable app, offline shell, cached workout, and secure sync."
      />
    );
  }

  const snapshot = getPwaReadinessSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          PWA readiness
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Installable shell and offline workout sync — see{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <PwaReadinessPanel snapshot={snapshot} />
    </div>
  );
}
