import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  EmptyState,
} from "@/design-system";
import type {
  PrPrediction,
  PrPredictionResult,
  PrPredictionWithheld,
} from "@/domain/pr-prediction";
import { fromPrPrediction } from "@/domain/explainable-ai";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";

function PredictionCard({ prediction }: { prediction: PrPrediction }) {
  const { low, high } = prediction.rangeKg;
  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">{prediction.exerciseLabel}</Badge>
          <ConfidenceBadge confidence={prediction.confidence} />
        </div>
        <CardTitle className="mt-2 text-xl tracking-tight">
          Estimated {prediction.exerciseLabel.toLowerCase()} potential
        </CardTitle>
        <p className="mt-3 font-[family-name:var(--font-display)] text-3xl tracking-tight text-[var(--color-fg)]">
          {low}–{high} kg
        </p>
        <CardDescription className="mt-2">
          Range only — not a verified PR or a single attempt recommendation.
        </CardDescription>
      </CardHeader>

      <div className="grid gap-4 text-sm">
        <section>
          <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Inputs used
          </h3>
          <ul className="mt-2 grid gap-1 text-[var(--color-muted)]">
            <li>
              Qualifying sets: {prediction.inputsUsed.qualifyingSetCount} (
              {prediction.inputsUsed.hardSetCount} hard)
            </li>
            <li>Sets with RPE: {prediction.inputsUsed.setsWithRpe}</li>
            <li>
              Median estimate (internal): {prediction.inputsUsed.medianE1rmKg}{" "}
              kg
            </li>
            <li>Trend: {prediction.inputsUsed.trend}</li>
            <li>Training phase: {prediction.inputsUsed.trainingPhase}</li>
            <li>
              Fatigue:{" "}
              {prediction.inputsUsed.fatigue != null
                ? `${prediction.inputsUsed.fatigue}/10`
                : "not logged"}
            </li>
          </ul>
        </section>

        <section>
          <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Assumptions
          </h3>
          <ul className="mt-2 grid gap-2">
            {prediction.assumptions.map((a, i) => (
              <li
                key={i}
                className="border-l-2 border-[var(--color-border)] pl-3 text-[var(--color-muted)]"
              >
                {a}
              </li>
            ))}
          </ul>
        </section>

        <WhyAmISeeingThis view={fromPrPrediction(prediction)} />
        <AiTrustChrome
          relatedType="pr_prediction"
          relatedId={prediction.exerciseKey}
          correctHref="/app/training"
          correctLabel="Log sets / RPE to correct this estimate"
        />
      </div>
    </Card>
  );
}

function WithheldCard({ item }: { item: PrPredictionWithheld }) {
  return (
    <Card>
      <CardHeader>
        <Badge variant="neutral">{item.exerciseLabel}</Badge>
        <CardTitle className="mt-2 text-lg tracking-tight">
          Prediction withheld
        </CardTitle>
        <CardDescription>{item.reason}</CardDescription>
      </CardHeader>
    </Card>
  );
}

export function PrPredictionPanel({
  result,
  lookbackDays,
  painSafeModeActive = false,
  painSafeMessage = null,
}: {
  result: PrPredictionResult;
  lookbackDays: number;
  painSafeModeActive?: boolean;
  painSafeMessage?: string | null;
}) {
  const empty =
    result.predictions.length === 0 && result.withheld.length === 0;

  if (empty) {
    return (
      <EmptyState
        title="Not enough lift data yet"
        description={`Log working sets (load, reps, ideally RPE) for squat, bench, deadlift, or press within the last ${lookbackDays} days. Predictions stay hidden until data quality is sufficient.`}
      />
    );
  }

  return (
    <div className="grid gap-6">
      {painSafeModeActive && painSafeMessage ? (
        <Alert tone="warning" title="Pain-safe mode — aggressive PR framing withheld">
          {painSafeMessage} Treat any range as informational only — not a push
          to max.
        </Alert>
      ) : null}
      <p className="text-sm text-[var(--color-muted)]">
        Conservative estimated 1RM ranges from recent working sets, RPE, rep
        performance, trend, training phase, and fatigue. No prediction when
        evidence is thin.
      </p>

      {result.predictions.length > 0 ? (
        <div className="grid gap-4">
          {result.predictions.map((p) => (
            <PredictionCard key={p.exerciseKey} prediction={p} />
          ))}
        </div>
      ) : null}

      {result.withheld.length > 0 ? (
        <div className="grid gap-3">
          <h2 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Withheld (insufficient data)
          </h2>
          {result.withheld.map((w) => (
            <WithheldCard key={w.exerciseKey} item={w} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
