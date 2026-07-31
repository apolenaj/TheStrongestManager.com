import type { Metadata } from "next";
import { CommunityQaModerationPanel } from "@/components/community-qa/CommunityQaModerationPanel";
import { requireAdmin } from "@/services/admin/require-admin";
import { listQaModerationQueue } from "@/services/community-qa";

export const metadata: Metadata = {
  title: "Q&A moderation",
  robots: { index: false, follow: false },
};

export default async function AdminCommunityQaPage() {
  await requireAdmin();
  const items = await listQaModerationQueue();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold tracking-tight">
          Community Q&A moderation
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">
          Flag, hide, restore, or remove questions and answers. AI summaries are
          never moderated as human authors.
        </p>
      </div>
      <CommunityQaModerationPanel items={items} />
    </div>
  );
}
