import { ComingSoon } from "@/components/ui/ComingSoon";
import { LiveCompetitionAdminPanel } from "@/components/live-competition-mode/LiveCompetitionAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getLiveCompetitionSnapshot } from "@/services/live-competition-mode";

export default async function AdminLiveCompetitionPage() {
  await requireAdmin();

  if (!featureFlags.liveCompetitionMode) {
    return (
      <ComingSoon
        title="Live Competition Mode"
        description="Live Competition Mode architecture is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_LIVE_COMPETITION_MODE=true to review meet-day contracts — without launching unsafe or invented sessions."
      />
    );
  }

  const snapshot = getLiveCompetitionSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Live Competition Mode
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Future meet-day architecture — attempts, results, next attempt,
          warm-up timing, offline. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <LiveCompetitionAdminPanel snapshot={snapshot} />
    </div>
  );
}
