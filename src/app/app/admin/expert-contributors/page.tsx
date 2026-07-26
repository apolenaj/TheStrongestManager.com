import type { Metadata } from "next";
import { ExpertReviewQueue } from "@/components/expert-contributor/ExpertReviewQueue";
import { requireAdmin } from "@/services/admin/require-admin";
import { listExpertReviewQueue } from "@/services/expert-contributor";

export const metadata: Metadata = {
  title: "Expert contributors",
  robots: { index: false, follow: false },
};

export default async function AdminExpertContributorsPage() {
  await requireAdmin();
  const items = await listExpertReviewQueue();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Expert Contributor verification
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Explicit staff grant only. Never auto-label experts from Coach Mode or
          marketplace credentials.
        </p>
      </div>
      <ExpertReviewQueue items={items} />
    </div>
  );
}
