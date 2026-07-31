import { ComingSoon } from "@/components/ui/ComingSoon";
import { PerformanceStoryAdminPanel } from "@/components/performance-story/PerformanceStoryAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getPerformanceStoryAdminSnapshot } from "@/services/performance-story";

export default async function AdminPerformanceStoryPage() {
  await requireAdmin();

  if (!featureFlags.performanceStory) {
    return (
      <ComingSoon
        title="Performance Story"
        description="Yearly narrative engine is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_PERFORMANCE_STORY=true to review chapter rules and causality caveats."
      />
    );
  }

  const snapshot = getPerformanceStoryAdminSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Performance Story
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Long-term narrative architecture. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <PerformanceStoryAdminPanel snapshot={snapshot} />
    </div>
  );
}
