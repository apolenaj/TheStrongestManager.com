import type { Metadata } from "next";
import { AdminVerifiedLiftQueue } from "@/components/verified-lift/AdminVerifiedLiftQueue";
import { requireAdmin } from "@/services/admin/require-admin";
import { listPendingLiftReviews } from "@/services/verified-lift";

export const metadata: Metadata = {
  title: "Verified lift review",
  robots: { index: false, follow: false },
};

export default async function AdminVerifiedLiftsPage() {
  await requireAdmin();
  const items = await listPendingLiftReviews();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Verified lift review
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Manual review of video evidence and metadata. Approve competition
          verification only when meet criteria are present — never label
          “officially verified” otherwise.
        </p>
      </div>
      <AdminVerifiedLiftQueue items={items} />
    </div>
  );
}
