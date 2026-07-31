import { ComingSoon } from "@/components/ui/ComingSoon";
import { MobileWorkoutPanel } from "@/components/mobile-workout/MobileWorkoutPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getMobileWorkoutSnapshot } from "@/services/mobile-workout";

export default async function AdminMobileWorkoutPage() {
  await requireAdmin();

  if (!featureFlags.mobileWorkoutExperience) {
    return (
      <ComingSoon
        title="Mobile workout experience"
        description="The mobile-first live workout player is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_MOBILE_WORKOUT_EXPERIENCE=true for one-hand focus, steppers, auto-save, and sticky rest timer."
      />
    );
  }

  const snapshot = getMobileWorkoutSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Mobile-first workout
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Native-feeling training UI principles. See{" "}
          <code className="text-xs">{snapshot.docPath}</code>. Generated{" "}
          {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <MobileWorkoutPanel snapshot={snapshot} />
    </div>
  );
}
