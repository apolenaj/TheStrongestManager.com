import { AdminReviewForm } from "@/components/admin/AdminReviewForm";
import { listAdminExercises } from "@/services/admin/admin-service";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminExercisesPage() {
  await requireAdmin();
  const items = listAdminExercises();

  return (
    <div className="space-y-4">
      <h2 className="font-[family-name:var(--font-display)] text-2xl">
        Exercise content
      </h2>
      <p className="text-sm text-[var(--color-muted)]">
        Priority exercise intelligence catalog. Reviews write to the admin audit
        log.
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
            {item.aliases.length > 0 ? (
              <p className="mt-1 text-xs text-[var(--color-muted)]">
                Aliases: {item.aliases.join(", ")}
              </p>
            ) : null}
            <AdminReviewForm entityType="exercise" entityId={item.id} />
          </li>
        ))}
      </ul>
    </div>
  );
}
