import { ComingSoon } from "@/components/ui/ComingSoon";
import { TechniqueCheckPanel } from "@/components/technique-check/TechniqueCheckPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getTechniqueCheckSnapshot } from "@/services/technique-check";

export default async function AdminTechniqueCheckPage() {
  await requireAdmin();

  if (!featureFlags.techniqueCheck) {
    return (
      <ComingSoon
        title="Free Technique Check"
        description="Acquisition funnel is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_TECHNIQUE_CHECK=true to review the upload → limited insight → signup flow."
      />
    );
  }

  const snapshot = getTechniqueCheckSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Free technique check
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Guest funnel with in-browser analysis, privacy defaults, and claim
          rate limits. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <TechniqueCheckPanel snapshot={snapshot} />
    </div>
  );
}
