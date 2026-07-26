import { ComingSoon } from "@/components/ui/ComingSoon";
import { ExerciseComparisonPanel } from "@/components/exercise-comparison/ExerciseComparisonPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getExerciseComparisonSnapshot } from "@/services/exercise-comparison";

export default async function AdminExerciseComparisonPage() {
  await requireAdmin();

  if (!featureFlags.exerciseComparison) {
    return (
      <ComingSoon
        title="Exercise Comparison Engine"
        description="Exercise A vs B comparison is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_EXERCISE_COMPARISON=true to review dimensions, profiles, and SEO pairs."
      />
    );
  }

  const snapshot = getExerciseComparisonSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Exercise comparison
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Exercise A vs B — purpose, technique, muscles, fatigue, programming,
          who should choose which. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <ExerciseComparisonPanel snapshot={snapshot} />
    </div>
  );
}
