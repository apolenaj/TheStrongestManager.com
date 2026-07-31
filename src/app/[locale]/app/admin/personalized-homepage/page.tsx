import { ComingSoon } from "@/components/ui/ComingSoon";
import { PersonalizedHomepagePanel } from "@/components/personalized-homepage/PersonalizedHomepagePanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getPersonalizedHomepageSnapshot } from "@/services/personalized-homepage";

export default async function AdminPersonalizedHomepagePage() {
  await requireAdmin();

  if (!featureFlags.personalizedHomepage) {
    return (
      <ComingSoon
        title="Personalized Homepage"
        description="Traffic-intent homepage variants are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_PERSONALIZED_HOMEPAGE=true to review allowlisted intents (brand + metadata locked; no cloaking)."
      />
    );
  }

  const snapshot = getPersonalizedHomepageSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Personalized homepage
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Soft variants by traffic intent — canonical brand and SEO metadata
          stay fixed. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <PersonalizedHomepagePanel snapshot={snapshot} />
    </div>
  );
}
