import Link from "next/link";
import {
  Badge,
  Button,
  ButtonLink,
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Label,
  Select,
} from "@/design-system";
import {
  DIFFICULTY_LEVELS,
  EQUIPMENT_KEYS,
  MOVEMENT_PATTERNS,
  MUSCLE_KEYS,
  SPORT_KEYS,
  exerciseFiltersToHref,
  type ExerciseSearchFilters,
} from "@/domain/exercises/search";
import { RecentlyViewedExercises } from "@/components/exercises/RecentlyViewedExercises";
import type { ExerciseListItem } from "@/services/exercises/exercise-catalog";
import type { ExerciseDiscoveryResult } from "@/services/exercises/exercise-discovery";

function humanize(value: string): string {
  return value.replace(/_/g, " ");
}

function ExerciseCard({ exercise }: { exercise: ExerciseListItem }) {
  return (
    <Link
      href={`/exercises/${exercise.slug}`}
      className="block rounded-[var(--radius-md)] transition-colors hover:bg-[var(--color-surface-elevated)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-accent)]"
    >
      <Card className="h-full !p-4">
        <CardHeader className="mb-2">
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="text-base">{exercise.name}</CardTitle>
            <Badge variant="neutral">{exercise.difficulty}</Badge>
          </div>
          <CardDescription className="line-clamp-2">
            {exercise.description ??
              `${exercise.movementPattern} · ${exercise.category}`}
          </CardDescription>
        </CardHeader>
        <p className="text-xs text-[var(--color-subtle)]">
          {exercise.primaryMuscles.slice(0, 3).join(", ") || "—"} ·{" "}
          {exercise.equipment.slice(0, 2).join(", ") || "—"}
        </p>
      </Card>
    </Link>
  );
}

function DiscoveryRail({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="grid gap-3">
      <div>
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
          {title}
        </h2>
        <p className="mt-1 text-sm text-[var(--color-muted)]">{description}</p>
      </div>
      {children}
    </section>
  );
}

function FilterSelect({
  id,
  name,
  label,
  value,
  options,
}: {
  id: string;
  name: string;
  label: string;
  value: string;
  options: readonly string[];
}) {
  return (
    <div className="min-w-0">
      <Label htmlFor={id}>{label}</Label>
      <Select id={id} name={name} defaultValue={value} className="mt-1 w-full">
        <option value="">Any</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {humanize(option)}
          </option>
        ))}
      </Select>
    </div>
  );
}

function ActiveFilterChips({
  filters,
  basePath,
}: {
  filters: ExerciseSearchFilters;
  basePath: string;
}) {
  const chips: { key: keyof ExerciseSearchFilters; label: string }[] = [];
  if (filters.q) chips.push({ key: "q", label: `Search: ${filters.q}` });
  if (filters.sport)
    chips.push({ key: "sport", label: `Sport: ${humanize(filters.sport)}` });
  if (filters.equipment)
    chips.push({
      key: "equipment",
      label: `Equipment: ${humanize(filters.equipment)}`,
    });
  if (filters.movement)
    chips.push({
      key: "movement",
      label: `Movement: ${humanize(filters.movement)}`,
    });
  if (filters.muscle)
    chips.push({
      key: "muscle",
      label: `Muscle: ${humanize(filters.muscle)}`,
    });
  if (filters.difficulty)
    chips.push({
      key: "difficulty",
      label: `Difficulty: ${filters.difficulty}`,
    });

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((chip) => {
        const next = { ...filters, [chip.key]: "" } as ExerciseSearchFilters;
        return (
          <ButtonLink
            key={chip.key}
            href={exerciseFiltersToHref(next, basePath)}
            variant="secondary"
            size="sm"
          >
            {chip.label} ×
          </ButtonLink>
        );
      })}
      <ButtonLink href={basePath} variant="ghost" size="sm">
        Clear all
      </ButtonLink>
    </div>
  );
}

