import { ComingSoon } from "@/components/ui/ComingSoon";
import { SocialGraphAdminPanel } from "@/components/social-graph/SocialGraphAdminPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getSocialGraphSnapshot } from "@/services/social-graph";

export default async function AdminSocialGraphPage() {
  await requireAdmin();

  if (!featureFlags.socialGraphPrep) {
    return (
      <ComingSoon
        title="Social graph"
        description="Social graph architecture is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_SOCIAL_GRAPH_PREP=true to review follow / privacy / feed contracts — without launching a live feed."
      />
    );
  }

  const snapshot = getSocialGraphSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Social graph prep
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Follow athletes & coaches, private accounts, activity feed contracts —
          see <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <SocialGraphAdminPanel snapshot={snapshot} />
    </div>
  );
}
