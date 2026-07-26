import { ComingSoon } from "@/components/ui/ComingSoon";
import { OnSiteEducationPanel } from "@/components/on-site-education/OnSiteEducationPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getOnSiteEducationSnapshot } from "@/services/on-site-education";

export default async function AdminOnSiteEducationPage() {
  await requireAdmin();

  if (!featureFlags.onSiteEducation) {
    return (
      <ComingSoon
        title="On-site education"
        description="Metric Learn why is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_ON_SITE_EDUCATION=true to review catalogued metric explanations."
      />
    );
  }

  const snapshot = getOnSiteEducationSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          On-site education
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Learn why topics for dashboard metrics — expand in place. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <OnSiteEducationPanel snapshot={snapshot} />
    </div>
  );
}
