import { ComingSoon } from "@/components/ui/ComingSoon";
import { UniversalTimelineAdminPanel } from "@/components/universal-timeline/UniversalTimelineAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getUniversalTimelineAdminSnapshot } from "@/services/universal-timeline";

export default async function AdminUniversalTimelinePage() {
  await requireAdmin();

  if (!featureFlags.universalTimeline) {
    return (
      <ComingSoon
        title="Universal timeline"
        description="Athlete history timeline is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_UNIVERSAL_TIMELINE=true to review event kinds and honesty."
      />
    );
  }

  const snapshot = getUniversalTimelineAdminSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Universal timeline
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Athlete history event catalog. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <UniversalTimelineAdminPanel snapshot={snapshot} />
    </div>
  );
}
