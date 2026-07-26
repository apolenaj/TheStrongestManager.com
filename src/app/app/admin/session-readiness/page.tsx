import { ComingSoon } from "@/components/ui/ComingSoon";
import { SessionReadinessAdminPanel } from "@/components/session-readiness-adjuster/SessionReadinessAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getSessionReadinessAdminSnapshot } from "@/services/session-readiness-adjuster";

export default async function AdminSessionReadinessPage() {
  await requireAdmin();

  if (!featureFlags.sessionReadinessAdjuster) {
    return (
      <ComingSoon
        title="Session readiness adjuster"
        description="Session readiness adjuster is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_SESSION_READINESS_ADJUSTER=true to review proceed / minor adjustment / review load rules."
      />
    );
  }

  const snapshot = getSessionReadinessAdminSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Session readiness adjuster
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Pre-workout recommendations — see{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <SessionReadinessAdminPanel snapshot={snapshot} />
    </div>
  );
}
