"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  Alert,
  Badge,
  Button,
  Input,
  Label,
  Select,
} from "@/design-system";
import {
  FIT_DAYS,
  FIT_EQUIPMENT,
  FIT_EQUIPMENT_LABELS,
  FIT_EXPERIENCE,
  FIT_EXPERIENCE_LABELS,
  FIT_GOAL_LABELS,
  FIT_GOALS,
  FIT_SESSION,
  FIT_SESSION_LABELS,
} from "@/domain/fit";
import {
  PROGRAM_BUILDER_HONESTY,
  PROGRAM_BUILDER_MAX_PRIORITY_LIFTS,
  PROGRAM_BUILDER_PRIORITY_LIFTS,
  PROGRAM_BUILDER_PRIORITY_LIFT_LABELS,
  editProgramBuilderDraft,
  generateProgramBuilderDraft,
  type ProgramBuilderDraft,
  type ProgramBuilderPriorityLift,
} from "@/domain/program-builder";

const defaultLifts: ProgramBuilderPriorityLift[] = [
  "back-squat",
  "bench-press",
  "deadlift",
];

export function ProgramBuilderExperience({
  initialEquipment = "full_gym",
}: {
  initialEquipment?: (typeof FIT_EQUIPMENT)[number];
}) {
  const [goal, setGoal] = useState<(typeof FIT_GOALS)[number]>("strength");
  const [days, setDays] = useState<(typeof FIT_DAYS)[number]>("4");
  const [session, setSession] = useState<(typeof FIT_SESSION)[number]>("medium");
  const [equipment, setEquipment] =
    useState<(typeof FIT_EQUIPMENT)[number]>(initialEquipment);
  const [experience, setExperience] =
    useState<(typeof FIT_EXPERIENCE)[number]>("intermediate");
  const [priorityLifts, setPriorityLifts] =
    useState<ProgramBuilderPriorityLift[]>(defaultLifts);
  const [draft, setDraft] = useState<ProgramBuilderDraft | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editDay, setEditDay] = useState(0);
  const [editSlug, setEditSlug] = useState("");
  const [editSets, setEditSets] = useState("3");

  const editOptions = useMemo(() => {
    if (!draft?.weeks[0]) return [];
    return draft.weeks[0].days.flatMap((day) =>
      day.exercises.map((ex) => ({
        dayIndex: day.dayIndex,
        slug: ex.slug,
        label: `Day ${day.dayIndex + 1}: ${ex.name} (${ex.targetSets} sets)`,
      })),
    );
  }, [draft]);

  function toggleLift(slug: ProgramBuilderPriorityLift) {
    setPriorityLifts((prev) => {
      if (prev.includes(slug)) return prev.filter((s) => s !== slug);
      if (prev.length >= PROGRAM_BUILDER_MAX_PRIORITY_LIFTS) return prev;
      return [...prev, slug];
    });
  }

  function generate() {
    const result = generateProgramBuilderDraft({
      goal,
      days,
      session,
      equipment,
      experience,
      priorityLifts,
    });
    if (!result.ok) {
      setError(result.error);
      setDraft(null);
      return;
    }
    setError(null);
    setDraft(result.draft);
    const first = result.draft.weeks[0]?.days[0]?.exercises[0];
    if (first) {
      setEditDay(0);
      setEditSlug(first.slug);
      setEditSets(String(first.targetSets));
    }
  }

  function applyEdit() {
    if (!draft) return;
    const sets = Number(editSets);
    const result = editProgramBuilderDraft(draft, [
      {
        dayIndex: editDay,
        exerciseSlug: editSlug,
        targetSets: sets,
      },
    ]);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setError(null);
    setDraft(result.draft);
  }

  return (
    <div className="grid gap-10">
      <Alert tone="info" title="Program Builder 2.0">
        {PROGRAM_BUILDER_HONESTY[0]} {PROGRAM_BUILDER_HONESTY[1]}
      </Alert>
      <Alert tone="warning" title="Not medical advice">
        {PROGRAM_BUILDER_HONESTY[3]}
      </Alert>

      <section className="grid gap-4">
        <h2 className="font-[family-name:var(--font-display)] text-xl font-semibold">
          Build inputs
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="goal">Goal</Label>
            <Select
              id="goal"
              className="mt-1"
              value={goal}
              onChange={(e) =>
                setGoal(e.target.value as (typeof FIT_GOALS)[number])
              }
            >
              {FIT_GOALS.map((g) => (
                <option key={g} value={g}>
                  {FIT_GOAL_LABELS[g]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="days">Days / week</Label>
            <Select
              id="days"
              className="mt-1"
              value={days}
              onChange={(e) =>
                setDays(e.target.value as (typeof FIT_DAYS)[number])
              }
            >
              {FIT_DAYS.map((d) => (
                <option key={d} value={d}>
                  {d} days
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="session">Session duration</Label>
            <Select
              id="session"
              className="mt-1"
              value={session}
              onChange={(e) =>
                setSession(e.target.value as (typeof FIT_SESSION)[number])
              }
            >
              {FIT_SESSION.map((s) => (
                <option key={s} value={s}>
                  {FIT_SESSION_LABELS[s]}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="equipment">Equipment</Label>
            <Select
              id="equipment"
              className="mt-1"
              value={equipment}
              onChange={(e) =>
                setEquipment(e.target.value as (typeof FIT_EQUIPMENT)[number])
              }
            >
              {FIT_EQUIPMENT.map((eq) => (
                <option key={eq} value={eq}>
                  {FIT_EQUIPMENT_LABELS[eq]}
                </option>
              ))}
            </Select>
          </div>
          <div className="sm:col-span-2">
            <Label htmlFor="experience">Experience</Label>
            <Select
              id="experience"
              className="mt-1"
              value={experience}
              onChange={(e) =>
                setExperience(e.target.value as (typeof FIT_EXPERIENCE)[number])
              }
            >
              {FIT_EXPERIENCE.map((ex) => (
                <option key={ex} value={ex}>
                  {FIT_EXPERIENCE_LABELS[ex]}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <div>
          <p className="text-sm font-medium text-[var(--color-foreground)]">
            Priority lifts (max {PROGRAM_BUILDER_MAX_PRIORITY_LIFTS})
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {PROGRAM_BUILDER_PRIORITY_LIFTS.map((slug) => {
              const on = priorityLifts.includes(slug);
              return (
                <Button
                  key={slug}
                  type="button"
                  size="sm"
                  variant={on ? "primary" : "secondary"}
                  onClick={() => toggleLift(slug)}
                >
                  {PROGRAM_BUILDER_PRIORITY_LIFT_LABELS[slug]}
                </Button>
              );
            })}
          </div>
        </div>

        <Button type="button" onClick={generate}>
          Generate draft
        </Button>
      </section>

      {error ? (
        <Alert tone="danger" title="Builder error">
          {error}
        </Alert>
      ) : null}

      {draft ? (
        <ProgramBuilderDraftView
          draft={draft}
          editOptions={editOptions}
          editDay={editDay}
          editSlug={editSlug}
          editSets={editSets}
          onEditDay={setEditDay}
          onEditSlug={setEditSlug}
          onEditSets={setEditSets}
          onApplyEdit={applyEdit}
        />
      ) : null}

      <p className="text-sm text-[var(--color-muted)]">
        Related:{" "}
        <Link href="/app/programs" className="text-[var(--color-accent)]">
          Programs
        </Link>
        ,{" "}
        <Link href="/fit" className="text-[var(--color-accent)]">
          Approach fit
        </Link>
        ,{" "}
        <Link href="/decision-trees" className="text-[var(--color-accent)]">
          Decision trees
        </Link>
        .
      </p>
    </div>
  );
}

function ProgramBuilderDraftView({
  draft,
  editOptions,
  editDay,
  editSlug,
  editSets,
  onEditDay,
  onEditSlug,
  onEditSets,
  onApplyEdit,
}: {
  draft: ProgramBuilderDraft;
  editOptions: Array<{ dayIndex: number; slug: string; label: string }>;
  editDay: number;
  editSlug: string;
  editSets: string;
  onEditDay: (v: number) => void;
  onEditSlug: (v: string) => void;
  onEditSets: (v: string) => void;
  onApplyEdit: () => void;
}) {
  return (
    <div className="grid gap-8">
      <div className="flex flex-wrap items-center gap-2">
        <Badge variant="accent">{draft.status}</Badge>
        <Badge variant="neutral">autoApply: false</Badge>
        <Badge variant="neutral">{draft.volumeSource.tableId}</Badge>
      </div>
      <h2 className="font-[family-name:var(--font-display)] text-2xl font-semibold">
        {draft.title}
      </h2>
      <p className="text-sm text-[var(--color-muted)]">
        Weekly hard sets planned: {draft.volumeSource.weeklyHardSetsPlanned} /
        budget {draft.volumeSource.weeklyHardSetBudget} (
        {draft.volumeSource.band})
      </p>

      {draft.missingInformation.length > 0 ? (
        <Alert tone="warning" title="Check before accepting">
          <ul className="list-disc pl-5">
            {draft.missingInformation.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {draft.weeks.map((week) => (
        <section key={week.weekNumber} className="grid gap-4">
          <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
            Week {week.weekNumber}
            {week.isDeload ? " · Deload" : ""}
          </h3>
          {week.days.map((day) => (
            <article
              key={`${week.weekNumber}-${day.dayIndex}`}
              className="border-t border-[var(--color-border)] pt-3"
            >
              <h4 className="font-medium text-[var(--color-foreground)]">
                {day.name}
              </h4>
              <ul className="mt-2 grid gap-2 text-sm">
                {day.exercises.map((ex) => (
                  <li key={`${day.dayIndex}-${ex.slug}`}>
                    <span className="text-[var(--color-foreground)]">
                      {ex.name}
                    </span>{" "}
                    <span className="text-[var(--color-muted)]">
                      · {ex.targetSets}×{ex.targetReps}
                      {ex.rpeTarget != null ? ` @ RPE ${ex.rpeTarget}` : ""} ·{" "}
                      {ex.role}
                    </span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </section>
      ))}

      <section className="grid gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Why exercises were chosen
        </h3>
        <ul className="grid gap-3 text-sm">
          {draft.whyExercises.map((w) => (
            <li key={w.slug}>
              <p className="font-medium text-[var(--color-foreground)]">
                {w.name}
              </p>
              <p className="text-[var(--color-muted)]">{w.reason}</p>
              <p className="text-xs text-[var(--color-subtle)]">
                {w.ruleIds.join(", ")}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Progression
        </h3>
        <ul className="list-disc space-y-2 pl-5 text-sm text-[var(--color-muted)]">
          {draft.progression.map((p) => (
            <li key={`${p.ruleKind}-${p.summary.slice(0, 24)}`}>
              <span className="text-[var(--color-foreground)]">
                {p.ruleKind}
              </span>
              : {p.summary}
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-2">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Deload strategy
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          {draft.deloadStrategy.summary}
        </p>
      </section>

      <section className="grid gap-3">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Adjustment rules
        </h3>
        <ul className="grid gap-3 text-sm">
          {draft.adjustmentRules.map((r) => (
            <li
              key={r.id}
              className="rounded-[var(--radius-md)] border border-[var(--color-border)] p-3"
            >
              <p className="font-medium text-[var(--color-foreground)]">
                When: {r.when}
              </p>
              <p className="text-[var(--color-muted)]">Action: {r.action}</p>
              <p className="mt-1 text-[var(--color-muted)]">{r.summary}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-3 rounded-[var(--radius-md)] border border-[var(--color-border)] p-4">
        <h3 className="font-[family-name:var(--font-display)] text-lg font-semibold">
          Edit draft
        </h3>
        <p className="text-sm text-[var(--color-muted)]">
          Change set counts within safe bounds. Edits stay local to this draft
          and never auto-apply.
        </p>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Label htmlFor="edit-ex">Exercise</Label>
            <Select
              id="edit-ex"
              className="mt-1"
              value={`${editDay}::${editSlug}`}
              onChange={(e) => {
                const [day, slug] = e.target.value.split("::");
                onEditDay(Number(day));
                onEditSlug(slug ?? "");
              }}
            >
              {editOptions.map((opt) => (
                <option
                  key={`${opt.dayIndex}-${opt.slug}`}
                  value={`${opt.dayIndex}::${opt.slug}`}
                >
                  {opt.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="edit-sets">Sets</Label>
            <Input
              id="edit-sets"
              className="mt-1"
              type="number"
              min={1}
              max={8}
              value={editSets}
              onChange={(e) => onEditSets(e.target.value)}
            />
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={onApplyEdit}>
          Apply edit
        </Button>
      </section>
    </div>
  );
}
