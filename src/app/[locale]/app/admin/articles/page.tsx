import { AdminReviewForm } from "@/components/admin/AdminReviewForm";
import { Badge } from "@/design-system";
import { listAdminArticles } from "@/services/admin/admin-service";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminArticlesPage() {
  await requireAdmin();
  const items = listAdminArticles();

  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl">
        Articles
      </h2>
      <p className="text-sm text-[var(--color-muted)]">
        SEO topic pillars and history eras — supporting deep content only.
      </p>
      <ul className="divide-y divide-[var(--color-border)]">
        {items.map((item) => (
          <li key={item.id} className="py-4">
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={item.href}
                className="font-medium text-[var(--color-accent)] hover:underline"
              >
                {item.title}
              </a>
              <Badge variant="neutral">{item.kind}</Badge>
            </div>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{item.blurb}</p>
            <AdminReviewForm entityType="article" entityId={item.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
