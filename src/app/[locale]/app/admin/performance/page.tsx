import { ComingSoon } from "@/components/ui/ComingSoon";
import { PerformanceBudgetPanel } from "@/components/performance-system/PerformanceBudgetPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getPerformanceSystemSnapshot } from "@/services/performance-system";

export default async function AdminPerformancePage() {
  await requireAdmin();

  if (!featureFlags.performanceSystem) {
    return (
      <ComingSoon
        title="Performance 2.0"
        description="The Core Web Vitals budget console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_PERFORMANCE_SYSTEM=true to review LCP/INP/CLS/TTFB budgets for homepage, dashboard, exercises, and technique."
      />
    );
  }

  const snapshot = getPerformanceSystemSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Performance 2.0
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Core Web Vitals audit and measurable budgets for priority surfaces.
          Field reporting via web-vitals when the flag is on. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <PerformanceBudgetPanel snapshot={snapshot} />
    </div>
  );
}
