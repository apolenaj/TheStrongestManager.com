import { AdminReviewForm } from "@/components/admin/AdminReviewForm";
import { listAdminMethods } from "@/services/admin/admin-service";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminMethodsPage() {
  await requireAdmin();
  const items = listAdminMethods();

  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl">
        Training methods
      </h2>
      <p className="text-sm text-[var(--color-muted)]">
        Published method knowledge pages. Record reviews for change management.
      </p>
      <ul className="divide-y divide-[var(--color-border)]">
        {items.map((item) => (
          <li key={item.id} className="py-4">
            <a
              href={item.href}
              className="font-medium text-[var(--color-accent)] hover:underline"
            >
              {item.title}
            </a>
            <p className="mt-1 text-sm text-[var(--color-muted)]">{item.blurb}</p>
            <AdminReviewForm entityType="method" entityId={item.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
