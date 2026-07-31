import { ComingSoon } from "@/components/ui/ComingSoon";
import { RedTeamAiCoachPanel } from "@/components/red-team-ai-coach/RedTeamAiCoachPanel";
import { featureFlags } from "@/config/feature-flags";
import { requireAdmin } from "@/services/admin/require-admin";
import { getRedTeamAiCoachSnapshot } from "@/services/red-team-ai-coach";

export default async function AdminRedTeamAiCoachPage() {
  await requireAdmin();

  if (!featureFlags.redTeamAiCoach) {
    return (
      <ComingSoon
        title="Red Team AI Coach"
        description="Adversarial Coach chat QA is not enabled yet."
        reason="Set NEXT_PUBLIC_FF_RED_TEAM_AI_COACH=true to review attack prompts, documented failures, and live suite status."
      />
    );
  }

  const snapshot = getRedTeamAiCoachSnapshot();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-2xl">
          Red Team AI Coach
        </h2>
        <p className="mt-2 text-sm text-[var(--color-muted)]">
          Adversarial QA for Coach chat — refuse unsafe maxes, diagnosis, and
          guarantees. See <code className="text-xs">{snapshot.docPath}</code>.
          Generated {new Date(snapshot.generatedAt).toLocaleString("en-US")}.
        </p>
      </div>
      <RedTeamAiCoachPanel snapshot={snapshot} />
    </div>
  );
}
