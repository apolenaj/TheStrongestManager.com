import Link from "next/link";
import {
  Badge,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import {
  WEAK_POINT_CATEGORY_LABELS,
  type WeakPointFinding,
  type WeakPointIntelligenceResult,
} from "@/domain/weak-point-intelligence";
import { fromWeakPointFinding } from "@/domain/explainable-ai";
import { WhyAmISeeingThis } from "@/components/explainable-ai/WhyAmISeeingThis";
import { ConfidenceBadge } from "@/components/confidence/ConfidenceBadge";
import { AiTrustChrome } from "@/components/ai/AiTrustChrome";

function FindingCard({ finding }: { finding: WeakPointFinding }) {
  return (
    <Card elevated>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="neutral">
            {WEAK_POINT_CATEGORY_LABELS[finding.category]}
          </Badge>
          <ConfidenceBadge confidence={finding.confidence} />
        </div>
        <CardTitle className="mt-2 text-xl tracking-tight">
          Potential weak point: {finding.potentialWeakPoint}
        </CardTitle>
        <CardDescription>{finding.detail}</CardDescription>
      </CardHeader>

      <div className="grid gap-4 text-sm">
        <WhyAmISeeingThis view={fromWeakPointFinding(finding)} />

        <section>
          <h3 className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
            Recommended validation
          </h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-[var(--color-muted)]">
            {finding.recommendedValidation.map((v, i) => (
              <li key={`${finding.id}-val-${i}`}>{v}</li>
            ))}
          </ul>
        </section>

        {finding.href ? (
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={finding.href}>
              {finding.prescriptionWeakPoint
                ? "Open exercise picks"
                : "Review related data"}
            </ButtonLink>
          </div>
        ) : null}
        <AiTrustChrome
          relatedType="weak_point"
          relatedId={finding.id}
          correctHref={finding.href ?? "/app/technique"}
          correctLabel="Validate or correct with technique / logs"
        />
      </div>
    </Card>
  );
}

export function WeakPointIntelligencePanel({
  result,
}: {
  result: WeakPointIntelligenceResult;
}) {
  return (
    <div className="grid gap-6">
      <Card elevated>
        <CardHeader>
          <div className="flex flex-wrap gap-2">
            <Badge variant="accent">Weak Point Intelligence</Badge>
            <Badge variant="neutral">{result.engineVersion}</Badge>
          </div>
          <CardTitle className="mt-2 text-2xl tracking-tight">
            Evidence-backed weak points
          </CardTitle>
          <CardDescription>
            Findings cite logged technique, lifts, recovery, or sessions —
            never visual appearance alone.
          </CardDescription>
        </CardHeader>
        <ul className="grid gap-2 text-sm text-[var(--color-muted)]">
          {result.honesty.map((line) => (
            <li key={line} className="border-l-2 border-[var(--color-border)] pl-3">
              {line}
            </li>
          ))}
        </ul>
      </Card>

      {result.emptyReason ? (
        <Card>
          <CardHeader>
            <CardTitle>No weak points yet</CardTitle>
            <CardDescription>{result.emptyReason}</CardDescription>
          </CardHeader>
          {result.missingInformation.length > 0 ? (
            <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
              {result.missingInformation.map((m) => (
                <li key={m}>{m}</li>
              ))}
            </ul>
          ) : null}
          <div className="mt-4 flex flex-wrap gap-2">
            <ButtonLink href="/app/technique">Technique</ButtonLink>
            <ButtonLink href="/app/progress">Progress</ButtonLink>
            <ButtonLink href="/app/recovery">Recovery</ButtonLink>
          </div>
        </Card>
      ) : (
        result.findings.map((f) => <FindingCard key={f.id} finding={f} />)
      )}

      {!result.emptyReason && result.missingInformation.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">To strengthen confidence</CardTitle>
            <CardDescription>
              Extra signals that would support stronger or additional findings.
            </CardDescription>
          </CardHeader>
          <ul className="list-disc space-y-1 pl-5 text-sm text-[var(--color-muted)]">
            {result.missingInformation.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm text-[var(--color-muted)]">
            Related:{" "}
            <Link
              href="/app/exercise-prescription"
              className="underline underline-offset-2"
            >
              Exercise picks
            </Link>
          </p>
        </Card>
      ) : null}
    </div>
  );
}
