import Link from "next/link";
import { Badge, Card, CardDescription, CardHeader, CardTitle } from "@/design-system";
import type { ExerciseListItem } from "@/services/exercises/exercise-catalog";

export function ExerciseIndexList({
  exercises,
}: {
  exercises: ExerciseListItem[];
}) {
  if (exercises.length === 0) {
    return (
      <p className="text-sm text-[var(--color-muted)]">
        No published exercises yet. Run the Exercise Intelligence seed to load
        the priority catalog.
      </p>
    );
  }

  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {exercises.map((exercise) => (
        <li key={exercise.slug}>
          <Link
            href={`/exercises/${exercise.slug}`}
            className="block rounded-[var(--radius-md)] transition-colors hover:bg-[var(--color-surface-elevated)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
          >
            <Card className="h-full">
              <CardHeader className="mb-2">
                <div className="flex flex-wrap items-center gap-2">
                  <CardTitle>{exercise.name}</CardTitle>
                  <Badge variant="neutral">{exercise.difficulty}</Badge>
                </div>
                <CardDescription>
                  {exercise.description ??
                    `${exercise.movementPattern} · ${exercise.category}`}
                </CardDescription>
              </CardHeader>
              <p className="text-xs text-[var(--color-subtle)]">
                {exercise.primaryMuscles.join(", ") || "Muscles TBD"} ·{" "}
                {exercise.equipment.join(", ") || "Equipment TBD"}
              </p>
            </Card>
          </Link>
        </li>
      ))}
    </ul>
  );
}
