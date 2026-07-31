import { ComingSoon } from "@/components/ui/ComingSoon";
import { AccessibilityAuditPanel } from "@/components/accessibility-system/AccessibilityAuditPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getAccessibilityAuditSnapshot } from "@/services/accessibility-system";

export default async function AdminAccessibilityPage() {
  await requireAdmin();

  if (!featureFlags.accessibilitySystem) {
    return (
      <ComingSoon
        title="Accessibility 2.0"
        description="The WCAG audit console is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_ACCESSIBILITY_SYSTEM=true to review keyboard, screen reader, chart, video, form, and modal criteria."
      />
    );
  }

  const snapshot = getAccessibilityAuditSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Accessibility 2.0
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Advanced WCAG audit — keyboard, screen readers, charts, video
          analysis, forms, modals, focus traps, and color-blind-safe technique
          scores. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <AccessibilityAuditPanel snapshot={snapshot} />
    </div>
  );
}
