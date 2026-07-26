import type { Metadata } from "next";
import { AppPage } from "@/components/app/AppPage";
import { ExerciseSubstitutionsPanel } from "@/components/exercise-substitutions/ExerciseSubstitutionsPanel";
import { FeatureGate } from "@/components/ui/FeatureGate";
import { Alert, ButtonLink, EmptyState } from "@/design-system";
import {
  EXERCISE_SUBSTITUTION_GOALS,
  EXERCISE_SUBSTITUTION_GOAL_LABELS,
  EXERCISE_SUBSTITUTION_HONESTY,
  type ExerciseSubstitutionGoal,
} from "@/domain/exercise-substitutions";
import type { EquipmentKey } from "@/domain/exercises/types";
import { EQUIPMENT_KEYS } from "@/domain/exercises/types";
import { requireSession } from "@/services/auth/session";
import { getExerciseSubstitutions } from "@/services/exercise-substitutions";
import { prisma } from "@/lib/db";
import { featureFlags } from "@/config/feature-flags";

export const metadata: Metadata = {
  title: "Exercise substitutions",
  robots: { index: false, follow: false },
};

function parseGoal(raw: string | null): ExerciseSubstitutionGoal | null {
  if (raw && (EXERCISE_SUBSTITUTION_GOALS as readonly string[]).includes(raw)) {
    return raw as ExerciseSubstitutionGoal;
  }
  return null;
}

function parseEquipment(raw: string | null): EquipmentKey[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter((s): s is EquipmentKey =>
      (EQUIPMENT_KEYS as readonly string[]).includes(s),
    );
}

export default async function ExerciseSubstitutionsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await requireSession();
  const params = (await searchParams) ?? {};
  const unavailableSlug =
    typeof params.unavailable === "string" && params.unavailable.trim()
      ? params.unavailable.trim()
      : "bench-press";
  const goalParam =
    typeof params.goal === "string" ? parseGoal(params.goal) : null;
  const equipmentOverride =
    typeof params.equipment === "string"
      ? parseEquipment(params.equipment)
      : [];

  if (!featureFlags.exerciseSubstitutions) {
    return (
      <AppPage
        eyebrow="Training"
        title="Exercise substitutions"
        description="Smart replacements when a lift is unavailable."
      >
        <Alert tone="warning" title="Feature off">
          Enable NEXT_PUBLIC_FF_EXERCISE_SUBSTITUTIONS.
        </Alert>
      </AppPage>
    );
  }

  const profile = await prisma.athleteProfile.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  if (!profile) {
    return (
      <AppPage
        eyebrow="Training"
        title="Exercise substitutions"
        description={EXERCISE_SUBSTITUTION_HONESTY[0]}
      >
        <EmptyState
          title="No athlete profile yet"
          description="Complete onboarding so equipment and goals can shape substitutions."
          action={
            <ButtonLink href="/app/onboarding">Start onboarding</ButtonLink>
          }
        />
      </AppPage>
    );
  }

  const published = await prisma.exercise.findMany({
    where: { isPublished: true },
    select: { slug: true, name: true },
    orderBy: { name: "asc" },
  });

  const result = await getExerciseSubstitutions({
    userId: session.user.id,
    unavailableSlug,
    goal: goalParam ?? "chest_strength",
    equipmentOverride:
      equipmentOverride.length > 0 ? equipmentOverride : undefined,
  });

  return (
    <FeatureGate
      flag="exerciseSubstitutions"
      title="Exercise substitutions"
      description="Smart Exercise Substitutions is behind a feature flag."
    >
      <AppPage
        eyebrow="Training"
        title="Exercise substitutions"
        description={EXERCISE_SUBSTITUTION_HONESTY[0]}
      >
        <form
          method="get"
          action="/app/exercise-substitutions"
          className="mb-8 grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4 sm:grid-cols-3"
        >
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Unavailable exercise</span>
            <select
              name="unavailable"
              defaultValue={unavailableSlug}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2"
            >
              {published.map((e) => (
                <option key={e.slug} value={e.slug}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Goal</span>
            <select
              name="goal"
              defaultValue={goalParam ?? "chest_strength"}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2"
            >
              {EXERCISE_SUBSTITUTION_GOALS.map((g) => (
                <option key={g} value={g}>
                  {EXERCISE_SUBSTITUTION_GOAL_LABELS[g]}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm">
            <span className="font-medium">Equipment (optional)</span>
            <input
              name="equipment"
              defaultValue={
                equipmentOverride.length > 0
                  ? equipmentOverride.join(",")
                  : "dumbbell,bench,bodyweight,machine"
              }
              placeholder="dumbbell,bench,machine"
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] bg-transparent px-3 py-2"
            />
          </label>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-[var(--radius-md)] bg-[var(--color-accent)] px-4 py-2 text-sm text-[var(--color-accent-foreground)]"
            >
              Find substitutes
            </button>
          </div>
        </form>

        {result.ok ? (
          <ExerciseSubstitutionsPanel result={result.result} />
        ) : (
          <Alert tone="danger" title="Unavailable">
            {result.error}
          </Alert>
        )}
      </AppPage>
    </FeatureGate>
  );
}
