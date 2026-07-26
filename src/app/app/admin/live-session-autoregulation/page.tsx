import { ComingSoon } from "@/components/ui/ComingSoon";
import { LiveAutoregAdminPanel } from "@/components/live-session-autoregulation/LiveAutoregAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getLiveAutoregAdminSnapshot } from "@/services/live-session-autoregulation";

export default async function AdminLiveSessionAutoregPage() {
  await requireAdmin();

  if (!featureFlags.liveSessionAutoregulation) {
    return (
      <ComingSoon
        title="Live session autoregulation"
        description="Live session autoregulation is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_LIVE_SESSION_AUTOREGULATION=true to review RPE vs planned suggestion rules."
      />
    );
  }

  const snapshot = getLiveAutoregAdminSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Live session autoregulation
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          During-workout RPE vs planned — see{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <LiveAutoregAdminPanel snapshot={snapshot} />
    </div>
  );
}
