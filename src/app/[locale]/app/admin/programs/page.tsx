import { AdminReviewForm } from "@/components/admin/AdminReviewForm";
import { EmptyState } from "@/design-system";
import { listAdminProgramTemplates } from "@/services/admin/admin-service";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminProgramsPage() {
  await requireAdmin();
  const items = await listAdminProgramTemplates();

  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl">
        Program templates
      </h2>
      <p className="text-sm text-[var(--color-muted)]">
        Database programs with kind=template. Public marketplace programs remain
        separate and empty until published.
      </p>
      {items.length === 0 ? (
        <EmptyState
          title="No templates yet"
          description="When template programs exist in the database, they appear here for audited review notes."
        />
      ) : (
        <ul className="divide-y divide-[var(--color-border)]">
          {items.map((item) => (
            <li key={item.id} className="py-4">
              <p className="font-medium text-[var(--color-foreground)]">
                {item.title}{" "}
                <span className="text-xs text-[var(--color-muted)]">
                  ({item.status})
                </span>
              </p>
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {item.blurb}
              </p>
              <AdminReviewForm
                entityType="program_template"
                entityId={item.id}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