export function ExerciseDiscovery({
  discovery,
  formAction = "/exercises",
}: {
  discovery: ExerciseDiscoveryResult;
  /** Shareable filter base path (public or in-app). */
  formAction?: string;
}) {
  const { filters, results, popular, related, relatedFromGraph, resultCount, hasFilters } =
    discovery;

  return (
    <div className="grid gap-10">
      <form
        method="get"
        action={formAction}
        className="grid gap-4 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface)] p-4 sm:p-5"
      >
        <div>
          <Label htmlFor="exercise-q">Search</Label>
          <Input
            id="exercise-q"
            name="q"
            type="search"
            enterKeyHint="search"
            autoComplete="off"
            placeholder="Name, alias, muscle, movement, equipment…"
            defaultValue={filters.q}
            className="mt-1 w-full"
          />
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <FilterSelect
            id="filter-sport"
            name="sport"
            label="Sport"
            value={filters.sport}
            options={SPORT_KEYS}
          />
          <FilterSelect
            id="filter-equipment"
            name="equipment"
            label="Equipment"
            value={filters.equipment}
            options={EQUIPMENT_KEYS}
          />
          <FilterSelect
            id="filter-movement"
            name="movement"
            label="Movement"
            value={filters.movement}
            options={MOVEMENT_PATTERNS}
          />
          <FilterSelect
            id="filter-muscle"
            name="muscle"
            label="Muscle"
            value={filters.muscle}
            options={MUSCLE_KEYS}
          />
          <FilterSelect
            id="filter-difficulty"
            name="difficulty"
            label="Difficulty"
            value={filters.difficulty}
            options={DIFFICULTY_LEVELS}
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <Button type="submit">Apply filters</Button>
          <ButtonLink href={formAction} variant="secondary">
            Reset
          </ButtonLink>
        </div>

        <ActiveFilterChips filters={filters} basePath={formAction} />
        <p className="text-xs text-[var(--color-subtle)]">
          Filters update the URL so you can share this view. Search matches name,
          alias, muscle, movement, and equipment.
        </p>
      </form>

      <DiscoveryRail
        title="Recently viewed"
        description="Saved on this device only."
      >
        <RecentlyViewedExercises />
      </DiscoveryRail>

      {!hasFilters ? (
        <DiscoveryRail
          title="Popular exercises"
          description="Curated fundamentals from the priority catalog — not fake engagement metrics."
        >
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {popular.map((exercise) => (
              <li key={exercise.slug}>
                <ExerciseCard exercise={exercise} />
              </li>
            ))}
          </ul>
        </DiscoveryRail>
      ) : null}

      <section className="grid gap-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight">
              {hasFilters ? "Matching exercises" : "All exercises"}
            </h2>
            <p className="mt-1 text-sm text-[var(--color-muted)]">
              {resultCount} result{resultCount === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {results.length === 0 ? (
          <Card className="!p-5">
            <CardTitle className="text-base">No matches</CardTitle>
            <CardDescription className="mt-2">
              Try a broader search or clear a filter. The catalog is curated —
              empty results are honest, not a bug filled with filler exercises.
            </CardDescription>
            <div className="mt-4">
              <ButtonLink href={formAction} variant="secondary">
                Clear filters
              </ButtonLink>
            </div>
          </Card>
        ) : (
          <ul className="grid gap-3 sm:grid-cols-2">
            {results.map((exercise) => (
              <li key={exercise.slug}>
                <ExerciseCard exercise={exercise} />
              </li>
            ))}
          </ul>
        )}
      </section>

      {related.length > 0 ? (
        <DiscoveryRail
          title="Related exercises"
          description={
            discovery.relatedFromGraph
              ? "Curated variation edges from the Exercise Relationship Graph — not similarity guesses."
              : hasFilters
                ? "Nearby catalog entries based on movement and muscles from your top match."
                : "Nearby catalog entries based on popular movement patterns."
          }
        >
          <ul className="grid gap-3 sm:grid-cols-2">
            {related.map((exercise) => (
              <li key={exercise.slug}>
                <ExerciseCard exercise={exercise} />
              </li>
            ))}
          </ul>
        </DiscoveryRail>
      ) : null}
    </div>
  );
}
