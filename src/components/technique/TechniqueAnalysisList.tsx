import Link from "next/link";
import { Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";

type AnalysisListItem = {
  id: string;
  status: string;
  analysisBackendStatus: string;
  overallScore: number | null;
  createdAt: Date;
  cameraAngle: string | null;
  exercise: { name: string; slug: string } | null;
};

export function TechniqueAnalysisList({
  analyses,
}: {
  analyses: AnalysisListItem[];
}) {
  if (analyses.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No technique uploads yet. Use the form above to store a private video.
      </p>
    );
  }

  return (
    <ul className="grid gap-3">
      {analyses.map((item) => (
        <li key={item.id}>
          <Link
            href={`/app/technique/${item.id}`}
            className="block rounded-[var(--radius-md)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <Card className="!p-4 transition-colors hover:bg-[var(--color-surface-elevated)]">
              <CardHeader className="mb-1">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle className="text-base">
                    {item.exercise?.name ?? "Exercise not set"}
                  </CardTitle>
                  <Badge variant="neutral">{item.status}</Badge>
                  <Badge variant="info">{item.analysisBackendStatus}</Badge>
                </div>
                <CardDescription>
                  {item.createdAt.toLocaleString()}
                  {item.cameraAngle ? ` · ${item.cameraAngle}` : ""}
                </CardDescription>
              </CardHeader>
              <p className="text-xs text-[var(--color-subtle)]">
                {item.overallScore == null
                  ? "No technique score (backend did not produce one)."
                  : `Score on file: ${Math.round(item.overallScore)}`}
              </p>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
