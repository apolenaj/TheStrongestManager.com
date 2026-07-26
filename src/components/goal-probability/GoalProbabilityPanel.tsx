import {
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import type {
  GoalProgressAssessment,
  GoalProgressResult,
  GoalTrajectoryStatus,
} from "@/domain/goal-probability";
import { fromGoalProgressAssessment } from "@/domain/explainable-ai";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";

function statusVariant(
  s: GoalTrajectoryStatus,
): "neutral" | "info" | "accent" | "warning" {
  if (s === "on_track" || s === "target_reached") return "accent";
  if (s === "possible_but_aggressive") return "info";
  if (s === "below_target" || s === "past_deadline") return "warning";
  return "neutral";
}

function AssessmentCard({ a }: { a: GoalProgressAssessment }) {
  const req =
    a.requiredImprovementKg != null
      ? a.requiredImprovementKg.vsHigh === 0
        ? "Within current estimate high"
        : `+${a.requiredImprovementKg.vsHigh}–${a.requiredImprovementKg.vsLow} kg`
      : "—";

  const explain = fromGoalProgressAssessment(a);

  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">Goal</Badge>
          <Badge variant={statusVariant(a.status)}>{a.statusLabel}</Badge>
          <ConfidenceBadge confidence={explain.confidence} />
        </div>
        <CardTitle className="mt-2 text-xl tracking-tight">{a.goalTitle}</CardTitle>
        <CardDescription>
          {a.targetKg != null
            ? `Target: ${a.targetKg} kg${a.targetDate ? ` · by ${new Date(a.targetDate).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })}` : ""}`
            : "No numeric target resolved"}
        </CardDescription>
      </CardHeader>

      <div className="grid gap-4 text-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Current estimate
            </h3>
            <p className="mt-1 font-[family-name:var(--font-display)] text-2xl tracking-tight">
              {a.currentEstimateKg
                ? `${a.currentEstimateKg.low}–${a.currentEstimateKg.high} kg`
                : "Unavailable"}
            </p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Required improvement
            </h3>
            <p className="mt-1 text-lg tracking-tight">{req}</p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Time remaining
            </h3>
            <p className="mt-1 text-lg tracking-tight">
              {a.timeRemaining?.label ?? "No deadline"}
            </p>
          </div>
          <div>
            <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Current trajectory
            </h3>
            <p className="mt-1 text-lg tracking-tight">{a.trajectory.summary}</p>
            {a.trajectory.projectedKgAtTarget != null ? (
              <p className="mt-1 text-[var(--color-muted)]">
                Projected by deadline ≈ {a.trajectory.projectedKgAtTarget} kg
                {a.trajectory.requiredKgPerWeek != null
                  ? ` · need ≈ ${a.trajectory.requiredKgPerWeek} kg/week`
                  : ""}
              </p>
            ) : null}
          </div>
        </div>

        <WhyAmISeeingThis view={explain} />
        <AiTrustChrome
          relatedType="goal_probability"
          relatedId={a.goalId}
          correctHref="/app/goals"
          correctLabel="Edit goal or log lifts to correct trajectory"
        />
      </div>
    </Card>
  );
}

export function GoalProbabilityPanel({
  result,
}: {
  result: GoalProgressResult;
}) {
  if (result.assessments.length === 0) {
    return (
      <EmptyState
        title="No active goals yet"
        description="Add a strength goal with a target load and date (e.g. Deadlift 320 kg by October 15). Trajectory stays qualitative — never a fake probability percent."
      />
    );
  }

  return (
    <div className="grid gap-6">
      <p className="text-sm text-[var(--color-muted)]">
        Goal progress from current estimate, required improvement, time
        remaining, and trajectory. Status is qualitative only — not a calibrated
        probability.
      </p>
      <div className="grid gap-4">
        {result.assessments.map((a) => (
          <AssessmentCard key={a.goalId} a={a} />
        ))}
      </div>
    </div>
  );
}
