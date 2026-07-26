import { ComingSoon } from "@/components/ui/ComingSoon";
import { YearInReviewAdminPanel } from "@/components/year-in-review/YearInReviewAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getYearInReviewAdminSnapshot } from "@/services/year-in-review";

export default async function AdminYearInReviewPage() {
  await requireAdmin();

  if (!featureFlags.yearInReview) {
    return (
      <ComingSoon
        title="Year in Review"
        description="Annual report cards are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_YEAR_IN_REVIEW=true to review card kinds."
      />
    );
  }

  const snapshot = getYearInReviewAdminSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Year in Review
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Annual athlete report architecture. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>.
        </p>
      </div>
      <YearInReviewAdminPanel snapshot={snapshot} />
    </div>
  );
}
