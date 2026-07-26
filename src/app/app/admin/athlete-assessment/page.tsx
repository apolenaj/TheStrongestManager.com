import { ComingSoon } from "@/components/ui/ComingSoon";
import { AthleteAssessmentPanel } from "@/components/athlete-assessment/AthleteAssessmentPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getAthleteAssessmentSnapshot } from "@/services/athlete-assessment";

export default async function AdminAthleteAssessmentPage() {
  await requireAdmin();

  if (!featureFlags.athleteAssessment) {
    return (
      <ComingSoon
        title="Free Athlete Assessment"
        description="Acquisition funnel is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_ATHLETE_ASSESSMENT=true to review limited questions → partial profile → signup for real score."
      />
    );
  }

  const snapshot = getAthleteAssessmentSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Free athlete assessment
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Self-assessment estimate only — Not full Athlete Score. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <AthleteAssessmentPanel snapshot={snapshot} />
    </div>
  );
}
