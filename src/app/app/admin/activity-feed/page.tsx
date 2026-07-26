import { ComingSoon } from "@/components/ui/ComingSoon";
import { ActivityFeedAdminPanel } from "@/components/activity-feed/ActivityFeedAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getActivityFeedAdminSnapshot } from "@/services/activity-feed";

export default async function AdminActivityFeedPage() {
  await requireAdmin();

  if (!featureFlags.activityFeedMvp) {
    return (
      <ComingSoon
        title="Activity feed"
        description="Activity Feed MVP is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_ACTIVITY_FEED_MVP=true to review optional milestone kinds and anti-dark-pattern rules."
      />
    );
  }

  const snapshot = getActivityFeedAdminSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Activity Feed MVP
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Optional PRs / competition / achievements / shared technique — see{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <ActivityFeedAdminPanel snapshot={snapshot} />
    </div>
  );
}
