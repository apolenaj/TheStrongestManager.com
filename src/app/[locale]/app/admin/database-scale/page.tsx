import { ComingSoon } from "@/components/ui/ComingSoon";
import { DatabaseScalePanel } from "@/components/database-scale/DatabaseScalePanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getDatabaseScaleSnapshot } from "@/services/database-scale";

export default async function AdminDatabaseScalePage() {
  await requireAdmin();

  if (!featureFlags.databaseScale) {
    return (
      <ComingSoon
        title="Database Scale Audit"
        description="The 100k+ user database scale console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_DATABASE_SCALE=true to review indexes, N+1, pagination, large tables, and the no-shard scaling path."
      />
    );
  }

  const snapshot = getDatabaseScaleSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Database Scale Audit
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Indexes, N+1, pagination, large tables, analytics separation,
          technique metrics, and video metadata — plus an explicit path that
          does not prematurely shard. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <DatabaseScalePanel snapshot={snapshot} />
    </div>
  );
}
