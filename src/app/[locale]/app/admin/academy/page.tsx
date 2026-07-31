import { AdminReviewForm } from "@/components/admin/AdminReviewForm";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { listAdminAcademy } from "@/services/admin/admin-service";
import { getAcademy20AdminSnapshot } from "@/services/academy/academy-service";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminAcademyPage() {
  await requireAdmin();
  const items = listAdminAcademy();
  const academy20 = getAcademy20AdminSnapshot();

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Academy content
        </h2>
        <p className="text-sm text-[var(--color-muted)]">
          Published courses issue Certificate of Completion only — never fake
          accredited certifications.
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
              <p className="mt-1 text-sm text-[var(--color-muted)]">
                {item.blurb} · {item.modules} modules
              </p>
              <AdminReviewForm entityType="academy" entityId={item.id} />
            </li>
          ))}
        </ul>
      </div>

      <FeatureGate
        flag="academy20"
        title="Academy 2.0"
        description="Set NEXT_PUBLIC_FF_ACADEMY_20=true to review learning paths, prerequisites, and assignment coverage."
      >
        <div className="space-y-4 border-t border-[var(--color-border)] pt-6">
          <h3 className="font-[family-name:var(--font-display)] text-xl">
            Academy 2.0 snapshot
          </h3>
          <p className="text-sm text-[var(--color-muted)]">
            {academy20.honesty2[0]}
          </p>
          <div>
            <h4 className="text-sm font-medium">Learning paths</h4>
            <ul className="mt-2 space-y-2 text-sm text-[var(--color-muted)]">
              {academy20.paths.map((path) => (
                <li key={path.slug}>
                  <span className="font-medium text-[var(--color-foreground)]">
                    {path.title}
                  </span>{" "}
                  ({path.audience}) — {path.courseSlugs.join(" → ")}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-medium">
              Prerequisites & practice coverage
            </h4>
            <ul className="mt-2 space-y-2 text-sm text-[var(--color-muted)]">
              {academy20.coursesWithPrereqs.map((c) => (
                <li key={c.slug}>
                  <span className="font-medium text-[var(--color-foreground)]">
                    {c.title}
                  </span>
                  {c.prerequisites.length > 0
                    ? ` · prereqs: ${c.prerequisites.join(", ")}`
                    : " · no prerequisites"}
                  {` · ${c.assignmentCount} assignments · ${c.techniqueExampleCount} technique examples`}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </FeatureGate>
    </div>
  );
}
