import { ComingSoon } from "@/components/ui/ComingSoon";
import { UserSegmentationPanel } from "@/components/user-segmentation/UserSegmentationPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getUserSegmentationSnapshot } from "@/services/user-segmentation";

export default async function AdminUserSegmentationPage() {
  await requireAdmin();

  if (!featureFlags.userSegmentation) {
    return (
      <ComingSoon
        title="User Segmentation"
        description="Behavior and product-context segmentation is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_USER_SEGMENTATION=true to review Beginner / Advanced / sport / Coach / Paid / High engagement segments (no sensitive demographics)."
      />
    );
  }

  const snapshot = await getUserSegmentationSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          User segmentation
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Behavior and product context only — never sensitive demographic
          axes. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <UserSegmentationPanel snapshot={snapshot} />
    </div>
  );
}
