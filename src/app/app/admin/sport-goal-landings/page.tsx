import { ComingSoon } from "@/components/ui/ComingSoon";
import { SportGoalLandingsPanel } from "@/components/sport-goal-landings/SportGoalLandingsPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getSportGoalLandingSnapshot } from "@/services/sport-goal-landings";

export default async function AdminSportGoalLandingsPage() {
  await requireAdmin();

  if (!featureFlags.sportGoalLandings) {
    return (
      <ComingSoon
        title="Sport Goal Landing Pages"
        description="High-quality sport/goal landings are not enabled yet."
        reason="Set NEXT_PUBLIC_FF_SPORT_GOAL_LANDINGS=true to review allowlisted landings that link into real product features."
      />
    );
  }

  const snapshot = getSportGoalLandingSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Sport goal landings
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          High-quality landings with product CTAs — no generic SEO filler.
          Generated {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <SportGoalLandingsPanel snapshot={snapshot} />
    </div>
  );
}
