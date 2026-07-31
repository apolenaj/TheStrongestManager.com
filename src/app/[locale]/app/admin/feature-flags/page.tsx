import { FeatureFlagsReviewForm } from "@/components/admin/FeatureFlagsReviewForm";
import { Alert, Badge } from "@/design-system";
import { ADMIN_HONESTY } from "@/domain/admin";
import { listAdminFeatureFlags } from "@/services/admin/admin-service";
import { requireAdmin } from "@/services/admin/require-admin";

export default async function AdminFeatureFlagsPage() {
  await requireAdmin();
  const flags = listAdminFeatureFlags();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Feature flags
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          {ADMIN_HONESTY[1]}
        </p>
      </div>
      <Alert tone="warning" title="Environment-backed">
        Changing flags requires deploying env updates (`NEXT_PUBLIC_FF_*`). This
        page never pretends the browser can flip production flags.
      </Alert>
      <ul className="divide-y divide-[var(--color-border)]">
        {flags.map((flag) => (
          <li
            key={flag.key}
            className="flex flex-wrap items-center justify-between gap-2 py-3"
          >
            <code className="text-sm text-[var(--color-foreground)]">
              {flag.key}
            </code>
            <Badge variant={flag.enabled ? "success" : "neutral"}>
              {flag.enabled ? "on" : "off"}
            </Badge>
          </li>
        ))}
      </ul>
      <FeatureFlagsReviewForm />
    </div>
  );
}
