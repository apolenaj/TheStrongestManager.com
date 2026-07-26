import Link from "next/link";
import {
  Alert,
  Badge,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/design-system";
import type { ExerciseRelationshipGraph } from "@/domain/exercise-relationship-graph";
import { EXERCISE_GRAPH_RELATION_KINDS } from "@/domain/exercise-relationship-graph";

export function ExerciseRelationshipGraphPanel({
  graph,
}: {
  graph: ExerciseRelationshipGraph;
}) {
  const counts = Object.fromEntries(
    EXERCISE_GRAPH_RELATION_KINDS.map((k) => [
      k,
      graph.edges.filter((e) => e.relation === k).length,
    ]),
  ) as Record<(typeof EXERCISE_GRAPH_RELATION_KINDS)[number], number>;

  return (
    <div className="grid gap-8">
      <Alert tone="info" title="Exercise Relationship Graph">
        {graph.honesty[0]} {graph.honesty[1]}
      </Alert>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Relation kinds
        </h2>
        <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {EXERCISE_GRAPH_RELATION_KINDS.map((kind) => (
            <li
              key={kind}
              className="flex items-center justify-between gap-2 rounded-[var(--radius-md)] border border-[var(--color-border)] px-4 py-3 text-sm"
            >
              <span className="font-medium">{kind.replaceAll("_", " ")}</span>
              <Badge variant="neutral">{counts[kind]} edges</Badge>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Exercises with edges
        </h2>
        <ul className="grid gap-3 sm:grid-cols-2">
          {graph.nodes.map((node) => (
            <li key={node.exerciseSlug}>
              <Card className="h-full">
                <CardHeader>
                  <CardTitle>
                    <Link
                      href={`/exercises/${node.exerciseSlug}`}
                      className="text-[var(--color-accent)] underline-offset-2 hover:underline"
                    >
                      {node.exerciseSlug}
                    </Link>
                  </CardTitle>
                  <CardDescription>{node.edgeCount} curated edges</CardDescription>
                </CardHeader>
                <div className="flex flex-wrap gap-2 px-6 pb-6">
                  {EXERCISE_GRAPH_RELATION_KINDS.filter(
                    (k) => node.byRelation[k] > 0,
                  ).map((k) => (
                    <Badge key={k} variant="neutral">
                      {k}: {node.byRelation[k]}
                    </Badge>
                  ))}
                </div>
              </Card>
            </li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-[var(--color-muted)]">
        {graph.honesty[2]} Engine {graph.engineVersion}. Total edges:{" "}
        {graph.edges.length}.
      </p>
    </div>
  );
}
